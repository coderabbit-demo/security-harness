module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  env: { node: true, es2021: true },
  parserOptions: { ecmaVersion: 2021, sourceType: "module" },
  ignorePatterns: ["dist/", "node_modules/"],
  rules: {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    eqeqeq: ["error", "always"],
    "no-eval": "error"
  }
};
