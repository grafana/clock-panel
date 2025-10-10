const pluginJson = require('../plugin.json');

module.exports = {
  locales: pluginJson.languages,
  sort: true,
  createOldCatalogs: false,
  failOnWarnings: true,
  verbose: false,
  resetDefaultValueLocale: 'en-US',
  defaultNamespace: pluginJson.id,
  input: ['../**/*.{tsx,ts}'],
  output: 'src/locales/$LOCALE/$NAMESPACE.json',
};
