/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_REAL_WALLETS?: string;
  readonly VITE_SOLANA_NETWORK?: string;
  readonly VITE_PROGRAM_ID?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  phantom?: {
    solana?: {
      isPhantom?: boolean;
      publicKey?: {
        toString(): string;
      } | null;
      connect(): Promise<{ publicKey: { toString(): string } }>;
      disconnect(): Promise<void>;
    };
  };
  solflare?: {
    isSolflare?: boolean;
    publicKey?: {
      toString(): string;
    } | null;
    connect(): Promise<{ publicKey: { toString(): string } }>;
    disconnect(): Promise<void>;
  };
  backpack?: {
    isBackpack?: boolean;
    publicKey?: {
      toString(): string;
    } | null;
    connect(): Promise<{ publicKey: { toString(): string } }>;
    disconnect(): Promise<void>;
  };
  walletDiagnostics?: any;
}
