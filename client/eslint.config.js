import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

// Import the compatibility layer to safely load legacy style guides
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended
})

export default defineConfig([
  globalIgnores(['dist']),

  // 1. Load the standard Airbnb React Ruleset
  ...compat.extends('airbnb'),

  {
    files: ['**/*.{js,jsx}'],
    extends: [
      // Airbnb covers core JS, so you only need your unique Vite/React settings here
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      sourceType: "module",
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true }
      },
    },

    // CRITICAL FIX FOR ESLINT v10 CRASH:
    // This stops the plugin from calling getFilename() to autodetect React
    settings: {
      react: {
        version: 'detect', // Or specify your version exactly, e.g., '18.3' or '19.0'
      },
    },

    // 2. Custom overrides and bug fixes here
    rules: {
      // Fixes the previous "sourceCode.getTokenOrCommentBefore" crash from Airbnb
      'import/order': 'off',
      'import/no-unresolved': 'off',

      // complains about imports ending in .jsx, but thats fine???
      "import/extensions": "off",

      // Turn off Airbnb's requirement to import React in every single file (not needed in Vite)
      'react/react-in-jsx-scope': 'off',
    }
  },
])
