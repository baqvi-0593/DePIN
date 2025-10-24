import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Loader2, Wallet, AlertCircle, Download } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Alert, AlertDescription } from './ui/alert';
import { detectInstalledWallets, connectRealWallet, type DetectedWallet } from '../utils/solana/real-wallet-adapter';

interface WalletConnection {
  address: string;
  provider: string;
  publicKey: string;
}

interface WalletConnectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnectWallet: (walletConnection: WalletConnection) => Promise<void>;
}

// Check if we should use real wallets (production) or demo mode
const USE_REAL_WALLETS = import.meta.env.VITE_USE_REAL_WALLETS === 'true';

// Mock wallet providers for demo mode
const DEMO_WALLET_PROVIDERS = [
  {
    id: 'phantom',
    name: 'Phantom',
    icon: '👻',
    description: 'Connect to Phantom wallet (Demo)',
    detected: true,
    downloadUrl: 'https://phantom.app/download'
  },
  {
    id: 'solflare',
    name: 'Solflare',
    icon: '🔥',
    description: 'Connect to Solflare wallet (Demo)',
    detected: true,
    downloadUrl: 'https://solflare.com/download'
  },
  {
    id: 'backpack',
    name: 'Backpack',
    icon: '🎒',
    description: 'Connect to Backpack wallet (Demo)',
    detected: true,
    downloadUrl: 'https://backpack.app/download'
  },
];

export function WalletConnectModal({ open, onOpenChange, onConnectWallet }: WalletConnectModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [walletProviders, setWalletProviders] = useState<DetectedWallet[]>([]);

  useEffect(() => {
    // Detect installed wallets when modal opens
    if (open) {
      if (USE_REAL_WALLETS) {
        const detected = detectInstalledWallets();
        setWalletProviders(detected);
      } else {
        // Use demo providers
        setWalletProviders(DEMO_WALLET_PROVIDERS as DetectedWallet[]);
      }
    }
  }, [open]);

  const handleWalletConnect = async (walletId: string) => {
    setLoading(true);
    setSelectedWallet(walletId);

    try {
      if (USE_REAL_WALLETS) {
        // Connect to REAL wallet in production
        console.log(`🔗 Connecting to REAL ${walletId} wallet...`);
        const result = await connectRealWallet(walletId);
        
        await onConnectWallet({
          address: result.publicKey,
          provider: result.provider,
          publicKey: result.publicKey,
        });

        toast.success(`✅ Successfully connected to ${walletId} wallet!`, {
          description: `Address: ${result.publicKey.slice(0, 8)}...${result.publicKey.slice(-8)}`
        });
      } else {
        // DEMO MODE: Simulate wallet connection
        console.log(`🎮 Demo mode: Simulating ${walletId} wallet connection...`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Generate a realistic-looking mock Solana wallet address (base58, 32-44 chars)
        const mockWalletAddress = `${Math.random().toString(36).substr(2, 8)}${Math.random().toString(36).substr(2, 8)}${Math.random().toString(36).substr(2, 8)}${Math.random().toString(36).substr(2, 8)}`;
        
        await onConnectWallet({
          address: mockWalletAddress,
          provider: walletId,
          publicKey: mockWalletAddress,
        });

        toast.success(`✅ Demo wallet connected!`, {
          description: `Using ${walletId} in demo mode. Set VITE_USE_REAL_WALLETS=true for production.`
        });
      }

      onOpenChange(false);
    } catch (error: any) {
      console.error(`❌ Wallet connection failed:`, error);
      toast.error(`Failed to connect wallet`, {
        description: error.message || 'Please make sure your wallet is installed and unlocked.'
      });
    } finally {
      setLoading(false);
      setSelectedWallet(null);
    }
  };

  const hasInstalledWallets = walletProviders.some(w => w.detected);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-emerald-600" />
            Connect Your Solana Wallet
          </DialogTitle>
          <DialogDescription>
            Connect your Solana wallet to join BuildPK and start earning BUILD tokens
          </DialogDescription>
        </DialogHeader>

        {/* Mode indicator */}
        {!USE_REAL_WALLETS && (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-800">
              <strong>Demo Mode:</strong> Wallet connections are simulated. Set <code className="bg-blue-100 px-1 rounded">VITE_USE_REAL_WALLETS=true</code> in .env for production.
            </AlertDescription>
          </Alert>
        )}

        {/* Production mode - no wallets installed warning */}
        {USE_REAL_WALLETS && !hasInstalledWallets && (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-sm text-amber-800">
              No Solana wallets detected. Please install a wallet extension to continue.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {walletProviders.map((wallet) => (
            <div key={wallet.name}>
              <Button
                variant="outline"
                onClick={() => wallet.detected ? handleWalletConnect(wallet.adapter) : window.open(wallet.downloadUrl, '_blank')}
                disabled={loading && USE_REAL_WALLETS && wallet.detected}
                className={`w-full justify-start h-auto p-4 ${
                  wallet.detected 
                    ? 'hover:bg-emerald-50 border-emerald-200' 
                    : 'hover:bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="text-2xl">{wallet.icon}</div>
                  <div className="flex-1 text-left">
                    <div className="font-medium flex items-center gap-2">
                      {wallet.name}
                      {!wallet.detected && USE_REAL_WALLETS && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Not Installed</span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {wallet.detected || !USE_REAL_WALLETS
                        ? `Connect to ${wallet.name} wallet`
                        : 'Click to download'}
                    </div>
                  </div>
                  {loading && selectedWallet === wallet.adapter && wallet.detected && (
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                  )}
                  {!wallet.detected && USE_REAL_WALLETS && (
                    <Download className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </Button>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t">
          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p>New to Solana? Download a wallet to get started:</p>
            <div className="flex justify-center gap-4 text-xs">
              <a href="https://phantom.app/download" target="_blank" rel="noopener noreferrer" 
                 className="text-emerald-600 hover:underline">
                Phantom
              </a>
              <a href="https://solflare.com/download" target="_blank" rel="noopener noreferrer"
                 className="text-emerald-600 hover:underline">
                Solflare
              </a>
              <a href="https://backpack.app/download" target="_blank" rel="noopener noreferrer"
                 className="text-emerald-600 hover:underline">
                Backpack
              </a>
            </div>
          </div>
        </div>

        <div className="text-xs text-center text-muted-foreground">
          By connecting your wallet, you agree to participate in BuildPK and earn BUILD tokens
        </div>
      </DialogContent>
    </Dialog>
  );
}