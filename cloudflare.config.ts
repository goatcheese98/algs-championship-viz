import { defineConfig, defineWorker } from "cf/config";

// A static site: the built page and nothing else. No Worker code runs.
const worker = defineWorker({
	name: "algs-dashboard",
	compatibilityDate: "2026-10-01",
	workersDev: true,
	assets: { notFoundHandling: "single-page-application" },
});

export default defineConfig({
	// Rohan's personal account. Pinned so a deploy can never land in another account.
	accountId: "17ca93f20835664505fe44e9d514c34e",
	worker,
});
