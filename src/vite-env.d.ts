/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: "http://localhost:8080";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
