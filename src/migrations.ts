import { PanelModel } from '@grafana/data';
import { ClockOptions, ClockRefresh } from './types';
import { config } from '@grafana/runtime';

export const clockMigrationHandler = (panel: PanelModel<ClockOptions>): Partial<ClockOptions> => {
  const options: any = panel.options || {};
  if (options.refreshSettings?.syncWithDashboard) {
    options.refresh = ClockRefresh.dashboard;
  } else if ((panel as any).refreshSettings?.syncWithDashboard) {
    options.refresh = ClockRefresh.dashboard;
  }

  if (!isReadonlyTarget(panel)) {
    if (detectInputOnlyPluginConfig(panel)) {
      migrateInputOnlyPluginConfig(panel);
    }
  }
  // configuration options moved as the panel migrated, clean up if needed
  cleanupConfig(panel);

  // Grafana 12: targets are a read-only getter — migrateInputOnlyPluginConfig was skipped
  // above. For input-only panels this leaves a stale bare target that Grafana will query
  // against the default datasource, producing an error. Point it at the Grafana built-in
  // datasource (which always succeeds with a randomWalk) so the panel loads cleanly.
  if (isReadonlyTarget(panel) && detectInputOnlyPluginConfig(panel)) {
    const grafanaDs = findGrafanaDataSource(config.datasources);
    if (grafanaDs) {
      panel.datasource = { type: grafanaDs.type, uid: grafanaDs.uid };
      // The readonly getter returns a mutable clone; mutate element properties in place
      // so individual targets also point at the Grafana datasource.
      const targets = panel.targets;
      if (Array.isArray(targets)) {
        for (const target of targets) {
          target.datasource = { type: grafanaDs.type, uid: grafanaDs.uid };
          target.queryType = 'randomWalk';
        }
      }
    }
  }

  return options;
};

// detect clock panel that does not use a query
const detectInputOnlyPluginConfig = (panel: PanelModel<ClockOptions>) => {
  let isInputOnly = false;

  const options: any = panel.options || {};
  if (options.countdownSettings?.source) {
    if (options.countdownSettings?.source === 'input') {
      isInputOnly = true;
    } else {
      return false;
    }
  } else {
    // no source indicates an old config (pre 2.1.4)
    isInputOnly = true;
  }

  if (options.countupSettings?.source) {
    if (options.countupSettings?.source === 'input') {
      isInputOnly = true;
    } else {
      return false;
    }
  } else {
    // no source indicates an old config (pre 2.1.4)
    isInputOnly = true;
  }

  if (options.descriptionSettings?.source) {
    if (options.descriptionSettings?.source === 'none') {
      isInputOnly = true;
    }
    if (options.descriptionSettings?.source === 'input') {
      isInputOnly = true;
    }
    if (options.descriptionSettings?.source === 'query') {
      return false;
    }
  } else {
    // no source indicates an old config (pre 2.1.4)
    isInputOnly = true;
  }

  return isInputOnly;
};

export const findGrafanaDataSource = (datasources: Record<string, any>) => {
  for (const key of Object.keys(datasources || {})) {
    const ds = datasources[key];
    if (ds.uid === 'grafana' || (ds.name === '-- Grafana --' && ds.type === 'datasource')) {
      return ds;
    }
  }
  return undefined;
};

const migrateInputOnlyPluginConfig = (panel: PanelModel<ClockOptions>) => {
  // remove the datasource
  delete panel.datasource;
  // remove the targets
  panel.targets = [];

  // find the grafana datasource and set it if available
  const grafanaDs = findGrafanaDataSource(config.datasources);

  // set a default random walk
  if (grafanaDs !== undefined) {
    panel.targets = [
      {
        refId: 'A',
        datasource: {
          type: grafanaDs.type,
          uid: grafanaDs.uid,
        },
        queryType: 'randomWalk',
      },
    ];
    panel.datasource = {
      type: grafanaDs.type,
      uid: grafanaDs.uid,
    };
  }
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
