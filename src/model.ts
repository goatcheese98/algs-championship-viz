// The numbers behind every view: for one series, each team's running score,
// its place in the standings after every game, and the facts worth saying
// about each game. Nothing here touches the page.
import raw from "./data/algs.json";

const MAPS = ["World's Edge", "Storm Point", "E-District", "Broken Moon"] as const;
export type MapName = (typeof MAPS)[number];
const isMap = (name: string): name is MapName => MAPS.some((m) => m === name);

/** The value, or an error that names what was missing. For data that the build has already checked. */
export function must<T>(value: T | null | undefined, what: string): T {
	if (value === null || value === undefined) throw new Error(`Missing: ${what}`);
	return value;
}

interface RawTeam {
	name: string;
	rank: number;
	points: number[];
	kills?: number[];
	placements?: number[];
}
interface RawSeries {
	id: string;
	title: string;
	maps: string[];
	teams: RawTeam[];
}
interface RawStage {
	name: string;
	series: RawSeries[];
}
interface RawTournament {
	id: string;
	name: string;
	short: string;
	place: string;
	stages: RawStage[];
}

export interface Team {
	index: number;
	name: string;
	/** The official final place, 1-based. It breaks ties at the end. */
	finalRank: number;
	/** Per game. */
	points: number[];
	kills: number[];
	placePoints: number[];
	/** Exact finishing place per game, or null where the source cannot give it. */
	placements: number[] | null;
	/** After 0..n games. */
	total: number[];
	totalKills: number[];
	totalPlace: number[];
	/** Place in the standings after 0..n games, 0-based. */
	position: number[];
}

export interface Series {
	id: string;
	title: string;
	tournament: { id: string; name: string; short: string; place: string };
	stage: string;
	maps: MapName[];
	games: number;
	teams: Team[];
	/** The highest final score, for scales. */
	top: number;
	/**
	 * True where the source splits each score into placement and kills. Where it
	 * does not (the Year 4 Championship), only the game scores are shown.
	 */
	detail: boolean;
}

export interface TournamentIndex {
	id: string;
	name: string;
	short: string;
	place: string;
	stages: { name: string; series: { id: string; title: string; games: number; teams: number }[] }[];
}

const tournaments = raw as RawTournament[];

export const index: TournamentIndex[] = tournaments.map((t) => ({
	id: t.id,
	name: t.name,
	short: t.short,
	place: t.place,
	stages: t.stages.map((s) => ({
		name: s.name,
		series: s.series.map((x) => ({ id: x.id, title: x.title, games: x.maps.length, teams: x.teams.length })),
	})),
}));

const running = (values: number[]): number[] => {
	const out = [0];
	for (const v of values) out.push((out.at(-1) ?? 0) + v);
	return out;
};

/** Builds the full model of one series from its rows. */
export function buildSeries(tournament: RawTournament, stage: string, source: RawSeries): Series {
	const games = source.maps.length;
	const teams: Team[] = source.teams.map((t, i) => {
		const kills = t.kills ?? t.points.map(() => 0);
		const placePoints = t.points.map((p, g) => p - (kills[g] ?? 0));
		return {
			index: i,
			name: t.name,
			finalRank: t.rank,
			points: t.points,
			kills,
			placePoints,
			placements: t.placements ?? null,
			total: running(t.points),
			totalKills: running(kills),
			totalPlace: running(placePoints),
			position: [],
		};
	});

	for (let g = 0; g <= games; g++) {
		const order = [...teams].toSorted((a, b) => {
			// Before the first game nobody has a score, so the order is by name.
			if (g === 0) return a.name.localeCompare(b.name);
			const byScore = (b.total[g] ?? 0) - (a.total[g] ?? 0);
			if (byScore !== 0) return byScore;
			// A tie goes to the better single game so far, then to the official final place.
			const best = (t: Team) => Math.max(...t.points.slice(0, g));
			return best(b) - best(a) || a.finalRank - b.finalRank;
		});
		// At the end, a tie goes to the official final place.
		if (g === games) order.toSorted((a, b) => (b.total[g] ?? 0) - (a.total[g] ?? 0) || a.finalRank - b.finalRank);
		order.forEach((t, place) => (t.position[g] = place));
	}

	return {
		id: source.id,
		title: source.title,
		tournament: { id: tournament.id, name: tournament.name, short: tournament.short, place: tournament.place },
		stage,
		maps: source.maps.map((m) => must(isMap(m) ? m : null, `a known map, not "${m}"`)),
		games,
		teams,
		top: Math.max(...teams.map((t) => t.total[games] ?? 0)),
		detail: source.teams.every((t) => t.kills !== undefined),
	};
}

export function findSeries(tournamentId: string, seriesId: string): Series | null {
	const tournament = tournaments.find((t) => t.id === tournamentId);
	if (!tournament) return null;
	for (const stage of tournament.stages) {
		const source = stage.series.find((s) => s.id === seriesId);
		if (source) return buildSeries(tournament, stage.name, source);
	}
	return null;
}

export const firstSeriesOf = (tournamentId: string): string | null =>
	tournaments.find((t) => t.id === tournamentId)?.stages[0]?.series[0]?.id ?? null;

// ---- A moment in the replay -------------------------------------------------
// The playhead is a number of games, with a fraction while a game is "being played".

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const ease = (f: number) => (f < 0.5 ? 4 * f * f * f : 1 - (-2 * f + 2) ** 3 / 2);

// A game plays in two beats: the scores count up, then the rows change places.
const GROW_END = 0.62;
const SLIDE_START = 0.42;
const grow = (f: number) => ease(clamp(f / GROW_END, 0, 1));

