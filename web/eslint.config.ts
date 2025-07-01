import { FlatCompat } from "@eslint/eslintrc";
import eslint from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import tseslint from "typescript-eslint";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { react },
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  ...compat.config({
    extends: ["next"],
    // rules: {}
  }),
);
