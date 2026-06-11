"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "@/lib/gsap-init";
import { projects as allProjects, type Project, type Theme } from "@/lib/projects";
import {
  generateSlots,
  slotPosition,
  createPatchGeometry,
  LAT_BANDS,
  CELL_LAT,
  CELL_LON,
  COLS,
  PATCH_LAT_SPAN,
  PATCH_LON_SPAN,
  STRIP_LAT_OFFSET,
  STRIP_LAT_SPAN,
  STRIP_LON_SPAN,
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

const FORWARD = new THREE.Vector3(0, 0, -1);
const DEG = Math.PI / 180;
const GRID_COLOR = 0x3a3e45;
const mod = (n: number, m: number) => ((n % m) + m) % m;

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

    const renderer = new THREE.WebGLRenderer({
      antialias: !isNarrow,
      alpha: true,
      powerPreference: "high-performance",
    });
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
    const gridGroup = new THREE.Group();
    const tileGroup = new THREE.Group();
    const stripGroup = new THREE.Group();
    group.add(gridGroup, tileGroup, stripGroup);
    scene.add(group);

    let wakeUntil = 0;
    const requestRender = (ms = 300) => {
      wakeUntil = Math.max(wakeUntil, performance.now() + ms);
    };

    // --- explicit grid: lat circles + meridian arcs in the cell gutters ---
    const latBoundaries = LAT_BANDS.map((lat) => lat + CELL_LAT / 2);
    latBoundaries.push(LAT_BANDS[LAT_BANDS.length - 1] - CELL_LAT / 2);
    const latTop = latBoundaries[0];
    const latBot = latBoundaries[latBoundaries.length - 1];

    const gridMaterial = new THREE.LineBasicMaterial({ color: GRID_COLOR });
    const gridGeometries: THREE.BufferGeometry[] = [];
    for (const lat of latBoundaries) {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i < 128; i++) {
        pts.push(
          new THREE.Vector3(...slotPosition(lat, (i * 360) / 128)).multiplyScalar(1.004)
        );
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      gridGeometries.push(geo);
      gridGroup.add(new THREE.LineLoop(geo, gridMaterial));
    }
    for (let k = 0; k < COLS; k++) {
      const lon = CELL_LON / 2 + k * CELL_LON;
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 48; i++) {
        const lat = latTop + ((latBot - latTop) * i) / 48;
        pts.push(new THREE.Vector3(...slotPosition(lat, lon)).multiplyScalar(1.004));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      gridGeometries.push(geo);
      gridGroup.add(new THREE.Line(geo, gridMaterial));
    }

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

    // curved sphere-patch geometries, one per band (shared by its columns)
    const patchGeos = new Map<number, THREE.BufferGeometry>();
    const stripGeos = new Map<number, THREE.BufferGeometry>();
    for (const lat of LAT_BANDS) {
      patchGeos.set(lat, createPatchGeometry(lat, PATCH_LAT_SPAN, PATCH_LON_SPAN));
      stripGeos.set(
        lat,
        createPatchGeometry(lat + STRIP_LAT_OFFSET, STRIP_LAT_SPAN, STRIP_LON_SPAN, 8, 1)
      );
    }

    // Logical content lives in a 5x12 matrix so vertical row-recycling and
    // filtering can re-address it; rowOffset shifts which base row a
    // physical band displays.
    const baseContent: Project[][] = LAT_BANDS.map(() => []);
    let rowOffset = 0;

    const tiles = slots.map((slot, i) => {
      const project = ranked[i % ranked.length];
      const bandIdx = LAT_BANDS.indexOf(slot.lat);
      const colIdx = Math.round(slot.lon / CELL_LON);
      baseContent[bandIdx][colIdx] = project;
      const rotY = -slot.lon * DEG;

      const material = new THREE.MeshBasicMaterial({
        map: textures.get(project.slug)!.texture,
        transparent: true,
        side: THREE.FrontSide,
        opacity: slot.angularDist > 1.745 ? 0.08 : 1,
      });
      const mesh = new THREE.Mesh(patchGeos.get(slot.lat)!, material);
      mesh.position.set(...slot.position);
      mesh.rotation.y = rotY;
      mesh.userData = { project } satisfies TileData;
      tileGroup.add(mesh);

      const stripMaterial = new THREE.MeshBasicMaterial({
        map: stripTextures.get(project.slug)!.texture,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const strip = new THREE.Mesh(stripGeos.get(slot.lat)!, stripMaterial);
      strip.position.set(...slotPosition(slot.lat + STRIP_LAT_OFFSET, slot.lon));
      strip.rotation.y = rotY;
      stripGroup.add(strip);

      return { mesh, material, strip, stripMaterial, project, bandIdx, colIdx };
    });

    type TileEntry = (typeof tiles)[number];
    const displayedProject = (entry: TileEntry): Project =>
      baseContent[mod(entry.bandIdx - rowOffset, LAT_BANDS.length)][entry.colIdx];

    const applyContent = (entry: TileEntry) => {
      const next = displayedProject(entry);
      if (entry.project.slug === next.slug) return;
      entry.project = next;
      (entry.mesh.userData as TileData).project = next;
      entry.material.map = textures.get(next.slug)!.texture;
      entry.stripMaterial.map = stripTextures.get(next.slug)!.texture;
    };

    const remap = () => tiles.forEach(applyContent);

    // --- rotation state (pitch is unclamped; rows recycle every cell) ---
    let yaw = 0;
    let pitch = 0;
    let targetYaw = 0;
    let targetPitch = 0;
    let inertia = 0;
    let inertiaY = 0;
    const CELL_RAD = CELL_LAT * DEG;
    const HALF_CELL_RAD = CELL_RAD / 2;

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
      gridMaterial.color.setHex(0x0a0a0b);
      gsap.to(gridMaterial.color, {
        r: ((GRID_COLOR >> 16) & 255) / 255,
        g: ((GRID_COLOR >> 8) & 255) / 255,
        b: (GRID_COLOR & 255) / 255,
        duration: 1.2,
        delay: 0.3,
        onUpdate: () => requestRender(),
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
    let dragVelY = 0;
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
      dragVelY = 0;
      inertia = 0;
      inertiaY = 0;
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
        targetPitch -= dy * 0.003;
        dragVel = dragVel * 0.5 + dx * 0.0045 * 0.5;
        dragVelY = dragVelY * 0.5 + -dy * 0.003 * 0.5;
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
        inertiaY = dragVelY;
        requestRender(2000);
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (modeRef.current !== "active") return;
      e.preventDefault();
      targetYaw += e.deltaX * 0.0012;
      targetPitch += e.deltaY * 0.0012;
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
      targetPitch += dPitch;
      requestRender(1500);
    };

    openFrontRef.current = () => {
      let best: THREE.Mesh | null = null;
      let bestDot = -Infinity;
      const wp = new THREE.Vector3();
      for (const { mesh } of tiles) {
        mesh.getWorldPosition(wp);
        const dot = wp.normalize().dot(FORWARD);
        if (dot > bestDot) {
          bestDot = dot;
          best = mesh;
        }
      }
      if (best) onSelectRef.current(best.userData.project as Project);
    };

    // Filtering never empties cells: every tile crossfades to a project
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
        baseContent[mod(entry.bandIdx - rowOffset, LAT_BANDS.length)][
          entry.colIdx
        ] = next;
        if (entry.project.slug === next.slug) return;

        gsap.killTweensOf(entry.material);
        if (reducedMotion) {
          applyContent(entry);
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
          onComplete: () => applyContent(entry),
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

    // --- video scheduling: rVFC-driven compositing, max 2 playing ---
    const vfcToken = new Map<string, number>();
    const startVfc = (slug: string, video: HTMLVideoElement) => {
      const token = (vfcToken.get(slug) ?? 0) + 1;
      vfcToken.set(slug, token);
      const tick = () => {
        if (vfcToken.get(slug) !== token || video.paused) return;
        textures.get(slug)!.drawVideo(video);
        requestRender(80);
        video.requestVideoFrameCallback(tick);
      };
      video.requestVideoFrameCallback(tick);
    };

    // --- frame loop (render on demand) ---
    const clock = new THREE.Clock();
    const wp = new THREE.Vector3();
    const videoDots = new Map<string, number>();
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
      if (Math.abs(inertiaY) > 0.00005) {
        targetPitch += inertiaY;
        inertiaY *= 0.94;
        requestRender();
      } else {
        inertiaY = 0;
      }

      const moving =
        Math.abs(targetYaw - yaw) > 0.0001 ||
        Math.abs(targetPitch - pitch) > 0.0001;
      if (!moving && performance.now() > wakeUntil) return;

      const k = 1 - Math.exp(-5 * dt);
      yaw += (targetYaw - yaw) * k;
      pitch += (targetPitch - pitch) * k;

      // endless vertical spin: physical pitch stays within half a cell while
      // content shifts one row per crossing — the snap is frame-exact, so
      // the rendered image is identical and the seam invisible.
      let shifted = false;
      while (pitch > HALF_CELL_RAD) {
        pitch -= CELL_RAD;
        targetPitch -= CELL_RAD;
        rowOffset--;
        shifted = true;
      }
      while (pitch < -HALF_CELL_RAD) {
        pitch += CELL_RAD;
        targetPitch += CELL_RAD;
        rowOffset++;
        shifted = true;
      }
      if (shifted) remap();

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

      // play only the two front-most videos
      let first: string | null = null;
      let second: string | null = null;
      for (const [slug, dot] of videoDots) {
        if (dot <= 0.6) continue;
        if (first === null || dot > videoDots.get(first)!) {
          second = first;
          first = slug;
        } else if (second === null || dot > videoDots.get(second)!) {
          second = slug;
        }
      }
      for (const [slug, video] of videos) {
        const shouldPlay =
          modeRef.current === "active" &&
          !document.hidden &&
          (slug === first || slug === second);
        if (shouldPlay && video.paused) {
          video.play().catch(() => {});
          startVfc(slug, video);
        } else if (!shouldPlay && !video.paused) {
          video.pause();
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
      gsap.killTweensOf(gridMaterial.color);
      textures.forEach((t) => t.dispose());
      stripTextures.forEach((t) => t.dispose());
      patchGeos.forEach((g) => g.dispose());
      stripGeos.forEach((g) => g.dispose());
      gridGeometries.forEach((g) => g.dispose());
      gridMaterial.dispose();
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
    const STEP = (CELL_LON * Math.PI) / 180;
    const PITCH_STEP = (CELL_LAT * Math.PI) / 180;
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
          rotateByRef.current(0, -PITCH_STEP);
          break;
        case "ArrowDown":
          rotateByRef.current(0, PITCH_STEP);
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
