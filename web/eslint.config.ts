import { FlatCompat } from "@eslint/eslintrc";
import eslint from "@eslint/js";
import eslintParserTypescript from "@typescript-eslint/parser";
import tailwindcss from "eslint-plugin-better-tailwindcss";
import react from "eslint-plugin-react";
import globals from "globals";
import tseslint from "typescript-eslint";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: eslintParserTypescript,
      parserOptions: { project: true, ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { react, "better-tailwindcss": tailwindcss },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/consistent-type-imports": "warn",
      "react/jsx-curly-brace-presence": ["warn", "never"],
      ...tailwindcss.configs["recommended-error"].rules,
      ...tailwindcss.configs["recommended-warn"].rules,
      "better-tailwindcss/enforce-consistent-line-wrapping": [
        "warn",
        { preferSingleLine: true },
      ],
    },
    settings: { "better-tailwindcss": { entryPoint: "styles/globals.css" } },
  },
  ...compat.config({
    extends: ["next"],
  }),
);
