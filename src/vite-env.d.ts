/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string;
  readonly VITE_FASTAPI_BASE_URL: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_GITHUB_CLIENT_ID?: string;
  readonly VITE_VIDEO_SRC1?: string;
  readonly VITE_VIDEO_SRC2?: string;
  readonly VITE_VIDEO_SRC3?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
