import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { 
  Zap, 
  Link, 
  Globe, 
  Shield, 
  TrendingUp, 
  Activity,
  Wallet,
  ArrowRightLeft,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { simpleSolanaClient } from '../utils/solana/simple-client';
import { SmartContractStatus } from './SmartContractStatus';

interface ChainInfo {
  id: string;
  name: string;
  nativeCurrency: string;
  rpcUrl: string;
  explorerUrl: string;
  status: 'active' | 'coming_soon' | 'maintenance';
  tvl: string;
  userCount: number;
  avgGasPrice?: string;
  blockTime: string;
  features: string[];
}

const SUPPORTED_CHAINS: ChainInfo[] = [
  {
    id: 'solana',
    name: 'Solana',
    nativeCurrency: 'SOL',
    rpcUrl: 'https://api.devnet.solana.com',
    explorerUrl: 'https://explorer.solana.com',
    status: 'active',
    tvl: '$2.8M',
    userCount: 1247,
    avgGasPrice: '0.000005 SOL',
    blockTime: '~400ms',
    features: ['DePIN Smart Contracts', 'Token Staking', 'Governance', 'Fast Transactions']
  },
  {
    id: 'polygon',
    name: 'Polygon',
    nativeCurrency: 'MATIC',
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    status: 'coming_soon',
    tvl: 'TBA',
    userCount: 0,
    avgGasPrice: '~0.01 MATIC',
    blockTime: '~2s',
    features: ['Low Gas Fees', 'Ethereum Compatibility', 'Layer 2 Scaling']
  },
  {
    id: 'binance',
    name: 'Binance Smart Chain',
    nativeCurrency: 'BNB',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    explorerUrl: 'https://bscscan.com',
    status: 'coming_soon',
    tvl: 'TBA',
    userCount: 0,
    avgGasPrice: '~0.003 BNB',
    blockTime: '~3s',
    features: ['High Throughput', 'DeFi Integration', 'Cross-chain Bridge']
  },
  {
    id: 'avalanche',
    name: 'Avalanche',
    nativeCurrency: 'AVAX',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    explorerUrl: 'https://snowtrace.io',
    status: 'coming_soon',
    tvl: 'TBA',
    userCount: 0,
    avgGasPrice: '~2 GWEI',
    blockTime: '~1s',
    features: ['Sub-second Finality', 'EVM Compatible', 'Subnet Architecture']
  }
];

export function MultichainIntegration() {
  const [activeChain, setActiveChain] = useState<string>('solana');
  const [connectionStatus, setConnectionStatus] = useState<Record<string, 'connected' | 'connecting' | 'disconnected'>>({});
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    // Initialize connection status
    const initialStatus: Record<string, 'connected' | 'connecting' | 'disconnected'> = {};
    SUPPORTED_CHAINS.forEach(chain => {
      if (chain.id === 'solana') {
        initialStatus[chain.id] = simpleSolanaClient.isConnected() ? 'connected' : 'disconnected';
      } else {
        initialStatus[chain.id] = chain.status === 'active' ? 'connected' : 'disconnected';
      }
    });
    setConnectionStatus(initialStatus);

    // Load demo balances
    setBalances({
      'solana': '1,250 PKN',
      'polygon': 'TBA',
      'binance': 'TBA',
      'avalanche': 'TBA'
    });

    // Load demo transactions
    setTransactions([
      {
        id: '1',
        chain: 'solana',
        type: 'stake',
        amount: '500 PKN',
        status: 'confirmed',
        timestamp: new Date().toISOString(),
        hash: '5zV2...8mK9'
      },
      {
        id: '2',
        chain: 'solana',
        type: 'reward',
        amount: '+25 PKN',
        status: 'confirmed',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        hash: '3nH7...2pQ4'
      }
    ]);
  }, []);

  const connectToChain = async (chainId: string) => {
    const chain = SUPPORTED_CHAINS.find(c => c.id === chainId);
    if (!chain) return;

    if (chain.status !== 'active') {
      toast.info(`${chain.name} integration coming soon! Currently in development phase.`);
      return;
    }

    setConnectionStatus(prev => ({ ...prev, [chainId]: 'connecting' }));

    try {
      if (chainId === 'solana') {
        // Check if already connected
        if (simpleSolanaClient.isConnected()) {
          setConnectionStatus(prev => ({ ...prev, [chainId]: 'connected' }));
          toast.success(`Already connected to ${chain.name}!`);
        } else {
          // Simulate connection for demo
          await new Promise(resolve => setTimeout(resolve, 1500));
          setConnectionStatus(prev => ({ ...prev, [chainId]: 'connected' }));
          toast.success(`Successfully connected to ${chain.name}!`);
        }
      }
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, [chainId]: 'disconnected' }));
      toast.error(`Failed to connect to ${chain.name}: ${error}`);
    }
  };

  const bridgeTokens = async () => {
    toast.info('Cross-chain bridge functionality coming soon! This will allow seamless PKN token transfers between supported chains.');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'coming_soon':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'maintenance':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getConnectionIcon = (status: 'connected' | 'connecting' | 'disconnected') => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'connecting':
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'disconnected':
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Multichain Integration</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Connect your DePIN network across multiple blockchains for enhanced scalability, 
          reduced costs, and broader ecosystem access.
        </p>
      </div>

      {/* Smart Contract Status */}
      <SmartContractStatus />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Globe className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">4</div>
            <div className="text-sm text-gray-600">Supported Chains</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">$2.8M</div>
            <div className="text-sm text-gray-600">Total Value Locked</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">1,247</div>
            <div className="text-sm text-gray-600">Active Users</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <ArrowRightLeft className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">24</div>
            <div className="text-sm text-gray-600">Cross-chain Txns</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeChain} onValueChange={setActiveChain} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          {SUPPORTED_CHAINS.map((chain) => (
            <TabsTrigger key={chain.id} value={chain.id} className="flex items-center gap-2">
              {getStatusIcon(chain.status)}
              {chain.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {SUPPORTED_CHAINS.map((chain) => (
          <TabsContent key={chain.id} value={chain.id} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chain Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link className="h-5 w-5" />
                    {chain.name} Network
                  </CardTitle>
                  <CardDescription>
                    Network details and integration status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Status</div>
                      <Badge variant={chain.status === 'active' ? 'default' : 'secondary'} className="mt-1">
                        {chain.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Native Currency</div>
                      <div className="font-medium">{chain.nativeCurrency}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Block Time</div>
                      <div className="font-medium">{chain.blockTime}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">TVL</div>
                      <div className="font-medium">{chain.tvl}</div>
                    </div>
                  </div>

                  {chain.avgGasPrice && (
                    <div>
                      <div className="text-sm text-gray-600">Avg Gas Price</div>
                      <div className="font-medium">{chain.avgGasPrice}</div>
                    </div>
                  )}

                  <div>
                    <div className="text-sm text-gray-600 mb-2">Features</div>
                    <div className="flex flex-wrap gap-2">
                      {chain.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Connection Status</span>
                      {getConnectionIcon(connectionStatus[chain.id])}
                    </div>
                    <Button 
                      onClick={() => connectToChain(chain.id)}
                      disabled={connectionStatus[chain.id] === 'connecting'}
                      className="w-full"
                      variant={connectionStatus[chain.id] === 'connected' ? 'secondary' : 'default'}
                    >
                      {connectionStatus[chain.id] === 'connected' ? 'Connected' : 
                       connectionStatus[chain.id] === 'connecting' ? 'Connecting...' : 
                       'Connect to ' + chain.name}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Wallet Integration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Wallet & Assets
                  </CardTitle>
                  <CardDescription>
                    Your balances and transactions on {chain.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">PKN Balance</div>
                    <div className="text-2xl font-bold text-gray-900">{balances[chain.id]}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {chain.status === 'active' ? 'Available for staking and transactions' : 'Available when network launches'}
                    </div>
                  </div>

                  {chain.status === 'active' && (
                    <div className="space-y-2">
                      <Button className="w-full" disabled={chain.status !== 'active'}>
                        <Zap className="h-4 w-4 mr-2" />
                        Stake PKN Tokens
                      </Button>
                      <Button variant="outline" className="w-full" onClick={bridgeTokens}>
                        <ArrowRightLeft className="h-4 w-4 mr-2" />
                        Bridge to Other Chains
                      </Button>
                    </div>
                  )}

                  {chain.status !== 'active' && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="text-sm text-yellow-800">
                        <strong>Coming Soon:</strong> {chain.name} integration is currently under development. 
                        Stay tuned for launch updates!
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            {chain.status === 'active' && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>
                    Your latest activity on {chain.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {transactions
                      .filter(tx => tx.chain === chain.id)
                      .map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`h-2 w-2 rounded-full ${tx.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                            <div>
                              <div className="font-medium capitalize">{tx.type}</div>
                              <div className="text-sm text-gray-600">{tx.hash}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{tx.amount}</div>
                            <div className="text-sm text-gray-600">
                              {new Date(tx.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    
                    {transactions.filter(tx => tx.chain === chain.id).length === 0 && (
                      <div className="text-center py-6 text-gray-500">
                        No transactions yet. Start by staking PKN tokens!
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Cross-Chain Bridge Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Cross-Chain Bridge
          </CardTitle>
          <CardDescription>
            Seamlessly transfer PKN tokens between supported blockchains
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-medium mb-1">Secure Transfers</h3>
              <p className="text-sm text-gray-600">Multi-signature validation and fraud protection</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-medium mb-1">Fast Settlement</h3>
              <p className="text-sm text-gray-600">Cross-chain transfers in under 5 minutes</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-medium mb-1">Low Fees</h3>
              <p className="text-sm text-gray-600">Competitive rates across all supported chains</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-800">
              <strong>🚀 Bridge Protocol:</strong> Our multichain bridge will enable seamless PKN token transfers 
              between Solana, Polygon, BSC, and Avalanche networks. Coming Q2 2024!
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}