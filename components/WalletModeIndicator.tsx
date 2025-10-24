import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle, CheckCircle, Wallet, Zap } from 'lucide-react';

interface WalletModeIndicatorProps {
  mode?: 'demo' | 'production';
  className?: string;
}

export function WalletModeIndicator({ mode, className = '' }: WalletModeIndicatorProps) {
  // Auto-detect mode from environment variable
  const isProductionMode = mode === 'production' || import.meta.env.VITE_USE_REAL_WALLETS === 'true';

  if (isProductionMode) {
    return (
      <Alert className={`bg-emerald-50 border-emerald-200 ${className}`}>
        <CheckCircle className="h-4 w-4 text-emerald-600" />
        <AlertTitle className="text-emerald-900">Production Mode Active</AlertTitle>
        <AlertDescription className="text-sm text-emerald-700">
          Connected to real Solana blockchain. All transactions require wallet approval and SOL for fees.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className={`bg-blue-50 border-blue-200 ${className}`}>
      <Zap className="h-4 w-4 text-blue-600" />
      <AlertTitle className="text-blue-900">Demo Mode Active</AlertTitle>
      <AlertDescription className="text-sm text-blue-700">
        Using simulated wallets for testing. Set <code className="bg-blue-100 px-1 rounded text-xs">VITE_USE_REAL_WALLETS=true</code> for production.
      </AlertDescription>
    </Alert>
  );
}

// Optional: Add to settings/admin panel
export function WalletModeSettings() {
  const isProductionMode = import.meta.env.VITE_USE_REAL_WALLETS === 'true';
  const network = import.meta.env.VITE_SOLANA_NETWORK || 'devnet';

  return (
    <div className="space-y-4 p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2">
        <Wallet className="h-5 w-5 text-emerald-600" />
        <h3 className="font-semibold">Wallet Configuration</h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between py-2 border-b">
          <span className="text-sm text-muted-foreground">Connection Mode</span>
          <span className={`text-sm font-medium ${isProductionMode ? 'text-emerald-600' : 'text-blue-600'}`}>
            {isProductionMode ? '🔗 Production (Real Wallets)' : '🎮 Demo (Simulated)'}
          </span>
        </div>

        <div className="flex items-center justify-between py-2 border-b">
          <span className="text-sm text-muted-foreground">Solana Network</span>
          <span className="text-sm font-medium">
            {network === 'mainnet-beta' ? '🌐 Mainnet' : network === 'devnet' ? '🧪 Devnet' : `📍 ${network}`}
          </span>
        </div>

        <div className="flex items-center justify-between py-2 border-b">
          <span className="text-sm text-muted-foreground">Program ID</span>
          <span className="text-xs font-mono text-muted-foreground">
            {import.meta.env.VITE_PROGRAM_ID || 'Not set'}
          </span>
        </div>
      </div>

      <div className="pt-4">
        {!isProductionMode ? (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-xs text-amber-700">
              <strong>Note:</strong> Demo mode is active. Users cannot earn real BUILD tokens or make blockchain transactions.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="bg-emerald-50 border-emerald-200">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-xs text-emerald-700">
              <strong>Production Ready:</strong> Real wallet connections enabled. Ensure smart contracts are deployed!
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="text-xs text-muted-foreground pt-2">
        To change mode, update <code className="bg-muted px-1 rounded">.env</code> file and restart the application.
      </div>
    </div>
  );
}
