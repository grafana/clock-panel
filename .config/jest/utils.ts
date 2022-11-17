/*
 * This utility function is useful in combination with jest `transformIgnorePatterns` config
 * to transform specific packages (e.g.ES modules) in a projects node_modules folder.
 */
export const nodeModulesToTransform = (moduleNames: string[]) => `node_modules\/(?!(${moduleNames.join('|')})\/)`;

// Array of known nested grafana package dependencies that only bundle an ESM version
export const grafanaESModules = ['ol', 'react-colorful'];
