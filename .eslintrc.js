module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  overrides: [
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'airbnb-base',
    'airbnb-typescript/base',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    'import/no-named-as-default': 'off',
    'max-len': ['error', { 'code': 120 }],
    'class-methods-use-this': 'off',
  },
};
