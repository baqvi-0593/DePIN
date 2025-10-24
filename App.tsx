import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { DashboardHeader } from './components/DashboardHeader';
import { PhaseOverview } from './components/PhaseOverview';
import { WiFiNetworkDashboard } from './components/WiFiNetworkDashboard';
import { LogisticsDashboard } from './components/LogisticsDashboard';
import { AgricultureDashboard } from './components/AgricultureDashboard';
import { HealthcareDashboard } from './components/HealthcareDashboard';
import { TaxationDashboard } from './components/TaxationDashboard';
import { TokenEconomics } from './components/TokenEconomics';
import { MultichainIntegration } from './components/MultichainIntegration';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { WalletConnectModal } from './components/WalletConnectModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';
import { Button } from './components/ui/button';
import { useWalletAuth } from './hooks/useWalletAuth';
import { localApiClient } from './utils/localApi';
import { localDb } from './utils/localDb';

export default function App() {
  const { user, loading, walletConnected, disconnectWallet, connectWallet } = useWalletAuth();
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [totalTokens, setTotalTokens] = useState(0);
  const [demoMode, setDemoMode] = useState(false);
  const [appInitialized, setAppInitialized] = useState(false);
  const [currentTab, setCurrentTab] = useState('overview');

  useEffect(() => {
    // Initialize demo data and test API connection on app load - only once
    let mounted = true;
    
    const initializeApp = async () => {
      try {
        // Initialize demo data for better user experience
        localDb.initializeDemoData();
        console.log('Demo data initialized');
        
        // Test API connection with timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Health check timeout')), 5000)
        );
        
        await Promise.race([
          localApiClient.healthCheck(),
          timeoutPromise
        ]);
        
        if (mounted) {
          console.log('Local API connection successful');
          setAppInitialized(true);
        }
      } catch (error) {
        if (mounted) {
          console.error('App initialization failed:', error);
          setAppInitialized(true); // Still mark as initialized to prevent hanging
        }
      }
    };

    // Only initialize once
    initializeApp();
    
    return () => {
      mounted = false;
    };
  }, []); // Remove dependencies to run only once

  useEffect(() => {
    // Set up auth token and fetch user's token balance when authenticated
    let mounted = true;
    
    if (user?.id && walletConnected && !demoMode) {
      localApiClient.setCurrentUserId(user.id);
      localApiClient.setAuthToken('local-wallet-auth-token');
      
      const fetchTokenBalance = async () => {
        try {
          const balance = await localApiClient.getTokenBalance(user.id);
          if (mounted && balance && typeof balance.tokens === 'number' && typeof balance.staked === 'number') {
            setTotalTokens(balance.tokens + balance.staked);
          } else if (mounted) {
            console.warn('Invalid balance data received:', balance);
            setTotalTokens(0);
          }
        } catch (error) {
          if (mounted) {
            console.error('Failed to fetch token balance:', error);
            setTotalTokens(0);
          }
        }
      };

      fetchTokenBalance();
    } else if (!demoMode) {
      localApiClient.setCurrentUserId(null);
      localApiClient.setAuthToken(null);
      if (mounted) {
        setTotalTokens(0);
      }
    }
    
    return () => {
      mounted = false;
    };
  }, [user?.id, walletConnected, demoMode]); // More specific dependencies

  useEffect(() => {
    // Listen for custom wallet modal open events
    const handleOpenWalletModal = () => {
      setWalletModalOpen(true);
    };

    window.addEventListener('openWalletModal', handleOpenWalletModal);
    return () => window.removeEventListener('openWalletModal', handleOpenWalletModal);
  }, []);

  if (loading || !appInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          {loading ? (
            <p className="text-muted-foreground">Loading wallet connection...</p>
          ) : (
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-emerald-900">BuildPK</h2>
              <p className="text-lg text-emerald-700">Pakistan's Decentralized Physical Infrastructure Network</p>
              <p className="text-base font-semibold text-emerald-600">Build. Own. Earn.</p>
              <p className="text-sm text-muted-foreground mt-4">Initializing network...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const handleConnectWallet = () => {
    setWalletModalOpen(true);
  };

  const handleConnectWalletFromDashboard = () => {
    toast.info("🚀 Connect your Solana wallet to start earning BUILD tokens!", {
      action: {
        label: "Connect Wallet",
        onClick: () => setWalletModalOpen(true)
      }
    });
  };

  const handleDisconnectWallet = async () => {
    try {
      await disconnectWallet();
      setTotalTokens(0);
      toast.success("Wallet disconnected successfully");
    } catch (error: any) {
      toast.error(`Disconnect failed: ${error.message}`);
    }
  };

  const handleExperienceDemo = () => {
    if (walletConnected) {
      toast.info('🎯 You\'re already connected! Explore each phase to start earning BUILD tokens.');
      return;
    }
    
    if (!demoMode) {
      setDemoMode(true);
      setTotalTokens(1250); // Demo token balance
      toast.success('Demo Mode Activated! All features unlocked with sample data. Connect your wallet to start earning real BUILD tokens!', {
        duration: 5000,
        action: {
          label: "Connect Wallet",
          onClick: () => setWalletModalOpen(true)
        }
      });
    } else {
      toast.info('🎯 Demo mode is already active! Explore all features with sample data.');
    }
  };

  const handleStopDemo = () => {
    setDemoMode(false);
    setTotalTokens(0);
    toast.success('Demo Mode Stopped! Connect your wallet to start earning real BUILD tokens.', {
      action: {
        label: "Connect Wallet",
        onClick: () => setWalletModalOpen(true)
      }
    });
  };

  const handleNavigateHome = () => {
    setCurrentTab('overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <DashboardHeader 
          totalTokens={totalTokens}
          walletConnected={walletConnected}
          onConnectWallet={handleConnectWallet}
          user={user}
          onDisconnectWallet={handleDisconnectWallet}
          demoMode={demoMode}
          onNavigateHome={handleNavigateHome}
        />
        
        <div className="container mx-auto px-4 py-6">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 gap-1">
              <TabsTrigger value="overview" className="text-xs lg:text-sm">Overview</TabsTrigger>
              <TabsTrigger value="wifi" className="text-xs lg:text-sm">WiFi</TabsTrigger>
              <TabsTrigger value="logistics" className="text-xs lg:text-sm">Logistics</TabsTrigger>
              <TabsTrigger value="agriculture" className="text-xs lg:text-sm">Agriculture</TabsTrigger>
              <TabsTrigger value="healthcare" className="text-xs lg:text-sm">Healthcare</TabsTrigger>
              <TabsTrigger value="taxation" className="text-xs lg:text-sm">Taxation</TabsTrigger>
              <TabsTrigger value="tokens" className="text-xs lg:text-sm">Tokens</TabsTrigger>
              <TabsTrigger value="multichain" className="text-xs lg:text-sm">Multichain</TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs lg:text-sm">Analytics</TabsTrigger>
              <TabsTrigger value="admin" className="text-xs lg:text-sm">Admin</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="space-y-6">
                <div className="text-center py-8">
                  <div className="mb-6">
                    <h1 className="text-5xl font-bold text-emerald-900 mb-2">
                      BuildPK
                    </h1>
                    <h2 className="text-2xl text-emerald-700 mb-2">
                      Pakistan's Decentralized Physical Infrastructure Network
                    </h2>
                    <h3 className="text-xl font-semibold text-emerald-600">
                      Build. Own. Earn.
                    </h3>
                  </div>
                  <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    A comprehensive DePIN platform for building decentralized physical infrastructure networks across Pakistan. 
                    Connect your Solana wallet to deploy WiFi networks, optimize logistics, monitor agriculture, collect healthcare data, 
                    and track taxation with blockchain-powered BUILD token incentives.
                  </p>
                  <div className="mt-6 space-y-3">
                    <Button 
                      size="lg"
                      onClick={handleExperienceDemo}
                      className={`${walletConnected 
                        ? 'bg-emerald-600 hover:bg-emerald-700' 
                        : 'bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700'
                      } text-white px-8 py-3`}
                    >
                      {walletConnected ? '🎯 Explore Your Network' : 'Experience It'}
                    </Button>
                    {demoMode && !walletConnected && (
                      <div>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={handleStopDemo}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          Stop Demo
                        </Button>
                      </div>
                    )}
                  </div>
                  {!walletConnected && !demoMode && (
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg max-w-md mx-auto">
                      <p className="text-sm text-amber-800">
                        🔑 Connect your Solana wallet to get started and begin earning BUILD tokens
                      </p>
                    </div>
                  )}
                  {demoMode && !walletConnected && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto">
                      <p className="text-sm text-blue-800">
                        <strong>Demo Mode Active:</strong> Experience all features with sample data. Connect your wallet to earn real BUILD tokens!
                      </p>
                    </div>
                  )}
                </div>
                
                <PhaseOverview />
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                  <div className="p-6 border rounded-lg bg-gradient-to-br from-emerald-50 to-green-50">
                    <h3 className="font-semibold text-emerald-900 mb-2">Phase 1: Community WiFi</h3>
                    <p className="text-sm text-emerald-700 mb-4">
                      Deploy 20-30 WiFi hotspots across focused geographic areas with token rewards for operators.
                    </p>
                    <div className="text-xs text-emerald-600 space-y-1">
                      <div>• Reward: 50 BUILD per hotspot</div>
                      <div>• Target: 500+ users in 3 months</div>
                      <div>• Focus: Peri-urban areas with limited coverage</div>
                    </div>
                  </div>

                  <div className="p-6 border rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50">
                    <h3 className="font-semibold text-blue-900 mb-2">Phase 2: Logistics Data</h3>
                    <p className="text-sm text-blue-700 mb-4">
                      Partner with delivery services to collect traffic and route optimization data.
                    </p>
                    <div className="text-xs text-blue-600 space-y-1">
                      <div>• Reward: 25 BUILD per partner</div>
                      <div>• Target: 200+ delivery partners in 6 months</div>
                      <div>• Coverage: 2-3 major cities</div>
                    </div>
                  </div>

                  <div className="p-6 border rounded-lg bg-gradient-to-br from-amber-50 to-yellow-50">
                    <h3 className="font-semibold text-amber-900 mb-2">Phase 3: Agriculture Monitoring</h3>
                    <p className="text-sm text-amber-700 mb-4">
                      Deploy low-cost sensors for precision agriculture and data sharing networks.
                    </p>
                    <div className="text-xs text-amber-600 space-y-1">
                      <div>• Reward: 75 BUILD per farm</div>
                      <div>• Target: 100+ farms in 3-5 districts</div>
                      <div>• Goal: Measurable yield improvements</div>
                    </div>
                  </div>

                  <div className="p-6 border rounded-lg bg-gradient-to-br from-rose-50 to-pink-50">
                    <h3 className="font-semibold text-rose-900 mb-2">Phase 4: Healthcare Data</h3>
                    <p className="text-sm text-rose-700 mb-4">
                      Collect anonymized healthcare data from hospitals and clinics for medical research.
                    </p>
                    <div className="text-xs text-rose-600 space-y-1">
                      <div>• Reward: 100 BUILD per provider</div>
                      <div>• Target: 50+ healthcare facilities</div>
                      <div>• Focus: Privacy-preserving data sharing</div>
                    </div>
                  </div>

                  <div className="p-6 border rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50">
                    <h3 className="font-semibold text-indigo-900 mb-2">Phase 5: Government Taxation</h3>
                    <p className="text-sm text-indigo-700 mb-4">
                      Transparent tax collection data from FBR, provincial authorities, and customs offices.
                    </p>
                    <div className="text-xs text-indigo-600 space-y-1">
                      <div>• Reward: 150 BUILD per tax point</div>
                      <div>• Target: 30+ collection points</div>
                      <div>• Goal: Blockchain-verified tax records</div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="wifi">
              <ErrorBoundary>
                <WiFiNetworkDashboard demoMode={demoMode} />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="logistics">
              <ErrorBoundary>
                <LogisticsDashboard demoMode={demoMode} />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="agriculture">
              <ErrorBoundary>
                <AgricultureDashboard demoMode={demoMode} />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="healthcare">
              <ErrorBoundary>
                <HealthcareDashboard demoMode={demoMode} />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="taxation">
              <ErrorBoundary>
                <TaxationDashboard demoMode={demoMode} />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="tokens">
              <ErrorBoundary>
                <TokenEconomics 
                  totalTokens={totalTokens}
                  walletConnected={walletConnected || demoMode}
                  demoMode={demoMode}
                />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="multichain">
              <ErrorBoundary>
                <MultichainIntegration />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="analytics">
              <ErrorBoundary>
                <AnalyticsDashboard />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="admin">
              <ErrorBoundary>
                <AdminDashboard demoMode={demoMode} walletConnected={walletConnected} />
              </ErrorBoundary>
            </TabsContent>
          </Tabs>
        </div>
        
        <WalletConnectModal 
          open={walletModalOpen} 
          onOpenChange={setWalletModalOpen}
          onConnectWallet={connectWallet}
        />
        
        <Toaster />
      </div>
    </ErrorBoundary>
  );
}