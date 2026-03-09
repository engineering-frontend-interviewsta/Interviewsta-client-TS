import devConfig from './config.dev';
import prodConfig from './config.prod';
import stagingConfig from './config.staging';

const ENV = import.meta.env.MODE || 'development';

const configMap = {
  development: devConfig,
  staging: stagingConfig,
  production: prodConfig,
} as const;

const Config = configMap[ENV as keyof typeof configMap] ?? devConfig;

export default Config;
