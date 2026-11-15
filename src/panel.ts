// The words beside the chart: what the last game did to the standings, the
// team being followed, and, once the series is over, how it ended.
import { escapeHtml, mapColour } from "./dom";
import { type MapName, type Series, type Team, clamp, finish, gameStory, ordinal, seriesFacts, won } from "./model";

const b = (team: Team) => `<b>${escapeHtml(team.name)}</b>`;
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

function intro(series: Series): string {
	const counts = new Map<MapName, number>();
	for (const map of series.maps) counts.set(map, (counts.get(map) ?? 0) + 1);
	const maps = [...counts]
		.map(([map, count]) => `<span class="mapname"><i style="background:${mapColour(map)}"></i>${escapeHtml(map)} × ${count}</span>`)
		.join("");
	return `<p class="when">Before the first game</p>
		<h2>${series.teams.length} teams, ${plural(series.games, "game")}</h2>
		<div class="maplist">${maps}</div>
		<ul class="lines">
			<li>A team scores for where it finishes each game: 12 points for a win, down to 1 for 11th to 15th.</li>
			<li>Every kill adds 1 point.</li>
			<li>Press play, or drag along the games below.</li>
		</ul>`;
}

function afterGame(series: Series, game: number): string {
	const s = gameStory(series, game);
	const lines: string[] = [];
	if (s.winner && s.topKills) {
		const kills = s.winner.kills[game - 1] ?? 0;
		const alsoTop = s.topKills.teams.includes(s.winner);
		lines.push(
			`${b(s.winner)} won the game with ${plural(kills, "kill")}${alsoTop && kills > 0 ? ", the most of anyone" : ""}: ${s.winner.points[game - 1]} points.`,
		);
		if (!alsoTop) {
			const names = s.topKills.teams.slice(0, 2).map(b).join(" and ");
			lines.push(`${names} had the most kills, ${s.topKills.kills}.`);
		}
	} else {
		lines.push(`${b(s.best.team)} had the best game: ${s.best.points} points.`);
	}
	const lead =
		s.gap === 0
			? `${b(s.leader)} and ${b(s.second)} are level on points`
			: `${b(s.leader)} ${s.leadChanged ? "took the lead and are" : "lead by"} ${s.leadChanged ? `${plural(s.gap, "point")} ahead of` : `${s.gap} over`} ${b(s.second)}`;
	lines.push(`${lead}.`);
	if (s.climber)
		lines.push(`${b(s.climber.team)} climbed ${plural(s.climber.from - s.climber.to, "place")} to ${ordinal(s.climber.to + 1)}.`);
	if (s.faller) lines.push(`${b(s.faller.team)} dropped ${plural(s.faller.to - s.faller.from, "place")} to ${ordinal(s.faller.to + 1)}.`);
	return `<p class="when">After game ${game} of ${series.games}</p>
		<h2><i class="swatch" style="background:${mapColour(s.map)}"></i>${escapeHtml(s.map)}</h2>
		<ul class="lines">${lines.map((l) => `<li>${l}</li>`).join("")}</ul>`;
}

function ending(series: Series): string {
	const f = seriesFacts(series);
	const lines: string[] = [];
	lines.push(
		f.margin === 0
			? `${b(f.winner)} finished level on points at the top and took first on the tiebreak.`
			: `${b(f.winner)} won the series by ${plural(f.margin, "point")}.`,
	);
	lines.push(
		f.leadChanges === 0
			? `${b(f.winner)} led after every game.`
			: `The lead changed hands ${f.leadChanges === 1 ? "once" : `${f.leadChanges} times`}.`,
	);
	if (f.gameWinners !== null && f.winnerWins !== null) {
		const own = f.winnerWins === 0 ? `${b(f.winner)} did not win one of them.` : `${b(f.winner)} won ${f.winnerWins}.`;
		lines.push(`${plural(f.gameWinners, "team")} won a game. ${own}`);
	}
	lines.push(`Best single game: ${b(f.bestGame.team)}, ${f.bestGame.points} points in game ${f.bestGame.game}.`);
	if (f.mostKills) lines.push(`Most kills: ${b(f.mostKills.team)}, ${f.mostKills.kills}.`);
	return `<section class="ending"><h3>How it ended</h3><ul class="lines">${lines.map((l) => `<li>${l}</li>`).join("")}</ul></section>`;
}

function card(series: Series, team: Team, game: number, picked: boolean): string {
	const best = Math.max(...series.teams.flatMap((t) => t.points));
	const bars = team.points
		.map((p, i) => {
			const done = i < game;
			const share = series.detail && p > 0 ? ((team.kills[i] ?? 0) / p) * 100 : 0;
			const title = done
				? `Game ${i + 1}, ${series.maps[i]}: ${series.detail ? `${finish(series, team, i)}, ${plural(team.kills[i] ?? 0, "kill")}, ` : ""}${p} points`
				: `Game ${i + 1}`;
			return `<div class="spark__col${done ? "" : " is-ahead"}${done && won(series, team, i) ? " is-win" : ""}" title="${escapeHtml(title)}">
				<div class="spark__bar" style="height:${done ? Math.max(3, (p / best) * 100) : 3}%;--c:${mapColour(series.maps[i] ?? "World's Edge")};--kills:${share.toFixed(0)}%"></div>
				<span>${done ? p : ""}</span>
			</div>`;
		})
		.join("");
	const played = team.points.slice(0, game);
	const wins = played.filter((_, i) => won(series, team, i)).length;
	const stats: [string, number][] = [["Points", team.total[game] ?? 0]];
	if (series.detail) stats.push(["Kills", team.totalKills[game] ?? 0], ["Wins", wins]);
	stats.push(["Best game", played.length ? Math.max(...played) : 0]);
	return `<section class="card">
		<header><h3>${escapeHtml(team.name)}</h3>${picked ? `<button type="button" class="card__clear" data-clear aria-label="Stop following ${escapeHtml(team.name)}">Stop following</button>` : ""}</header>
		<p class="card__now">${game === 0 ? "Not started" : `${ordinal((team.position[game] ?? 0) + 1)} after game ${game}`}</p>
		<div class="spark" role="img" aria-label="Score in each game">${bars}</div>
		<dl class="stats">${stats.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
	</section>`;
}

let lastKey = "";

/** Redraws the panel when the game, the series or the followed team changes. */
export function renderPanel(el: HTMLElement, series: Series, t: number, selected: string | null, hover: string | null): void {
	const game = clamp(Math.floor(t + 1e-6), 0, series.games);
	const name = hover ?? selected;
	const key = `${series.tournament.id}/${series.id}|${game}|${name}|${selected}`;
	if (key === lastKey) return;
	lastKey = key;
	const team = series.teams.find((x) => x.name === name);
	el.innerHTML = `<section class="story">${game === 0 ? intro(series) : afterGame(series, game)}</section>
		${team ? card(series, team, game, team.name === selected) : `<p class="hint">Select a team to follow it through the series.</p>`}
		${game === series.games ? ending(series) : ""}`;
}
