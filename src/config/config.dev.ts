const devConfig = {
  API_URL: import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8000/api/',
  FASTAPI_BASE_URL: import.meta.env.VITE_FASTAPI_BASE_URL ?? 'http://localhost:8001/api/v1',
} as const;

export default devConfig;
