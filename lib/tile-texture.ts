import * as THREE from "three";
import type { Project } from "@/lib/projects";

const SANS = `"Inter", -apple-system, "Segoe UI", sans-serif`;
const MONO = `"JetBrains Mono", "SF Mono", Menlo, monospace`;

const COLORS = {
  card: "#11203a",
  coverFallback: "#182b4d",
  border: "rgba(228, 234, 245, 0.10)",
  title: "#e4eaf5",
  subtitle: "#8593ad",
  meta: "#56627d",
  chipBorder: "rgba(228, 234, 245, 0.16)",
  chipText: "#8593ad",
};

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function draw(
  ctx: CanvasRenderingContext2D,
  project: Project,
  w: number,
  h: number,
  cover: HTMLImageElement | null
) {
  const s = w / 1024; // scale factor relative to design size
  ctx.clearRect(0, 0, w, h);

  const radius = 28 * s;
  roundedRectPath(ctx, 0, 0, w, h, radius);
  ctx.save();
  ctx.clip();

  // card base
  ctx.fillStyle = COLORS.card;
  ctx.fillRect(0, 0, w, h);

  // cover area (top ~62%)
  const coverH = Math.round(h * 0.62);
  if (cover) {
    const imgRatio = cover.width / cover.height;
    const areaRatio = w / coverH;
    let dw = w;
    let dh = coverH;
    if (imgRatio > areaRatio) {
      dw = coverH * imgRatio;
    } else {
      dh = w / imgRatio;
    }
    ctx.drawImage(cover, (w - dw) / 2, (coverH - dh) / 2, dw, dh);
  } else {
    const grad = ctx.createLinearGradient(0, 0, w, coverH);
    grad.addColorStop(0, COLORS.coverFallback);
    grad.addColorStop(1, COLORS.card);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, coverH);
  }

  // text block
  const pad = 44 * s;
  let cursorY = coverH + 62 * s;

  ctx.fillStyle = COLORS.title;
  ctx.font = `600 ${46 * s}px ${SANS}`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(project.title, pad, cursorY, w - pad * 2);

  cursorY += 44 * s;
  ctx.fillStyle = COLORS.subtitle;
  ctx.font = `400 ${27 * s}px ${SANS}`;
  ctx.fillText(project.subtitle, pad, cursorY, w - pad * 2);

  // bottom meta row: theme chips left, year right
  const chipFontSize = 19 * s;
  const chipH = 38 * s;
  const chipY = h - pad - chipH;
  ctx.font = `500 ${chipFontSize}px ${MONO}`;
  let chipX = pad;
  for (const theme of project.themes.slice(0, 3)) {
    const label = theme.toUpperCase();
    const tw = ctx.measureText(label).width;
    const chipW = tw + 28 * s;
    roundedRectPath(ctx, chipX, chipY, chipW, chipH, chipH / 2);
    ctx.strokeStyle = COLORS.chipBorder;
    ctx.lineWidth = 1.5 * s;
    ctx.stroke();
    ctx.fillStyle = COLORS.chipText;
    ctx.fillText(label, chipX + 14 * s, chipY + chipH / 2 + chipFontSize * 0.36);
    chipX += chipW + 12 * s;
  }

  ctx.fillStyle = COLORS.meta;
  ctx.font = `500 ${21 * s}px ${MONO}`;
  const yearText = String(project.year);
  const yearW = ctx.measureText(yearText).width;
  ctx.fillText(yearText, w - pad - yearW, chipY + chipH / 2 + 21 * s * 0.36);

  ctx.restore();

  // hairline border
  roundedRectPath(ctx, 0.75, 0.75, w - 1.5, h - 1.5, radius);
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 1.5 * s;
  ctx.stroke();
}

export interface TileTexture {
  texture: THREE.CanvasTexture;
  dispose: () => void;
}

/**
 * Builds a CanvasTexture for a project tile. Renders immediately with a
 * placeholder cover, then re-composites once the cover image loads.
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

  draw(ctx, project, width, height, null);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = anisotropy;

  let disposed = false;
  const img = new Image();
  img.onload = () => {
    if (disposed) return;
    draw(ctx, project, width, height, img);
    texture.needsUpdate = true;
    onUpgrade();
  };
  img.src = project.cover;

  return {
    texture,
    dispose: () => {
      disposed = true;
      texture.dispose();
    },
  };
}