/** A running total at the playhead. It counts up during the first beat of a game. */
export function valueAt(values: number[], t: number): number {
	const g = clamp(Math.floor(t), 0, values.length - 1);
	const next = values[Math.min(g + 1, values.length - 1)] ?? 0;
	const now = values[g] ?? 0;
	return now + (next - now) * grow(t - g);
}

/** A position at the playhead. It slides during the second beat of a game. */
export function slideAt(values: number[], t: number): number {
	const g = clamp(Math.floor(t), 0, values.length - 1);
	const next = values[Math.min(g + 1, values.length - 1)] ?? 0;
	const now = values[g] ?? 0;
	return now + (next - now) * ease(clamp((t - g - SLIDE_START) / (1 - SLIDE_START), 0, 1));
}

/** How much of game `g` (0-based) has been played at the playhead, eased, 0 to 1. */
export const played = (g: number, t: number) => grow(t - g);

// ---- Words ------------------------------------------------------------------

export function ordinal(n: number): string {
	const tens = n % 100;
	if (tens >= 11 && tens <= 13) return `${n}th`;
	return `${n}${["th", "st", "nd", "rd"][n % 10] ?? "th"}`;
}

/** Where a team finished a game, as exactly as the data allows. */
export function finish(series: Series, team: Team, g: number): string {
	if (!series.detail) return "";
	const exact = team.placements?.[g];
	if (exact) return ordinal(exact);
	// Without a trusted place, the placement points still say which band it was.
	const bands: Record<number, string> = {
		12: "1st",
		9: "2nd",
		7: "3rd",
		5: "4th",
		4: "5th",
		3: "6th or 7th",
		2: "8th to 10th",
		1: "11th to 15th",
		0: "16th or lower",
	};
	return bands[team.placePoints[g] ?? 0] ?? "";
}

/** True when the team won game `g`. Only known where the series has detail. */
export const won = (series: Series, team: Team, g: number) => series.detail && team.placePoints[g] === 12;

export interface GameStory {
	game: number;
	map: MapName;
	/** The game's highest score. */
	best: { team: Team; points: number };
	/** Null where the series has no detail. */
	winner: Team | null;
	topKills: { teams: Team[]; kills: number } | null;
	leader: Team;
	second: Team;
	gap: number;
	leadChanged: boolean;
	climber: { team: Team; from: number; to: number } | null;
	faller: { team: Team; from: number; to: number } | null;
}

/** What happened in game `game` (1-based) and where it left the standings. */
export function gameStory(series: Series, game: number): GameStory {
	const g = game - 1;
	const kills = Math.max(...series.teams.map((t) => t.kills[g] ?? 0));
	const at = (place: number, after: number) =>
		must(
			series.teams.find((t) => t.position[after] === place),
			`a team in place ${place}`,
		);
	const moves = series.teams.map((team) => ({ team, from: team.position[game - 1] ?? 0, to: team.position[game] ?? 0 }));
	// Places before the first game are alphabetical, so a move from them means nothing.
	const real = game > 1 ? moves : [];
	const climber = real.reduce<(typeof moves)[number] | null>(
		(best, m) => (m.from - m.to > (best ? best.from - best.to : 0) ? m : best),
		null,
	);
	const faller = real.reduce<(typeof moves)[number] | null>(
		(best, m) => (m.to - m.from > (best ? best.to - best.from : 0) ? m : best),
		null,
	);
	const leader = at(0, game);
	const second = at(1, game);
	return {
		game,
		map: must(series.maps[g], `the map of game ${game}`),
		best: series.teams.reduce((best, team) => ((team.points[g] ?? 0) > best.points ? { team, points: team.points[g] ?? 0 } : best), {
			team: leader,
			points: -1,
		}),
		winner: series.teams.find((t) => won(series, t, g)) ?? null,
		topKills: series.detail ? { teams: series.teams.filter((t) => t.kills[g] === kills), kills } : null,
		leader,
		second,
		gap: (leader.total[game] ?? 0) - (second.total[game] ?? 0),
		leadChanged: game > 1 && at(0, game - 1) !== leader,
		climber,
		faller,
	};
}

export interface SeriesFacts {
	winner: Team;
	margin: number;
	leadChanges: number;
	/** How many different teams won a game, and how many the series winner won. Null without detail. */
	gameWinners: number | null;
	winnerWins: number | null;
	bestGame: { team: Team; game: number; points: number };
	mostKills: { team: Team; kills: number } | null;
}

/** The series as a whole. */
export function seriesFacts(series: Series): SeriesFacts {
	const n = series.games;
	const byFinal = [...series.teams].toSorted((a, b) => (a.position[n] ?? 0) - (b.position[n] ?? 0));
	const winner = must(byFinal[0], "a winner");
	let leadChanges = 0;
	for (let g = 2; g <= n; g++) if (gameStory(series, g).leadChanged) leadChanges++;
	let bestGame = { team: winner, game: 1, points: -1 };
	for (const team of series.teams)
		team.points.forEach((points, g) => points > bestGame.points && (bestGame = { team, game: g + 1, points }));
	const mostKills = series.teams.reduce((best, t) => ((t.totalKills[n] ?? 0) > (best.totalKills[n] ?? 0) ? t : best), winner);
	const winners = new Set<string>();
	for (let g = 0; g < n; g++) for (const t of series.teams) if (won(series, t, g)) winners.add(t.name);
	return {
		winner,
		margin: (winner.total[n] ?? 0) - (must(byFinal[1], "a second team").total[n] ?? 0),
		leadChanges,
		gameWinners: series.detail ? winners.size : null,
		winnerWins: series.detail ? winner.points.filter((_, g) => won(series, winner, g)).length : null,
		bestGame,
		mostKills: series.detail ? { team: mostKills, kills: mostKills.totalKills[n] ?? 0 } : null,
	};
}
