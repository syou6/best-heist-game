// The Meridian Museum floor for Vault Night: one night-time wing, three rooms.
// Coordinates are world pixels on a 1280x800 stage; the top 56 px are the HUD band,
// so the floor itself runs from y=72 to y=784. Walls and display cases are solid
// rectangles: they block movement and sight alike.

export const STAGE = { width: 1280, height: 800, hudHeight: 56 };
export const FLOOR = { left: 24, top: 72, right: 1256, bottom: 784 };

/** Solid rectangles: the outer shell is implied by FLOOR, these are the interior. */
export const WALLS = [
  // West partition between the gallery and the hall, with a doorway at y 396..486.
  { x: 430, y: 72, w: 18, h: 324 },
  { x: 430, y: 486, w: 18, h: 298 },
  // Vault wall along the south of the vault room, its door at x 990..1074.
  { x: 848, y: 452, w: 142, h: 18 },
  { x: 1074, y: 452, w: 182, h: 18 },
  // Vault's west wall, running down from the ceiling to the vault wall.
  { x: 848, y: 72, w: 18, h: 380 },
  // Display cases and plinths (low, but they block sight and feet).
  { x: 118, y: 196, w: 96, h: 42 },
  { x: 226, y: 356, w: 96, h: 42 },
  { x: 612, y: 216, w: 116, h: 46 },
  { x: 612, y: 430, w: 116, h: 46 },
  { x: 148, y: 566, w: 116, h: 46 },
  { x: 690, y: 622, w: 40, h: 40 },
  { x: 540, y: 118, w: 40, h: 40 },
];

/** The way in is the way out: the service door the thief slipped through. */
export const EXIT_ZONE = { x: 40, y: 724, w: 118, h: 52 };

export const PLAYER_START = { x: 98, y: 690 };

/** Loot on display. The Star Diamond (kind 'gem') is the night's real target. */
export const LOOT_SPOTS = [
  { x: 166, y: 176, kind: 'painting', name: 'Gilded Seascape', value: 500 },
  { x: 274, y: 336, kind: 'vase', name: 'Celadon Vase', value: 500 },
  { x: 670, y: 196, kind: 'crown', name: 'Sun Crown', value: 800 },
  { x: 670, y: 410, kind: 'mask', name: 'Jade Mask', value: 800 },
  { x: 206, y: 546, kind: 'coins', name: 'Coin Hoard', value: 500 },
  { x: 952, y: 300, kind: 'chalice', name: 'Abbot’s Chalice', value: 800 },
  { x: 1150, y: 150, kind: 'gem', name: 'The Star Diamond', value: 5000 },
];

/** Guard patrols: loops of waypoints, walked in order, with a pause at each. */
export const GUARD_PATROLS = [
  [{ x: 196, y: 140 }, { x: 348, y: 140 }, { x: 348, y: 660 }, { x: 196, y: 660 }],
  [{ x: 560, y: 660 }, { x: 560, y: 140 }, { x: 792, y: 140 }, { x: 792, y: 660 }],
  [{ x: 924, y: 168 }, { x: 1196, y: 168 }, { x: 1196, y: 388 }, { x: 924, y: 388 }],
];

/**
 * Wall cameras. Each sits at (x, y) facing `base` radians and sweeps ±`sweep`
 * radians around it with period `period` seconds.
 */
export const CAMERA_SPOTS = [
  { x: 640, y: 76, base: Math.PI / 2, sweep: 0.85, period: 7 },
  { x: 1252, y: 120, base: Math.PI * 0.78, sweep: 0.7, period: 9 },
];

export const TUNING = {
  playerWalkSpeed: 168,
  playerSneakSpeed: 96,
  playerRadius: 13,
  guardPatrolSpeed: 72,
  guardChaseSpeed: 152,
  guardInvestigateSpeed: 112,
  guardRadius: 13,
  guardViewRadius: 196,
  guardViewHalfAngle: 0.56,
  cameraViewRadius: 178,
  cameraViewHalfAngle: 0.42,
  catchDistance: 21,
  lootPickupDistance: 30,
  coinCount: 3,
  coinLureRadius: 270,
  alarmMax: 100,
  alarmDecayPerSecond: 24,
};
