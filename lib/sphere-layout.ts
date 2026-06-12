import * as THREE from "three";

export const SPHERE_RADIUS = 10;

// Uniform angular grid, phantom-style: every cell spans the same angular
// extent, so columns align across rows and all cells subtend equal angles
// from the camera at the sphere's center. Cards are curved sphere patches
// filling their cell; the remainder is the gutter where grid lines run.
export const CELL_LAT = 22;
export const CELL_LON = 30;
export const PATCH_LAT_SPAN = 17;
export const PATCH_LON_SPAN = 24.5;
export const LAT_BANDS = [44, 22, 0, -22, -44];
export const COLS = 360 / CELL_LON;

// Mono metadata strip sits ON the row-boundary grid line below each card.
export const STRIP_LAT_OFFSET = -CELL_LAT / 2;
export const STRIP_LAT_SPAN = 2.2;
export const STRIP_LON_SPAN = 24.5;

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
 * Point on the vertically-flattened surface that makes rows foreshorten.
 * Surface normals rotate (1-k)x slower than on a sphere while rows keep
 * their arc-length height, so off-center rows tip AWAY from the view ray
 * by k*lat and read as trapezoids. k = 0 is the plain sphere; k = 1 is a
 * vertical cylinder (normals all forward — the strongest clean tilt, with
 * meridians converging to a vanishing point that scrolling never reaches).
 * Cards, strips, and grid lines must all use this so they warp together.
 */
export function warpedPosition(
  latDeg: number,
  lonDeg: number,
  k: number
): [number, number, number] {
  const lon = lonDeg * DEG;
  const latRad = latDeg * DEG;
  const g = 1 - k;
  let y: number;
  let rho: number;
  if (Math.abs(g) < 1e-6) {
    y = SPHERE_RADIUS * latRad;
    rho = SPHERE_RADIUS;
  } else {
    y = (SPHERE_RADIUS / g) * Math.sin(g * latRad);
    rho = SPHERE_RADIUS - (SPHERE_RADIUS / g) * (1 - Math.cos(g * latRad));
  }
  return [rho * Math.sin(lon), y, -rho * Math.cos(lon)];
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
 * Re-projects a patch's vertices for the latitude it currently appears at.
 * Pitch is NOT a rigid rotation of the sphere: band patches aren't congruent
 * (physical width shrinks with cos(lat)), so rotating them makes row
 * recycling visibly snap. Instead the patch is rebuilt from its visual
 * latitude every frame — its shape is then purely a function of where it
 * appears, which makes the 22° row-recycle wrap exactly seamless.
 * Vertices are relative to the cell-center point so meshes are placed with
 * `position = slotPosition(lat, lon)` + `rotation.y = -lon` and hover
 * scaling pivots about the card center.
 */
export function writePatchPositions(
  geometry: THREE.BufferGeometry,
  latCenterDeg: number,
  latSpanDeg: number,
  lonSpanDeg: number,
  segsX = 8,
  segsY = 6,
  k = 0
): void {
  const center = warpedPosition(latCenterDeg, 0, k);
  const attr = geometry.getAttribute("position") as THREE.BufferAttribute;
  let i = 0;
  for (let iy = 0; iy <= segsY; iy++) {
    const lat = latCenterDeg + latSpanDeg / 2 - (iy * latSpanDeg) / segsY;
    for (let ix = 0; ix <= segsX; ix++) {
      const lon = -lonSpanDeg / 2 + (ix * lonSpanDeg) / segsX;
      const p = warpedPosition(lat, lon, k);
      attr.setXYZ(i++, p[0] - center[0], p[1] - center[1], p[2] - center[2]);
    }
  }
  attr.needsUpdate = true;
  geometry.computeBoundingSphere();
}

/** Curved sphere patch spanning an angular cell; front faces the camera
 *  inside the sphere. Positions are (re)written via writePatchPositions. */
export function createPatchGeometry(
  latCenterDeg: number,
  latSpanDeg: number,
  lonSpanDeg: number,
  segsX = 8,
  segsY = 6
): THREE.BufferGeometry {
  const uvs: number[] = [];
  const indices: number[] = [];
  for (let iy = 0; iy <= segsY; iy++) {
    for (let ix = 0; ix <= segsX; ix++) {
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
    new THREE.Float32BufferAttribute(
      new Array((segsX + 1) * (segsY + 1) * 3).fill(0),
      3
    )
  );
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  writePatchPositions(geometry, latCenterDeg, latSpanDeg, lonSpanDeg, segsX, segsY);
  return geometry;
}
