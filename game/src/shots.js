// The staged scenes behind ?shot=<name>, used to take the entry's screenshots
// (see shots.json). Each scene arranges a real game state — positions, facings,
// the alarm — and the ordinary renderer draws it, so a screenshot is exactly
// what the game itself looks like mid-heist, never a mock-up.

import { SCREEN_BUSTED, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WON } from './entities.js';

function faceToward(entity, x, y) {
  entity.facing = Math.atan2(y - entity.y, x - entity.x);
}

/** Arrange `game` into the named scene. Unknown names fall back to the title. */
export function stageShot(game, name) {
  const [galleryGuard, hallGuard, vaultGuard] = game.guards;
  const [hallCamera, vaultCamera] = game.cameras;
  game.time = 4.2;

  if (name === 'heist') {
    // The cover frame: the thief mid-gallery, a guard's cone sweeping past,
    // a camera watching the hall, loot all around and the alarm at a third.
    game.screen = SCREEN_PLAY;
    game.elapsed = 74;
    game.alarm = 34;
    game.player.x = 560; game.player.y = 356; game.player.facing = 0.4;
    galleryGuard.x = 300; galleryGuard.y = 300; faceToward(galleryGuard, 560, 430);
    hallGuard.x = 700; hallGuard.y = 560; faceToward(hallGuard, 700, 200);
    vaultGuard.x = 1050; vaultGuard.y = 250; faceToward(vaultGuard, 1150, 150);
    hallCamera.facing = Math.PI / 2 + 0.35;
    vaultCamera.facing = Math.PI * 0.85;
    game.loot[0].taken = true;
    game.lootTaken = 1;
    game.haul = 500;
  } else if (name === 'chase') {
    // Seconds from disaster: the diamond is lifted, a guard is on the thief's
    // heels and the alarm is nearly full.
    game.screen = SCREEN_PLAY;
    game.elapsed = 132;
    game.alarm = 82;
    game.alarmPeak = 82;
    game.player.x = 940; game.player.y = 540; game.player.facing = Math.PI * 0.94;
    game.player.hasGem = true;
    galleryGuard.x = 250; galleryGuard.y = 620; faceToward(galleryGuard, 250, 300);
    hallGuard.x = 880; hallGuard.y = 470; hallGuard.mode = 'chase'; faceToward(hallGuard, 940, 540);
    vaultGuard.x = 1100; vaultGuard.y = 330; vaultGuard.mode = 'investigate'; faceToward(vaultGuard, 990, 452);
    hallCamera.facing = Math.PI / 2 - 0.5;
    vaultCamera.facing = Math.PI * 0.7;
    game.loot[2].taken = true;
    game.loot[6].taken = true;
    game.lootTaken = 2;
    game.haul = 5800;
    game.coinsLeft = 2;
  } else if (name === 'getaway') {
    // The win screen over the floor: the thief home, the haul counted.
    game.screen = SCREEN_WON;
    game.elapsed = 168;
    game.alarmPeak = 61;
    game.player.x = 99; game.player.y = 700; game.player.facing = -Math.PI / 2;
    game.player.hasGem = true;
    galleryGuard.x = 320; galleryGuard.y = 200; faceToward(galleryGuard, 320, 500);
    hallGuard.x = 640; hallGuard.y = 620; faceToward(hallGuard, 300, 620);
    vaultGuard.x = 1000; vaultGuard.y = 200; faceToward(vaultGuard, 1000, 420);
    hallCamera.facing = Math.PI / 2;
    vaultCamera.facing = Math.PI * 0.8;
    for (const item of game.loot) item.taken = true;
    game.lootTaken = game.loot.length;
    game.haul = 8900;
  } else if (name === 'busted') {
    game.screen = SCREEN_BUSTED;
    game.elapsed = 96;
    game.alarm = 100;
    game.bustReason = 'The alarm hit full — the vault sealed and the floor locked down.';
    game.player.x = 700; game.player.y = 330; game.player.facing = 2.6;
    hallGuard.x = 664; hallGuard.y = 306; hallGuard.mode = 'chase'; faceToward(hallGuard, 700, 330);
    game.haul = 1300;
    game.lootTaken = 2;
  } else {
    game.screen = SCREEN_TITLE;
    game.player.x = 480; game.player.y = 620; game.player.facing = -0.6;
    galleryGuard.x = 280; galleryGuard.y = 260; faceToward(galleryGuard, 500, 260);
    hallGuard.x = 700; hallGuard.y = 300; faceToward(hallGuard, 700, 640);
    vaultGuard.x = 1080; vaultGuard.y = 260; faceToward(vaultGuard, 900, 260);
    hallCamera.facing = Math.PI / 2 + 0.2;
    vaultCamera.facing = Math.PI * 0.75;
  }
}
