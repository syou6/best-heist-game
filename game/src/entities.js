// The living pieces of Vault Night: the thief, the guards, the cameras, and the
// alarm they feed. This module owns the whole game state and its rules; the
// renderer only reads it, and main.js only feeds it input and time.

import {
  CAMERA_SPOTS, EXIT_ZONE, FLOOR, GUARD_PATROLS, LOOT_SPOTS, PLAYER_START, TUNING, WALLS,
} from './level.js';
import { angleDifference, pointInRect, slideMove, visionStrength } from './vision.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_WON = 'won';
export const SCREEN_BUSTED = 'busted';

const GUARD_PAUSE_SECONDS = 1.1;
const INVESTIGATE_LOOK_SECONDS = 1.8;
const CAMERA_FILL_PER_SECOND = 42;

export function createGame() {
  return {
    screen: SCREEN_TITLE,
    time: 0,
    elapsed: 0,
    alarm: 0,
    alarmPeak: 0,
    bustReason: '',
    player: {
      x: PLAYER_START.x, y: PLAYER_START.y, facing: -Math.PI / 2,
      sneaking: false, moving: false, hasGem: false, stepPhase: 0,
    },
    guards: GUARD_PATROLS.map((patrol) => ({
      x: patrol[0].x, y: patrol[0].y, facing: Math.PI / 2,
      patrol, waypoint: 1, pauseLeft: 0,
      mode: 'patrol', // patrol | investigate | chase | look
      targetX: patrol[0].x, targetY: patrol[0].y, lookLeft: 0,
      seesPlayer: 0,
    })),
    cameras: CAMERA_SPOTS.map((spot) => ({ ...spot, facing: spot.base, seesPlayer: 0 })),
    loot: LOOT_SPOTS.map((spot) => ({ ...spot, taken: false })),
    lootTaken: 0,
    haul: 0,
    coinsLeft: TUNING.coinCount,
    coin: null, // { x, y, ripple } while a thrown coin is clinking
    events: [], // sound cues for main.js: 'pickup' | 'coin' | 'spotted' | 'busted' | 'won'
  };
}

function moveGuardToward(guard, tx, ty, speed, dt) {
  const dx = tx - guard.x;
  const dy = ty - guard.y;
  const distance = Math.hypot(dx, dy);
  if (distance < 2) return true;
  const step = Math.min(distance, speed * dt);
  const next = slideMove(guard, TUNING.guardRadius, (dx / distance) * step, (dy / distance) * step, WALLS, FLOOR);
  guard.x = next.x;
  guard.y = next.y;
  const wanted = Math.atan2(dy, dx);
  guard.facing += angleDifference(wanted, guard.facing) * Math.min(1, dt * 10);
  return distance <= step + 2;
}

function updateGuard(game, guard, dt) {
  const player = game.player;
  guard.seesPlayer = visionStrength(
    guard, guard.facing, TUNING.guardViewRadius, TUNING.guardViewHalfAngle, player, WALLS,
  );

  if (guard.seesPlayer > 0 && game.alarm > 12) guard.mode = 'chase';

  if (guard.mode === 'chase') {
    if (guard.seesPlayer > 0) {
      guard.targetX = player.x;
      guard.targetY = player.y;
    }
    const arrived = moveGuardToward(guard, guard.targetX, guard.targetY, TUNING.guardChaseSpeed, dt);
    if (arrived && guard.seesPlayer === 0) {
      guard.mode = 'look';
      guard.lookLeft = INVESTIGATE_LOOK_SECONDS;
    }
    return;
  }

  if (guard.mode === 'investigate') {
    const arrived = moveGuardToward(guard, guard.targetX, guard.targetY, TUNING.guardInvestigateSpeed, dt);
    if (arrived) {
      guard.mode = 'look';
      guard.lookLeft = INVESTIGATE_LOOK_SECONDS;
    }
    return;
  }

  if (guard.mode === 'look') {
    guard.lookLeft -= dt;
    guard.facing += dt * 1.7;
    if (guard.lookLeft <= 0) guard.mode = 'patrol';
    return;
  }

  // Patrol: walk the loop, pause and glance around at each waypoint.
  if (guard.pauseLeft > 0) {
    guard.pauseLeft -= dt;
    guard.facing += dt * 0.9;
    return;
  }
  const spot = guard.patrol[guard.waypoint];
  if (moveGuardToward(guard, spot.x, spot.y, TUNING.guardPatrolSpeed, dt)) {
    guard.waypoint = (guard.waypoint + 1) % guard.patrol.length;
    guard.pauseLeft = GUARD_PAUSE_SECONDS;
  }
}

