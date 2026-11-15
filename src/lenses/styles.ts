// Styles: how each team earns its points. Kill points run across, placement
// points run up, and the slanted lines join equal totals. A team above the
// dashed line has earned more from placement than from kills.
import { type Ctx, type Focus, type Lens, LABEL_FONT, applyFocus, escapeHtml, fit, niceScale, svg } from "../dom";
import { type Series, clamp, valueAt } from "../model";

export function styles(host: HTMLElement, series: Series, ctx: Ctx): Lens {
	if (!series.detail) {
		const note = document.createElement("div");
		note.className = "lens-note";
		note.innerHTML = `<h3>This event has game scores only</h3><p>The source for the ${escapeHtml(series.tournament.short)} does not split a score into placement and kills in a way that adds up, so there is nothing to plot here. The Year 5 Open and EWC 2025 have the full split.</p>`;
		host.replaceChildren(note);
		return { update() {} };
	}

	const W = host.clientWidth;
	const H = host.clientHeight;
	const n = series.games;
	const left = 46;
	const bottom = 40;
	const top = 14;
	const right = 18;
	const kMax = niceScale(Math.max(...series.teams.map((t) => t.totalKills[n] ?? 0)) * 1.05 + 1);
	const pMax = niceScale(Math.max(...series.teams.map((t) => t.totalPlace[n] ?? 0)) * 1.05 + 1);
	const plotW = W - left - right;
	const plotH = H - top - bottom;
	const sx = (k: number) => left + (k / kMax.max) * plotW;
	const sy = (p: number) => top + plotH - (p / pMax.max) * plotH;

	const root = svg("svg", { class: "lens lens--styles", width: W, height: H, viewBox: `0 0 ${W} ${H}`, role: "img" });
	root.setAttribute("aria-label", `Kill points against placement points for every team in ${series.title}`);
	host.replaceChildren(root);

	for (let k = 0; k <= kMax.max; k += kMax.step) {
		svg("line", { class: "grid", x1: sx(k), x2: sx(k), y1: top, y2: top + plotH }, root);
		svg("text", { class: "tick", x: sx(k), y: top + plotH + 16, "text-anchor": "middle" }, root).textContent = String(k);
	}
	for (let p = 0; p <= pMax.max; p += pMax.step) {
		svg("line", { class: "grid", x1: left, x2: left + plotW, y1: sy(p), y2: sy(p) }, root);
		svg("text", { class: "tick", x: left - 8, y: sy(p), "text-anchor": "end", "dominant-baseline": "central" }, root).textContent =
			String(p);
	}
	svg("text", { class: "axis", x: left + plotW, y: H - 6, "text-anchor": "end" }, root).textContent = "Kill points";
	svg("text", { class: "axis", x: left + 6, y: top + 12 }, root).textContent = "Placement points";

	// Lines of equal total, clipped to the plot.
	const clipId = `plot-${Math.random().toString(36).slice(2, 8)}`;
	svg("rect", { x: left, y: top, width: plotW, height: plotH }, svg("clipPath", { id: clipId }, svg("defs", {}, root)));
	const inside = svg("g", { "clip-path": `url(#${clipId})` }, root);
	const step = niceScale(series.top).step;
	for (let total = step; total <= kMax.max + pMax.max; total += step) {
		svg("line", { class: "iso", x1: sx(0), y1: sy(total), x2: sx(total), y2: sy(0) }, inside);
		if (total <= pMax.max) svg("text", { class: "iso__label", x: sx(0) + 6, y: sy(total) + 14 }, inside).textContent = `${total} points`;
	}
	const even = Math.min(kMax.max, pMax.max);
	svg("line", { class: "even", x1: sx(0), y1: sy(0), x2: sx(even), y2: sy(even) }, inside);

	const trail = svg("polyline", { class: "trail" }, inside);
	const groups = new Map<string, Element[]>();
	const dots = series.teams.map((team) => {
		const g = svg("g", { class: "team" }, root);
		svg("circle", { class: "dot", r: 6 }, g);
		const label = svg("text", { class: "name", x: 10, "dominant-baseline": "central" }, g);
		label.textContent = fit(team.name, 150, LABEL_FONT);
		groups.set(team.name, [g]);
		g.addEventListener("pointerenter", () => ctx.hover(team.name));
		g.addEventListener("pointerleave", () => {
			ctx.hover(null);
			ctx.tip(null);
		});
		g.addEventListener("click", () => ctx.select(team.name));
		g.addEventListener("pointermove", (event) => {
			const k = Math.round(valueAt(team.totalKills, now));
			const p = Math.round(valueAt(team.totalPlace, now));
			ctx.tip(`<b>${escapeHtml(team.name)}</b>${p} from placement<br>${k} from kills<br>${p + k} points`, event);
		});
		return { team, g, label };
	});

	let now = 0;
	const last = { key: "" };
	return {
		update(t, focus: Focus) {
			now = t;
			const named = new Set(
				[...series.teams]
					.toSorted((a, b) => valueAt(b.total, t) - valueAt(a.total, t))
					.slice(0, 5)
					.map((x) => x.name),
			);
			for (const d of dots) {
				const x = sx(valueAt(d.team.totalKills, t));
				const y = sy(valueAt(d.team.totalPlace, t));
				d.g.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
				d.g.classList.toggle("is-named", t > 0 && named.has(d.team.name));
				// Keep a label inside the plot: flip it to the left near the right edge.
				const flip = x > W - right - 130;
				d.label.setAttribute("x", flip ? "-10" : "10");
				d.label.setAttribute("text-anchor", flip ? "end" : "start");
			}
			// The followed team leaves a trail of where it stood after each game.
			const followed = series.teams.find((x) => x.name === (focus.hover ?? focus.selected));
			if (followed) {
				const points = [];
				for (let g = 0; g <= clamp(Math.floor(t), 0, n); g++)
					points.push(`${sx(followed.totalKills[g] ?? 0).toFixed(1)},${sy(followed.totalPlace[g] ?? 0).toFixed(1)}`);
				points.push(`${sx(valueAt(followed.totalKills, t)).toFixed(1)},${sy(valueAt(followed.totalPlace, t)).toFixed(1)}`);
				trail.setAttribute("points", points.join(" "));
			} else trail.setAttribute("points", "");
			applyFocus(root, groups, focus, last);
		},
	};
}
