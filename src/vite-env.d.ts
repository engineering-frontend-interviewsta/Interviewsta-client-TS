/// <reference types="vite/client" />

declare module '*.html?raw' {
  const src: string;
  export default src;
}

/** Legacy landing pages (plain JSX); default export is a React page with no required props. */
declare module '*.jsx' {
  import type { ComponentType } from 'react';
  const component: ComponentType<object>;
  export default component;
}

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
