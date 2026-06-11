"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "@/lib/gsap-init";
import { projects as allProjects, type Project, type Theme } from "@/lib/projects";
import {
  generateSlots,
  SPHERE_RADIUS,
  TILE_WIDTH,
  TILE_HEIGHT,
} from "@/lib/sphere-layout";
import { createTileTexture } from "@/lib/tile-texture";

export type SphereMode = "active" | "dimmed" | "hidden";

interface WorkSphereProps {
  activeThemes: Theme[];
  mode: SphereMode;
  onSelect: (project: Project) => void;
}

interface TileData {
  project: Project;
  filtered: boolean;
}

const ORIGIN = new THREE.Vector3(0, 0, 0);
const UP = new THREE.Vector3(0, 1, 0);
const FORWARD = new THREE.Vector3(0, 0, -1);

function slotQuaternion(position: THREE.Vector3): THREE.Quaternion {
  // Matrix4.lookAt builds +Z = eye - target; eye must be the origin so the
  // tile's front (+Z) faces the camera at the sphere's center.
  const m = new THREE.Matrix4().lookAt(ORIGIN, position, UP);
  return new THREE.Quaternion().setFromRotationMatrix(m);
}

export default function WorkSphere({
  activeThemes,
  mode,
  onSelect,
}: WorkSphereProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const applyFilterRef = useRef<(themes: Theme[]) => void>(() => {});
  const openFrontRef = useRef<() => void>(() => {});
  const rotateByRef = useRef<(dYaw: number, dPitch: number) => void>(() => {});

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isNarrow = window.innerWidth < 768;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isNarrow ? 1.5 : 1.75));
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      isNarrow ? 62 : 55,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 0);

    const group = new THREE.Group();
    scene.add(group);

    // --- tiles ---
    const slots = generateSlots();
    const ranked = [...allProjects].sort((a, b) => a.rank - b.rank);
    const texW = isNarrow ? 512 : 1024;
    const texH = isNarrow ? 320 : 640;
    const anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());

    let wakeUntil = 0;
    const requestRender = (ms = 300) => {
      wakeUntil = Math.max(wakeUntil, performance.now() + ms);
    };

    const geometry = new THREE.PlaneGeometry(TILE_WIDTH, TILE_HEIGHT);
    const tiles = ranked.map((project, i) => {
      const tile = createTileTexture(project, texW, texH, anisotropy, () =>
        requestRender()
      );
      const material = new THREE.MeshBasicMaterial({
        map: tile.texture,
        transparent: true,
        side: THREE.FrontSide,
      });
      const mesh = new THREE.Mesh(geometry, material);
      const pos = new THREE.Vector3(...slots[i].position);
      mesh.position.copy(pos);
      mesh.quaternion.copy(slotQuaternion(pos));
      mesh.userData = { project, filtered: false } satisfies TileData;
      group.add(mesh);
      return { mesh, material, tile, project };
    });

    // --- rotation state ---
    let yaw = 0;
    let pitch = 0;
    let targetYaw = 0;
    let targetPitch = 0;
    let inertia = 0;
    const PITCH_LIMIT = 0.55;
    const clampPitch = (v: number) =>
      Math.min(PITCH_LIMIT, Math.max(-PITCH_LIMIT, v));

    // --- intro ---
    let introTween: gsap.core.Tween | null = null;
    if (reducedMotion) {
      requestRender(600);
    } else {
      tiles.forEach(({ mesh }, i) => {
        mesh.scale.setScalar(0.001);
        gsap.to(mesh.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: 0.9,
          ease: "expo.out",
          delay: 0.15 + i * 0.05,
          onUpdate: () => requestRender(),
        });
      });
      const rot = { y: -0.14 };
      yaw = targetYaw = rot.y;
      introTween = gsap.to(rot, {
        y: 0,
        duration: 1.4,
        ease: "power3.out",
        delay: 0.15,
        onUpdate: () => {
          yaw = targetYaw = rot.y;
          requestRender();
        },
      });
    }

    // --- interaction ---
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let dragging = false;
    let moved = 0;
    let lastX = 0;
    let lastY = 0;
    let dragVel = 0;
    let hovered: THREE.Mesh | null = null;

    const setHover = (mesh: THREE.Mesh | null) => {
      if (mesh === hovered) return;
      if (hovered) {
        const mat = (hovered as THREE.Mesh).material as THREE.MeshBasicMaterial;
        gsap.to(hovered.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: 0.35,
          ease: "expo.out",
          onUpdate: () => requestRender(),
        });
        gsap.to(mat.color, {
          r: 1,
          g: 1,
          b: 1,
          duration: 0.35,
          onUpdate: () => requestRender(),
        });
      }
      hovered = mesh;
      if (mesh) {
        const mat = mesh.material as THREE.MeshBasicMaterial;
        gsap.to(mesh.scale, {
          x: 1.06,
          y: 1.06,
          z: 1.06,
          duration: 0.35,
          ease: "expo.out",
          onUpdate: () => requestRender(),
        });
        gsap.to(mat.color, {
          r: 1.12,
          g: 1.12,
          b: 1.12,
          duration: 0.35,
          onUpdate: () => requestRender(),
        });
      }
      renderer.domElement.style.cursor = mesh ? "pointer" : "grab";
    };

    const pick = (clientX: number, clientY: number): THREE.Mesh | null => {
      pointer.set(
        (clientX / window.innerWidth) * 2 - 1,
        -(clientY / window.innerHeight) * 2 + 1
      );
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(
        group.children.filter((c) => c.visible)
      );
      return (hits[0]?.object as THREE.Mesh) ?? null;
    };

    const el = renderer.domElement;

    const onPointerDown = (e: PointerEvent) => {
      if (modeRef.current !== "active") return;
      el.setPointerCapture(e.pointerId);
      dragging = true;
      moved = 0;
      lastX = e.clientX;
      lastY = e.clientY;
      dragVel = 0;
      inertia = 0;
      introTween?.kill();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (modeRef.current !== "active") return;
      if (dragging) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        moved += Math.abs(dx) + Math.abs(dy);
        targetYaw += dx * 0.0045;
        targetPitch = clampPitch(targetPitch - dy * 0.003);
        dragVel = dragVel * 0.5 + dx * 0.0045 * 0.5;
        requestRender();
      } else if (e.pointerType === "mouse") {
        setHover(pick(e.clientX, e.clientY));
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      if (moved < 6) {
        const hit = pick(e.clientX, e.clientY);
        if (hit) onSelectRef.current(hit.userData.project as Project);
      } else if (!reducedMotion) {
        inertia = dragVel;
        requestRender(2000);
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (modeRef.current !== "active") return;
      e.preventDefault();
      targetYaw += (e.deltaY + e.deltaX) * 0.0012;
      requestRender();
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);
    el.addEventListener("wheel", onWheel, { passive: false });

    // --- imperative hooks for filter / keyboard ---
    rotateByRef.current = (dYaw, dPitch) => {
      targetYaw += dYaw;
      targetPitch = clampPitch(targetPitch + dPitch);
      requestRender(1500);
    };

    openFrontRef.current = () => {
      let best: THREE.Mesh | null = null;
      let bestDot = -Infinity;
      const wp = new THREE.Vector3();
      for (const { mesh } of tiles) {
        if (!mesh.visible) continue;
        mesh.getWorldPosition(wp);
        const dot = wp.normalize().dot(FORWARD);
        if (dot > bestDot) {
          bestDot = dot;
          best = mesh;
        }
      }
      if (best) onSelectRef.current(best.userData.project as Project);
    };

    applyFilterRef.current = (themes: Theme[]) => {
      const matches = (p: Project) =>
        themes.length === 0 || p.themes.some((t) => themes.includes(t));
      const visible = ranked.filter(matches);
      const duration = reducedMotion ? 0 : 1;
      requestRender(duration * 1000 + 600);

      let slotIndex = 0;
      let moveIndex = 0;
      tiles.forEach(({ mesh, material }) => {
        const data = mesh.userData as TileData;
        const show = matches(data.project);
        if (!show) {
          if (!data.filtered) {
            data.filtered = true;
            gsap.killTweensOf([mesh.scale, mesh.position, material]);
            gsap.to(mesh.scale, {
              x: 0.6,
              y: 0.6,
              z: 0.6,
              duration: reducedMotion ? 0 : 0.4,
              ease: "power2.in",
            });
            gsap.to(material, {
              opacity: 0,
              duration: reducedMotion ? 0 : 0.4,
              ease: "power2.in",
              onUpdate: () => requestRender(),
              onComplete: () => {
                mesh.visible = false;
              },
            });
          }
          return;
        }

        const slot = slots[slotIndex++];
        const endPos = new THREE.Vector3(...slot.position);
        const endQ = slotQuaternion(endPos);
        const wasFiltered = data.filtered;
        data.filtered = false;
        mesh.visible = true;
        gsap.killTweensOf([mesh.scale, mesh.position, material]);

        if (wasFiltered) {
          // reappear in place at its new slot
          mesh.position.copy(endPos);
          mesh.quaternion.copy(endQ);
          gsap.fromTo(
            mesh.scale,
            { x: 0.6, y: 0.6, z: 0.6 },
            {
              x: 1,
              y: 1,
              z: 1,
              duration: reducedMotion ? 0 : 0.7,
              ease: "expo.out",
              delay: reducedMotion ? 0 : 0.25 + moveIndex * 0.03,
            }
          );
          gsap.to(material, {
            opacity: 1,
            duration: reducedMotion ? 0 : 0.5,
            delay: reducedMotion ? 0 : 0.25 + moveIndex * 0.03,
            onUpdate: () => requestRender(),
          });
        } else if (mesh.position.distanceToSquared(endPos) > 0.01) {
          // glide along the sphere surface to the new slot
          const startPos = mesh.position.clone();
          const startQ = mesh.quaternion.clone();
          const proxy = { t: 0 };
          gsap.to(proxy, {
            t: 1,
            duration: reducedMotion ? 0 : 0.8,
            ease: "expo.out",
            delay: reducedMotion ? 0 : 0.2 + moveIndex * 0.03,
            onUpdate: () => {
              mesh.position
                .copy(startPos)
                .lerp(endPos, proxy.t)
                .normalize()
                .multiplyScalar(SPHERE_RADIUS);
              mesh.quaternion.slerpQuaternions(startQ, endQ, proxy.t);
              requestRender();
            },
          });
          gsap.to(material, { opacity: 1, duration: 0.3 });
        } else {
          gsap.to(material, { opacity: 1, duration: 0.3 });
          mesh.scale.setScalar(1);
        }
        moveIndex++;
      });

      // ease the view back home so the refilled front cluster is in frame
      const rot = { y: targetYaw, p: targetPitch };
      gsap.to(rot, {
        y: 0,
        p: 0,
        duration: reducedMotion ? 0 : 0.8,
        ease: "expo.out",
        onUpdate: () => {
          targetYaw = rot.y;
          targetPitch = rot.p;
          requestRender();
        },
      });
      setHover(null);
    };

    // --- frame loop (render on demand) ---
    const clock = new THREE.Clock();
    const wp = new THREE.Vector3();
    let rafId = 0;

    const frame = () => {
      rafId = requestAnimationFrame(frame);
      const dt = Math.min(clock.getDelta(), 0.05);

      if (Math.abs(inertia) > 0.00005) {
        targetYaw += inertia;
        inertia *= 0.94;
        requestRender();
      } else {
        inertia = 0;
      }

      const moving =
        Math.abs(targetYaw - yaw) > 0.0001 ||
        Math.abs(targetPitch - pitch) > 0.0001;
      if (!moving && performance.now() > wakeUntil) return;

      const k = 1 - Math.exp(-5 * dt);
      yaw += (targetYaw - yaw) * k;
      pitch += (targetPitch - pitch) * k;
      group.rotation.set(pitch, yaw, 0);

      // fade tiles rotating behind the camera
      for (const { mesh, material } of tiles) {
        if (!mesh.visible || (mesh.userData as TileData).filtered) continue;
        mesh.getWorldPosition(wp);
        const dot = wp.normalize().dot(FORWARD);
        const target = dot < -0.17 ? 0.1 : 1; // ~100 deg
        if (!gsap.isTweening(material)) {
          material.opacity += (target - material.opacity) * Math.min(1, dt * 8);
        }
      }

      renderer.render(scene, camera);
    };
    requestRender(1500 + tiles.length * 50);
    frame();

    // --- resize ---
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.fov = window.innerWidth < 768 ? 62 : 55;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      requestRender();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
      el.removeEventListener("wheel", onWheel);
      introTween?.kill();
      tiles.forEach(({ mesh, material, tile }) => {
        gsap.killTweensOf([mesh.scale, mesh.position, material, material.color]);
        material.dispose();
        tile.dispose();
      });
      geometry.dispose();
      renderer.dispose();
      container.removeChild(el);
    };
  }, []);

  // filter changes (skip the initial mount so the intro animation survives)
  const themesKey = activeThemes.join(",");
  const lastThemesKey = useRef(themesKey);
  useEffect(() => {
    if (themesKey === lastThemesKey.current) return;
    lastThemesKey.current = themesKey;
    applyFilterRef.current(activeThemes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themesKey]);

  // keyboard navigation
  useEffect(() => {
    if (mode !== "active") return;
    const STEP = Math.PI / 3;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.tagName === "BUTTON")
        return;
      switch (e.key) {
        case "ArrowLeft":
          rotateByRef.current(STEP, 0);
          break;
        case "ArrowRight":
          rotateByRef.current(-STEP, 0);
          break;
        case "ArrowUp":
          rotateByRef.current(0, -0.45);
          break;
        case "ArrowDown":
          rotateByRef.current(0, 0.45);
          break;
        case "Enter":
          openFrontRef.current();
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode]);

  const modeClass =
    mode === "hidden"
      ? " sphere-canvas--inactive"
      : mode === "dimmed"
        ? " sphere-canvas--dimmed"
        : "";

  return <div ref={containerRef} className={`sphere-canvas${modeClass}`} />;
}
