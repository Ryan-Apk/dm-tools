import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended
});

export default [
  // 1. Load Airbnb rules
  ...compat.extends("airbnb-base"),

  // 2. Safely patch the rules for ESLint v10
  {
    rules: {
      "import/extensions": "off",
      "no-console": "off",      // Keeps your backend logs clean
      "import/order": "off",     // CRITICAL: Stops the "sourceCode.getTokenOrCommentBefore" crash
      "import/no-unresolved": "off" // Optional: Stops legacy import plugin pathing errors
    }
  }
];
