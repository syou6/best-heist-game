// All of Vault Night's drawing: the museum floor, vision cones, the cast, the
// HUD (alarm meter, haul, coins, clock) and the three screens. Canvas 2D only,
// flat shapes with soft shadows — a clean night-time look that stays readable
// when the judge's sheet shrinks it.

import { EXIT_ZONE, FLOOR, STAGE, TUNING, WALLS } from './level.js';
import { SCREEN_BUSTED, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WON, scoreBreakdown } from './entities.js';

const INK = '#e8ecf4';
const DIM = '#9aa5b8';
const GOLD = '#f5c542';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function drawFloor(ctx, game) {
  ctx.fillStyle = '#131722';
  ctx.fillRect(0, 0, STAGE.width, STAGE.height);
  // Tile grid over the play floor.
  ctx.fillStyle = '#171c2a';
  ctx.fillRect(FLOOR.left, FLOOR.top, FLOOR.right - FLOOR.left, FLOOR.bottom - FLOOR.top);
  ctx.strokeStyle = 'rgba(255,255,255,0.045)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = FLOOR.left; x <= FLOOR.right; x += 44) { ctx.moveTo(x, FLOOR.top); ctx.lineTo(x, FLOOR.bottom); }
  for (let y = FLOOR.top; y <= FLOOR.bottom; y += 44) { ctx.moveTo(FLOOR.left, y); ctx.lineTo(FLOOR.right, y); }
  ctx.stroke();
  // A red carpet path from the service door toward the gallery.
  ctx.fillStyle = 'rgba(122, 31, 43, 0.3)';
  ctx.fillRect(52, 470, 66, 268);
  ctx.fillRect(52, 470, 340, 66);
  // Room labels, stencilled on the floor.
  ctx.fillStyle = 'rgba(232,236,244,0.16)';
  ctx.font = '700 21px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('GALLERY', 60, 120);
  ctx.fillText('HALL', 560, 120);
  ctx.fillText('THE VAULT', 1080, 120);

  // The exit: a lit service door in the corner.
  ctx.fillStyle = '#1d2b22';
  ctx.fillRect(EXIT_ZONE.x, EXIT_ZONE.y, EXIT_ZONE.w, EXIT_ZONE.h);
  ctx.strokeStyle = '#3f7d55';
  ctx.lineWidth = 2;
  ctx.strokeRect(EXIT_ZONE.x, EXIT_ZONE.y, EXIT_ZONE.w, EXIT_ZONE.h);
  ctx.fillStyle = '#7fc793';
  ctx.font = '700 15px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(game.player.hasGem ? 'ESCAPE!' : 'EXIT', EXIT_ZONE.x + EXIT_ZONE.w / 2, EXIT_ZONE.y + 32);
  ctx.textAlign = 'left';
}

function drawWalls(ctx) {
  for (const wall of WALLS) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(wall.x + 4, wall.y + 6, wall.w, wall.h);
    const isCase = wall.h <= 46 && wall.w >= 90;
    ctx.fillStyle = isCase ? '#2c3247' : '#39415a';
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    ctx.fillStyle = isCase ? '#46506e' : '#4d5878';
    ctx.fillRect(wall.x, wall.y, wall.w, 4);
    if (isCase) {
      ctx.strokeStyle = 'rgba(150, 200, 235, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(wall.x + 5, wall.y + 5, wall.w - 10, wall.h - 10);
    }
  }
  // Outer shell.
  ctx.strokeStyle = '#4d5878';
  ctx.lineWidth = 3;
  ctx.strokeRect(FLOOR.left, FLOOR.top, FLOOR.right - FLOOR.left, FLOOR.bottom - FLOOR.top);
}

function drawCone(ctx, eye, facing, radius, halfAngle, colour) {
  const grad = ctx.createRadialGradient(eye.x, eye.y, 8, eye.x, eye.y, radius);
  grad.addColorStop(0, colour.replace('A', '0.34'));
  grad.addColorStop(1, colour.replace('A', '0'));
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(eye.x, eye.y);
  ctx.arc(eye.x, eye.y, radius, facing - halfAngle, facing + halfAngle);
  ctx.closePath();
  ctx.fill();
}

