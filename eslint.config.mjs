import { FlatCompat } from '@eslint/eslintrc';
import { includeIgnoreFile } from '@eslint/compat';
import eslintPluginPlugins from '@grafana/eslint-plugin-plugins';
import grafanaI18nPlugin from '@grafana/i18n/eslint-plugin';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url));

export default [
  // mimic ESLintRC-style extends
  ...compat.extends('./.config/.eslintrc'),
  includeIgnoreFile(gitignorePath, 'Imported .gitignore patterns'),
  {
    plugins: {
      '@grafana/i18n/eslint-plugin': eslintPluginPlugins,
    },
    files: ['src/**/*.{ts,tsx,js,jsx}'],
    rules: {
      '@grafana/i18n/eslint-plugin/import-is-compatible': ['warn'],
    },
  },
  {
    plugins: {
      '@grafana/i18n': grafanaI18nPlugin,
    },
    files: ['src/**/*.{ts,tsx,js,jsx}'],
    rules: {
      '@grafana/i18n/no-untranslated-strings': 'error',
      '@grafana/i18n/no-translation-top-level': 'error',
    },
  },
];
