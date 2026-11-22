// Tiny synthesized sound for Vault Night: no audio files, just a WebAudio
// oscillator tapped for a few cues. Created lazily on the first user gesture so
// the browser's autoplay rules are honoured; every failure is swallowed, since
// sound is garnish, never the meal.

let context = null;

function ensureContext() {
  if (context) return context;
  try {
    context = new (window.AudioContext || window.webkitAudioContext)();
  } catch {
    context = null;
  }
  return context;
}

function tone(freqFrom, freqTo, seconds, type, volume, delay = 0) {
  const ac = ensureContext();
  if (!ac) return;
  const start = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freqFrom, start);
  osc.frequency.exponentialRampToValueAtTime(Math.max(30, freqTo), start + seconds);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + seconds);
  osc.connect(gain).connect(ac.destination);
  osc.start(start);
  osc.stop(start + seconds + 0.02);
}

/** Play one named cue from the game's event list. */
export function playCue(name) {
  switch (name) {
    case 'pickup':
      tone(880, 1320, 0.12, 'triangle', 0.16);
      tone(1320, 1760, 0.14, 'triangle', 0.12, 0.07);
      break;
    case 'coin':
      tone(2093, 2093, 0.07, 'square', 0.06);
      tone(2637, 2637, 0.16, 'square', 0.05, 0.06);
      break;
    case 'spotted':
      tone(392, 392, 0.11, 'sawtooth', 0.08);
      tone(392, 392, 0.11, 'sawtooth', 0.08, 0.14);
      break;
    case 'busted':
      tone(220, 55, 0.7, 'sawtooth', 0.2);
      tone(110, 40, 0.8, 'square', 0.12, 0.05);
      break;
    case 'won':
      tone(523, 523, 0.12, 'triangle', 0.16);
      tone(659, 659, 0.12, 'triangle', 0.16, 0.11);
      tone(784, 784, 0.12, 'triangle', 0.16, 0.22);
      tone(1046, 1046, 0.3, 'triangle', 0.18, 0.33);
      break;
    default:
      break;
  }
}
