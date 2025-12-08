import { useEffect } from 'react';
import { config, reportInteraction } from '@grafana/runtime';

import pluginJson from '../plugin.json';

export function useInteraction(name: string, options: Record<string, unknown>) {
  useEffect(() => {
    const interactionName = `grafana_plugin_${name}`;
    const info = {
      grafana_version: config.buildInfo.version,
      plugin_type: String(pluginJson.type),
      plugin_version: pluginJson.info.version,
      plugin_id: pluginJson.id,
      plugin_name: pluginJson.name,
    };
    reportInteraction(interactionName, { ...options, ...info });
  }, [name, options]);
}
