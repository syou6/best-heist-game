// Vault Night's entry point: wires the keyboard and mouse to the game state,
// runs the frame loop, speaks the sound cues, and stages the screenshot scenes
// when the page is opened with ?shot=<name> (see shots.js and shots.json).

import { createGame, updateGame, throwCoin, SCREEN_PLAY, SCREEN_TITLE } from './entities.js';
import { renderGame } from './render.js';
import { playCue } from './audio.js';
import { stageShot } from './shots.js';
import { STAGE } from './level.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = STAGE.width;
canvas.height = STAGE.height;

const status = document.getElementById('status');

const input = { up: false, down: false, left: false, right: false, sneak: false, grab: false };

const KEYMAP = {
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  ShiftLeft: 'sneak', ShiftRight: 'sneak',
  KeyE: 'grab',
};

let game = createGame();
// A read handle for play-testing tools (and curious players in devtools):
// window.__vaultNight() returns the live game state.
window.__vaultNight = () => game;
const shotName = new URLSearchParams(window.location.search).get('shot');
const frozen = shotName !== null;
if (frozen) stageShot(game, shotName);

function startHeist() {
  if (game.screen === SCREEN_TITLE) game.screen = SCREEN_PLAY;
}

function restart() {
  const fresh = createGame();
  fresh.screen = SCREEN_PLAY;
  game = fresh;
}

window.addEventListener('keydown', (event) => {
  const name = KEYMAP[event.code];
  if (name) {
    input[name] = true;
    event.preventDefault();
  }
  if (event.code === 'Enter') startHeist();
  if (event.code === 'KeyR' && game.screen !== SCREEN_PLAY && game.screen !== SCREEN_TITLE) restart();
});
window.addEventListener('keyup', (event) => {
  const name = KEYMAP[event.code];
  if (name) input[name] = false;
});

canvas.addEventListener('pointerdown', (event) => {
  if (frozen) return;
  if (game.screen === SCREEN_TITLE) {
    startHeist();
    return;
  }
  if (game.screen !== SCREEN_PLAY) {
    restart();
    return;
  }
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * STAGE.width;
  const y = ((event.clientY - rect.top) / rect.height) * STAGE.height;
  throwCoin(game, x, y);
});

let lastStatus = '';
function announce() {
  let text;
  if (game.screen === SCREEN_TITLE) text = 'Vault Night. Press Enter to start.';
  else if (game.screen === SCREEN_PLAY) {
    text = game.player.hasGem
      ? 'You have the Star Diamond. Reach the exit.'
      : `Alarm at ${Math.round(game.alarm)} percent. Haul $${game.haul}.`;
  } else text = `Game over: ${game.screen}. Press R to play again.`;
  if (text !== lastStatus) {
    lastStatus = text;
    status.textContent = text;
  }
}

let previous = performance.now();
function frame(now) {
  const dt = frozen ? 0 : Math.min(0.05, (now - previous) / 1000);
  previous = now;
  if (!frozen) {
    updateGame(game, input, dt);
    for (const cue of game.events) playCue(cue);
    game.events.length = 0;
  }
  renderGame(ctx, game);
  announce();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
