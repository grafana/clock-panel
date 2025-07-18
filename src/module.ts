import { PanelPlugin } from '@grafana/data';

import { ClockPanel } from './ClockPanel';
import { ClockOptions } from './types';
import { optionsBuilder } from './options';
import { clockMigrationHandler } from './migrations';
import { initPluginTranslations } from '@grafana/i18n';
import pluginJson from 'plugin.json';

await initPluginTranslations(pluginJson.id);

export const plugin = new PanelPlugin<ClockOptions>(ClockPanel)
  .setNoPadding()
  .setMigrationHandler(clockMigrationHandler)
  .setPanelOptions(optionsBuilder);
