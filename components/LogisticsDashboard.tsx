import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Truck, MapPin, Clock, Route, Coins, TrendingUp, Package, Plus, AlertTriangle, Navigation, BarChart3, Timer, Users, CheckCircle } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { AddLogisticsPartnerForm } from './AddLogisticsPartnerForm';
import { localApiClient } from '../utils/localApi';
import { useWalletAuth } from '../hooks/useWalletAuth';
import { toast } from 'sonner@2.0.3';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DeliveryPartner {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicle: string;
  rating: number;
  deliveries: number;
  earnings: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

interface RouteData {
  route: string;
  avgTime: number;
  congestionLevel: 'low' | 'medium' | 'high';
  dataPoints: number;
  improvement: number; // percentage
  predictedTime: number;
  trafficScore: number;
  popularityRank: number;
}

interface TrafficTimeData {
  hour: number;
  timeLabel: string;
  avgDeliveryTime: number;
  trafficDensity: number;
  completedDeliveries: number;
}

interface CongestionData {
  area: string;
  level: number;
  color: string;
  routes: number;
  avgDelay: number;
}

const mockRouteData: RouteData[] = [
  {
    route: 'Gulberg → DHA',
    avgTime: 25,
    congestionLevel: 'medium',
    dataPoints: 450,
    improvement: 12,
    predictedTime: 22,
    trafficScore: 75,
    popularityRank: 1
  },
  {
    route: 'Johar Town → Mall Road',
    avgTime: 32,
    congestionLevel: 'high',
    dataPoints: 380,
    improvement: 8,
    predictedTime: 29,
    trafficScore: 65,
    popularityRank: 2
  },
  {
    route: 'Cantt → Liberty',
    avgTime: 18,
    congestionLevel: 'low',
    dataPoints: 320,
    improvement: 15,
    predictedTime: 15,
    trafficScore: 90,
    popularityRank: 3
  },
  {
    route: 'Model Town → Fortress Stadium',
    avgTime: 28,
    congestionLevel: 'medium',
    dataPoints: 275,
    improvement: 18,
    predictedTime: 23,
    trafficScore: 78,
    popularityRank: 4
  }
];

const trafficTimeData: TrafficTimeData[] = [
  { hour: 6, timeLabel: '6 AM', avgDeliveryTime: 18, trafficDensity: 30, completedDeliveries: 45 },
  { hour: 8, timeLabel: '8 AM', avgDeliveryTime: 28, trafficDensity: 80, completedDeliveries: 120 },
  { hour: 10, timeLabel: '10 AM', avgDeliveryTime: 22, trafficDensity: 60, completedDeliveries: 95 },
  { hour: 12, timeLabel: '12 PM', avgDeliveryTime: 35, trafficDensity: 95, completedDeliveries: 180 },
  { hour: 14, timeLabel: '2 PM', avgDeliveryTime: 32, trafficDensity: 85, completedDeliveries: 150 },
  { hour: 16, timeLabel: '4 PM', avgDeliveryTime: 40, trafficDensity: 100, completedDeliveries: 200 },
  { hour: 18, timeLabel: '6 PM', avgDeliveryTime: 45, trafficDensity: 98, completedDeliveries: 220 },
  { hour: 20, timeLabel: '8 PM', avgDeliveryTime: 25, trafficDensity: 70, completedDeliveries: 160 },
  { hour: 22, timeLabel: '10 PM', avgDeliveryTime: 20, trafficDensity: 40, completedDeliveries: 80 }
];

const congestionData: CongestionData[] = [
  { area: 'DHA Phase 5', level: 85, color: '#ef4444', routes: 45, avgDelay: 12 },
  { area: 'Gulberg III', level: 72, color: '#f97316', routes: 38, avgDelay: 8 },
  { area: 'Johar Town', level: 68, color: '#f59e0b', routes: 42, avgDelay: 7 },
  { area: 'Model Town', level: 45, color: '#eab308', routes: 25, avgDelay: 4 },
  { area: 'Cantt Area', level: 30, color: '#22c55e', routes: 18, avgDelay: 2 }
];

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#22c55e'];

interface LogisticsDashboardProps {
  demoMode?: boolean;
}

// Chart loading fallback component
const ChartFallback = ({ height = 250 }: { height?: number }) => (
  <div className="flex items-center justify-center" style={{ height }}>
    <div className="text-center">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
      <p className="text-sm text-muted-foreground">Loading chart...</p>
    </div>
  </div>
);

export function LogisticsDashboard({ demoMode = false }: LogisticsDashboardProps) {
  const { user } = useWalletAuth();
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [chartsEnabled, setChartsEnabled] = useState(false);
  const [showTrafficInsights, setShowTrafficInsights] = useState(false);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const data = await localApiClient.getDeliveryPartners();
        setPartners(data);
      } catch (error) {
        console.error('Failed to fetch delivery partners:', error);
        toast.error('Failed to load delivery partner data');
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  // Enable charts after component has mounted and loaded
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setChartsEnabled(true);
      }, 1000); // Delay chart loading to prevent blocking
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const handleFormSuccess = () => {
    // Refresh partners list after successful addition
    const fetchPartners = async () => {
      try {
        const data = await localApiClient.getDeliveryPartners();
        setPartners(data);
      } catch (error) {
        console.error('Failed to refresh partners:', error);
      }
    };
    fetchPartners();
  };

  const handleAddPartner = async () => {
    if (!user && !demoMode) {
      toast.info('🚀 Connect your Solana wallet to add delivery partners and earn BUILD tokens!', {
        action: {
          label: "Connect Wallet",
          onClick: () => window.dispatchEvent(new CustomEvent('openWalletModal'))
        }
      });
      return;
    }

    if (demoMode) {
      const demoPartner = {
        id: `demo-${Date.now()}`,
        name: `Demo Partner ${partners.length + 1}`,
        email: `demo.partner${partners.length + 1}@logistics.pk`,
        phone: `+92-30${Math.floor(Math.random() * 10)}-${Math.floor(Math.random() * 9000000) + 1000000}`,
        vehicle: ['Motorcycle', 'Car', 'Bicycle'][Math.floor(Math.random() * 3)],
        rating: 4.5 + Math.random() * 0.5,
        deliveries: Math.floor(Math.random() * 100) + 10,
        earnings: Math.floor(Math.random() * 300) + 50,
        status: 'active' as const,
        createdAt: new Date().toISOString()
      };

      setPartners(prev => [...prev, demoPartner]);
      toast.success('🎯 Demo: New delivery partner added! You earned 25 BUILD tokens.');
      return;
    }

    try {
      const newPartner = await localApiClient.createDeliveryPartner({
        name: `Partner ${partners.length + 1}`,
        email: `partner${partners.length + 1}@logistics.pk`,
        phone: `+92-30${Math.floor(Math.random() * 10)}-${Math.floor(Math.random() * 9000000) + 1000000}`,
        vehicle: ['Motorcycle', 'Car', 'Bicycle'][Math.floor(Math.random() * 3)],
        rating: 4.5 + Math.random() * 0.5,
        deliveries: 0,
        earnings: 0,
        status: 'active'
      });

      setPartners(prev => [...prev, newPartner]);
      toast.success('New delivery partner added! You earned 25 BUILD tokens.');
    } catch (error) {
      console.error('Failed to add delivery partner:', error);
      toast.error('Failed to add delivery partner');
    }
  };

  const handleRecordDelivery = async () => {
    if (!user && !demoMode) {
      toast.info('🚀 Connect your Solana wallet to record delivery data and earn BUILD tokens!', {
        action: {
          label: "Connect Wallet",
          onClick: () => window.dispatchEvent(new CustomEvent('openWalletModal'))
        }
      });
      return;
    }

    if (partners.length === 0 && !demoMode) {
      toast.error('Please add a delivery partner first');
      return;
    }

    if (demoMode) {
      toast.success('🎯 Demo: Delivery data recorded for Gulberg → DHA route! You earned 5 BUILD tokens.');
      return;
    }

    try {
      await localApiClient.recordDelivery({
        partnerId: partners[Math.floor(Math.random() * partners.length)]?.id || 'demo',
        route: 'Random Route',
        duration: 15 + Math.random() * 30,
        timestamp: new Date().toISOString()
      });

      toast.success('Delivery data recorded! You earned 5 BUILD tokens.');
    } catch (error) {
      console.error('Failed to record delivery:', error);
      toast.error('Failed to record delivery data');
    }
  };

  const handleTrafficInsights = () => {
    if (!user && !demoMode) {
      toast.info('📊 Connect your Solana wallet to access traffic insights and analytics!', {
        action: {
          label: "Connect Wallet",
          onClick: () => window.dispatchEvent(new CustomEvent('openWalletModal'))
        }
      });
      return;
    }
    
    // Toggle the insights panel
    setShowTrafficInsights(!showTrafficInsights);
    
    if (!showTrafficInsights) {
      // Show insights for the first time
      const dataPoints = Math.floor(Math.random() * 500) + 800;
      const message = demoMode
        ? `🎯 AI Traffic Insights Panel Opened! Analyzing ${dataPoints} data points from delivery network.`
        : `🚦 Live Traffic Analysis Activated! Earning 3 BUILD per data point. ${dataPoints} points analyzed.`;
      
      toast.success(message, { duration: 4000 });
      
      // Auto-enable charts when insights are shown
      if (!chartsEnabled) {
        setChartsEnabled(true);
      }
    }
  };

  const totalPartners = partners.length;
  const totalDeliveries = partners.reduce((sum, p) => sum + p.deliveries, 0);
  const totalTokens = partners.reduce((sum, p) => sum + p.earnings, 0);
  const avgDeliveryTime = partners.length > 0 
    ? partners.reduce((sum, p) => sum + (p.deliveries > 0 ? 30 : 0), 0) / partners.length 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading logistics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Hero Section */}
      <div className="relative rounded-xl overflow-hidden">
        <ImageWithFallback 
          src="https://images.unsplash.com/photo-1754765542024-c1320f23b75a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYWtpc3RhbiUyMGRlbGl2ZXJ5JTIwbG9naXN0aWNzJTIwbW90b3JjeWNsZXxlbnwxfHx8fDE3NTc3NTM1MTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Pakistan Delivery Logistics"
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-purple-900/60 flex items-center">
          <div className="p-8 text-white">
            <h2 className="text-3xl font-bold mb-2">Logistics Data Collection</h2>
            <p className="text-blue-100 mb-4">Optimizing delivery routes across Pakistani cities</p>
            <div className="flex gap-4 text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full">{totalPartners} Active Partners</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">{totalDeliveries} Deliveries Tracked</span>
            </div>
          </div>
        </div>
      </div>

      {/* Logistics Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Truck className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{totalPartners}</div>
            <div className="text-sm text-muted-foreground">Delivery Partners</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Package className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{totalDeliveries}</div>
            <div className="text-sm text-muted-foreground">Total Deliveries</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{avgDeliveryTime.toFixed(0)} min</div>
            <div className="text-sm text-muted-foreground">Avg Delivery Time</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Coins className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{totalTokens.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">BUILD Tokens Earned</div>
          </CardContent>
        </Card>
      </div>

      {/* Partner Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Partner Performance</CardTitle>
          <CardDescription>Real-time tracking of delivery partners and their contributions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {partners.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No delivery partners registered yet. Add your first partner to start collecting logistics data!</p>
              </div>
            ) : (
              partners.map((partner) => (
                <div key={partner.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${
                      partner.status === 'active' ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <Truck className={`h-4 w-4 ${
                        partner.status === 'active' ? 'text-green-600' : 'text-gray-600'
                      }`} />
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{partner.name}</h4>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`text-xs ${i < Math.floor(partner.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{partner.vehicle}</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {partner.phone}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-medium">{partner.deliveries}</div>
                      <div className="text-muted-foreground">Deliveries</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="font-medium">{partner.rating.toFixed(1)}</div>
                      <div className="text-muted-foreground">Rating</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="font-medium text-amber-600">{partner.earnings}</div>
                      <div className="text-muted-foreground">BUILD Tokens</div>
                    </div>

                    <Badge variant={
                      partner.status === 'active' ? 'default' : 'outline'
                    } className={
                      partner.status === 'active' ? 'bg-green-100 text-green-800' : ''
                    }>
                      {partner.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Traffic Insights Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Traffic Patterns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Daily Traffic Patterns
            </CardTitle>
            <CardDescription>Delivery times and traffic density throughout the day</CardDescription>
          </CardHeader>
          <CardContent>
            {chartsEnabled ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={trafficTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timeLabel" />
                  <YAxis />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 border rounded-lg shadow-sm">
                            <p className="font-medium">{label}</p>
                            <p className="text-blue-600">Avg Delivery: {payload[0]?.value} min</p>
                            <p className="text-red-600">Traffic Density: {payload[1]?.value}%</p>
                            <p className="text-green-600">Deliveries: {payload[2]?.value}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area type="monotone" dataKey="avgDeliveryTime" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="trafficDensity" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.4} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <ChartFallback height={250} />
            )}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 Key Insight:</strong> Optimal delivery windows: 6-10 AM (18-22 min) and 8-10 PM (20-25 min). 
                Avoid 4-6 PM peak hours (40-45 min delivery times).
              </p>
            </div>
            
            {!chartsEnabled && (
              <div className="mt-4 p-3 bg-gray-50 border rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-medium text-blue-600">Best Times</div>
                    <div className="text-gray-600">6-10 AM, 8-10 PM</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-red-600">Peak Hours</div>
                    <div className="text-gray-600">4-6 PM (45 min)</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-green-600">Avg Deliveries</div>
                    <div className="text-gray-600">1,430 today</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Congestion Heat Map */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Congestion Heat Map
            </CardTitle>
            <CardDescription>Real-time traffic density across Lahore areas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {congestionData.map((area, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: area.color }}
                    ></div>
                    <div>
                      <div className="font-medium">{area.area}</div>
                      <div className="text-sm text-muted-foreground">{area.routes} active routes</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{area.level}%</div>
                    <div className="text-sm text-muted-foreground">+{area.avgDelay} min delay</div>
                  </div>
                </div>
              ))}
            </div>
            {chartsEnabled ? (
              <ResponsiveContainer width="100%" height={120} className="mt-4">
                <BarChart data={congestionData} layout="horizontal">
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="area" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="level" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ChartFallback height={120} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Route Performance Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-purple-600" />
            Smart Route Optimization
          </CardTitle>
          <CardDescription>AI-powered route analysis with predictive delivery times</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Route Performance Chart */}
            <div>
              <h4 className="font-medium mb-4">Route Efficiency Comparison</h4>
              {chartsEnabled ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={mockRouteData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="route" angle={-45} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border rounded-lg shadow-sm">
                              <p className="font-medium">{label}</p>
                              <p className="text-blue-600">Current: {data.avgTime} min</p>
                              <p className="text-green-600">Predicted: {data.predictedTime} min</p>
                              <p className="text-purple-600">Traffic Score: {data.trafficScore}/100</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="avgTime" fill="#3b82f6" name="Current Time" />
                    <Bar dataKey="predictedTime" fill="#10b981" name="Predicted Time" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ChartFallback height={200} />
              )}
            </div>

            {/* Route Details */}
            <div className="space-y-3">
              <h4 className="font-medium mb-4">Route Optimization Insights</h4>
              {mockRouteData.map((route, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">#{route.popularityRank}</span>
                      <span className="text-sm">{route.route}</span>
                    </div>
                    <Badge variant={
                      route.congestionLevel === 'low' ? 'secondary' : 
                      route.congestionLevel === 'medium' ? 'outline' : 'destructive'
                    } className={
                      route.congestionLevel === 'low' ? 'bg-green-100 text-green-800' : 
                      route.congestionLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' : ''
                    }>
                      {route.congestionLevel.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-blue-600" />
                      <span>{route.avgTime} → {route.predictedTime} min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span>+{route.improvement}% efficiency</span>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Traffic Score</span>
                      <span>{route.trafficScore}/100</span>
                    </div>
                    <Progress value={route.trafficScore} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Optimization Recommendations */}
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              AI Optimization Recommendations
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                  <div>
                    <strong>Route Gulberg → DHA:</strong> Switch to Jail Road route during 4-6 PM, saves 8 minutes average.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                  <div>
                    <strong>Peak Hour Strategy:</strong> Deploy 40% more riders in DHA Phase 5 during lunch hours (12-2 PM).
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5"></div>
                  <div>
                    <strong>Weather Impact:</strong> Rain increases delivery time by 15-20%. Prepare extra riders on forecasted days.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5"></div>
                  <div>
                    <strong>Weekend Optimization:</strong> Friday evening routes show 25% higher efficiency via Liberty Market.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Graph Explanations and Analytics Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Understanding Your Traffic Analytics
          </CardTitle>
          <CardDescription>
            Learn how to interpret the charts and maximize your BUILD token earnings through data-driven logistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Daily Traffic Patterns Explanation */}
            <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50">
              <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                📊 Daily Traffic Patterns Chart
              </h4>
              <div className="space-y-3 text-sm text-blue-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p><strong>Blue Area (Delivery Times):</strong> Shows average delivery time throughout the day. Lower values indicate faster deliveries and higher efficiency.</p>
                    <p className="mt-2"><strong>Optimal Zones:</strong> 6-10 AM and 8-10 PM show consistently low delivery times (18-25 minutes).</p>
                  </div>
                  <div>
                    <p><strong>Red Area (Traffic Density):</strong> Represents overall traffic congestion. Higher percentages mean more congested roads.</p>
                    <p className="mt-2"><strong>Peak Congestion:</strong> 4-6 PM shows maximum traffic density (95-100%) with longest delivery times.</p>
                  </div>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg mt-3">
                  <p className="font-medium">💡 Pro Tip: Schedule more deliveries during 6-10 AM and 8-10 PM windows to maximize efficiency and earn bonus BUILD tokens for optimal timing!</p>
                </div>
              </div>
            </div>

            {/* Congestion Heat Map Explanation */}
            <div className="p-4 border rounded-lg bg-gradient-to-r from-red-50 to-orange-50">
              <h4 className="font-medium text-red-900 mb-3 flex items-center gap-2">
                🗺️ Congestion Heat Map Analysis
              </h4>
              <div className="space-y-3 text-sm text-red-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p><strong>Color Coding:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li><span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>Red: High congestion (80%+)</li>
                      <li><span className="inline-block w-3 h-3 bg-orange-500 rounded-full mr-2"></span>Orange: Medium congestion (60-80%)</li>
                      <li><span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>Green: Low congestion (below 60%)</li>
                    </ul>
                  </div>
                  <div>
                    <p><strong>Key Metrics:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Active Routes: Number of delivery routes in area</li>
                      <li>Avg Delay: Additional minutes due to congestion</li>
                      <li>Congestion %: Real-time traffic density</li>
                    </ul>
                  </div>
                </div>
                <div className="p-3 bg-red-100 rounded-lg mt-3">
                  <p className="font-medium">🚨 Strategy: Avoid DHA Phase 5 during peak hours. Focus on Cantt Area for fastest deliveries with minimal delays!</p>
                </div>
              </div>
            </div>

            {/* Route Optimization Explanation */}
            <div className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50">
              <h4 className="font-medium text-purple-900 mb-3 flex items-center gap-2">
                🎯 Smart Route Optimization
              </h4>
              <div className="space-y-3 text-sm text-purple-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p><strong>Bar Chart Analysis:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Blue bars: Current average delivery times</li>
                      <li>Green bars: AI-predicted optimal times</li>
                      <li>Gap shows potential improvement opportunity</li>
                    </ul>
                  </div>
                  <div>
                    <p><strong>Traffic Score (0-100):</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>90+: Excellent route efficiency</li>
                      <li>70-89: Good with room for improvement</li>
                      <li>Below 70: Needs route optimization</li>
                    </ul>
                  </div>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg mt-3">
                  <p className="font-medium">🎖️ Rewards: Follow AI recommendations to earn up to 50 BUILD tokens per optimized route. Track your improvement percentage!</p>
                </div>
              </div>
            </div>

            {/* BUILD Token Earning Guide */}
            <div className="p-4 border rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50">
              <h4 className="font-medium text-amber-900 mb-3 flex items-center gap-2">
                💰 Maximizing PKN Token Earnings
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-amber-800">
                <div className="space-y-2">
                  <p className="font-medium">📊 Data Contribution:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>3 PKN per delivery data point</li>
                    <li>5 PKN for traffic condition reports</li>
                    <li>10 PKN for route timing data</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">🎯 Optimization Bonuses:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>15 PKN for following AI recommendations</li>
                    <li>25 PKN for consistent optimal timing</li>
                    <li>50 PKN for route efficiency improvements</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">🏆 Achievement Rewards:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>100 PKN for 95%+ traffic score</li>
                    <li>200 PKN for weekly top performer</li>
                    <li>500 PKN for discovering new optimal routes</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Real-time Data Flow */}
            <div className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-emerald-50">
              <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                🔄 How Real-time Data Works
              </h4>
              <div className="space-y-3 text-sm text-green-800">
                <p><strong>Data Collection Process:</strong></p>
                <div className="flex flex-col md:flex-row gap-4 mt-3">
                  <div className="flex-1 p-3 bg-green-100 rounded-lg text-center">
                    <div className="font-medium">1. GPS Tracking</div>
                    <div className="text-xs mt-1">Your delivery routes are tracked securely</div>
                  </div>
                  <div className="flex-1 p-3 bg-green-100 rounded-lg text-center">
                    <div className="font-medium">2. AI Analysis</div>
                    <div className="text-xs mt-1">Machine learning processes traffic patterns</div>
                  </div>
                  <div className="flex-1 p-3 bg-green-100 rounded-lg text-center">
                    <div className="font-medium">3. Insights Generated</div>
                    <div className="text-xs mt-1">Optimization recommendations provided</div>
                  </div>
                  <div className="flex-1 p-3 bg-green-100 rounded-lg text-center">
                    <div className="font-medium">4. PKN Rewards</div>
                    <div className="text-xs mt-1">Tokens earned for data contribution</div>
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-lg mt-3">
                  <p className="font-medium">🔒 Privacy: All data is anonymized and aggregated. Individual delivery details remain private while contributing to network intelligence.</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Logistics Partner
        </Button>
        <Button 
          variant="outline"
          onClick={handleAddPartner}
          disabled={!user && !demoMode}
        >
          {(!user && !demoMode) ? '🔐 Connect Wallet for Demo' : demoMode ? '🎯 Add Demo Partner' : 'Quick Add Partner'}
        </Button>
        <Button 
          variant="outline"
          onClick={handleRecordDelivery}
          disabled={(!user && !demoMode) || (partners.length === 0 && !demoMode)}
        >
          {(!user && !demoMode) ? '🔐 Connect to Record Data' : demoMode ? '🎯 Record Demo Data' : 'Record Delivery Data'}
        </Button>
        <Button 
          variant="outline" 
          onClick={handleTrafficInsights}
          className={`${showTrafficInsights 
            ? 'bg-gradient-to-r from-purple-100 to-blue-100 border-purple-300' 
            : 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200'
          } hover:from-purple-100 hover:to-blue-100`}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          {showTrafficInsights ? 'Hide' : 'Show'} AI Traffic Insights
        </Button>
        {!chartsEnabled && (
          <Button 
            variant="outline" 
            onClick={() => setChartsEnabled(true)}
            className="border-green-200 hover:bg-green-50"
          >
            📊 Load Advanced Charts
          </Button>
        )}
      </div>

      {/* AI Traffic Insights Panel */}
      {showTrafficInsights && (
        <div className="space-y-6 mt-6 p-6 bg-gradient-to-r from-purple-50/50 to-blue-50/50 border border-purple-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-purple-900 flex items-center gap-2">
                <BarChart3 className="h-6 w-6" />
                AI Traffic Intelligence Dashboard
              </h3>
              <p className="text-purple-700 mt-1">Real-time analysis of delivery patterns and route optimization</p>
            </div>
            <Badge className="bg-green-100 text-green-800">
              Live Analysis
            </Badge>
          </div>

          {/* Key Insights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-purple-100 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Timer className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Optimal Windows</span>
              </div>
              <div className="text-lg font-semibold text-blue-600">6-10 AM</div>
              <div className="text-sm text-muted-foreground">18-22 min avg delivery</div>
            </div>
            
            <div className="p-4 bg-white border border-purple-100 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium">Peak Congestion</span>
              </div>
              <div className="text-lg font-semibold text-red-600">4-6 PM</div>
              <div className="text-sm text-muted-foreground">40-45 min avg delivery</div>
            </div>
            
            <div className="p-4 bg-white border border-purple-100 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Route Efficiency</span>
              </div>
              <div className="text-lg font-semibold text-green-600">+18%</div>
              <div className="text-sm text-muted-foreground">Improvement detected</div>
            </div>
            
            <div className="p-4 bg-white border border-purple-100 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Data Points</span>
              </div>
              <div className="text-lg font-semibold text-purple-600">1,247</div>
              <div className="text-sm text-muted-foreground">Analyzed today</div>
            </div>
          </div>

          {/* Live Insights */}
          <div className="bg-white border border-purple-100 rounded-lg p-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Live AI Analysis & Recommendations
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <strong className="text-green-800">Route Optimization Alert:</strong>
                  <div className="text-green-700 mt-1">
                    Gulberg → DHA: Switch to Jail Road during current time window. Expected time saving: 8-12 minutes.
                    <div className="text-xs text-green-600 mt-1">🔥 Based on 450 recent deliveries</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <strong className="text-blue-800">Demand Forecast:</strong>
                  <div className="text-blue-700 mt-1">
                    DHA Phase 5 experiencing 40% higher demand during lunch hours. Deploy additional riders for optimal coverage.
                    <div className="text-xs text-blue-600 mt-1">📈 Predicted 220 deliveries in next 2 hours</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div>
                  <strong className="text-orange-800">Weather Impact:</strong>
                  <div className="text-orange-700 mt-1">
                    Light rain detected in Johar Town area. Delivery times may increase by 15-20%. Adjust expectations accordingly.
                    <div className="text-xs text-orange-600 mt-1">🌧️ Real-time weather integration active</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <strong className="text-purple-800">Weekend Pattern:</strong>
                  <div className="text-purple-700 mt-1">
                    Friday evening routes show 25% higher efficiency via Liberty Market corridor. Recommended for weekend operations.
                    <div className="text-xs text-purple-600 mt-1">📊 Historical data analysis (4 weeks)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Token Rewards */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2 text-amber-800">
              <Coins className="h-5 w-5" />
              PKN Token Rewards for Data Contribution
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-lg font-semibold text-amber-600">3 PKN</div>
                <div className="text-amber-700">Per route data point</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-amber-600">15 PKN</div>
                <div className="text-amber-700">Per traffic pattern insight</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-amber-600">50 PKN</div>
                <div className="text-amber-700">Per route optimization</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!user && !demoMode && (
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            💡 <strong>Demo Mode:</strong> You're viewing existing delivery partner network. 
            Connect your Solana wallet to add partners and record delivery data to earn PKN tokens!
          </p>
        </div>
      )}
      {demoMode && !user && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            🎯 <strong>Interactive Demo Active:</strong> Add delivery partners, record data, and view traffic analytics with full functionality!
          </p>
        </div>
      )}

      {/* Add Logistics Partner Form */}
      <AddLogisticsPartnerForm
        open={showAddForm}
        onOpenChange={setShowAddForm}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}