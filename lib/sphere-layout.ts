export const SPHERE_RADIUS = 10;
export const TILE_WIDTH = 5.8;
export const TILE_HEIGHT = 3.625;

const LAT_BANDS = [26, 0, -26];
const LON_COUNT = 6;
const LON_STEP = 360 / LON_COUNT;

export interface Slot {
  position: [number, number, number];
  angularDist: number;
}

const DEG = Math.PI / 180;

function slotPosition(latDeg: number, lonDeg: number): [number, number, number] {
  const lat = latDeg * DEG;
  const lon = lonDeg * DEG;
  return [
    SPHERE_RADIUS * Math.cos(lat) * Math.sin(lon),
    SPHERE_RADIUS * Math.sin(lat),
    -SPHERE_RADIUS * Math.cos(lat) * Math.cos(lon),
  ];
}

/**
 * 3 latitude bands x 6 longitudes, top/bottom rows offset by half a step
 * (brick stagger) so the middle row's first slot sits dead ahead of the
 * initial camera. Sorted by angular distance from the initial forward
 * vector (0,0,-1) so index 0 is the most prominent slot.
 */
export function generateSlots(): Slot[] {
  const slots: Slot[] = [];
  LAT_BANDS.forEach((lat, bandIndex) => {
    const offset = bandIndex === 1 ? 0 : LON_STEP / 2;
    for (let i = 0; i < LON_COUNT; i++) {
      const position = slotPosition(lat, offset + i * LON_STEP);
      const angularDist = Math.acos(
        Math.min(1, Math.max(-1, -position[2] / SPHERE_RADIUS))
      );
      slots.push({ position, angularDist });
    }
  });
  return slots.sort((a, b) => a.angularDist - b.angularDist);
}
