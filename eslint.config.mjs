import antfu from "@antfu/eslint-config"

const antfuConfig = antfu({
	stylistic: {
		indent: "tab",
		quotes: "double",
		semi: false,
	},
	rules: {
		"jsdoc/require-returns-check": "off",
		"jsdoc/require-returns-description": "off",
		"no-console": "off",
		"node/handle-callback-err": "off",
		"eslint-comments/no-unlimited-disable": "off",
		"ts/consistent-type-definitions": ["error", "type"],
		"ts/consistent-type-imports": "off",
		"node/prefer-global/process": "off",
		"brace-style": ["warn", "stroustrup", { allowSingleLine: false }],
	},
	ignores: [
		"**/benchmark/data/**",
	],
})

export default antfuConfig
