const grafanaConfig = require('@grafana/eslint-config/flat');
const { includeIgnoreFile } = require('@eslint/compat');
const path = require('node:path');

// Use path.resolve for CommonJS to get .gitignore path
const gitignorePath = path.resolve(__dirname, '.gitignore');

/**
 * @type {Array<import('eslint').Linter.Config>}
 */
module.exports = [
  // Include .gitignore patterns
  includeIgnoreFile(gitignorePath, 'Imported .gitignore patterns'),

  // Additional ignore patterns not in .gitignore
  {
    ignores: ['.github/**', '.yarn/**', '.config/**', 'renovate.json', 'src/external/**'],
  },

  // Apply Grafana config to all relevant files
  ...grafanaConfig,

  // Global project configuration
  {
    name: 'clock-panel/global',
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      '@grafana/plugins': require('@grafana/eslint-plugin-plugins'),
    },
    rules: {
      // From root .eslintrc
      '@grafana/plugins/import-is-compatible': ['warn'],
      // From .config/.eslintrc
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
];
