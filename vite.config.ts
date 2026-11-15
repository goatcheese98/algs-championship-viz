import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig, lazyPlugins } from "vite-plus";

// One file for the whole toolchain (Vite+): the build, the formatter and the linter.
export default defineConfig({
	fmt: {
		useTabs: true,
		printWidth: 140,
		ignorePatterns: ["**/*.md", "package-lock.json", "src/data/algs.json", "data/**"],
	},
	lint: {
		plugins: ["typescript", "unicorn", "oxc", "import"],
		categories: { correctness: "error", suspicious: "error" },
		options: { typeAware: true, typeCheck: true, reportUnusedDisableDirectives: "error" },
		ignorePatterns: ["dist", ".cloudflare"],
		rules: {
			// Stylesheets and fonts are imported for their effect.
			"import/no-unassigned-import": ["error", { allow: ["**/*.css", "@fontsource-variable/*"] }],
		},
	},
	// Loaded only by the commands that build or serve, so `vp check` starts fast.
	plugins: lazyPlugins(() => [cloudflare()]),
});
