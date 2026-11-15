// Reads data/tournaments.json and the per-series CSV files beside it, checks
// them, and writes src/data/algs.json: the one file the page loads.
//
//   node scripts/build-data.mjs
//
// A CSV row is one team in one game: Team, Rank, Game, Placement, Kills, Points.
// Points are the official game score (placement points plus one per kill).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tournaments = JSON.parse(fs.readFileSync(`${root}/data/tournaments.json`, "utf8"));

// ALGS placement points. 6th and 7th share 3, 8th to 10th share 2, 11th to 15th share 1.
const PLACEMENT_POINTS = [12, 9, 7, 5, 4, 3, 3, 2, 2, 2, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0];

function parseCsv(file) {
	const [header, ...lines] = fs.readFileSync(file, "utf8").replace(/^﻿/, "").trim().split(/\r?\n/);
	const cols = header.split(",").map((c) => c.trim());
	const expected = ["Team", "Rank", "Game", "Placement", "Kills", "Points"];
	if (cols.join() !== expected.join()) throw new Error(`${file}: unexpected header ${header}`);
	return lines.map((line) => {
		const cells = line.split(",");
		// A team name never holds a comma in this data; fail loudly if one ever does.
		if (cells.length !== 6) throw new Error(`${file}: bad row ${line}`);
		const [team, rank, game, placement, kills, points] = cells.map((c) => c.trim());
		return { team, rank: +rank, game: +game, placement: +placement, kills: +kills, points: +points };
	});
}

const notes = [];
const out = tournaments.map((t) => ({
	id: t.id,
	name: t.name,
	short: t.short,
	place: t.place,
	stages: t.stages.map((stage) => ({
		name: stage.name,
		series: stage.series.map((s) => {
			const file = `${root}/data/${t.id}/${s.id}.csv`;
			const rows = parseCsv(file);
			// Games with no points for anyone were never played; the source pads them with zeros.
			const played = [...new Set(rows.map((r) => r.game))]
				.toSorted((a, b) => a - b)
				.filter((g) => rows.some((r) => r.game === g && r.points > 0));
			const games = played.length;
			if (played.some((g, i) => g !== i + 1)) throw new Error(`${file}: games are not 1..n`);
			if (s.maps.length < games) throw new Error(`${file}: ${games} games but ${s.maps.length} maps`);

			const names = [...new Set(rows.map((r) => r.team))];
			const teams = names.map((name) => {
				const mine = rows.filter((r) => r.team === name && r.game <= games).toSorted((a, b) => a.game - b.game);
				if (mine.length !== games) throw new Error(`${file}: ${name} has ${mine.length} rows for ${games} games`);
				return {
					name,
					rank: mine[0].rank,
					points: mine.map((r) => r.points),
					kills: mine.map((r) => r.kills),
					placements: mine.map((r) => r.placement),
				};
			});

			// Can the points be split into placement and kills? In a real game exactly
			// one team takes each of the top five placement scores, two take 3, three
			// take 2 and five take 1 (fewer in a lobby that is not full), and no two
			// teams finish in the same place.
			let detail = true;
			for (let g = 0; g < games && detail; g++) {
				const seen = new Map();
				for (const team of teams) {
					const placementPoints = team.points[g] - team.kills[g];
					if (PLACEMENT_POINTS[team.placements[g] - 1] !== placementPoints) detail = false;
					seen.set(placementPoints, (seen.get(placementPoints) ?? 0) + 1);
				}
				if (seen.get(12) !== 1) detail = false;
				for (const [value, count] of seen) if (value !== 0 && count > PLACEMENT_POINTS.filter((p) => p === value).length) detail = false;
				if (new Set(teams.map((team) => team.placements[g])).size !== teams.length) detail = false;
			}
			if (!detail) {
				// The Kills and Placement columns do not add up in this file. The game
				// scores do, so the page shows scores only.
				for (const team of teams) {
					delete team.kills;
					delete team.placements;
				}
				notes.push(`${t.id}/${s.id}: scores only (kills and placement do not add up)`);
			}
			teams.toSorted((a, b) => a.rank - b.rank || a.name.localeCompare(b.name));
			return { id: s.id, title: s.title, maps: s.maps.slice(0, games), teams };
		}),
	})),
}));

fs.mkdirSync(`${root}/src/data`, { recursive: true });
fs.writeFileSync(`${root}/src/data/algs.json`, JSON.stringify(out) + "\n");
const count = out.reduce((n, t) => n + t.stages.reduce((m, s) => m + s.series.length, 0), 0);
console.log(`${count} series written to src/data/algs.json`);
for (const n of notes) console.log(`note: ${n}`);
