import * as THREE from "three";
import type { Project } from "@/lib/projects";

const COLORS = {
  coverFallback: "#11203a",
  coverFallbackEnd: "#182b4d",
  caption: "#e4eaf5",
  meta: "#8593ad",
  strip: "#56627d",
};

let monoCache: string | null = null;
function monoFamily(): string {
  if (!monoCache) {
    const v = getComputedStyle(document.documentElement)
      .getPropertyValue("--font-geist")
      .trim();
    monoCache = v ? `${v}, monospace` : `"Geist Mono", "SF Mono", Menlo, monospace`;
  }
  return monoCache;
}

function coverFit(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  sw: number,
  sh: number,
  w: number,
  h: number
) {
  const srcRatio = sw / sh;
  const dstRatio = w / h;
  let dw = w;
  let dh = h;
  if (srcRatio > dstRatio) {
    dw = h * srcRatio;
  } else {
    dh = w / srcRatio;
  }
  ctx.drawImage(source, (w - dw) / 2, (h - dh) / 2, dw, dh);
}

/** Scrim + caption + hairline border, pre-rendered once so video frames
 *  can be composited per-frame with just two drawImage calls. */
function buildOverlay(project: Project, w: number, h: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const s = w / 1024;

  const grad = ctx.createLinearGradient(0, h * 0.6, 0, h);
  grad.addColorStop(0, "rgba(4, 9, 18, 0)");
  grad.addColorStop(1, "rgba(4, 9, 18, 0.82)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, h * 0.6, w, h * 0.4);

  const pad = 34 * s;
  const baseline = h - 32 * s;
  ctx.textBaseline = "alphabetic";
  if ("letterSpacing" in ctx) {
    (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
      `${2 * s}px`;
  }

  ctx.font = `500 ${23 * s}px ${monoFamily()}`;
  ctx.fillStyle = COLORS.meta;
  const yearText = String(project.year);
  const yearW = ctx.measureText(yearText).width;
  ctx.fillText(yearText, w - pad - yearW, baseline);

  ctx.fillStyle = COLORS.caption;
  ctx.fillText(
    project.title.toUpperCase(),
    pad,
    baseline,
    w - pad * 3 - yearW
  );

  return canvas;
}

export interface TileTexture {
  texture: THREE.CanvasTexture;
  /** Composite a playing video frame under the cached caption overlay. */
  drawVideo: (video: HTMLVideoElement) => void;
  dispose: () => void;
}

/**
 * Builds a CanvasTexture for a project tile: full-bleed cover under a
 * scrim/caption overlay. Renders a placeholder immediately, re-composites
 * when the cover image and the web fonts load.
 */
export function createTileTexture(
  project: Project,
  width: number,
  height: number,
  anisotropy: number,
  onUpgrade: () => void
): TileTexture {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  let overlay = buildOverlay(project, width, height);
  let coverImg: HTMLImageElement | null = null;
  let disposed = false;

  const draw = () => {
    if (coverImg) {
      coverFit(ctx, coverImg, coverImg.width, coverImg.height, width, height);
    } else {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, COLORS.coverFallbackEnd);
      grad.addColorStop(1, COLORS.coverFallback);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }
    ctx.drawImage(overlay, 0, 0);
  };

  draw();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = anisotropy;

  const refresh = () => {
    if (disposed) return;
    draw();
    texture.needsUpdate = true;
    onUpgrade();
  };

  const img = new Image();
  img.onload = () => {
    coverImg = img;
    refresh();
  };
  img.src = project.cover;

  document.fonts.ready.then(() => {
    if (disposed) return;
    overlay = buildOverlay(project, width, height);
    refresh();
  });

  return {
    texture,
    drawVideo: (video) => {
      if (disposed || video.readyState < 2) return;
      coverFit(ctx, video, video.videoWidth, video.videoHeight, width, height);
      ctx.drawImage(overlay, 0, 0);
      texture.needsUpdate = true;
    },
    dispose: () => {
      disposed = true;
      texture.dispose();
    },
  };
}

export interface StripTexture {
  texture: THREE.CanvasTexture;
  dispose: () => void;
}

/** Mono metadata strip ("THEME — YEAR") shown in the gap below a tile. */
export function createStripTexture(
  project: Project,
  anisotropy: number,
  onUpgrade: () => void
): StripTexture {
  const w = 512;
  const h = 40;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    if ("letterSpacing" in ctx) {
      (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
        "3px";
    }
    ctx.font = `500 19px ${monoFamily()}`;
    ctx.fillStyle = COLORS.strip;
    ctx.textBaseline = "middle";
    const label = `${project.themes[0].replace("-", " / ").toUpperCase()} — ${project.year}`;
    ctx.fillText(label, 2, h / 2);
  };

  draw();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = anisotropy;

  let disposed = false;
  document.fonts.ready.then(() => {
    if (disposed) return;
    draw();
    texture.needsUpdate = true;
    onUpgrade();
  });

  return {
    texture,
    dispose: () => {
      disposed = true;
      texture.dispose();
    },
  };
}
