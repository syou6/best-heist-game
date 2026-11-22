// Sight geometry for Vault Night: vision cones and line of sight.
// A point is visible from an eye when it sits inside the cone (range + half angle)
// and the straight line between them crosses no wall. Walls are rectangles, so
// line of sight is tested by walking the segment in small steps — the floor is
// small, and a 6 px step never tunnels through an 18 px wall.

const LOS_STEP = 6;

export function angleDifference(a, b) {
  let d = (a - b) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function pointInRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

/** True when the segment (x1,y1)->(x2,y2) stays clear of every wall rect. */
export function lineOfSightClear(x1, y1, x2, y2, walls) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = Math.hypot(dx, dy);
  const steps = Math.max(1, Math.ceil(distance / LOS_STEP));
  for (let i = 1; i < steps; i += 1) {
    const t = i / steps;
    const x = x1 + dx * t;
    const y = y1 + dy * t;
    for (const wall of walls) {
      if (pointInRect(x, y, wall)) return false;
    }
  }
  return true;
}

/**
 * How strongly an eye sees a target: 0 when unseen, otherwise a 0..1 strength
 * that grows as the target gets closer to the eye. Used both for the alarm
 * fill rate and for tinting the cone where the thief stands.
 */
export function visionStrength(eye, facing, radius, halfAngle, target, walls) {
  const dx = target.x - eye.x;
  const dy = target.y - eye.y;
  const distance = Math.hypot(dx, dy);
  if (distance > radius) return 0;
  const angle = Math.atan2(dy, dx);
  if (Math.abs(angleDifference(angle, facing)) > halfAngle) return 0;
  if (!lineOfSightClear(eye.x, eye.y, target.x, target.y, walls)) return 0;
  return 1.25 - distance / radius;
}

/** True when a circle at (x, y) with radius r overlaps any wall rect. */
export function circleHitsWall(x, y, r, walls) {
  for (const wall of walls) {
    const nearX = Math.max(wall.x, Math.min(x, wall.x + wall.w));
    const nearY = Math.max(wall.y, Math.min(y, wall.y + wall.h));
    if (Math.hypot(x - nearX, y - nearY) < r) return true;
  }
  return false;
}

/**
 * Move a circle by (dx, dy), sliding along walls: each axis is tried on its own
 * so a diagonal push into a wall still glides along it. The floor bounds act as
 * the outer walls. Returns the new position.
 */
export function slideMove(pos, radius, dx, dy, walls, floor) {
  let { x, y } = pos;
  const tryX = x + dx;
  if (!circleHitsWall(tryX, y, radius, walls) && tryX - radius >= floor.left && tryX + radius <= floor.right) {
    x = tryX;
  }
  const tryY = y + dy;
  if (!circleHitsWall(x, tryY, radius, walls) && tryY - radius >= floor.top && tryY + radius <= floor.bottom) {
    y = tryY;
  }
  return { x, y };
}
