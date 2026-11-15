// Games: a grid of every team's score in every game. A stronger cell is a
// bigger game, and a ringed cell is a win.
import { type Ctx, type Focus, type Lens, LABEL_FONT, applyFocus, escapeHtml, fit, mapColour, svg } from "../dom";
import { type Series, clamp, finish, played, slideAt, valueAt, won } from "../model";

export function games(host: HTMLElement, series: Series, ctx: Ctx): Lens {
	const W = host.clientWidth;
	const H = host.clientHeight;
	const n = series.teams.length;
	const top = 34;
	const rowH = (H - top - 4) / n;
	const rankW = 26;
	const nameW = clamp(W * 0.2, 88, 190);
	const totalW = 50;
	const x0 = rankW + nameW + 12;
	const colW = (W - x0 - totalW) / series.games;
	const best = Math.max(...series.teams.flatMap((t) => t.points));

	const root = svg("svg", { class: "lens lens--games", width: W, height: H, viewBox: `0 0 ${W} ${H}`, role: "img" });
	root.setAttribute("aria-label", `Score of every team in each game of ${series.title}`);
	host.replaceChildren(root);

	series.maps.forEach((map, i) => {
		svg("text", { class: "tick", x: x0 + (i + 0.5) * colW, y: 14, "text-anchor": "middle" }, root).textContent =
			colW > 64 ? `Game ${i + 1}` : String(i + 1);
		svg("rect", { x: x0 + i * colW + 1, y: top - 10, width: colW - 2, height: 4, fill: mapColour(map), rx: 1 }, root);
	});
	svg("text", { class: "tick", x: W - 4, y: 14, "text-anchor": "end" }, root).textContent = "Total";

	const groups = new Map<string, Element[]>();
	const rows = series.teams.map((team) => {
		const g = svg("g", { class: "row" }, root);
		svg("rect", { class: "hit", x: 0, y: 0, width: W, height: rowH }, g);
		const rank = svg("text", { class: "rank", x: rankW - 4, y: rowH / 2, "text-anchor": "end", "dominant-baseline": "central" }, g);
		svg("text", { class: "name", x: rankW + nameW, y: rowH / 2, "text-anchor": "end", "dominant-baseline": "central" }, g).textContent =
			fit(team.name, nameW - 8, LABEL_FONT);
		const cells = team.points.map((p, i) => {
			const cell = svg("g", { class: "cell" }, g);
			const heat = p === 0 ? 0 : 0.14 + 0.86 * (p / best) ** 0.75;
			const box = svg(
				"rect",
				{
					x: x0 + i * colW + 1,
					y: 1,
					width: colW - 2,
					height: rowH - 2,
					rx: 3,
					fill: mapColour(series.maps[i] ?? "World's Edge"),
					"fill-opacity": heat.toFixed(3),
				},
				cell,
			);
			if (won(series, team, i)) box.setAttribute("class", "cell__win");
			if (p === 0) box.setAttribute("class", "cell__zero");
			if (colW >= 20 && rowH >= 13) {
				svg(
					"text",
					{
						class: heat > 0.5 ? "cell__n cell__n--on" : "cell__n",
						x: x0 + (i + 0.5) * colW,
						y: rowH / 2,
						"text-anchor": "middle",
						"dominant-baseline": "central",
					},
					cell,
				).textContent = String(p);
			}
			cell.addEventListener("pointermove", (event) => {
				const where = finish(series, team, i);
				const how = series.detail ? `${where}, ${team.kills[i]} ${team.kills[i] === 1 ? "kill" : "kills"}<br>` : "";
				ctx.tip(`<b>${escapeHtml(team.name)}</b>Game ${i + 1}, ${series.maps[i]}<br>${how}${p} points`, event);
			});
			return cell;
		});
		const total = svg("text", { class: "total", x: W - 4, y: rowH / 2, "text-anchor": "end", "dominant-baseline": "central" }, g);
		groups.set(team.name, [g]);
		g.addEventListener("pointerenter", () => ctx.hover(team.name));
		g.addEventListener("pointerleave", () => {
			ctx.hover(null);
			ctx.tip(null);
		});
		g.addEventListener("click", () => ctx.select(team.name));
		return { team, g, rank, cells, total };
	});

	const last = { key: "" };
	return {
		update(t, focus: Focus) {
			for (const r of rows) {
				const pos = slideAt(r.team.position, t);
				r.g.setAttribute("transform", `translate(0 ${(top + pos * rowH).toFixed(2)})`);
				r.cells.forEach((cell, i) => cell.setAttribute("opacity", played(i, t).toFixed(3)));
				r.total.textContent = String(Math.round(valueAt(r.team.total, t)));
				r.rank.textContent = String(Math.round(pos) + 1);
			}
			applyFocus(root, groups, focus, last);
		},
	};
}
