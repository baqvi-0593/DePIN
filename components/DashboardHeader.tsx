import { Wallet, Globe, TrendingUp, LogOut, Copy, ExternalLink, Home } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { NotificationBell } from './NotificationBell';

interface DashboardHeaderProps {
  totalTokens: number;
  walletConnected: boolean;
  onConnectWallet: () => void;
  user?: {
    id: string;
    email: string;
    user_metadata?: {
      name?: string;
      walletAddress?: string;
      walletProvider?: string;
    };
  } | null;
  onDisconnectWallet?: () => void;
  demoMode?: boolean;
  onNavigateHome?: () => void;
}

export function DashboardHeader({ totalTokens, walletConnected, onConnectWallet, user, onDisconnectWallet, demoMode = false, onNavigateHome }: DashboardHeaderProps) {
  const handleCopyAddress = () => {
    if (user?.user_metadata?.walletAddress) {
      navigator.clipboard.writeText(user.user_metadata.walletAddress);
      toast.success('Wallet address copied to clipboard');
    }
  };

  const getDisplayAddress = (address?: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getWalletIcon = (provider?: string) => {
    switch (provider) {
      case 'phantom': return '👻';
      case 'solflare': return '🔥';
      case 'backpack': return '🎒';
      default: return '👛';
    }
  };

  const handleHomeClick = () => {
    if (onNavigateHome) {
      onNavigateHome();
    }
  };

  return (
    <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-emerald-50 to-blue-50">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button 
            onClick={handleHomeClick}
            className="cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-3 bg-white rounded-lg px-4 py-2 border border-emerald-200"
            aria-label="Go to home"
          >
            <div className="flex items-center gap-2">
              <Globe className="h-8 w-8 text-emerald-600" />
              <div className="flex flex-col items-start">
                <span className="font-bold text-lg text-emerald-900 leading-tight">BuildPK</span>
                <span className="text-xs text-emerald-700 leading-tight">DePIN Network</span>
              </div>
            </div>
          </button>
          <Button
            onClick={handleHomeClick}
            variant="outline"
            size="sm"
            className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
          >
            <Home className="h-4 w-4" />
            Home
          </Button>
        </div>
        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
          MVP v1.0
        </Badge>
        {demoMode && !walletConnected && (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            🚀 Demo Mode
          </Badge>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border">
          <TrendingUp className="h-4 w-4 text-emerald-600" />
          <span className="font-medium">{totalTokens.toLocaleString()} BUILD</span>
          <span className="text-sm text-muted-foreground">Tokens</span>
        </div>
        
        {(walletConnected || demoMode) && <NotificationBell />}
        
        {walletConnected ? (
          <div className="flex items-center gap-2">
            {user?.user_metadata ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-emerald-200">
                <span className="text-lg">{getWalletIcon(user.user_metadata?.walletProvider)}</span>
                <div className="text-right">
                  <div className="text-sm font-medium flex items-center gap-1">
                    {getDisplayAddress(user.user_metadata?.walletAddress)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyAddress}
                      className="h-auto p-1 text-muted-foreground hover:text-foreground"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-xs text-emerald-600 capitalize">
                    {user.user_metadata?.walletProvider || 'wallet'} Connected
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-emerald-200">
                <span className="text-lg">👛</span>
                <div className="text-right">
                  <div className="text-sm font-medium">Wallet Connected</div>
                  <div className="text-xs text-emerald-600">Ready to earn BUILD</div>
                </div>
              </div>
            )}
            <Button 
              onClick={onDisconnectWallet}
              variant="outline"
              size="sm"
              className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Disconnect
            </Button>
          </div>
        ) : (
          <Button 
            onClick={onConnectWallet}
            variant="default"
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            <Wallet className="h-4 w-4" />
            Connect Wallet
          </Button>
        )}
      </div>
    </div>
  );
}