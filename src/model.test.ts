import { describe, expect, it } from "vite-plus/test";
import { finish, findSeries, gameStory, index, ordinal, played, seriesFacts, slideAt, valueAt } from "./model";

const all = index.flatMap((t) => t.stages.flatMap((s) => s.series.map((x) => ({ tournament: t.id, series: x.id }))));

describe("every series in the data", () => {
	it("is found and has a full grid of games", () => {
		expect(all.length).toBe(36);
		for (const ref of all) {
			const s = findSeries(ref.tournament, ref.series);
			expect(s, `${ref.tournament}/${ref.series}`).not.toBeNull();
			if (!s) continue;
			for (const team of s.teams) {
				expect(team.points.length).toBe(s.games);
				expect(team.total.length).toBe(s.games + 1);
				expect(team.position.length).toBe(s.games + 1);
				expect(team.total.at(-1)).toBe(team.points.reduce((a, b) => a + b, 0));
			}
		}
	});

	it("gives every team a different place after every game", () => {
		for (const ref of all) {
			const s = findSeries(ref.tournament, ref.series);
			if (!s) continue;
			for (let g = 0; g <= s.games; g++) {
				const places = s.teams.map((t) => t.position[g]).toSorted((a, b) => (a ?? 0) - (b ?? 0));
				expect(places).toEqual(s.teams.map((_, i) => i));
			}
		}
	});

	it("never ranks a team above one with more points", () => {
		for (const ref of all) {
			const s = findSeries(ref.tournament, ref.series);
			if (!s) continue;
			for (let g = 1; g <= s.games; g++) {
				const order = [...s.teams].toSorted((a, b) => (a.position[g] ?? 0) - (b.position[g] ?? 0));
				for (let i = 1; i < order.length; i++) expect(order[i - 1]?.total[g]).toBeGreaterThanOrEqual(order[i]?.total[g] ?? 0);
			}
		}
	});

	it("breaks a tie at the end by the official place", () => {
		const s = findSeries("year-5-open", "Day2-WinnersRound3-2");
		const order = [...(s?.teams ?? [])].toSorted((x, y) => (x.position[6] ?? 0) - (y.position[6] ?? 0));
		expect(order[0]?.total[6]).toBe(order[1]?.total[6]);
		expect(order[0]?.name).toBe("NRG");
		expect(order[0]?.finalRank).toBe(1);
	});

	it("has exactly one winner in every game, where the source has the detail", () => {
		for (const ref of all) {
			const s = findSeries(ref.tournament, ref.series);
			if (!s) continue;
			expect(s.detail, `${ref.tournament}/${ref.series}`).toBe(ref.tournament !== "year-4-championship");
			for (let g = 1; g <= s.games; g++) {
				const story = gameStory(s, g);
				if (s.detail) expect(story.winner, `${ref.series} game ${g}`).not.toBeNull();
				else expect(story.winner).toBeNull();
				expect(story.best.points).toBeGreaterThan(0);
			}
		}
	});
});

describe("EWC 2025 Group A", () => {
	const s = findSeries("ewc-2025", "Day1-A");
	if (!s) throw new Error("missing series");

	it("is ten games won by TSM", () => {
		const facts = seriesFacts(s);
		expect(s.games).toBe(10);
		expect(facts.winner.name).toBe("TSM");
		expect(facts.winner.total[10]).toBe(117);
		expect(facts.margin).toBe(13);
	});

	it("tells the first game without a climber, because nobody had a place yet", () => {
		const story = gameStory(s, 1);
		expect(story.climber).toBeNull();
		expect(story.leadChanged).toBe(false);
	});

	it("names the exact finish where the data has it", () => {
		const tsm = s.teams.find((t) => t.name === "TSM");
		expect(tsm && finish(s, tsm, 0)).toBe("6th");
	});
});

describe("Year 4 Championship", () => {
	it("shows scores only, because the source's kills and places do not add up", () => {
		const s = findSeries("year-4-championship", "AvsB");
		const fnatic = s?.teams.find((t) => t.name === "FNATIC");
		expect(s?.detail).toBe(false);
		expect(fnatic?.placements).toBeNull();
		expect(fnatic?.total[6]).toBe(65);
		expect(s && fnatic && finish(s, fnatic, 0)).toBe("");
		expect(s && seriesFacts(s).mostKills).toBeNull();
	});
});

describe("the playhead", () => {
	it("holds whole values at whole games and moves between them", () => {
		expect(valueAt([0, 10, 30], 0)).toBe(0);
		expect(valueAt([0, 10, 30], 1)).toBe(10);
		expect(valueAt([0, 10, 30], 2)).toBe(30);
		expect(valueAt([0, 10, 30], 1.31)).toBeCloseTo(20, 5);
		// The count is complete before the game ends, so the rows can then move.
		expect(valueAt([0, 10, 30], 1.7)).toBe(30);
		expect(valueAt([0, 10, 30], 9)).toBe(30);
	});

	it("says how much of a game is played", () => {
		expect(played(2, 1.9)).toBe(0);
		expect(played(2, 3.4)).toBe(1);
		expect(played(2, 2.31)).toBeCloseTo(0.5, 5);
		expect(played(2, 2.7)).toBe(1);
	});

	it("slides positions only after the scores are counted", () => {
		expect(slideAt([4, 0, 2], 0.4)).toBe(4);
		expect(slideAt([4, 0, 2], 0.71)).toBeCloseTo(2, 5);
		expect(slideAt([4, 0, 2], 1)).toBe(0);
		expect(slideAt([4, 0, 2], 2)).toBe(2);
	});

	it("writes ordinals", () => {
		expect([1, 2, 3, 4, 11, 12, 13, 21, 22].map(ordinal)).toEqual(["1st", "2nd", "3rd", "4th", "11th", "12th", "13th", "21st", "22nd"]);
	});
});
