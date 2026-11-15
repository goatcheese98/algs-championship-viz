// Small helpers the views share: making SVG, map colours, fitting text.
import type { MapName } from "./model";

const NS = "http://www.w3.org/2000/svg";

export function svg<K extends keyof SVGElementTagNameMap>(
	tag: K,
	attrs: Record<string, string | number> = {},
	parent?: Element,
): SVGElementTagNameMap[K] {
	const el = document.createElementNS(NS, tag);
	for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
	parent?.append(el);
	return el;
}

/** Each map has one colour everywhere on the page. */
export const mapColour = (map: MapName): string =>
	({ "World's Edge": "var(--we)", "Storm Point": "var(--sp)", "E-District": "var(--ed)", "Broken Moon": "var(--bm)" })[map];

export const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const measure = document.createElement("canvas").getContext("2d");

/** Shortens a label with an ellipsis until it fits `width` pixels in `font`. */
export function fit(text: string, width: number, font: string): string {
	if (!measure) return text;
	measure.font = font;
	if (measure.measureText(text).width <= width) return text;
	let cut = text.length;
	while (cut > 1 && measure.measureText(`${text.slice(0, cut).trimEnd()}…`).width > width) cut--;
	return `${text.slice(0, cut).trimEnd()}…`;
}

export const LABEL_FONT = '600 13px "Sofia Sans Condensed Variable", sans-serif';

/** A round number at or above `value`, and the step between gridlines up to it. */
export function niceScale(value: number): { max: number; step: number } {
	const step = value <= 40 ? 10 : value <= 100 ? 20 : 25;
	return { max: Math.max(step, Math.ceil(value / step) * step), step };
}

/** What the views need from the page around them. */
export interface Ctx {
	select(name: string): void;
	hover(name: string | null): void;
	tip(html: string | null, event?: PointerEvent): void;
}

export interface Focus {
	selected: string | null;
	hover: string | null;
}

export interface Lens {
	update(t: number, focus: Focus): void;
}

/** Marks the focused team's group and dims the rest. `groups` maps a team name to its elements. */
export function applyFocus(root: Element, groups: Map<string, Element[]>, focus: Focus, last: { key: string }): void {
	const key = `${focus.selected}|${focus.hover}`;
	if (key === last.key) return;
	last.key = key;
	const any = focus.selected !== null || focus.hover !== null;
	root.classList.toggle("has-focus", any);
	for (const [name, els] of groups) {
		const on = name === focus.selected || name === focus.hover;
		for (const el of els) {
			el.classList.toggle("is-on", on);
			el.classList.toggle("is-picked", name === focus.selected);
		}
	}
}
