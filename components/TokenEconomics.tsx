import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Coins, TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, Clock, BarChart3, PieChart, LineChart, Lock, Unlock, Plus, Minus, Target, Trophy, Zap, Shield } from 'lucide-react';
import { Progress } from './ui/progress';
import { Slider } from './ui/slider';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { localApiClient } from '../utils/localApi';
import { useWalletAuth } from '../hooks/useWalletAuth';
import { toast } from 'sonner@2.0.3';

interface TokenTransaction {
  id: string;
  type: 'earned' | 'staked' | 'unstaked' | 'transferred';
  amount: number;
  description: string;
  timestamp: string;
}

interface StakingPool {
  name: string;
  apr: number;
  totalStaked: number;
  userStaked: number;
  lockPeriod: string;
  rewards: number;
  minStake: number;
  maxCapacity: number;
  poolType: 'infrastructure' | 'data' | 'governance';
  riskLevel: 'low' | 'medium' | 'high';
  description: string;
}

const stakingPools: StakingPool[] = [
  {
    name: 'WiFi Infrastructure Pool',
    apr: 12.5,
    totalStaked: 2450000,
    userStaked: 0,
    lockPeriod: '30 days',
    rewards: 0,
    minStake: 50,
    maxCapacity: 5000000,
    poolType: 'infrastructure',
    riskLevel: 'low',
    description: 'Fund WiFi hotspot deployment across Pakistan. Low risk, steady returns from network usage fees.'
  },
  {
    name: 'Logistics Optimization Pool',
    apr: 15.2,
    totalStaked: 1850000,
    userStaked: 0,
    lockPeriod: '60 days',
    rewards: 0,
    minStake: 100,
    maxCapacity: 3000000,
    poolType: 'data',
    riskLevel: 'medium',
    description: 'Support traffic data collection and route optimization. Medium risk with performance-based rewards.'
  },
  {
    name: 'Agriculture Data Pool',
    apr: 18.0,
    totalStaked: 980000,
    userStaked: 0,
    lockPeriod: '90 days',
    rewards: 0,
    minStake: 200,
    maxCapacity: 2000000,
    poolType: 'data',
    riskLevel: 'high',
    description: 'Finance agricultural sensor networks. Higher risk but best returns from yield improvement data.'
  },
  {
    name: 'Governance Pool',
    apr: 8.5,
    totalStaked: 1200000,
    userStaked: 0,
    lockPeriod: '14 days',
    rewards: 0,
    minStake: 25,
    maxCapacity: 1500000,
    poolType: 'governance',
    riskLevel: 'low',
    description: 'Participate in network governance decisions. Voting power increases with stake amount.'
  },
  {
    name: 'Innovation Fund Pool',
    apr: 22.0,
    totalStaked: 450000,
    userStaked: 0,
    lockPeriod: '180 days',
    rewards: 0,
    minStake: 500,
    maxCapacity: 1000000,
    poolType: 'infrastructure',
    riskLevel: 'high',
    description: 'Fund experimental DePIN technologies. High risk/reward for innovative infrastructure projects.'
  }
];

interface TokenEconomicsProps {
  totalTokens: number;
  walletConnected: boolean;
  demoMode?: boolean;
}

