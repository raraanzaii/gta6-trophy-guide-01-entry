# gta6-trophy-guide-01-entry

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/raraanzaii/gta6-trophy-guide-01-entry/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/raraanzaii/gta6-trophy-guide-01-entry/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

**Leonida Trophy Atlas** — an offline guide and tracker for all 55
PlayStation 5 trophies of Grand Theft Auto VI (1 platinum, 2 gold,
6 silver, 46 bronze), in an original neon-dusk Leonida look with no
Rockstar artwork and no network requests at runtime.

Every trophy carries its official name, description and grade, plus a
guide written for this atlas in our own words — what to do, where and
how, and when it can be missed — with its sources cited beside the guide
(a per-trophy source matrix drawn from the published list and roadmap
guides: PowerPyx, Push Square, GTABase, Output Lag, Sixshore). A
five-stage platinum roadmap orders the run (story with the one Chapter 1
missable protected, the 100% checklist and collectible sweep, activities
and robberies, duo and misc cleanup, platinum), and every missable or
save-sensitive trophy is flagged with the moment it can be lost.

The tracker works fully offline: tick trophies off with progress saved
in localStorage, per-trophy counters for counted trophies (x / 42, x /
100, x / 250…), filters by kind (story, missable, collectibles,
activities, online — the list has 0 online trophies) and grade, name
search, a spoiler shield that hides unearned story trophies behind
"Hidden story trophy", a progress header (x/55, percent to platinum,
per-grade counts), and export/import of progress as a JSON file.

The app is static files under `app/` (vanilla JS ES modules + CSS, no
build step, no libraries). `main.ts` is the hand-in program: it copies
`app/` and `screenshots/` to the output directory and writes
`dossier.json` with `buildDossier` from the kit's
`vendor/makefun-frontend.ts`, unchanged.

## Run it

```sh
node serve.ts                          # serve app/ and open http://localhost:8080
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # hand-in build
```

---

<sub>Entered on [make.fun](https://make.fun/bounty/gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
