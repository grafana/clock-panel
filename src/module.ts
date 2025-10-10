import { PanelPlugin } from '@grafana/data';

import { ClockPanel } from './ClockPanel';
import { ClockOptions } from './types';
import { optionsBuilder } from './options';
import { clockMigrationHandler } from './migrations';
import { initPluginTranslations } from '@grafana/i18n';
import pluginJson from 'plugin.json';
import { config } from '@grafana/runtime';
import semver from 'semver';
import { loadResources } from './loadResources';

// Before Grafana version 12.1.0 the plugin is responsible for loading translation resources
// In Grafana version 12.1.0 and later Grafana is responsible for loading translation resources
const loaders = semver.lt(config?.buildInfo?.version, '12.1.0') ? [loadResources] : [];

await initPluginTranslations(pluginJson.id, loaders);

export const plugin = new PanelPlugin<ClockOptions>(ClockPanel)
  .setNoPadding()
  .setMigrationHandler(clockMigrationHandler)
  .setPanelOptions(optionsBuilder);