export function TokenEconomics({ totalTokens, walletConnected, demoMode = false }: TokenEconomicsProps) {
  const { user } = useWalletAuth();
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [tokenBalance, setTokenBalance] = useState({ tokens: 0, staked: 0 });
  const [loading, setLoading] = useState(true);
  const [userStakingPools, setUserStakingPools] = useState(stakingPools);
  const [showStakingModal, setShowStakingModal] = useState(false);
  const [selectedPool, setSelectedPool] = useState<number | null>(null);
  const [stakeAmount, setStakeAmount] = useState(100);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [stakingHistory, setStakingHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchTokenData = async () => {
      if (!user && !demoMode) {
        setLoading(false);
        return;
      }

      if (demoMode && !user) {
        // Set demo data
        setTokenBalance({ tokens: 850, staked: 400 });
        setTransactions([
          {
            id: 'demo-1',
            type: 'earned',
            amount: 75,
            description: 'Farm registration reward',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'demo-2',
            type: 'earned',
            amount: 50,
            description: 'WiFi hotspot deployment',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'demo-3',
            type: 'staked',
            amount: 200,
            description: 'Staked in Agriculture Pool',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'demo-4',
            type: 'earned',
            amount: 25,
            description: 'Delivery partner onboarded',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'demo-5',
            type: 'earned',
            amount: 15,
            description: 'Sensor data contribution',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]);
        setUserStakingPools(prev => prev.map((pool, index) => ({
          ...pool,
          userStaked: index === 2 ? 200 : index === 0 ? 150 : index === 1 ? 100 : index === 3 ? 50 : 0,
          rewards: index === 2 ? 12 : index === 0 ? 8 : index === 1 ? 6 : index === 3 ? 2 : 0
        })));
        
        setStakingHistory([
          { pool: 'WiFi Infrastructure Pool', amount: 150, date: '2024-01-15', action: 'stake' },
          { pool: 'Agriculture Data Pool', amount: 200, date: '2024-01-10', action: 'stake' },
          { pool: 'Logistics Optimization Pool', amount: 100, date: '2024-01-08', action: 'stake' },
          { pool: 'Governance Pool', amount: 50, date: '2024-01-05', action: 'stake' }
        ]);
        setLoading(false);
        return;
      }

      try {
        const [balance, userTransactions] = await Promise.all([
          localApiClient.getTokenBalance(user.id),
          localApiClient.getTransactions(user.id)
        ]);

        setTokenBalance(balance);
        setTransactions(userTransactions);
      } catch (error) {
        console.error('Failed to fetch token data:', error);
        toast.error('Failed to load token data');
      } finally {
        setLoading(false);
      }
    };

    fetchTokenData();
  }, [user, demoMode]);

  const handleStakeTokens = async (poolIndex: number, customAmount?: number) => {
    if (!user && !demoMode) {
      toast.error('Please connect your wallet to stake tokens');
      return;
    }

    const amount = customAmount || stakeAmount;
    const pool = userStakingPools[poolIndex];
    
    if (tokenBalance.tokens < amount) {
      toast.error('Insufficient tokens for staking');
      return;
    }

    if (amount < pool.minStake) {
      toast.error(`Minimum stake for this pool is ${pool.minStake} PKN`);
      return;
    }

    if (pool.totalStaked + amount > pool.maxCapacity) {
      toast.error('Pool capacity exceeded. Try a smaller amount.');
      return;
    }

    if (demoMode) {
      // Update demo state
      setTokenBalance(prev => ({
        tokens: prev.tokens - amount,
        staked: prev.staked + amount
      }));

      setUserStakingPools(prev => prev.map((p, index) => 
        index === poolIndex 
          ? { ...p, userStaked: p.userStaked + amount, totalStaked: p.totalStaked + amount }
          : p
      ));

      setStakingHistory(prev => [...prev, {
        pool: pool.name,
        amount,
        date: new Date().toISOString().split('T')[0],
        action: 'stake'
      }]);

      toast.success(`🎯 Demo: Successfully staked ${amount} PKN tokens in ${pool.name}!`);
      setShowStakingModal(false);
      return;
    }

    try {
      await localApiClient.stakeTokens({ amount, poolIndex });
      
      // Update local state
      setTokenBalance(prev => ({
        tokens: prev.tokens - amount,
        staked: prev.staked + amount
      }));

      setUserStakingPools(prev => prev.map((p, index) => 
        index === poolIndex 
          ? { ...p, userStaked: p.userStaked + amount, totalStaked: p.totalStaked + amount }
          : p
      ));

      toast.success(`Successfully staked ${amount} PKN tokens in ${pool.name}!`);
      setShowStakingModal(false);
    } catch (error) {
      console.error('Failed to stake tokens:', error);
      toast.error('Failed to stake tokens');
    }
  };

  const openStakingModal = (poolIndex: number) => {
    const pool = userStakingPools[poolIndex];
    setSelectedPool(poolIndex);
    setStakeAmount(pool.minStake);
    setShowStakingModal(true);
  };

  const handleUnstakeTokens = async (poolIndex: number) => {
    if (!user && !demoMode) {
      toast.error('Please connect your wallet to unstake tokens');
      return;
    }

    const pool = userStakingPools[poolIndex];
    if (pool.userStaked === 0) {
      toast.error('No tokens staked in this pool');
      return;
    }

    if (demoMode) {
      // Update demo state
      setTokenBalance(prev => ({
        tokens: prev.tokens + pool.userStaked,
        staked: prev.staked - pool.userStaked
      }));

      setUserStakingPools(prev => prev.map((p, index) => 
        index === poolIndex 
          ? { ...p, userStaked: 0, rewards: 0 }
          : p
      ));

      toast.success(`🎯 Demo: Successfully unstaked ${pool.userStaked} PKN tokens from ${pool.name}!`);
      return;
    }

    try {
      await localApiClient.unstakeTokens({ amount: pool.userStaked });
      
      // Update local state
      setTokenBalance(prev => ({
        tokens: prev.tokens + pool.userStaked,
        staked: prev.staked - pool.userStaked
      }));

      setUserStakingPools(prev => prev.map((p, index) => 
        index === poolIndex 
          ? { ...p, userStaked: 0, rewards: 0 }
          : p
      ));

      toast.success(`Successfully unstaked ${pool.userStaked} PKN tokens!`);
    } catch (error) {
      console.error('Failed to unstake tokens:', error);
      toast.error('Failed to unstake tokens');
    }
  };

  const handleClaimRewards = async (poolIndex: number) => {
    if (!user && !demoMode) {
      toast.error('Please connect your wallet to claim rewards');
      return;
    }

    const pool = userStakingPools[poolIndex];
    if (pool.rewards === 0) {
      toast.error('No rewards available to claim');
      return;
    }

    if (demoMode) {
      // Update demo state
      setTokenBalance(prev => ({
        ...prev,
        tokens: prev.tokens + pool.rewards
      }));

      setUserStakingPools(prev => prev.map((p, index) => 
        index === poolIndex 
          ? { ...p, rewards: 0 }
          : p
      ));

      toast.success(`🎯 Demo: Successfully claimed ${pool.rewards} PKN tokens from ${pool.name}!`);
      return;
    }

    try {
      await localApiClient.claimRewards({ poolIndex });
      
      // Update local state
      setTokenBalance(prev => ({
        ...prev,
        tokens: prev.tokens + pool.rewards
      }));

      setUserStakingPools(prev => prev.map((p, index) => 
        index === poolIndex 
          ? { ...p, rewards: 0 }
          : p
      ));

      toast.success(`Successfully claimed ${pool.rewards} PKN tokens!`);
    } catch (error) {
      console.error('Failed to claim rewards:', error);
      toast.error('Failed to claim rewards');
    }
  };

  const totalStaked = userStakingPools.reduce((sum, pool) => sum + pool.userStaked, 0);
  const totalRewards = userStakingPools.reduce((sum, pool) => sum + pool.rewards, 0);
  const availableTokens = tokenBalance.tokens;

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading token data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Enhanced Token Overview */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">PKN Token Economics</h2>
            <p className="text-gray-600 mt-1">Manage your Pakistan Network tokens and staking positions</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 hover:from-purple-100 hover:to-blue-100"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-4 text-center">
              <Wallet className="h-8 w-8 text-amber-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-amber-900">{availableTokens.toLocaleString()}</div>
              <div className="text-sm text-amber-700">Available PKN</div>
              <div className="text-xs text-amber-600 mt-1">Ready to stake</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-4 text-center">
              <Lock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-900">{totalStaked.toLocaleString()}</div>
              <div className="text-sm text-purple-700">Staked PKN</div>
              <div className="text-xs text-purple-600 mt-1">Across {userStakingPools.filter(p => p.userStaked > 0).length} pools</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900">{totalRewards}</div>
              <div className="text-sm text-green-700">Pending Rewards</div>
              <div className="text-xs text-green-600 mt-1">
                {totalRewards > 0 ? `~₨${(totalRewards * 12.5).toFixed(0)} PKR` : 'Start staking to earn'}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-4 text-center">
              <Coins className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-900">{(availableTokens + totalStaked).toLocaleString()}</div>
              <div className="text-sm text-blue-700">Total PKN</div>
              <div className="text-xs text-blue-600 mt-1">Portfolio value</div>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Distribution Visualization */}
        {(walletConnected || demoMode) && totalStaked > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-blue-600" />
                Portfolio Distribution
              </CardTitle>
              <CardDescription>Your PKN token allocation across different pools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userStakingPools.filter(pool => pool.userStaked > 0).map((pool, index) => {
                  const percentage = ((pool.userStaked / totalStaked) * 100);
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{pool.name}</span>
                        <div className="text-right">
                          <span className="text-sm font-medium">{pool.userStaked.toLocaleString()} PKN</span>
                          <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Analytics Dashboard */}
      {showAnalytics && (
        <div className="space-y-6 p-6 bg-gradient-to-r from-purple-50/50 to-blue-50/50 border border-purple-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-purple-900 flex items-center gap-2">
                <BarChart3 className="h-6 w-6" />
                Token Economics Analytics
              </h3>
              <p className="text-purple-700 mt-1">Advanced insights into your PKN token performance and network metrics</p>
            </div>
            <Badge className="bg-purple-100 text-purple-800">
              Live Data
            </Badge>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white border border-purple-100 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">30-Day ROI</span>
              </div>
              <div className="text-lg font-bold text-green-600">
                +{((totalRewards / Math.max(totalStaked, 1)) * 100 * 12).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Annualized return</div>
            </div>
            
            <div className="p-4 bg-white border border-purple-100 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Network Health</span>
              </div>
              <div className="text-lg font-bold text-blue-600">97.8%</div>
              <div className="text-sm text-muted-foreground">Infrastructure uptime</div>
            </div>
            
            <div className="p-4 bg-white border border-purple-100 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium">Earning Rate</span>
              </div>
              <div className="text-lg font-bold text-amber-600">
                {(totalStaked * 0.0004).toFixed(1)} PKN/day
              </div>
              <div className="text-sm text-muted-foreground">Current rewards</div>
            </div>
          </div>

          {/* Network Statistics */}
          <div className="bg-white border border-purple-100 rounded-lg p-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <LineChart className="h-5 w-5 text-purple-600" />
              Network Growth Metrics
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">12.4M</div>
                <div className="text-purple-700">Total PKN Staked</div>
                <div className="text-xs text-purple-600 mt-1">+8.2% this month</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">1,847</div>
                <div className="text-green-700">Active Validators</div>
                <div className="text-xs text-green-600 mt-1">+124 new this week</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">₨2.8M</div>
                <div className="text-blue-700">Total Value Locked</div>
                <div className="text-xs text-blue-600 mt-1">$45,200 USD equivalent</div>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <div className="text-lg font-bold text-amber-600">98.2%</div>
                <div className="text-amber-700">Staking Ratio</div>
                <div className="text-xs text-amber-600 mt-1">Above network target</div>
              </div>
            </div>
          </div>

          {/* Yield Comparison */}
          <div className="bg-white border border-purple-100 rounded-lg p-4">
            <h4 className="font-medium mb-3">Yield Comparison vs Traditional Investments</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Bank Fixed Deposit (1 year)</span>
                <div className="flex items-center gap-2">
                  <Progress value={12} className="w-20 h-2" />
                  <span className="text-sm font-medium">3.5%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">National Savings Certificate</span>
                <div className="flex items-center gap-2">
                  <Progress value={25} className="w-20 h-2" />
                  <span className="text-sm font-medium">7.2%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-700">PKN Infrastructure Staking</span>
                <div className="flex items-center gap-2">
                  <Progress value={50} className="w-20 h-2" />
                  <span className="text-sm font-medium text-green-600">12.5%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-amber-700">PKN Innovation Fund</span>
                <div className="flex items-center gap-2">
                  <Progress value={88} className="w-20 h-2" />
                  <span className="text-sm font-medium text-amber-600">22.0%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest PKN token activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Coins className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No transactions yet. Start contributing to the network to earn PKN tokens!</p>
                </div>
              ) : (
                transactions.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        tx.type === 'earned' ? 'bg-green-100' : 
                        tx.type === 'transferred' ? 'bg-red-100' : 'bg-purple-100'
                      }`}>
                        {tx.type === 'earned' ? (
                          <ArrowDownRight className={`h-4 w-4 ${
                            tx.type === 'earned' ? 'text-green-600' : 
                            tx.type === 'transferred' ? 'text-red-600' : 'text-purple-600'
                          }`} />
                        ) : (
                          <ArrowUpRight className={`h-4 w-4 ${
                            tx.type === 'earned' ? 'text-green-600' : 
                            tx.type === 'transferred' ? 'text-red-600' : 'text-purple-600'
                          }`} />
                        )}
                      </div>
                      
                      <div>
                        <div className="font-medium text-sm">{tx.description}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatTimeAgo(tx.timestamp)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`font-medium ${
                        tx.type === 'earned' ? 'text-green-600' : 
                        tx.type === 'transferred' ? 'text-red-600' : 'text-purple-600'
                      }`}>
                        {tx.type === 'earned' ? '+' : tx.type === 'transferred' ? '-' : ''}{tx.amount} PKN
                      </div>
                      <Badge 
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        completed
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Staking Pools */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Staking Pools
            </CardTitle>
            <CardDescription>Earn passive income by staking your PKN tokens across different risk levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userStakingPools.map((pool, index) => {
                const poolUtilization = (pool.totalStaked / pool.maxCapacity) * 100;
                const riskColorClasses = pool.riskLevel === 'low' 
                  ? 'bg-green-50 text-green-700 border-green-200' 
                  : pool.riskLevel === 'medium' 
                  ? 'bg-yellow-50 text-yellow-700 border-yellow-200' 
                  : 'bg-red-50 text-red-700 border-red-200';
                const typeColorClasses = pool.poolType === 'infrastructure' 
                  ? 'bg-blue-50 text-blue-700 border-blue-200' 
                  : pool.poolType === 'data' 
                  ? 'bg-purple-50 text-purple-700 border-purple-200' 
                  : 'bg-amber-50 text-amber-700 border-amber-200';
                
                return (
                  <div key={index} className="p-4 border rounded-lg space-y-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{pool.name}</h4>
                          <Badge variant="outline" className={riskColorClasses}>
                            {pool.riskLevel.toUpperCase()} RISK
                          </Badge>
                          <Badge variant="outline" className={typeColorClasses}>
                            {pool.poolType.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground max-w-md">
                          {pool.description}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Lock Period: {pool.lockPeriod}</span>
                          <span>Min Stake: {pool.minStake} PKN</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 text-lg px-3 py-1">
                        {pool.apr}% APR
                      </Badge>
                    </div>

                    {/* Pool Utilization */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Pool Utilization</span>
                        <span>{poolUtilization.toFixed(1)}% filled</span>
                      </div>
                      <Progress value={poolUtilization} className="h-2" />
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Total Staked</div>
                        <div className="font-medium">{pool.totalStaked.toLocaleString()} PKN</div>
                        <div className="text-xs text-muted-foreground">
                          {((pool.totalStaked / pool.maxCapacity) * 100).toFixed(1)}% of capacity
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Your Stake</div>
                        <div className="font-medium">{pool.userStaked.toLocaleString()} PKN</div>
                        <div className="text-xs text-muted-foreground">
                          {pool.userStaked > 0 ? `${((pool.userStaked / pool.totalStaked) * 100).toFixed(2)}% of pool` : 'Not participating'}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Est. Monthly</div>
                        <div className="font-medium text-green-600">
                          {pool.userStaked > 0 ? `+${(pool.userStaked * pool.apr / 12 / 100).toFixed(1)} PKN` : '0 PKN'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {pool.userStaked > 0 ? `≈₨${(pool.userStaked * pool.apr / 12 / 100 * 12.5).toFixed(0)}` : 'Start earning'}
                        </div>
                      </div>
                    </div>

                    {pool.userStaked > 0 && (
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-green-700">Pending Rewards</span>
                          <div className="text-right">
                            <span className="font-medium text-green-600">+{pool.rewards} PKN</span>
                            <div className="text-xs text-green-600">≈₨{(pool.rewards * 12.5).toFixed(0)} PKR</div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {pool.userStaked > 0 ? (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => openStakingModal(index)}
                            disabled={!user && !demoMode}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add More
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleUnstakeTokens(index)}
                            disabled={!user && !demoMode}
                          >
                            <Unlock className="h-4 w-4 mr-1" />
                            Unstake
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleClaimRewards(index)}
                            disabled={(!user && !demoMode) || pool.rewards === 0}
                          >
                            <Trophy className="h-4 w-4 mr-1" />
                            Claim
                          </Button>
                        </>
                      ) : (
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => openStakingModal(index)}
                          disabled={(!user && !demoMode) || availableTokens < pool.minStake}
                        >
                          <Lock className="h-4 w-4 mr-2" />
                          Stake {pool.minStake}+ PKN
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Token Utility */}
      <Card>
        <CardHeader>
          <CardTitle>PKN Token Utility</CardTitle>
          <CardDescription>How you can earn and use Pakistan Network tokens</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="p-3 bg-emerald-100 rounded-full w-fit mx-auto">
                <Coins className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="font-medium">Earn Tokens</h3>
              <p className="text-sm text-muted-foreground">
                Operate WiFi hotspots, contribute logistics data, or share agricultural sensor readings
              </p>
            </div>

            <div className="text-center space-y-2">
              <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-medium">Stake & Earn</h3>
              <p className="text-sm text-muted-foreground">
                Stake tokens in infrastructure pools to earn passive rewards and support network growth
              </p>
            </div>

            <div className="text-center space-y-2">
              <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium">Governance</h3>
              <p className="text-sm text-muted-foreground">
                Vote on network upgrades, funding proposals, and infrastructure expansion plans
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Integration */}
      {!walletConnected && !demoMode && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-6 text-center">
            <Wallet className="h-12 w-12 text-amber-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-amber-900 mb-2">Connect Your Solana Wallet</h3>
            <p className="text-amber-700 mb-4">
              Connect your Solana wallet to start earning PKN tokens and participate in DePIN network rewards.
              New users get 100 PKN tokens as a starting bonus!
            </p>
            <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
              <div className="p-2 bg-white/50 rounded">
                <div className="font-medium text-amber-900">🎁 Welcome Bonus</div>
                <div className="text-amber-700">100 PKN tokens</div>
              </div>
              <div className="p-2 bg-white/50 rounded">
                <div className="font-medium text-amber-900">🏗️ Deploy Hotspot</div>
                <div className="text-amber-700">+50 PKN tokens</div>
              </div>
              <div className="p-2 bg-white/50 rounded">
                <div className="font-medium text-amber-900">🌾 Register Farm</div>
                <div className="text-amber-700">+75 PKN tokens</div>
              </div>
            </div>
            <Button 
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => window.dispatchEvent(new CustomEvent('openWalletModal'))}
            >
              Connect Wallet to Start
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Staking Modal */}
      {showStakingModal && selectedPool !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-green-600" />
                Stake in {userStakingPools[selectedPool].name}
              </CardTitle>
              <CardDescription>
                {userStakingPools[selectedPool].description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Stake Amount (PKN)</Label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(Number(e.target.value))}
                      min={userStakingPools[selectedPool].minStake}
                      max={availableTokens}
                      className="flex-1"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setStakeAmount(availableTokens)}
                      disabled={availableTokens === 0}
                    >
                      Max
                    </Button>
                  </div>
                  <Slider
                    value={[stakeAmount]}
                    onValueChange={(value) => setStakeAmount(value[0])}
                    min={userStakingPools[selectedPool].minStake}
                    max={Math.min(availableTokens, userStakingPools[selectedPool].maxCapacity - userStakingPools[selectedPool].totalStaked)}
                    step={10}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Staking Preview */}
              <div className="p-4 bg-green-50 rounded-lg space-y-3">
                <h4 className="font-medium text-green-900">Staking Preview</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-green-700">APR</span>
                    <div className="font-medium">{userStakingPools[selectedPool].apr}%</div>
                  </div>
                  <div>
                    <span className="text-green-700">Lock Period</span>
                    <div className="font-medium">{userStakingPools[selectedPool].lockPeriod}</div>
                  </div>
                  <div>
                    <span className="text-green-700">Est. Monthly</span>
                    <div className="font-medium">+{(stakeAmount * userStakingPools[selectedPool].apr / 12 / 100).toFixed(1)} PKN</div>
                  </div>
                  <div>
                    <span className="text-green-700">Est. Yearly</span>
                    <div className="font-medium">+{(stakeAmount * userStakingPools[selectedPool].apr / 100).toFixed(1)} PKN</div>
                  </div>
                </div>
              </div>

              {/* Warnings */}
              {stakeAmount < userStakingPools[selectedPool].minStake && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Minimum stake for this pool is {userStakingPools[selectedPool].minStake} PKN
                  </p>
                </div>
              )}

              {stakeAmount > availableTokens && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    Insufficient balance. You have {availableTokens} PKN available.
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowStakingModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => handleStakeTokens(selectedPool, stakeAmount)}
                  disabled={
                    stakeAmount < userStakingPools[selectedPool].minStake || 
                    stakeAmount > availableTokens ||
                    stakeAmount === 0
                  }
                >
                  Stake {stakeAmount} PKN
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}