# GTA VI Trophy Guide — all 55 PS5 trophies

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/tommy-project/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/tommy-project/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI (1 Platinum, 2 Gold, 6 Silver, 46 Bronze), built for the [gta6-trophy-guide-01](https://make.fun/bounty/gta6-trophy-guide-01) bounty on make.fun.

## What it is

- **All 55 trophies** with their official names, descriptions and grades exactly as published, plus a guide in our own words for each one, with steps and a named source beside every guide.
- **Roadmap to the Platinum**: one playthrough, about 200 hours, with the only possibly missable trophy called out up front (Positive Mental Attitude — Lucia's Chapter 1 balcony meditation) and the full 100% completion breakdown for A Long Road.
- **Tracker**: tick trophies off as they pop; progress saves in the browser (localStorage), with export to file and import back.
- **Filters**: by kind (story, side quests, collectibles, activities, exploration, one-offs, completion), by grade, by earned state, by possibly missable and by hidden; plus full-text search.
- **Spoiler setting**: on by default — the 28 hidden trophies stay masked until you earn them or turn spoilers off.
- **Fully offline**: static files under `app/`, no network requests at runtime, no Rockstar artwork or logos.

## Honesty notes

- Trophy names, descriptions and grades were cross-checked against the Exophase and PSNProfiles lists (reported by Push Square, 18 Nov 2026) and against the GTABase, Output Lag and Press Start lists, which all agree with the kit's data. Trophy 4 keeps its asterisks exactly as published: `T**s Ass Drug Money`.
- Seven trophies are labelled **unconfirmed** in the app: their exact unlock steps were not confirmed at launch (In The Beginning…, Capital Offense, Bad Luck I Guess, The Truth Is Out There, Ten Pin, Fair Game's trigger animal, and the remaining Strangers & Freaks strands). The guide says so instead of guessing.
- Guide details are sourced from the GTABase trophy guide and the Output Lag trophy list; the trophy list itself from Exophase / PSNProfiles. Nothing is copied from those guides — the wording here is original.

## Run it

```sh
node serve.ts
# then open http://localhost:8080
```

Or open `app/index.html` directly from any static server with `app/` at its root.

Deep links: `?view=roadmap` opens the roadmap, `?demo=1` shows a 12-trophy preview without touching saved progress, `?spoilers=off` reveals hidden trophies, `?focus=17` jumps to a trophy, and `?kind=…&grade=…&show=…` pre-set the filters.

## Screenshots

Real renders of the app running, 1280×800:

1. `screenshots/1-cover.png` — the guide, progress bar, filters and first trophy.
2. `screenshots/2-guide.png` — a full guide card (The Shootist) with steps and source.
3. `screenshots/3-roadmap.png` — the Roadmap to Platinum with the missable warning.
4. `screenshots/4-spoilers.png` — spoiler masking: an earned hidden trophy revealed, the next ones masked.

## Hand-in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output folder and writes `dossier.json` with the vendored make.fun library (`vendor/makefun-frontend.ts`, unchanged).

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT. See [LICENSE](LICENSE).

## Competition result

Final rank #5,540 of 6,776 entries, $0 (0 matches played — the entry was
screened out of the judged playoff).
