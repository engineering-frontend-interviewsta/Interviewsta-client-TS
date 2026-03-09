const stagingConfig = {
  API_URL: import.meta.env.VITE_BACKEND_URL ?? '',
  FASTAPI_BASE_URL: import.meta.env.VITE_FASTAPI_BASE_URL ?? '',
} as const;

export default stagingConfig;
