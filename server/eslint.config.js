import js from "@eslint/js";

export default [
  // 1. Native ESLint core rules (instant performance)
  js.configs.recommended,

  // 2. Pure Airbnb backend style rules injected statically (zero lag)
  {
    rules: {
      "no-var": "error",
      "prefer-const": "error",
      "prefer-arrow-callback": "error",
      "arrow-body-style": ["error", "as-needed"],
      "object-shorthand": "error",
      "quote-props": ["error", "as-needed"],
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-else-return": ["error", { allowElseIf: false }],
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-param-reassign": ["error", { props: true }],
      strict: ["error", "global"],

      // 3. Your specific backend overrides
      "no-console": "off"
    }
  }
];
