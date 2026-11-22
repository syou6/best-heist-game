# Vault Night

An original top-down stealth heist game for the make.fun bounty [best-heist-game-20261122-0559](https://make.fun/bounty/best-heist-game-20261122-0559): slip through a museum at night, dodge guards' vision cones and sweeping cameras, steal the Star Diamond from the vault and reach the EXIT before the alarm fills.

[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/syou6/best-heist-game/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/syou6/best-heist-game/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

## Play

Open `game/index.html` in a browser — no build step, no libraries, no network requests. Controls: WASD / arrow keys to move, Shift to sneak, E to grab the diamond, mouse click to throw a decoy coin that lures guards, R to restart. Score is loot plus time and ghost (unseen) bonuses. Sound is synthesized with WebAudio.

## Build the entry

```
node main.ts
```

`main.ts` (Node 22, standard library only) copies `game/` and `screenshots/` to the output directory and writes `dossier.json`. The game source lives in `game/src/` split by role (level, vision, entities, audio, render, shots, main).

## License

MIT — see `LICENSE`.
