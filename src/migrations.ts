import { PanelModel } from '@grafana/data';
import { ClockOptions, ClockRefresh } from './types';
import { config } from '@grafana/runtime';
import { findGrafanaDataSource, isQueryDrivenOptions } from './utils';

export const clockMigrationHandler = (panel: PanelModel<ClockOptions>): Partial<ClockOptions> => {
  const options: any = panel.options || {};
  if (options.refreshSettings?.syncWithDashboard) {
    options.refresh = ClockRefresh.dashboard;
  } else if ((panel as any).refreshSettings?.syncWithDashboard) {
    options.refresh = ClockRefresh.dashboard;
  }

  const readonlyTargets = isReadonlyTarget(panel);
  const inputOnly = detectInputOnlyPluginConfig(panel);

  if (!readonlyTargets && inputOnly) {
    migrateInputOnlyPluginConfig(panel);
  }
  // configuration options moved as the panel migrated, clean up if needed
  cleanupConfig(panel);

  // Grafana 12: targets is a read-only getter — migrateInputOnlyPluginConfig was skipped
  // above. If stale bare targets exist, we cannot clear the array, so redirect them to
  // the Grafana built-in datasource (randomWalk) to prevent errors against the default
  // datasource. Panels with empty targets need no intervention.
  //
  // The Grafana built-in datasource (uid='grafana') is a Grafana core internal — always
  // present regardless of org configuration. Prefer the registered instance from
  // config.datasources (which carries the correct type); fall back to the known-stable
  // uid when it is absent from config (e.g. in test environments).
  if (readonlyTargets && inputOnly) {
    const targets = panel.targets;
    if (Array.isArray(targets) && targets.length > 0) {
      const grafanaDs = findGrafanaDataSource(config.datasources) ?? { type: 'datasource', uid: 'grafana' };
      panel.datasource = { type: grafanaDs.type, uid: grafanaDs.uid };
      for (const target of targets) {
        target.datasource = { type: grafanaDs.type, uid: grafanaDs.uid };
        target.queryType = 'randomWalk';
      }
    }
  }

  return options;
};

const detectInputOnlyPluginConfig = (panel: PanelModel<ClockOptions>) =>
  !isQueryDrivenOptions(panel.options || {});

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
  // NOTE: panel.datasource is intentionally NOT deleted here.
  // For input-only panels, migrateInputOnlyPluginConfig handles datasource removal.
  // For query panels, the panel-level datasource must be preserved.
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

function isReadonlyTarget(panel: PanelModel<ClockOptions, any>) {
  const description = Object.getOwnPropertyDescriptor(panel, 'targets');
  return typeof description?.set === 'undefined' && typeof description?.get === 'function';
}
