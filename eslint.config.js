import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: [
      // Archivos y carpetas a ignorar
      "node_modules",
      "dist",
      "coverage",

      // Configuración y build tools
      "vite.config.ts",
      "postcss.config.cjs",
      "tailwind.config.js",

      // Archivos de configuración varios
      "*.config.js",
      "*.config.cjs",
      "*.config.mjs",
      "tsconfig*.json",

      // Otros archivos
      "eslint.config.js",
      "vitest.config.ts",
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
        project: "./tsconfig.eslint.json",
        extraFileExtensions: [".vue"],
      },
    },
    settings: {
      "import/resolver": {
        typescript: { project: "./tsconfig.eslint.json" },
        alias: {
          map: [["@", "./src"]],
          extensions: [".ts", ".js", ".vue", ".json"],
        },
      },
    },
  },
  tseslint.configs.recommended,
  pluginVue.configs["flat/essential"],
  {
    files: ["**/*.vue"],
    languageOptions: {
      parserOptions: { parser: tseslint.parser },
    },
  },
]);