function updatePlayer(game, input, dt) {
  const player = game.player;
  let dx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  let dy = (input.down ? 1 : 0) - (input.up ? 1 : 0);
  player.moving = dx !== 0 || dy !== 0;
  player.sneaking = Boolean(input.sneak);
  if (player.moving) {
    const length = Math.hypot(dx, dy);
    dx /= length;
    dy /= length;
    const speed = player.sneaking ? TUNING.playerSneakSpeed : TUNING.playerWalkSpeed;
    const next = slideMove(player, TUNING.playerRadius, dx * speed * dt, dy * speed * dt, WALLS, FLOOR);
    player.x = next.x;
    player.y = next.y;
    player.facing = Math.atan2(dy, dx);
    player.stepPhase += dt * (player.sneaking ? 6 : 10);
  }

  // Loot is lifted by walking up to its case and pressing the grab key (or just
  // brushing past slowly while sneaking — a practised hand).
  for (const item of game.loot) {
    if (item.taken) continue;
    const near = Math.hypot(item.x - player.x, item.y - player.y) < TUNING.lootPickupDistance;
    if (near && (input.grab || player.sneaking)) {
      item.taken = true;
      game.lootTaken += 1;
      game.haul += item.value;
      if (item.kind === 'gem') player.hasGem = true;
      game.events.push('pickup');
    }
  }

  // The way out only counts once the Star Diamond is in the bag.
  if (player.hasGem && pointInRect(player.x, player.y, EXIT_ZONE)) {
    game.screen = SCREEN_WON;
    game.events.push('won');
  }
}

/** Throw a decoy coin toward (x, y): guards nearby leave their patrol to look. */
export function throwCoin(game, x, y) {
  if (game.screen !== SCREEN_PLAY || game.coinsLeft <= 0) return;
  game.coinsLeft -= 1;
  game.coin = { x, y, ripple: 0 };
  game.events.push('coin');
  for (const guard of game.guards) {
    if (guard.mode === 'chase') continue;
    if (Math.hypot(guard.x - x, guard.y - y) < TUNING.coinLureRadius) {
      guard.mode = 'investigate';
      guard.targetX = x;
      guard.targetY = y;
    }
  }
}

function updateDetection(game, dt) {
  const player = game.player;
  let fill = 0;
  for (const guard of game.guards) {
    if (guard.seesPlayer > 0) fill = Math.max(fill, guard.seesPlayer * 62);
  }
  for (const camera of game.cameras) {
    camera.facing = camera.base + Math.sin((game.time / camera.period) * Math.PI * 2) * camera.sweep;
    camera.seesPlayer = visionStrength(
      camera, camera.facing, TUNING.cameraViewRadius, TUNING.cameraViewHalfAngle, player, WALLS,
    );
    if (camera.seesPlayer > 0) fill = Math.max(fill, camera.seesPlayer * CAMERA_FILL_PER_SECOND);
  }
  if (player.sneaking) fill *= 0.55;
  const wasQuiet = game.alarm < 30;
  if (fill > 0) game.alarm = Math.min(TUNING.alarmMax, game.alarm + fill * dt);
  else game.alarm = Math.max(0, game.alarm - TUNING.alarmDecayPerSecond * dt);
  game.alarmPeak = Math.max(game.alarmPeak, game.alarm);
  if (wasQuiet && game.alarm >= 30) game.events.push('spotted');

  if (game.alarm >= TUNING.alarmMax) {
    game.screen = SCREEN_BUSTED;
    game.bustReason = 'The alarm hit full — the vault sealed and the floor locked down.';
    game.events.push('busted');
    return;
  }
  for (const guard of game.guards) {
    if (Math.hypot(guard.x - player.x, guard.y - player.y) < TUNING.catchDistance) {
      game.screen = SCREEN_BUSTED;
      game.bustReason = 'A guard got a hand on your coat. The night is over.';
      game.events.push('busted');
      return;
    }
  }
}

/** Advance the whole game by dt seconds. `input` is main.js's keyboard state. */
export function updateGame(game, input, dt) {
  game.time += dt;
  if (game.coin) {
    game.coin.ripple += dt;
    if (game.coin.ripple > 1.2) game.coin = null;
  }
  if (game.screen !== SCREEN_PLAY) return;
  game.elapsed += dt;
  updatePlayer(game, input, dt);
  if (game.screen !== SCREEN_PLAY) return;
  for (const guard of game.guards) updateGuard(game, guard, dt);
  updateDetection(game, dt);
}

/** The final score breakdown, shown on the getaway screen. */
export function scoreBreakdown(game) {
  const timeBonus = Math.max(0, 3000 - Math.floor(game.elapsed) * 10);
  const ghostBonus = game.alarmPeak < 75 ? 1500 : 0;
  return {
    haul: game.haul,
    timeBonus,
    ghostBonus,
    total: game.haul + timeBonus + ghostBonus,
  };
}
