import { PanelModel } from '@grafana/data';
import { ClockOptions, ClockRefresh } from './types';

export const clockMigrationHandler = (panel: PanelModel<ClockOptions>): Partial<ClockOptions> => {
  const options: any = panel.options || {};
  if (options.refreshSettings?.syncWithDashboard) {
    options.refresh = ClockRefresh.dashboard;
  } else if ((panel as any).refreshSettings?.syncWithDashboard) {
    options.refresh = ClockRefresh.dashboard;
  }

  if (detectInputOnlyPluginConfig(panel)) {
    migrateInputOnlyPluginConfig(panel);
  }
  // configuration options moved as the panel migrated, clean up if needed
  cleanupConfig(panel);

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
    // no source indicates and old config (pre 2.1.4)
    isInputOnly = true;
  }
  // an input source does not require a datasource
  if (options.countdownSettings?.source) {
    if (options.countdownSettings?.source === 'input') {
      isInputOnly = true;
    } else {
      return false;
    }
  } else {
    // no source indicates and old config (pre 2.1.4)
    isInputOnly = true;
  }

  if (options.countupSettings?.source) {
    if (options.countupSettings?.source === 'input') {
      isInputOnly = true;
    } else {
      return false;
    }
  } else {
    // no source indicates and old config (pre 2.1.4)
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
    // no source indicates and old config (pre 2.1.4)
    isInputOnly = true;
  }

  return isInputOnly;
};

const migrateInputOnlyPluginConfig = (panel: PanelModel<ClockOptions>) => {
  // remove the datasource
  delete panel.datasource;
  // remove the targets
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
  // @ts-ignore
  if (panel.datasource) {
    // @ts-ignore
    delete panel.datasource;
  }
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
