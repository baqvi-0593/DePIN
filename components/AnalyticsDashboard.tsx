import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, DollarSign, Activity, Download, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { localDb } from '../utils/localDb';
import { toast } from 'sonner@2.0.3';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalTokensDistributed: 0,
    totalTransactions: 0,
    phaseDistribution: [] as any[],
    growthData: [] as any[],
    topEarners: [] as any[],
    activityByPhase: [] as any[],
  });

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = () => {
    const users = localDb.getAllUsers();
    const hotspots = localDb.getHotspots();
    const partners = localDb.getDeliveryPartners();
    const farms = localDb.getFarms();
    const healthcare = localDb.getHealthcareProviders();
    const taxPoints = localDb.getTaxCollectionPoints();

    // Total tokens distributed
    const allBalances = users.map(u => localDb.getTokenBalance(u.id));
    const totalTokens = allBalances.reduce((sum, b) => sum + b.tokens + b.staked, 0);

    // Total transactions
    const allTransactions = users.flatMap(u => localDb.getTransactions(u.id));

    // Phase distribution
    const phaseDistribution = [
      { name: 'WiFi Network', value: hotspots.length, color: '#10b981' },
      { name: 'Logistics', value: partners.length, color: '#3b82f6' },
      { name: 'Agriculture', value: farms.length, color: '#f59e0b' },
      { name: 'Healthcare', value: healthcare.length, color: '#ec4899' },
      { name: 'Taxation', value: taxPoints.length, color: '#8b5cf6' },
    ];

    // Growth data (simulated - in production would use real historical data)
    const growthData = generateGrowthData(timeRange);

    // Top earners
    const topEarners = users
      .map(u => {
        const balance = localDb.getTokenBalance(u.id);
        return {
          name: u.name || 'Unknown',
          tokens: balance.tokens + balance.staked,
        };
      })
      .sort((a, b) => b.tokens - a.tokens)
      .slice(0, 10);

    // Activity by phase
    const activityByPhase = [
      { 
        phase: 'WiFi', 
        deployed: hotspots.length,
        active: hotspots.filter(h => h.status === 'online').length,
        earnings: hotspots.reduce((sum, h) => sum + h.earnings, 0),
      },
      { 
        phase: 'Logistics', 
        deployed: partners.length,
        active: partners.filter(p => p.status === 'active').length,
        earnings: partners.reduce((sum, p) => sum + p.earnings, 0),
      },
      { 
        phase: 'Agriculture', 
        deployed: farms.length,
        active: farms.length,
        earnings: farms.reduce((sum, f) => sum + f.earnings, 0),
      },
      { 
        phase: 'Healthcare', 
        deployed: healthcare.length,
        active: healthcare.filter(p => p.status === 'active').length,
        earnings: healthcare.reduce((sum, p) => sum + p.earnings, 0),
      },
      { 
        phase: 'Taxation', 
        deployed: taxPoints.length,
        active: taxPoints.filter(p => p.status === 'active').length,
        earnings: taxPoints.reduce((sum, p) => sum + p.earnings, 0),
      },
    ];

    setAnalytics({
      totalUsers: users.length,
      totalTokensDistributed: totalTokens,
      totalTransactions: allTransactions.length,
      phaseDistribution,
      growthData,
      topEarners,
      activityByPhase,
    });
  };

  const generateGrowthData = (range: string) => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
    const data = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        users: Math.floor(Math.random() * 20) + i * 2,
        transactions: Math.floor(Math.random() * 50) + i * 5,
        tokens: Math.floor(Math.random() * 100) + i * 10,
      });
    }
    
    return data;
  };

  const exportData = () => {
    const csvContent = [
      ['Date', 'Users', 'Transactions', 'Tokens Distributed'],
      ...analytics.growthData.map(d => [d.date, d.users, d.transactions, d.tokens])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buildpk-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast.success('Analytics data exported successfully');
  };

  return (
    <div className="space-y-6 relative">
      {/* Background Watermark */}
      <div 
        className="fixed inset-0 flex items-center justify-center pointer-events-none z-0"
        style={{ opacity: 0.03 }}
      >
        <div className="text-center">
          <h1 className="text-[20rem] font-bold text-emerald-900">BuildPK</h1>
        </div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-emerald-900 mb-2 flex items-center gap-2">
              <TrendingUp className="h-8 w-8" />
              Network Analytics
            </h2>
            <p className="text-muted-foreground">
              Comprehensive insights and metrics across all DePIN phases
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportData}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 mb-6">
          {(['7d', '30d', '90d', 'all'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === 'all' ? 'All Time' : range.toUpperCase()}
            </Button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">BUILD Distributed</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalTokensDistributed.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Across all phases
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalTransactions}</div>
              <p className="text-xs text-muted-foreground">
                Network activity
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Network Growth</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">+24%</div>
              <p className="text-xs text-muted-foreground">
                vs previous period
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Network Growth</CardTitle>
              <CardDescription>User and transaction trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.growthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="transactions" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Phase Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Phase Distribution</CardTitle>
              <CardDescription>Resources deployed across all phases</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.phaseDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.phaseDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Activity by Phase */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Activity by Phase</CardTitle>
            <CardDescription>Deployment and earnings comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.activityByPhase}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="phase" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="deployed" fill="#10b981" name="Deployed" />
                <Bar dataKey="active" fill="#3b82f6" name="Active" />
                <Bar dataKey="earnings" fill="#f59e0b" name="Earnings (BUILD)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Earners */}
        <Card>
          <CardHeader>
            <CardTitle>Top Earners</CardTitle>
            <CardDescription>Users with highest BUILD token balances</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topEarners.map((earner, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <span className="font-medium">{earner.name}</span>
                  </div>
                  <span className="font-bold text-emerald-600">
                    {earner.tokens.toLocaleString()} BUILD
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
