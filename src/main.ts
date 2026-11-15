// The page: picks a series, runs the playhead, and keeps the chart, the
// timeline, the panel and the address in step with it.
import "@fontsource-variable/sofia-sans";
import "@fontsource-variable/sofia-sans-condensed";
import "@fontsource-variable/sofia-sans-extra-condensed";
import "./style.css";
import { type Ctx, type Lens, escapeHtml, mapColour } from "./dom";
import { games } from "./lenses/games";
import { race } from "./lenses/race";
import { ranks } from "./lenses/ranks";
import { styles } from "./lenses/styles";
import { type Series, clamp, findSeries, firstSeriesOf, index, must } from "./model";
import { renderPanel } from "./panel";

type LensId = "race" | "ranks" | "games" | "styles";

const LENSES: {
	id: LensId;
	label: string;
	make: (host: HTMLElement, series: Series, ctx: Ctx) => Lens;
	note: (series: Series) => string;
}[] = [
	{
		id: "race",
		label: "Race",
		make: race,
		note: (s) =>
			`Each block is one game, in the colour of its map.${s.detail ? " The solid part is placement points and the paler part is kills." : ""}`,
	},
	{
		id: "ranks",
		label: "Ranks",
		make: ranks,
		note: (s) => `Each line is a team's place after every game.${s.detail ? " A large dot is a game win." : ""}`,
	},
	{
		id: "games",
		label: "Games",
		make: games,
		note: (s) =>
			`Each cell is a team's score in one game. A stronger colour is a bigger game${s.detail ? ", and a ring marks a win" : ""}.`,
	},
	{
		id: "styles",
		label: "Styles",
		make: styles,
		note: () => "Kill points run across and placement points run up. Teams above the dashed line earn more from placement than from kills.",
	},
];

// Seconds a game takes to play at normal speed.
const GAME_SECONDS = 1.7;
const SPEEDS = [1, 2, 0.5];
const DEFAULT = { tournament: "ewc-2025", series: "Day1-A" };
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

const state = {
	lens: "race" as LensId,
	t: 0,
	playing: false,
	target: 0,
	speed: 1,
	selected: null as string | null,
	hover: null as string | null,
};
let series = must(findSeries(DEFAULT.tournament, DEFAULT.series), "the default series");
let lens: Lens | null = null;

const app = must(document.querySelector<HTMLElement>("#app"), "#app");
app.innerHTML = `
	<header class="bar">
		<a class="brand" href="#/"><svg viewBox="0 0 32 32" aria-hidden="true"><rect x="2" y="5" width="28" height="5" rx="1.5" fill="var(--we)"/><rect x="2" y="13.5" width="20" height="5" rx="1.5" fill="var(--sp)"/><rect x="2" y="22" width="12" height="5" rx="1.5" fill="var(--ed)"/></svg>ALGS Dashboard</a>
		<div class="tournaments" role="tablist" aria-label="Event">
			${index.map((t) => `<button type="button" role="tab" data-tournament="${t.id}">${escapeHtml(t.short)}</button>`).join("")}
		</div>
		<div class="bar__end">
			<button type="button" class="link" data-about>About the data</button>
			<button type="button" class="icon" data-theme aria-label="Switch between light and dark">
				<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10 2.5a7.5 7.5 0 0 0 0 15z" fill="currentColor"/></svg>
			</button>
		</div>
	</header>
	<nav class="seriesnav" aria-label="Series"></nav>
	<main class="work">
		<section class="head">
			<div class="head__title"><p class="head__where"></p><h1></h1></div>
			<div class="lenses" role="tablist" aria-label="View">
				${LENSES.map((l) => `<button type="button" role="tab" data-lens="${l.id}">${l.label}</button>`).join("")}
			</div>
			<p class="head__note"></p>
		</section>
		<section class="board">
			<div class="stage"></div>
			<aside class="panel" aria-live="polite"></aside>
		</section>
		<section class="tl" aria-label="Replay">
			<button type="button" class="tl__play" aria-label="Play"></button>
			<div class="tl__track" role="slider" tabindex="0" aria-label="Games played" aria-valuemin="0">
				<div class="tl__games"></div>
				<div class="tl__maps" aria-hidden="true"></div>
				<div class="tl__head"></div>
			</div>
			<button type="button" class="tl__speed" aria-label="Playback speed">1×</button>
		</section>
	</main>
	<div class="tip" role="tooltip" hidden></div>
	<dialog class="about">
		<h2>About the data</h2>
		<p>The ALGS Dashboard replays standings from three Apex Legends Global Series events, one game at a time: the ALGS Year 4 Championship, the ALGS Year 5 Open and the Esports World Cup 2025. That is 36 series and 234 games.</p>
		<p><b>Scoring.</b> In each game a team scores placement points (12 for a win, then 9, 7, 5, 4, 3, 3, 2, 2, 2, and 1 for 11th to 15th) plus 1 point for every kill.</p>
		<p><b>What is missing.</b> The finals of each event are not in the data. The Year 4 Championship source gives game scores, but its kills and places do not add up, so that event shows scores only. A few of its scores also differ from the official ones by a point.</p>
		<p><b>Where it came from.</b> The results were collected from public tournament result pages in 2025.</p>
		<p>Made by <a href="https://rohanjasani.com" rel="noopener">Rohan Jasani</a>. First built in 2025 and rebuilt in November 2026. This is a fan project. It is not affiliated with Electronic Arts, Respawn Entertainment or the ALGS.</p>
		<form method="dialog"><button type="submit" class="button">Close</button></form>
	</dialog>`;

