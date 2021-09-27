import { PanelPlugin } from '@grafana/data';

import { ClockPanel } from './ClockPanel';
import { ClockOptions } from './types';
import { optionsBuilder } from './options';
import { clockMigrationHandler } from './migrations';

export const plugin = new PanelPlugin<ClockOptions>(ClockPanel)
  .setNoPadding()
  .setMigrationHandler(clockMigrationHandler)
  .setPanelOptions(optionsBuilder);
