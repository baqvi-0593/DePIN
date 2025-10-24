import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Wifi, Truck, Sprout, Heart, Building, Users, DollarSign, Activity } from 'lucide-react';
import { localApiClient } from '../utils/localApi';

interface PhaseData {
  id: number;
  title: string;
  description: string;
  status: 'active' | 'planned' | 'completed';
  progress: number;
  metrics: {
    users: number;
    revenue: number;
    uptime: number;
  };
  icon: React.ReactNode;
  color: string;
  tokenReward: string;
}

export function PhaseOverview() {
  const [networkStats, setNetworkStats] = useState({
    hotspots: 0,
    totalWiFiUsers: 0,
    partners: 0,
    totalDeliveries: 0,
    farms: 0,
    totalSensors: 0,
    healthcareProviders: 0,
    healthcareDataPoints: 0,
    taxPoints: 0,
    taxTransactions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNetworkStats = async () => {
      try {
        const [hotspots, partners, farms, healthcareProviders, taxPoints] = await Promise.all([
          localApiClient.getHotspots(),
          localApiClient.getDeliveryPartners(),
          localApiClient.getFarms(),
          localApiClient.getHealthcareProviders(),
          localApiClient.getTaxCollectionPoints()
        ]);

        setNetworkStats({
          hotspots: hotspots.length,
          totalWiFiUsers: hotspots.reduce((sum, h) => sum + h.users, 0),
          partners: partners.length,
          totalDeliveries: partners.reduce((sum, p) => sum + p.deliveries, 0),
          farms: farms.length,
          totalSensors: farms.reduce((sum, f) => sum + f.sensors, 0),
          healthcareProviders: healthcareProviders.length,
          healthcareDataPoints: healthcareProviders.reduce((sum, p) => sum + p.dataPoints, 0),
          taxPoints: taxPoints.length,
          taxTransactions: taxPoints.reduce((sum, p) => sum + p.transactionsLogged, 0),
        });
      } catch (error) {
        console.error('Failed to fetch network stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNetworkStats();
  }, []);

  const phases: PhaseData[] = [
    {
      id: 1,
      title: "Community WiFi Network",
      description: "Deploy WiFi hotspots across neighborhoods with token rewards for operators",
      status: 'active',
      progress: Math.min((networkStats.hotspots / 20) * 100, 100),
      metrics: { 
        users: networkStats.totalWiFiUsers, 
        revenue: networkStats.hotspots * 180, 
        uptime: networkStats.hotspots > 0 ? 89 : 0 
      },
      icon: <Wifi className="h-6 w-6" />,
      color: "emerald",
      tokenReward: "50 BUILD"
    },
    {
      id: 2,
      title: "Logistics Data Collection",
      description: "Track delivery routes and traffic patterns with delivery partner rewards",
      status: 'active',
      progress: Math.min((networkStats.partners / 15) * 100, 100),
      metrics: { 
        users: networkStats.partners, 
        revenue: networkStats.totalDeliveries * 25, 
        uptime: networkStats.partners > 0 ? 94 : 0 
      },
      icon: <Truck className="h-6 w-6" />,
      color: "blue",
      tokenReward: "25 BUILD"
    },
    {
      id: 3,
      title: "Agricultural Monitoring",
      description: "Deploy sensors for precision agriculture and data sharing network",
      status: networkStats.farms > 0 ? 'active' : 'planned',
      progress: Math.min((networkStats.farms / 10) * 100, 100),
      metrics: { 
        users: networkStats.farms, 
        revenue: networkStats.totalSensors * 35, 
        uptime: networkStats.farms > 0 ? 78 : 0 
      },
      icon: <Sprout className="h-6 w-6" />,
      color: "amber",
      tokenReward: "75 BUILD"
    },
    {
      id: 4,
      title: "Healthcare Data Network",
      description: "Collect anonymized healthcare data from hospitals and clinics",
      status: networkStats.healthcareProviders > 0 ? 'active' : 'planned',
      progress: Math.min((networkStats.healthcareProviders / 10) * 100, 100),
      metrics: { 
        users: networkStats.healthcareProviders, 
        revenue: networkStats.healthcareDataPoints * 10, 
        uptime: networkStats.healthcareProviders > 0 ? 92 : 0 
      },
      icon: <Heart className="h-6 w-6" />,
      color: "rose",
      tokenReward: "100 BUILD"
    },
    {
      id: 5,
      title: "Government Taxation Network",
      description: "Transparent tax collection data from FBR and provincial authorities",
      status: networkStats.taxPoints > 0 ? 'active' : 'planned',
      progress: Math.min((networkStats.taxPoints / 8) * 100, 100),
      metrics: { 
        users: networkStats.taxPoints, 
        revenue: networkStats.taxTransactions * 15, 
        uptime: networkStats.taxPoints > 0 ? 96 : 0 
      },
      icon: <Building className="h-6 w-6" />,
      color: "indigo",
      tokenReward: "150 BUILD"
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading network overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {phases.map((phase) => (
        <Card key={phase.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg bg-${phase.color}-100`}>
                <div className={`text-${phase.color}-600`}>
                  {phase.icon}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge 
                  variant={phase.status === 'active' ? 'default' : phase.status === 'completed' ? 'secondary' : 'outline'}
                  className={phase.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                >
                  {phase.status}
                </Badge>
                <span className="text-xs font-semibold text-emerald-600">
                  {phase.tokenReward}
                </span>
              </div>
            </div>
            <CardTitle className="text-lg mt-2">{phase.title}</CardTitle>
            <CardDescription className="text-sm">{phase.description}</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(phase.progress)}%</span>
              </div>
              <Progress value={phase.progress} className="h-2" />
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center p-2 bg-muted rounded">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Users className="h-3 w-3" />
                </div>
                <div className="font-medium">{phase.metrics.users}</div>
                <div className="text-xs text-muted-foreground">Users</div>
              </div>
              
              <div className="text-center p-2 bg-muted rounded">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <DollarSign className="h-3 w-3" />
                </div>
                <div className="font-medium">₨{phase.metrics.revenue.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Revenue</div>
              </div>
              
              <div className="text-center p-2 bg-muted rounded">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Activity className="h-3 w-3" />
                </div>
                <div className="font-medium">{phase.metrics.uptime}%</div>
                <div className="text-xs text-muted-foreground">Uptime</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