const $ = (selector: string) => must(app.querySelector<HTMLElement>(selector), selector);
const stage = $(".stage");
const panel = $(".panel");
const tip = $(".tip");
const track = $(".tl__track");
const head = $(".tl__head");
const playButton = $(".tl__play");
const speedButton = $(".tl__speed");
const about = must(app.querySelector<HTMLDialogElement>(".about"), ".about");
let gameFills: HTMLElement[] = [];

const ICON = {
	play: `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6 3.6v12.8L16.5 10z" fill="currentColor"/></svg>`,
	pause: `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 4h3.6v12H5zM11.4 4H15v12h-3.6z" fill="currentColor"/></svg>`,
	again: `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 4a6 6 0 1 1-5.66 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M2.2 4.6 4.6 9l4.2-2.4z" fill="currentColor"/></svg>`,
};

// ---- Views of the state -----------------------------------------------------

const ctx: Ctx = {
	select(name) {
		state.selected = state.selected === name ? null : name;
		draw();
		writeAddress();
	},
	hover(name) {
		state.hover = name;
		draw();
	},
	tip(html, event) {
		if (!html || !event || event.pointerType === "touch") {
			tip.hidden = true;
			return;
		}
		tip.innerHTML = html;
		tip.hidden = false;
		const box = tip.getBoundingClientRect();
		tip.style.left = `${clamp(event.clientX + 14, 8, innerWidth - box.width - 8)}px`;
		tip.style.top = `${clamp(event.clientY + 16, 8, innerHeight - box.height - 8)}px`;
	},
};

function draw(): void {
	lens?.update(state.t, state);
	renderPanel(panel, series, state.t, state.selected, state.hover);
	gameFills.forEach((fill, i) => {
		const done = clamp(state.t - i, 0, 1);
		fill.style.transform = `scaleX(${done})`;
		fill.parentElement?.classList.toggle("is-done", done > 0.5);
	});
	head.style.left = `${(state.t / series.games) * 100}%`;
	track.setAttribute("aria-valuenow", String(Math.round(state.t)));
	track.setAttribute("aria-valuetext", state.t < 1 ? "Before the first game" : `After game ${Math.floor(state.t)} of ${series.games}`);
}

function drawControls(): void {
	const ended = state.t >= series.games;
	playButton.innerHTML = state.playing ? ICON.pause : ended ? ICON.again : ICON.play;
	playButton.setAttribute("aria-label", state.playing ? "Pause" : ended ? "Play again" : "Play");
	speedButton.textContent = `${state.speed}×`;
	for (const button of app.querySelectorAll<HTMLElement>("[data-lens]"))
		button.setAttribute("aria-selected", String(button.dataset.lens === state.lens));
}

function buildLens(): void {
	const def = must(
		LENSES.find((l) => l.id === state.lens),
		"the view",
	);
	$(".head__note").textContent = def.note(series);
	lens = def.make(stage, series, ctx);
	draw();
}

