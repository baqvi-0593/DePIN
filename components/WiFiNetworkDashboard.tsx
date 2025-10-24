import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Wifi, MapPin, Signal, Users, Coins, AlertTriangle, Plus } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { AddWiFiNetworkForm } from './AddWiFiNetworkForm';
import { CoverageMap } from './CoverageMap';
import { PartnerOnboardingForm } from './PartnerOnboardingForm';
import { localApiClient } from '../utils/localApi';
import { useWalletAuth } from '../hooks/useWalletAuth';
import { toast } from 'sonner@2.0.3';

interface Hotspot {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'maintenance';
  users: number;
  earnings: number;
  uptime: number;
  operatorId: string;
  latitude: number;
  longitude: number;
  createdAt: string;
}

interface WiFiNetworkDashboardProps {
  demoMode?: boolean;
}

export function WiFiNetworkDashboard({ demoMode = false }: WiFiNetworkDashboardProps) {
  const { user } = useWalletAuth();
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCoverageMap, setShowCoverageMap] = useState(false);
  const [showPartnerForm, setShowPartnerForm] = useState(false);

  useEffect(() => {
    const fetchHotspots = async () => {
      try {
        const data = await localApiClient.getHotspots();
        setHotspots(data);
      } catch (error) {
        console.error('Failed to fetch hotspots:', error);
        toast.error('Failed to load hotspot data');
      } finally {
        setLoading(false);
      }
    };

    fetchHotspots();
  }, []);

  const handleFormSuccess = () => {
    // Refresh hotspots list after successful addition
    const fetchHotspots = async () => {
      try {
        const data = await localApiClient.getHotspots();
        setHotspots(data);
      } catch (error) {
        console.error('Failed to refresh hotspots:', error);
      }
    };
    fetchHotspots();
  };

  const handleDeployHotspot = async () => {
    if (!user && !demoMode) {
      toast.info('🚀 Connect your Solana wallet to deploy hotspots and earn BUILD tokens!', {
        action: {
          label: "Connect Wallet",
          onClick: () => window.dispatchEvent(new CustomEvent('openWalletModal'))
        }
      });
      return;
    }

    if (demoMode) {
      const demoHotspot = {
        id: `demo-${Date.now()}`,
        name: 'Demo Hotspot',
        location: 'Gulberg, Lahore, Pakistan',
        status: 'online' as const,
        users: Math.floor(Math.random() * 50) + 10,
        earnings: Math.floor(Math.random() * 200) + 50,
        uptime: Math.floor(Math.random() * 20) + 80,
        operatorId: 'demo-user',
        latitude: 24.8607 + Math.random() * 0.1,
        longitude: 67.0011 + Math.random() * 0.1,
        createdAt: new Date().toISOString()
      };
      
      setHotspots(prev => [...prev, demoHotspot]);
      toast.success('🎯 Demo: New hotspot deployed! You earned 50 BUILD tokens.');
      return;
    }

    try {
      const newHotspot = await localApiClient.createHotspot({
        name: `${user.name || 'User'}'s Hotspot`,
        location: 'New Location, Pakistan',
        latitude: 24.8607 + Math.random() * 0.1,
        longitude: 67.0011 + Math.random() * 0.1,
        status: 'online'
      });

      setHotspots(prev => [...prev, newHotspot]);
      toast.success('New hotspot deployed! You earned 50 BUILD tokens.');
    } catch (error) {
      console.error('Failed to deploy hotspot:', error);
      toast.error('Failed to deploy hotspot');
    }
  };

  const handleViewCoverageMap = () => {
    setShowCoverageMap(!showCoverageMap);
  };

  const handlePartnerOnboarding = () => {
    setShowPartnerForm(true);
  };

  const totalUsers = hotspots.reduce((sum, hs) => sum + hs.users, 0);
  const totalTokens = hotspots.reduce((sum, hs) => sum + hs.earnings, 0);
  const onlineHotspots = hotspots.filter(hs => hs.status === 'online');
  const averageUptime = onlineHotspots.length > 0 
    ? onlineHotspots.reduce((sum, hs) => sum + hs.uptime, 0) / onlineHotspots.length 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading WiFi network data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Hero Section */}
      <div className="relative rounded-xl overflow-hidden">
        <ImageWithFallback 
          src="https://images.unsplash.com/photo-1645725677294-ed0843b97d5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYWtpc3RhbiUyMHdpZmklMjBjb21tdW5pdHklMjBuZXR3b3JrfGVufDF8fHx8MTc1Nzc1MzUxMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Pakistan WiFi Community Network"
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/80 to-blue-900/60 flex items-center">
          <div className="p-8 text-white">
            <h2 className="text-3xl font-bold mb-2">Community WiFi Network</h2>
            <p className="text-emerald-100 mb-4">Providing internet access across Pakistani neighborhoods</p>
            <div className="flex gap-4 text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full">{hotspots.length} Hotspots Deployed</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">{totalUsers} Active Users</span>
            </div>
          </div>
        </div>
      </div>

      {/* Network Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{totalUsers}</div>
            <div className="text-sm text-muted-foreground">Connected Users</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Coins className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{totalTokens.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">BUILD Tokens Earned</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Signal className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{averageUptime.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">Average Uptime</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Wifi className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{onlineHotspots.length}/{hotspots.length}</div>
            <div className="text-sm text-muted-foreground">Online Hotspots</div>
          </CardContent>
        </Card>
      </div>

      {/* Hotspot List */}
      <Card>
        <CardHeader>
          <CardTitle>Hotspot Network Status</CardTitle>
          <CardDescription>Real-time monitoring of WiFi hotspots across Pakistan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {hotspots.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Wifi className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hotspots deployed yet. Deploy your first hotspot to start earning BUILD tokens!</p>
              </div>
            ) : (
              hotspots.map((hotspot) => (
                <div key={hotspot.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${
                      hotspot.status === 'online' ? 'bg-green-100' : 
                      hotspot.status === 'maintenance' ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                      {hotspot.status === 'maintenance' ? (
                        <AlertTriangle className={`h-4 w-4 ${
                          hotspot.status === 'online' ? 'text-green-600' : 
                          hotspot.status === 'maintenance' ? 'text-yellow-600' : 'text-red-600'
                        }`} />
                      ) : (
                        <Wifi className={`h-4 w-4 ${
                          hotspot.status === 'online' ? 'text-green-600' : 'text-red-600'
                        }`} />
                      )}
                    </div>
                    
                    <div>
                      <h4 className="font-medium">{hotspot.name}</h4>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {hotspot.location}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-medium">{hotspot.users}</div>
                      <div className="text-muted-foreground">Users</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="font-medium text-amber-600">{hotspot.earnings}</div>
                      <div className="text-muted-foreground">BUILD Tokens</div>
                    </div>
                    
                    <div className="text-center min-w-[80px]">
                      <Progress value={hotspot.uptime} className="h-2 w-16 mb-1" />
                      <div className="text-muted-foreground">{hotspot.uptime}% Uptime</div>
                    </div>

                    <Badge variant={
                      hotspot.status === 'online' ? 'default' : 
                      hotspot.status === 'maintenance' ? 'secondary' : 'destructive'
                    }>
                      {hotspot.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button 
          className="bg-emerald-600 hover:bg-emerald-700"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add WiFi Network
        </Button>
        <Button 
          variant="outline"
          onClick={handleDeployHotspot}
          disabled={!user && !demoMode}
        >
          {(!user && !demoMode) ? '🔐 Connect Wallet for Demo' : demoMode ? '🎯 Deploy Demo Hotspot' : 'Deploy Quick Hotspot'}
        </Button>
        <Button variant="outline" onClick={handleViewCoverageMap}>
          <MapPin className="h-4 w-4 mr-2" />
          {showCoverageMap ? 'Hide' : 'View'} Coverage Map
        </Button>
        <Button variant="outline" onClick={handlePartnerOnboarding}>
          <Users className="h-4 w-4 mr-2" />
          Partner Onboarding
        </Button>
      </div>

      {!user && !demoMode && (
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            💡 <strong>Demo Mode:</strong> You're viewing existing WiFi hotspots in the network. 
            Connect your Solana wallet to deploy your own hotspots and start earning BUILD tokens!
          </p>
        </div>
      )}
      {demoMode && !user && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            🎯 <strong>Interactive Demo Active:</strong> All features are unlocked! Deploy hotspots, view analytics, and experience the full DePIN network with sample data.
          </p>
        </div>
      )}

      {/* Coverage Map */}
      {showCoverageMap && (
        <CoverageMap demoMode={demoMode} />
      )}

      {/* Add WiFi Network Form */}
      <AddWiFiNetworkForm
        open={showAddForm}
        onOpenChange={setShowAddForm}
        onSuccess={handleFormSuccess}
      />

      {/* Partner Onboarding Form */}
      <PartnerOnboardingForm
        open={showPartnerForm}
        onOpenChange={setShowPartnerForm}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}