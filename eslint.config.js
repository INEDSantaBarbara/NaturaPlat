import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: [
      'node_modules/**',
      'public/img/**',
      'docs/**',
      'odd/**',
      '.agents/**',
      '.claude/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  js.configs.recommended,
  {
    // JavaScript del navegador: main.js es un IIFE clásico y simulator.js es un
    // módulo ES. Ambos se lintean como módulo; el HTML decide cómo se cargan.
    files: ['public/js/**/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  {
    // Tests e2e: ejecutan fragmentos dentro del navegador con page.evaluate().
    files: ['tests/e2e/**/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.node, ...globals.browser },
    },
  },
  {
    // Config, tests, servidor de desarrollo y scripts corren en Node.
    files: [
      'tests/**/*.js',
      'scripts/**/*.mjs',
      'api/**/*.js',
      'playwright.config.js',
      'eslint.config.js',
      'server.js',
    ],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.node, fetch: 'readonly', AbortSignal: 'readonly' },
    },
  },
];
