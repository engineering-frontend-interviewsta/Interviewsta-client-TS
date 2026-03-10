import devConfig from './config.dev';
import prodConfig from './config.prod';

const ENV = import.meta.env.MODE || 'development';

const configMap = {
  development: devConfig,
  production: prodConfig,
} as const;

const Config = configMap[ENV as keyof typeof configMap] ?? devConfig;

export default Config;
