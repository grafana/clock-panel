import { defineConfig } from 'eslint/config';
import grafanaConfig from '@grafana/eslint-config/flat.js';
import grafanaI18nPlugin from '@grafana/i18n/eslint-plugin';
import pluginESLintPlugin from '@grafana/eslint-plugin-plugins';

export default defineConfig([
  {
    ignores: [
      '**/logs',
      '**/*.log',
      '**/npm-debug.log*',
      '**/yarn-debug.log*',
      '**/yarn-error.log*',
      '**/.pnpm-debug.log*',
      '**/node_modules/',
      '**/.pnp.*',
      '**/pids',
      '**/*.pid',
      '**/*.seed',
      '**/*.pid.lock',
      '**/lib-cov',
      '**/coverage',
      '**/dist/',
      '**/artifacts/',
      '**/work/',
      '**/ci/',
      'test-results/',
      'playwright-report/',
      'blob-report/',
      'playwright/.cache/',
      'playwright/.auth/',
      '**/.idea',
      '**/.eslintcache',
      '.github/**',
      '.yarn/**',
      '.config/**',
      'renovate.json',
      'src/external/**',
    ],
  },
  ...grafanaConfig,
  // Global project configuration
  {
    name: 'clock-panel/global',
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      '@grafana/plugins': pluginESLintPlugin,
    },
    rules: {
      '@grafana/plugins/import-is-compatible': ['warn'],
      'react/prop-types': 'off',
    },
  },

  // TypeScript specific configuration (replaces overrides)
  {
    name: 'clock-panel/typescript',
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      '@typescript-eslint/no-deprecated': 'warn',
    },
  },

  // Test files configuration (replaces overrides)
  {
    name: 'clock-panel/tests',
    files: ['./tests/**/*'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
    },
  },
  {
    name: 'grafana/i18n-rules',
    plugins: { '@grafana/i18n': grafanaI18nPlugin },
    rules: {
      '@grafana/i18n/no-untranslated-strings': ['error', { calleesToIgnore: ['^css$', 'use[A-Z].*'] }],
      '@grafana/i18n/no-translation-top-level': 'error',
    },
  },
]);
