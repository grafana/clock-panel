import { PanelModel } from '@grafana/data';
import { ClockOptions, ClockRefresh } from './types';
import { isQueryDrivenOptions } from './utils';
import { GRAFANA_BUILTIN_DS } from './constants';

const RANDOM_WALK_QUERY_TYPE = 'randomWalk';

export const clockMigrationHandler = (panel: PanelModel<ClockOptions>): Partial<ClockOptions> => {
  const options: any = panel.options || {};
  if (options.refreshSettings?.syncWithDashboard) {
    options.refresh = ClockRefresh.dashboard;
  } else if ((panel as any).refreshSettings?.syncWithDashboard) {
    options.refresh = ClockRefresh.dashboard;
  }

  const readonlyTargets = isReadonlyTarget(panel);
  const inputOnly = !isQueryDrivenOptions(panel.options || {});

  if (!readonlyTargets && inputOnly) {
    migrateInputOnlyPluginConfig(panel);
  }
  cleanupConfig(panel);

  // Grafana 12: targets is a read-only getter so we can't clear the array — redirect
  // stale targets to randomWalk on the Grafana built-in DS instead.
  if (readonlyTargets && inputOnly) {
    const targets = panel.targets;
    if (Array.isArray(targets) && targets.length > 0) {
      panel.datasource = { ...GRAFANA_BUILTIN_DS };
      for (const target of targets) {
        target.datasource = { ...GRAFANA_BUILTIN_DS };
        target.queryType = RANDOM_WALK_QUERY_TYPE;
      }
    }
  }

  return options;
};

const migrateInputOnlyPluginConfig = (panel: PanelModel<ClockOptions>) => {
  delete panel.datasource;
  panel.targets = [];
};

const cleanupConfig = (panel: PanelModel<ClockOptions>) => {
  // @ts-ignore
  if (panel.clockType) {
    // @ts-ignore
    delete panel.clockType;
  }
  // @ts-ignore
  if (panel.countdownSettings) {
    // @ts-ignore
    delete panel.countdownSettings;
  }
  // panel.datasource is NOT deleted here — migrateInputOnlyPluginConfig handles it for
  // input-only panels; query panels must keep their datasource.
  // @ts-ignore
  if (panel.dateSettings) {
    // @ts-ignore
    delete panel.dateSettings;
  }
  // @ts-ignore
  if (panel.mode) {
    // @ts-ignore
    delete panel.mode;
  }
  // @ts-ignore
  if (panel.refreshSettings) {
    // @ts-ignore
    delete panel.refreshSettings;
  }
  // @ts-ignore
  if (panel.timeSettings) {
    // @ts-ignore
    delete panel.timeSettings;
  }
  // @ts-ignore
  if (panel.timezone) {
    // @ts-ignore
    delete panel.timezone;
  }
  // @ts-ignore
  if (panel.timezoneSettings) {
    // @ts-ignore
    delete panel.timezoneSettings;
  }
};

function isReadonlyTarget(panel: PanelModel<ClockOptions>) {
  const description = Object.getOwnPropertyDescriptor(panel, 'targets');
  return typeof description?.set === 'undefined' && typeof description?.get === 'function';
}