function buildSeries(): void {
	const t = series.tournament;
	document.title = `${series.title}, ${t.short} | ALGS Dashboard`;
	$(".head__where").textContent = [t.name, t.place, series.stage].filter(Boolean).join(", ");
	$("h1").textContent = series.title;
	for (const button of app.querySelectorAll<HTMLElement>("[data-tournament]"))
		button.setAttribute("aria-selected", String(button.dataset.tournament === t.id));

	const event = index.find((x) => x.id === t.id);
	$(".seriesnav").innerHTML = (event?.stages ?? [])
		.map(
			(s) =>
				`<div class="stagegroup"><span>${escapeHtml(s.name)}</span><div>${s.series
					.map(
						(x) =>
							`<button type="button" class="chip" data-series="${x.id}" aria-current="${x.id === series.id}">${escapeHtml(x.title.replace(/^.*, (lobby \d+)$/, "$1").replace(/^lobby/, "Lobby"))}</button>`,
					)
					.join("")}</div></div>`,
		)
		.join("");
	app.querySelector(".seriesnav [aria-current=true]")?.scrollIntoView({ block: "nearest", inline: "center" });

	$(".tl__games").innerHTML = series.maps
		.map((map, i) => `<div class="tl__game" style="--c:${mapColour(map)}"><i></i><b>${i + 1}</b></div>`)
		.join("");
	gameFills = [...app.querySelectorAll<HTMLElement>(".tl__game i")];
	// One label under each run of games on the same map.
	const runs: { map: string; length: number }[] = [];
	for (const map of series.maps) {
		const last = runs.at(-1);
		if (last?.map === map) last.length++;
		else runs.push({ map, length: 1 });
	}
	$(".tl__maps").innerHTML = runs.map((r) => `<span style="flex:${r.length}">${escapeHtml(r.map)}</span>`).join("");
	track.setAttribute("aria-valuemax", String(series.games));
	buildLens();
	drawControls();
}

// ---- The playhead -----------------------------------------------------------

let lastFrame = 0;
function frame(now: number): void {
	if (!state.playing) return;
	const dt = Math.min(0.1, (now - lastFrame) / 1000);
	lastFrame = now;
	const step = (dt * state.speed) / GAME_SECONDS;
	state.t = state.target >= state.t ? Math.min(state.target, state.t + step) : Math.max(state.target, state.t - step * 2.5);
	draw();
	if (state.t === state.target) stop();
	else requestAnimationFrame(frame);
}

function stop(): void {
	state.playing = false;
	drawControls();
	writeAddress();
}

/** Moves the playhead to `target` games, playing the games between. */
function playTo(target: number): void {
	state.target = clamp(target, 0, series.games);
	if (reducedMotion.matches) {
		state.t = state.target;
		draw();
		return stop();
	}
	if (state.playing) return;
	state.playing = true;
	lastFrame = performance.now();
	drawControls();
	requestAnimationFrame(frame);
}

function togglePlay(): void {
	if (state.playing) return stop();
	if (state.t >= series.games) state.t = 0;
	playTo(series.games);
}

function seek(t: number): void {
	state.playing = false;
	state.t = clamp(t, 0, series.games);
	draw();
	drawControls();
}

const stepBy = (by: number) => playTo(by > 0 ? Math.floor(state.t + 1e-6) + 1 : Math.ceil(state.t - 1e-6) - 1);

// ---- The address ------------------------------------------------------------
// #/<event>/<series>/<view>/<games played>?team=<name>

function writeAddress(): void {
	const team = state.selected ? `?team=${encodeURIComponent(state.selected)}` : "";
	const hash = `#/${series.tournament.id}/${series.id}/${state.lens}/${Math.round(state.t)}${team}`;
	if (hash !== location.hash) history.replaceState(null, "", hash);
}