function drawLoot(ctx, game) {
  for (const item of game.loot) {
    if (item.taken) continue;
    const pulse = 1 + Math.sin(game.time * 3 + item.x) * 0.12;
    ctx.save();
    ctx.translate(item.x, item.y);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = 'rgba(245,197,66,0.18)';
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = GOLD;
    ctx.strokeStyle = '#8a6d1f';
    ctx.lineWidth = 1.5;
    if (item.kind === 'gem') {
      ctx.beginPath();
      ctx.moveTo(0, -11); ctx.lineTo(8, -3); ctx.lineTo(4, 10); ctx.lineTo(-4, 10); ctx.lineTo(-8, -3);
      ctx.closePath();
      ctx.fillStyle = '#7fd4ff';
      ctx.fill(); ctx.stroke();
    } else if (item.kind === 'painting') {
      ctx.fillRect(-10, -8, 20, 16); ctx.strokeRect(-10, -8, 20, 16);
    } else if (item.kind === 'crown') {
      ctx.beginPath();
      ctx.moveTo(-10, 7); ctx.lineTo(-10, -5); ctx.lineTo(-4, 1); ctx.lineTo(0, -8); ctx.lineTo(4, 1); ctx.lineTo(10, -5); ctx.lineTo(10, 7);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    } else if (item.kind === 'coins') {
      ctx.beginPath(); ctx.arc(-4, 3, 6, 0, Math.PI * 2); ctx.arc(5, 1, 6, 0, Math.PI * 2); ctx.arc(0, -5, 6, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
    ctx.restore();
  }
}

function drawPerson(ctx, x, y, facing, body, trim, bob) {
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.ellipse(0, 8 - bob, 13, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(0, 0, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = trim;
  ctx.beginPath();
  ctx.arc(Math.cos(facing) * 4, Math.sin(facing) * 4, 6.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawGuardsAndCameras(ctx, game) {
  for (const camera of game.cameras) {
    const sees = camera.seesPlayer > 0;
    drawCone(ctx, camera, camera.facing, TUNING.cameraViewRadius, TUNING.cameraViewHalfAngle, sees ? 'rgba(255,70,60,A)' : 'rgba(90,160,255,A)');
    ctx.save();
    ctx.translate(camera.x, camera.y);
    ctx.rotate(camera.facing);
    ctx.fillStyle = '#222a3d';
    ctx.fillRect(-4, -7, 14, 14);
    ctx.fillStyle = sees ? '#ff5040' : '#57d977';
    ctx.beginPath();
    ctx.arc(11, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  for (const guard of game.guards) {
    const alert = guard.mode === 'chase';
    const sees = guard.seesPlayer > 0;
    drawCone(ctx, guard, guard.facing, TUNING.guardViewRadius, TUNING.guardViewHalfAngle,
      alert || sees ? 'rgba(255,70,60,A)' : 'rgba(255,205,80,A)');
    drawPerson(ctx, guard.x, guard.y, guard.facing, '#2b4a7f', '#16283f', 0);
    // Cap brim.
    ctx.save();
    ctx.translate(guard.x, guard.y);
    ctx.rotate(guard.facing);
    ctx.fillStyle = '#101c30';
    ctx.fillRect(4, -7, 9, 14);
    ctx.restore();
    if (alert || guard.mode === 'investigate') {
      ctx.fillStyle = alert ? '#ff5040' : '#ffd34d';
      ctx.font = '900 22px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(alert ? '!' : '?', guard.x, guard.y - 24);
      ctx.textAlign = 'left';
    }
  }
}

function drawPlayer(ctx, game) {
  const player = game.player;
  const bob = player.moving ? Math.sin(player.stepPhase) * 1.6 : 0;
  drawPerson(ctx, player.x, player.y, player.facing, '#20242e', '#c8ccd6', bob);
  // The thief's hood and mask stripe.
  ctx.save();
  ctx.translate(player.x, player.y + bob);
  ctx.rotate(player.facing);
  ctx.fillStyle = '#0c0e13';
  ctx.beginPath();
  ctx.arc(-2, 0, 8, Math.PI * 0.55, Math.PI * 1.45);
  ctx.fill();
  ctx.fillStyle = '#e33d2e';
  ctx.fillRect(2, -6, 3.5, 12);
  ctx.restore();
  if (player.hasGem) {
    ctx.fillStyle = '#7fd4ff';
    ctx.beginPath();
    ctx.arc(player.x + 10, player.y - 12, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  if (game.coin) {
    const coin = game.coin;
    ctx.strokeStyle = `rgba(245,197,66,${Math.max(0, 0.8 - coin.ripple * 0.6)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, 6 + coin.ripple * 26, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = GOLD;
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawHud(ctx, game) {
  ctx.fillStyle = '#0a0d15';
  ctx.fillRect(0, 0, STAGE.width, STAGE.hudHeight);
  ctx.fillStyle = INK;
  ctx.font = '700 19px system-ui, sans-serif';
  ctx.fillText('VAULT NIGHT', 20, 35);

  // Alarm meter: the heart of the HUD.
  const alarmX = 230;
  const alarmW = 380;
  ctx.fillStyle = DIM;
  ctx.font = '700 13px system-ui, sans-serif';
  ctx.fillText('ALARM', alarmX, 20);
  ctx.fillStyle = '#232a3d';
  roundRect(ctx, alarmX, 26, alarmW, 16, 8);
  ctx.fill();
  const fillW = (game.alarm / TUNING.alarmMax) * alarmW;
  if (fillW > 1) {
    const hue = game.alarm > 66 ? '#ff4040' : game.alarm > 33 ? '#ff9f2e' : '#ffd34d';
    ctx.fillStyle = hue;
    roundRect(ctx, alarmX, 26, Math.max(10, fillW), 16, 8);
    ctx.fill();
  }
  ctx.strokeStyle = '#3a435e';
  roundRect(ctx, alarmX, 26, alarmW, 16, 8);
  ctx.stroke();

  ctx.fillStyle = GOLD;
  ctx.font = '700 18px system-ui, sans-serif';
  ctx.fillText(`$${game.haul.toLocaleString('en-US')}`, 660, 37);
  ctx.fillStyle = DIM;
  ctx.font = '600 14px system-ui, sans-serif';
  ctx.fillText(`loot ${game.lootTaken}/${game.loot.length}`, 790, 37);
  ctx.fillText(`coins ${'●'.repeat(game.coinsLeft)}${'○'.repeat(TUNING.coinCount - game.coinsLeft)}`, 900, 37);
  const mm = String(Math.floor(game.elapsed / 60)).padStart(2, '0');
  const ss = String(Math.floor(game.elapsed % 60)).padStart(2, '0');
  ctx.fillText(`${mm}:${ss}`, 1060, 37);
  ctx.fillStyle = game.player.hasGem ? '#7fc793' : DIM;
  ctx.fillText(game.player.hasGem ? 'Get to the EXIT!' : 'Steal the Star Diamond', 1120, 37);
}

function panel(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(5,7,12,0.72)';
  ctx.fillRect(0, 0, STAGE.width, STAGE.height);
  const w = 620;
  const h = 92 + lines.length * 30;
  const x = (STAGE.width - w) / 2;
  const y = (STAGE.height - h) / 2;
  ctx.fillStyle = '#12172a';
  roundRect(ctx, x, y, w, h, 14);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, 14);
  ctx.stroke();
  ctx.fillStyle = accent;
  ctx.font = '900 40px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, STAGE.width / 2, y + 58);
  ctx.fillStyle = INK;
  ctx.font = '500 17px system-ui, sans-serif';
  lines.forEach((line, i) => ctx.fillText(line, STAGE.width / 2, y + 98 + i * 30));
  ctx.textAlign = 'left';
}

export function renderGame(ctx, game) {
  drawFloor(ctx, game);
  drawWalls(ctx);
  drawLoot(ctx, game);
  drawGuardsAndCameras(ctx, game);
  drawPlayer(ctx, game);
  // Night vignette.
  const vignette = ctx.createRadialGradient(640, 430, 320, 640, 430, 780);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.42)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, STAGE.width, STAGE.height);
  drawHud(ctx, game);

  if (game.screen === SCREEN_TITLE) {
    panel(ctx, 'VAULT NIGHT', [
      'One thief. One diamond. Three guards, two cameras, no second chances.',
      'Move: WASD / arrows · Sneak: Shift · Grab: E (or sneak past loot)',
      'Click: throw a decoy coin · Fill the ALARM and the night ends',
      'Steal the Star Diamond from the vault, then reach the EXIT.',
      '',
      'Click or press Enter to slip inside',
    ], GOLD);
  } else if (game.screen === SCREEN_WON) {
    const score = scoreBreakdown(game);
    panel(ctx, 'CLEAN GETAWAY', [
      `Haul: $${score.haul.toLocaleString('en-US')} · Time bonus: $${score.timeBonus.toLocaleString('en-US')} · Ghost bonus: $${score.ghostBonus.toLocaleString('en-US')}`,
      `Total score: $${score.total.toLocaleString('en-US')} in ${Math.floor(game.elapsed)} seconds`,
      game.alarmPeak < 75 ? 'Barely a whisper — the museum never knew.' : 'The alarms sang, but you were already gone.',
      '',
      'Press R or click to rob it again',
    ], '#7fc793');
  } else if (game.screen === SCREEN_BUSTED) {
    panel(ctx, 'BUSTED', [
      game.bustReason,
      `You lifted $${game.haul.toLocaleString('en-US')} before it all went wrong.`,
      '',
      'Press R or click to try the night again',
    ], '#ff5040');
  } else if (game.screen === SCREEN_PLAY && game.alarm > 55) {
    ctx.fillStyle = `rgba(255,40,30,${0.1 + 0.08 * Math.sin(game.time * 9)})`;
    ctx.fillRect(0, 0, STAGE.width, STAGE.height);
  }
}
