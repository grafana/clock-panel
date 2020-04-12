import { PanelPlugin } from '@grafana/data';

import { ClockPanel } from './ClockPanel';
import { ClockOptions, defaults } from './types';
import { optionsBuilder } from './options';

export const plugin = new PanelPlugin<ClockOptions>(ClockPanel).setDefaults(defaults).setPanelOptions(optionsBuilder);
