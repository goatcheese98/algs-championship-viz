# ALGS Dashboard

Standings from the Apex Legends Global Series, replayed one game at a time.
Select a series and press play. The page shows the same replay in four views:

| View   | What it shows                                                          |
| ------ | ---------------------------------------------------------------------- |
| Race   | One bar for each team, built from one block for each game.             |
| Ranks  | The place of each team after each game, as one line for each team.     |
| Games  | A grid of the score of each team in each game.                         |
| Styles | Kill points against placement points, to show how a team earns points. |

Colour shows the map in all views. A followed team is shown with ink weight,
not with a colour.

The data covers three events, 36 series and 234 games: the ALGS Year 4
Championship, the ALGS Year 5 Open and the Esports World Cup 2025.

This is a fan project. It is not affiliated with Electronic Arts, Respawn
Entertainment or the ALGS.

## Run it

```bash
npm install
npm run dev      # http://localhost:4630
npm run check    # format, lint, types and tests
npm run build
```

The toolchain is Vite+ (`vp`) with TypeScript. The app is vanilla TypeScript
that draws SVG. There is no framework and no chart library.

## Where things are

| Path                     | What it is                                                            |
| ------------------------ | --------------------------------------------------------------------- |
| `data/tournaments.json`  | The events, stages, series and the map of each game.                  |
| `data/<event>/<id>.csv`  | One row for each team in each game: place, kills and points.          |
| `scripts/build-data.mjs` | Checks the CSV files and writes `src/data/algs.json`.                 |
| `src/model.ts`           | Standings after each game, and the facts that the panel puts in words. |
| `src/lenses/`            | The four views. Each one draws from the model and a playhead.         |
| `src/panel.ts`           | The text beside the chart.                                            |
| `src/main.ts`            | The page: series selection, the playhead, the timeline, the address.  |

Run `npm run data` after a change to a file in `data/`.

## Data quality

`scripts/build-data.mjs` checks that the placement points in each game form a
valid set. The Year 4 Championship files do not pass this check, because their
kills and places do not add up to the scores. For that event the app shows game
scores only, and a small number of its scores differ from the official ones by
a point. The finals of each event are not in the data.

## Deploy

The app is one Cloudflare Worker that serves static files, configured in
`cloudflare.config.ts`.

```bash
npm run deploy
```

`scripts/cf-personal` gets the Cloudflare token from Doppler for that one
command. A push to `main` also runs `.github/workflows/deploy.yml`, which
publishes the same build to the older Pages address.

## History

The first version (2025) was a Vue app with D3 and GSAP. It was rebuilt in
November 2026. The old code is in the git history before the `rebuild-2026-11`
branch.