/** Opens what the address names. Returns false when it names nothing. */
function readAddress(): boolean {
	const [path = "", query = ""] = location.hash.replace(/^#\/?/, "").split("?");
	const [tournament, id, view, played] = path.split("/");
	const found = tournament && id ? findSeries(tournament, decodeURIComponent(id)) : null;
	if (!found) return false;
	series = found;
	state.lens = LENSES.find((l) => l.id === view)?.id ?? state.lens;
	const team = new URLSearchParams(query).get("team");
	state.selected = found.teams.some((x) => x.name === team) ? team : null;
	state.playing = false;
	state.t = played === undefined || played === "" ? found.games : clamp(Number(played) || 0, 0, found.games);
	return true;
}

function open(tournament: string, id: string): void {
	const found = findSeries(tournament, id);
	if (!found) return;
	series = found;
	state.playing = false;
	state.selected = null;
	state.hover = null;
	state.t = 0;
	buildSeries();
	playTo(series.games);
}

// ---- Events -----------------------------------------------------------------

app.addEventListener("click", (event) => {
	const target = event.target instanceof Element ? event.target.closest<HTMLElement>("button, a") : null;
	if (!target) return;
	if (target.dataset.tournament) {
		const first = firstSeriesOf(target.dataset.tournament);
		if (first && target.dataset.tournament !== series.tournament.id) open(target.dataset.tournament, first);
	} else if (target.dataset.series) open(series.tournament.id, target.dataset.series);
	else if (target.dataset.lens) {
		state.lens = LENSES.find((l) => l.id === target.dataset.lens)?.id ?? state.lens;
		buildLens();
		drawControls();
		writeAddress();
	} else if ("clear" in target.dataset) {
		state.selected = null;
		draw();
		writeAddress();
	} else if ("about" in target.dataset) about.showModal();
	else if ("theme" in target.dataset) {
		const root = document.documentElement;
		const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
		root.dataset.theme = dark ? "light" : "dark";
		try {
			localStorage.setItem("theme", root.dataset.theme);
		} catch {
			// A private window can refuse storage. The choice still holds for this visit.
		}
	} else if (target.classList.contains("brand")) {
		event.preventDefault();
		open(DEFAULT.tournament, DEFAULT.series);
	}
});

playButton.addEventListener("click", togglePlay);
speedButton.addEventListener("click", () => {
	state.speed = SPEEDS[(SPEEDS.indexOf(state.speed) + 1) % SPEEDS.length] ?? 1;
	drawControls();
});

const fromPointer = (event: PointerEvent) => {
	const box = $(".tl__games").getBoundingClientRect();
	return ((event.clientX - box.left) / box.width) * series.games;
};
track.addEventListener("pointerdown", (event) => {
	track.setPointerCapture(event.pointerId);
	seek(fromPointer(event));
});
track.addEventListener("pointermove", (event) => {
	if (track.hasPointerCapture(event.pointerId)) seek(fromPointer(event));
});
track.addEventListener("pointerup", () => {
	// Rest on a whole game, so the panel and the chart agree.
	seek(Math.round(state.t));
	writeAddress();
});

document.addEventListener("keydown", (event) => {
	if (event.metaKey || event.ctrlKey || event.altKey || about.open) return;
	const typing =
		event.target instanceof HTMLElement && event.target.matches("button, a, input, select, textarea") && event.target !== track;
	if (event.key === " " && !typing) togglePlay();
	else if (event.key === "ArrowRight") stepBy(1);
	else if (event.key === "ArrowLeft") stepBy(-1);
	else if (event.key === "Home") seek(0);
	else if (event.key === "End") seek(series.games);
	else if (/^[1-4]$/.test(event.key) && !typing)
		app.querySelector<HTMLElement>(`[data-lens="${LENSES[Number(event.key) - 1]?.id}"]`)?.click();
	else return;
	event.preventDefault();
});

addEventListener("hashchange", () => {
	if (readAddress()) buildSeries();
});

// The chart is drawn for the size of its box, so it is drawn again when the box changes.
let resizeTimer = 0;
new ResizeObserver(() => {
	clearTimeout(resizeTimer);
	resizeTimer = setTimeout(buildLens, 80);
}).observe(stage);
// Labels are fitted by measuring text, which is only right once the fonts are in.
void document.fonts.ready.then(buildLens);

// A shared link opens where it points. A plain visit plays the default series.
if (readAddress()) buildSeries();
else {
	buildSeries();
	if (reducedMotion.matches) seek(series.games);
	else setTimeout(() => playTo(series.games), 500);
}
