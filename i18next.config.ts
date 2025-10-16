import { defineConfig } from 'i18next-cli';
import pluginJson from './src/plugin.json';

export default defineConfig({
  locales: ['en-US'], // Only en-US  is updated - Crowdin will PR with other languages
  extract: {
    input: ['src/**/*.{tsx,ts}'],
    output: 'src/locales/{{language}}/{{namespace}}.json',
    defaultNS: pluginJson.id,
    functions: ['t', '*.t'],
    transComponents: ['Trans'],
  },
});
