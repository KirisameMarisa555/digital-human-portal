/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_REMOTE_API?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
