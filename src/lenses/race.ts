// The race: one bar per team, built from one block per game in the colour of
// its map. Bars grow as a game is played and rows slide to their new place.
import { type Ctx, type Focus, type Lens, LABEL_FONT, applyFocus, escapeHtml, fit, mapColour, niceScale, svg } from "../dom";
import { type Series, clamp, finish, played, slideAt, valueAt } from "../model";

export function race(host: HTMLElement, series: Series, ctx: Ctx): Lens {
	const W = host.clientWidth;
	const H = host.clientHeight;
	const n = series.teams.length;
	const top = 26;
	const rowH = (H - top - 4) / n;
	const barH = clamp(rowH * 0.68, 5, 26);
	const rankW = 26;
	const nameW = clamp(W * 0.2, 88, 190);
	const x0 = rankW + nameW + 12;
	const x1 = W - 46;
	const { max, step } = niceScale(series.top);
	const sx = (x1 - x0) / max;

	const root = svg("svg", { class: "lens lens--race", width: W, height: H, viewBox: `0 0 ${W} ${H}`, role: "img" });
	root.setAttribute("aria-label", `Standings race for ${series.title}`);
	host.replaceChildren(root);

	for (let v = 0; v <= max; v += step) {
		svg("line", { class: "grid", x1: x0 + v * sx, x2: x0 + v * sx, y1: top - 6, y2: H - 4 }, root);
		svg("text", { class: "tick", x: x0 + v * sx, y: 12, "text-anchor": "middle" }, root).textContent = String(v);
	}

	const groups = new Map<string, Element[]>();
	const rows = series.teams.map((team) => {
		const g = svg("g", { class: "row" }, root);
		svg("rect", { class: "hit", x: 0, y: 0, width: W, height: rowH }, g);
		const rank = svg("text", { class: "rank", x: rankW - 4, y: rowH / 2, "text-anchor": "end", "dominant-baseline": "central" }, g);
		const name = svg("text", { class: "name", x: rankW + nameW, y: rowH / 2, "text-anchor": "end", "dominant-baseline": "central" }, g);
		name.textContent = fit(team.name, nameW - 8, LABEL_FONT);
		const segs = series.maps.map((map) => ({
			place: svg("rect", { class: "seg", y: (rowH - barH) / 2, height: barH, fill: mapColour(map), rx: 1.5 }, g),
			kills: series.detail
				? svg("rect", { class: "seg seg--kills", y: (rowH - barH) / 2, height: barH, fill: mapColour(map), rx: 1.5 }, g)
				: null,
		}));
		const total = svg("text", { class: "total", y: rowH / 2, "dominant-baseline": "central" }, g);
		groups.set(team.name, [g]);

		g.addEventListener("pointerenter", () => ctx.hover(team.name));
		g.addEventListener("pointerleave", () => {
			ctx.hover(null);
			ctx.tip(null);
		});
		g.addEventListener("click", () => ctx.select(team.name));
		g.addEventListener("pointermove", (event) => {
			// Which game's block is under the pointer?
			const x = event.clientX - root.getBoundingClientRect().left;
			let edge = x0;
			let game = -1;
			team.points.forEach((p, i) => {
				const w = p * sx * played(i, now);
				if (x >= edge && x < edge + w) game = i;
				edge += w;
			});
			const so = Math.round(valueAt(team.total, now));
			if (game < 0) return ctx.tip(`<b>${escapeHtml(team.name)}</b>${so} points so far`, event);
			const where = finish(series, team, game);
			const how = series.detail ? `${where}, ${team.kills[game]} ${team.kills[game] === 1 ? "kill" : "kills"}<br>` : "";
			ctx.tip(`<b>${escapeHtml(team.name)}</b>Game ${game + 1}, ${series.maps[game]}<br>${how}${team.points[game]} points`, event);
		});
		return { team, g, rank, segs, total };
	});

	let now = 0;
	const last = { key: "" };
	return {
		update(t, focus: Focus) {
			now = t;
			for (const r of rows) {
				const pos = slideAt(r.team.position, t);
				r.g.setAttribute("transform", `translate(0 ${(top + pos * rowH).toFixed(2)})`);
				let x = x0;
				r.segs.forEach((seg, i) => {
					const f = played(i, t);
					const w = (r.team.points[i] ?? 0) * sx * f;
					const wPlace = seg.kills ? (r.team.placePoints[i] ?? 0) * sx * f : w;
					// A hairline of space between games, taken from the end of each block.
					const gap = Math.min(1.5, w);
					seg.place.setAttribute("x", x.toFixed(2));
					seg.place.setAttribute("width", Math.max(0, wPlace - (seg.kills && w > wPlace ? 0 : gap)).toFixed(2));
					if (seg.kills) {
						seg.kills.setAttribute("x", (x + wPlace).toFixed(2));
						seg.kills.setAttribute("width", Math.max(0, w - wPlace - gap).toFixed(2));
					}
					x += w;
				});
				r.total.setAttribute("x", (x + 6).toFixed(2));
				r.total.textContent = String(Math.round(valueAt(r.team.total, t)));
				r.rank.textContent = String(Math.round(pos) + 1);
			}
			applyFocus(root, groups, focus, last);
		},
	};
}
