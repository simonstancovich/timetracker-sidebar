import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default tseslint.config(
  {
    ignores: [
      "dist",
      "dist-renderer",
      "release",
      "node_modules",
      // Electron main-process / build scripts are CommonJS Node files — linted
      // separately from the renderer TS app (a follow-up Node config can cover them).
      "*.js",
      "scripts/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { "react-hooks": reactHooks },
    rules: {
      // Real bugs — must fix.
      "react-hooks/rules-of-hooks": "error",
      // High-value but fixing all at once is risky — surface, don't block.
      "react-hooks/exhaustive-deps": "warn",
      // TS already resolves identifiers; no-undef double-reports types/globals.
      "no-undef": "off",
      "no-empty": ["error", { allowEmptyCatch: true }],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrors: "none" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    // A component must build from primitives (`prim.*`) and import the sibling
    // pieces it composes directly. Importing the components barrel from inside
    // the folder would make the barrel depend on itself (circular import), so
    // ban it here — the barrel is for outside consumers only.
    files: ["src/components/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [".", "./", "./index", "./index.ts", "../components", "../components/index"].map(
            (name) => ({
              name,
              message:
                "Don't import the components barrel from inside components/. Import the sibling module directly (e.g. './Field') to avoid a circular dependency.",
            }),
          ),
        },
      ],
    },
  },
  {
    files: ["**/*.test.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
);
