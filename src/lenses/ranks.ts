// Ranks: every team's place after every game, as one line each. The lines are
// drawn up to the playhead, and the team names ride its front edge.
import { type Ctx, type Focus, type Lens, LABEL_FONT, applyFocus, escapeHtml, fit, mapColour, svg } from "../dom";
import { type Series, clamp, ordinal, won } from "../model";

/**
 * Height of a line between two games, `f` of the way across (0 to 1). The line
 * is a cubic curve with flat ends, so its height is not linear in `f`.
 */
export function curveY(y0: number, y1: number, f: number): number {
	// Solve x(s) = 1.5·s·(1 − s) + s³ = f for s, then read y(s).
	let s = f;
	for (let i = 0; i < 6; i++) {
		const x = 1.5 * s * (1 - s) + s ** 3 - f;
		const slope = 1.5 - 3 * s + 3 * s * s;
		s = clamp(s - x / slope, 0, 1);
	}
	return y0 + (y1 - y0) * (3 * s * s - 2 * s ** 3);
}

export function ranks(host: HTMLElement, series: Series, ctx: Ctx): Lens {
	const W = host.clientWidth;
	const H = host.clientHeight;
	const n = series.teams.length;
	const games = series.games;
	const left = 30;
	const right = clamp(W * 0.22, 104, 200);
	const top = 34;
	const rowH = (H - top - 6) / n;
	const plotW = W - left - right;
	const gx = (g: number) => left + (g / games) * plotW;
	const ry = (pos: number) => top + (pos + 0.5) * rowH;

	const root = svg("svg", { class: "lens lens--ranks", width: W, height: H, viewBox: `0 0 ${W} ${H}`, role: "img" });
	root.setAttribute("aria-label", `Place of every team after each game of ${series.title}`);
	host.replaceChildren(root);

	series.maps.forEach((map, i) => {
		svg("rect", { class: "band", x: gx(i) + 1, y: top - 6, width: gx(i + 1) - gx(i) - 2, height: H - top, fill: mapColour(map) }, root);
		svg("rect", { x: gx(i) + 1, y: top - 10, width: gx(i + 1) - gx(i) - 2, height: 4, fill: mapColour(map), rx: 1 }, root);
		svg("text", { class: "tick", x: (gx(i) + gx(i + 1)) / 2, y: 14, "text-anchor": "middle" }, root).textContent =
			plotW / games > 64 ? `Game ${i + 1}` : String(i + 1);
	});
	for (let i = 0; i < n; i++)
		svg("text", { class: "rank", x: left - 8, y: ry(i), "text-anchor": "end", "dominant-baseline": "central" }, root).textContent = String(
			i + 1,
		);

	const clipId = `reveal-${Math.random().toString(36).slice(2, 8)}`;
	const clip = svg("rect", { x: 0, y: 0, width: 0, height: H }, svg("clipPath", { id: clipId }, svg("defs", {}, root)));
	const lines = svg("g", { "clip-path": `url(#${clipId})` }, root);
	const labels = svg("g", {}, root);

	const groups = new Map<string, Element[]>();
	const teams = series.teams.map((team) => {
		const g = svg("g", { class: "line" }, lines);
		let d = `M${gx(0)} ${ry(team.position[0] ?? 0)}`;
		for (let i = 1; i <= games; i++) {
			const half = (gx(i) - gx(i - 1)) / 2;
			d += ` C${gx(i - 1) + half} ${ry(team.position[i - 1] ?? 0)} ${gx(i) - half} ${ry(team.position[i] ?? 0)} ${gx(i)} ${ry(team.position[i] ?? 0)}`;
		}
		svg("path", { class: "line__hit", d }, g);
		svg("path", { class: "line__path", d }, g);
		for (let i = 1; i <= games; i++) {
			const win = won(series, team, i - 1);
			const dot = svg("circle", { class: win ? "dot dot--win" : "dot", cx: gx(i), cy: ry(team.position[i] ?? 0), r: win ? 5 : 2.4 }, g);
			if (win) dot.setAttribute("fill", mapColour(series.maps[i - 1] ?? "World's Edge"));
		}
		const label = svg("text", { class: "name", "dominant-baseline": "central" }, labels);
		label.textContent = fit(team.name, right - 44, LABEL_FONT);
		const pts = svg("tspan", { class: "pts", dx: 6 }, label);
		groups.set(team.name, [g, label]);

		for (const el of [g, label]) {
			el.addEventListener("pointerenter", () => ctx.hover(team.name));
			el.addEventListener("pointerleave", () => {
				ctx.hover(null);
				ctx.tip(null);
			});
			el.addEventListener("click", () => ctx.select(team.name));
		}
		g.addEventListener("pointermove", (event) => {
			const x = event.clientX - root.getBoundingClientRect().left;
			const game = clamp(Math.round(((x - left) / plotW) * games), 1, Math.max(1, Math.floor(now)));
			ctx.tip(
				`<b>${escapeHtml(team.name)}</b>${ordinal((team.position[game] ?? 0) + 1)} after game ${game}<br>${team.total[game]} points`,
				event,
			);
		});
		return { team, g, label, pts };
	});

	let now = 0;
	const last = { key: "" };
	return {
		update(t, focus: Focus) {
			now = t;
			const g = clamp(Math.floor(t), 0, games - 1);
			const f = clamp(t - g, 0, 1);
			const x = gx(Math.min(t, games));
			clip.setAttribute("width", (x + 6).toFixed(2));
			for (const r of teams) {
				const y = curveY(ry(r.team.position[g] ?? 0), ry(r.team.position[g + 1] ?? 0), f);
				r.label.setAttribute("x", (x + 12).toFixed(2));
				r.label.setAttribute("y", y.toFixed(2));
				r.pts.textContent = String(r.team.total[Math.floor(t)] ?? 0);
				// The top three at this moment are drawn stronger.
				const place = Math.round((y - top) / rowH - 0.5);
				r.g.classList.toggle("is-top", place < 3);
				r.label.classList.toggle("is-top", place < 3);
			}
			applyFocus(root, groups, focus, last);
		},
	};
}
