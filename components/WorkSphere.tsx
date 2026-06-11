"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "@/lib/gsap-init";
import { projects as allProjects, type Project, type Theme } from "@/lib/projects";
import {
  generateSlots,
  slotPosition,
  STRIP_LAT_OFFSET,
  TILE_WIDTH,
  TILE_HEIGHT,
} from "@/lib/sphere-layout";
import {
  createTileTexture,
  createStripTexture,
  type TileTexture,
  type StripTexture,
} from "@/lib/tile-texture";

export type SphereMode = "active" | "dimmed" | "hidden";

interface WorkSphereProps {
  activeThemes: Theme[];
  mode: SphereMode;
  onSelect: (project: Project) => void;
}

interface TileData {
  project: Project;
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
      isNarrow ? 62 : 60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 0);

    const group = new THREE.Group();
    const tileGroup = new THREE.Group();
    const stripGroup = new THREE.Group();
    group.add(tileGroup, stripGroup);
    scene.add(group);

    let wakeUntil = 0;
    const requestRender = (ms = 300) => {
      wakeUntil = Math.max(wakeUntil, performance.now() + ms);
    };

    // --- shared per-project resources (slots repeat the 18 projects) ---
    const slots = generateSlots();
    const ranked = [...allProjects].sort((a, b) => a.rank - b.rank);
    const texW = isNarrow ? 512 : 1024;
    const texH = isNarrow ? 356 : 712;
    const anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());

    const textures = new Map<string, TileTexture>();
    const stripTextures = new Map<string, StripTexture>();
    const videos = new Map<string, HTMLVideoElement>();
    for (const p of ranked) {
      textures.set(
        p.slug,
        createTileTexture(p, texW, texH, anisotropy, () => requestRender())
      );
      stripTextures.set(
        p.slug,
        createStripTexture(p, anisotropy, () => requestRender())
      );
      if (p.video && !reducedMotion) {
        const v = document.createElement("video");
        v.muted = true;
        v.loop = true;
        v.playsInline = true;
        v.preload = "metadata";
        v.src = p.video;
        v.addEventListener("error", () => videos.delete(p.slug), { once: true });
        videos.set(p.slug, v);
      }
    }

    const geometry = new THREE.PlaneGeometry(TILE_WIDTH, TILE_HEIGHT);
    const stripGeometry = new THREE.PlaneGeometry(
      TILE_WIDTH,
      TILE_WIDTH * (40 / 512)
    );

    const tiles = slots.map((slot, i) => {
      const project = ranked[i % ranked.length];
      const material = new THREE.MeshBasicMaterial({
        map: textures.get(project.slug)!.texture,
        transparent: true,
        side: THREE.FrontSide,
        opacity: slot.angularDist > 1.745 ? 0.08 : 1,
      });
      const mesh = new THREE.Mesh(geometry, material);
      const pos = new THREE.Vector3(...slot.position);
      mesh.position.copy(pos);
      mesh.quaternion.copy(slotQuaternion(pos));
      mesh.userData = { project } satisfies TileData;
      tileGroup.add(mesh);

      const stripMaterial = new THREE.MeshBasicMaterial({
        map: stripTextures.get(project.slug)!.texture,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const strip = new THREE.Mesh(stripGeometry, stripMaterial);
      const sPos = new THREE.Vector3(
        ...slotPosition(slot.lat + STRIP_LAT_OFFSET, slot.lon)
      );
      strip.position.copy(sPos);
      strip.quaternion.copy(slotQuaternion(sPos));
      stripGroup.add(strip);

      return { mesh, material, strip, stripMaterial, project };
    });

    // --- rotation state ---
    let yaw = 0;
    let pitch = 0;
    let targetYaw = 0;
    let targetPitch = 0;
    let inertia = 0;
    const PITCH_LIMIT = 0.4;
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
          delay: 0.15 + i * 0.018,
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
          x: 1.05,
          y: 1.05,
          z: 1.05,
          duration: 0.35,
          ease: "expo.out",
          onUpdate: () => requestRender(),
        });
        gsap.to(mat.color, {
          r: 1.1,
          g: 1.1,
          b: 1.1,
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
        tileGroup.children.filter((c) => c.visible)
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

    // Filtering never empties slots: every tile crossfades to a project
    // from the matching set, so the grid stays packed edge to edge.
    applyFilterRef.current = (themes: Theme[]) => {
      const matches = (p: Project) =>
        themes.length === 0 || p.themes.some((t) => themes.includes(t));
      const matchList = ranked.filter(matches);
      if (matchList.length === 0) return;
      requestRender(1600);

      let swapIndex = 0;
      tiles.forEach((entry, i) => {
        const next = matchList[i % matchList.length];
        const data = entry.mesh.userData as TileData;
        if (data.project.slug === next.slug) return;

        const swap = () => {
          data.project = next;
          entry.project = next;
          entry.material.map = textures.get(next.slug)!.texture;
          entry.stripMaterial.map = stripTextures.get(next.slug)!.texture;
        };

        gsap.killTweensOf(entry.material);
        if (reducedMotion) {
          swap();
          requestRender();
          return;
        }
        const delay = 0.012 * swapIndex++;
        gsap.to(entry.material, {
          opacity: 0,
          duration: 0.28,
          ease: "power2.in",
          delay,
          onUpdate: () => requestRender(),
          onComplete: swap,
        });
        gsap.to(entry.material, {
          opacity: 1,
          duration: 0.45,
          ease: "power2.out",
          delay: delay + 0.3,
          onUpdate: () => requestRender(),
        });
      });
      setHover(null);
    };

    // --- frame loop (render on demand; stays awake while a video plays) ---
    const clock = new THREE.Clock();
    const wp = new THREE.Vector3();
    const videoDots = new Map<string, number>();
    let videoPlaying = false;
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
      if (!moving && !videoPlaying && performance.now() > wakeUntil) return;

      const k = 1 - Math.exp(-5 * dt);
      yaw += (targetYaw - yaw) * k;
      pitch += (targetPitch - pitch) * k;
      group.rotation.set(pitch, yaw, 0);

      // fade tiles rotating behind the camera; strips track their tile
      videoDots.clear();
      for (const { mesh, material, stripMaterial, project } of tiles) {
        mesh.getWorldPosition(wp);
        const dot = wp.normalize().dot(FORWARD);
        const target = dot < -0.17 ? 0.08 : 1; // ~100 deg
        if (!gsap.isTweening(material)) {
          material.opacity += (target - material.opacity) * Math.min(1, dt * 8);
        }
        stripMaterial.opacity =
          material.opacity * Math.min(1, mesh.scale.x) * 0.9;
        if (videos.has(project.slug)) {
          const cur = videoDots.get(project.slug) ?? -1;
          if (dot > cur) videoDots.set(project.slug, dot);
        }
      }

      videoPlaying = false;
      for (const [slug, video] of videos) {
        const dot = videoDots.get(slug) ?? -1;
        const shouldPlay =
          modeRef.current === "active" && !document.hidden && dot > 0.45;
        if (shouldPlay && video.paused) {
          video.play().catch(() => {});
        } else if (!shouldPlay && !video.paused) {
          video.pause();
        }
        if (!video.paused) {
          textures.get(slug)!.drawVideo(video);
          videoPlaying = true;
        }
      }

      renderer.render(scene, camera);
    };
    requestRender(1500 + tiles.length * 18);
    frame();

    // --- resize ---
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.fov = window.innerWidth < 768 ? 62 : 60;
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
      for (const video of videos.values()) {
        video.pause();
        video.removeAttribute("src");
      }
      tiles.forEach(({ mesh, material, stripMaterial }) => {
        gsap.killTweensOf([mesh.scale, material, material.color]);
        material.dispose();
        stripMaterial.dispose();
      });
      textures.forEach((t) => t.dispose());
      stripTextures.forEach((t) => t.dispose());
      geometry.dispose();
      stripGeometry.dispose();
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
    const STEP = Math.PI / 6;
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
          rotateByRef.current(0, -0.38);
          break;
        case "ArrowDown":
          rotateByRef.current(0, 0.38);
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
