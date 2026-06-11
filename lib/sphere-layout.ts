export const SPHERE_RADIUS = 10;
export const TILE_WIDTH = 4.75;
export const TILE_HEIGHT = 3.3;

// Dense phantom-style grid: 5 latitude bands, longitude count scaled by
// cos(lat) so arc-length spacing stays even toward the poles.
const LAT_BANDS = [44, 22, 0, -22, -44];
const EQUATOR_COUNT = 12;

// Mono metadata strip sits centered in the 3° gap below each tile
// (tile spans ±9.5° of its band, next band starts 12.5° away).
export const STRIP_LAT_OFFSET = -11;

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
 * ~52 slots (9/11/12/11/9 per band), each band offset so no two rows'
 * columns align (brick stagger). Sorted by angular distance from the
 * initial forward vector (0,0,-1) so index 0 is the most prominent slot.
 */
export function generateSlots(): Slot[] {
  const slots: Slot[] = [];
  LAT_BANDS.forEach((lat, bandIndex) => {
    const count = Math.round(EQUATOR_COUNT * Math.cos(lat * DEG));
    const step = 360 / count;
    const offset = bandIndex % 2 === 1 ? step / 2 : 0;
    for (let i = 0; i < count; i++) {
      const lon = offset + i * step;
      const position = slotPosition(lat, lon);
      const angularDist = Math.acos(
        Math.min(1, Math.max(-1, -position[2] / SPHERE_RADIUS))
      );
      slots.push({ position, angularDist, lat, lon });
    }
  });
  return slots.sort((a, b) => a.angularDist - b.angularDist);
}
