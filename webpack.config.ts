import type { Configuration } from 'webpack';
import { merge } from 'webpack-merge';
import grafanaConfig from './.config/webpack/webpack.config';

const config = async (env: Record<string, unknown>): Promise<Configuration> => {
  const baseConfig = await grafanaConfig(env);
  const externals = baseConfig.externals as string[];

  return merge(baseConfig, { externals: [...externals, 'i18next'] });
};

export default config;
