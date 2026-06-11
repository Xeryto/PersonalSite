import * as THREE from "three";

export const SPHERE_RADIUS = 10;

// Uniform angular grid, phantom-style: every cell spans the same angular
// extent, so columns align across rows and all cells subtend equal angles
// from the camera at the sphere's center. Cards are curved sphere patches
// filling their cell; the remainder is the gutter where grid lines run.
export const CELL_LAT = 22;
export const CELL_LON = 30;
export const PATCH_LAT_SPAN = 19.5;
export const PATCH_LON_SPAN = 27.5;
export const LAT_BANDS = [44, 22, 0, -22, -44];
export const COLS = 360 / CELL_LON;

// Mono metadata strip sits ON the row-boundary grid line below each card.
export const STRIP_LAT_OFFSET = -CELL_LAT / 2;
export const STRIP_LAT_SPAN = 2.2;
export const STRIP_LON_SPAN = 26;

export interface Slot {
  position: [number, number, number];
  angularDist: number;
  lat: number;
  lon: number;
}

const DEG = Math.PI / 180;

export function slotPosition(
  latDeg: number,
  lonDeg: number
): [number, number, number] {
  const lat = latDeg * DEG;
  const lon = lonDeg * DEG;
  return [
    SPHERE_RADIUS * Math.cos(lat) * Math.sin(lon),
    SPHERE_RADIUS * Math.sin(lat),
    -SPHERE_RADIUS * Math.cos(lat) * Math.cos(lon),
  ];
}

/**
 * 5 bands x 12 aligned columns = 60 cells, sorted by angular distance from
 * the initial forward vector (0,0,-1) so index 0 is the most prominent slot.
 */
export function generateSlots(): Slot[] {
  const slots: Slot[] = [];
  for (const lat of LAT_BANDS) {
    for (let i = 0; i < COLS; i++) {
      const lon = i * CELL_LON;
      const position = slotPosition(lat, lon);
      const angularDist = Math.acos(
        Math.min(1, Math.max(-1, -position[2] / SPHERE_RADIUS))
      );
      slots.push({ position, angularDist, lat, lon });
    }
  }
  return slots.sort((a, b) => a.angularDist - b.angularDist);
}

/**
 * Curved sphere patch spanning an angular cell, built at lon 0 with vertex
 * positions relative to the cell-center point so meshes can be placed with
 * `position = slotPosition(lat, lon)` + `rotation.y = -lon` and hover
 * scaling pivots about the card center. Front faces point at the camera
 * inside the sphere.
 */
export function createPatchGeometry(
  latCenterDeg: number,
  latSpanDeg: number,
  lonSpanDeg: number,
  segsX = 8,
  segsY = 6
): THREE.BufferGeometry {
  const center = slotPosition(latCenterDeg, 0);
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let iy = 0; iy <= segsY; iy++) {
    const lat = latCenterDeg + latSpanDeg / 2 - (iy * latSpanDeg) / segsY;
    for (let ix = 0; ix <= segsX; ix++) {
      const lon = -lonSpanDeg / 2 + (ix * lonSpanDeg) / segsX;
      const p = slotPosition(lat, lon);
      positions.push(p[0] - center[0], p[1] - center[1], p[2] - center[2]);
      uvs.push(ix / segsX, 1 - iy / segsY);
    }
  }
  for (let iy = 0; iy < segsY; iy++) {
    for (let ix = 0; ix < segsX; ix++) {
      const a = iy * (segsX + 1) + ix;
      const b = a + 1;
      const c = a + segsX + 1;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  return geometry;
}
