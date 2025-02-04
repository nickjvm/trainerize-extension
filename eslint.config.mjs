import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        files: ["**/*.{js,mjs,cjs,ts}"],
    },
    {
        languageOptions: { globals: globals.node },
    },
    { ignores: ["dist/*"] },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    {
        rules: {
            semi: ["error", "always"],
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": "error",
            "@typescript-eslint/no-require-imports": "off",
            indent: ["error", 4, { SwitchCase: 1 }],
            // "react/react-in-jsx-scope": "off",
            // "react/jsx-uses-react": "off",
        },
    },
];
