import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import { defineConfig } from "eslint/config";
import path from "path";

export default defineConfig([
  {
    ignores: [
      "eslint.config.js", // 👈 evita que ESLint se analice a sí mismo
      "vite.config.ts",
      "tsconfig*.json",
      "node_modules",
      "dist"
    ],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,vue}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        parser: tseslint.parser,
        project: "./tsconfig.app.json",
      },
    },
    settings: {
      "import/resolver": {
        typescript: { project: "./tsconfig.app.json" },
        alias: { map: [["@", "./src"]], extensions: [".ts", ".js", ".vue", ".json"] },
      },
    },
  },
  tseslint.configs.recommended,
  pluginVue.configs["flat/essential"],
  {
    files: ["**/*.vue"],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
  },
]);
