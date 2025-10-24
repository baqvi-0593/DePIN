import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Activity, Heart, Building2, Pill, Plus, TrendingUp, Users, Database } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { RegisterHealthcareProviderForm } from './RegisterHealthcareProviderForm';
import { localApiClient } from '../utils/localApi';
import { useWalletAuth } from '../hooks/useWalletAuth';
import { toast } from 'sonner@2.0.3';

interface HealthcareProvider {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'diagnostic_center' | 'pharmacy';
  location: string;
  license: string;
  capacity: number;
  dataPoints: number;
  earnings: number;
  status: 'active' | 'inactive' | 'pending';
}

interface HealthcareDashboardProps {
  demoMode?: boolean;
}

const PROVIDER_TYPE_ICONS = {
  hospital: Building2,
  clinic: Heart,
  diagnostic_center: Activity,
  pharmacy: Pill,
};

const PROVIDER_TYPE_LABELS = {
  hospital: 'Hospital',
  clinic: 'Clinic',
  diagnostic_center: 'Diagnostic Center',
  pharmacy: 'Pharmacy',
};

export function HealthcareDashboard({ demoMode = false }: HealthcareDashboardProps) {
  const [providers, setProviders] = useState<HealthcareProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [registerFormOpen, setRegisterFormOpen] = useState(false);
  const [stats, setStats] = useState({
    totalProviders: 0,
    activeProviders: 0,
    totalDataPoints: 0,
    totalEarnings: 0,
  });
  const { user, walletConnected } = useWalletAuth();

  useEffect(() => {
    fetchProviders();
  }, [demoMode, walletConnected]);

  const fetchProviders = async () => {
    try {
      const data = await localApiClient.getHealthcareProviders();
      setProviders(data);
      
      // Calculate stats
      const stats = {
        totalProviders: data.length,
        activeProviders: data.filter(p => p.status === 'active').length,
        totalDataPoints: data.reduce((sum, p) => sum + p.dataPoints, 0),
        totalEarnings: data.reduce((sum, p) => sum + p.earnings, 0),
      };
      setStats(stats);
    } catch (error) {
      console.error('Failed to fetch healthcare providers:', error);
      toast.error('Failed to load healthcare providers');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSuccess = () => {
    fetchProviders();
  };

  const handleQuickRegister = async () => {
    if (!walletConnected && !demoMode) {
      toast.info('Please connect your wallet first', {
        action: {
          label: 'Connect Wallet',
          onClick: () => window.dispatchEvent(new Event('openWalletModal'))
        }
      });
      return;
    }

    try {
      const providerTypes: ('hospital' | 'clinic' | 'diagnostic_center' | 'pharmacy')[] = 
        ['hospital', 'clinic', 'diagnostic_center', 'pharmacy'];
      const locations = [
        'Lahore, Punjab',
        'Karachi, Sindh',
        'Islamabad, ICT',
        'Peshawar, KPK',
        'Quetta, Balochistan',
      ];

      const newProvider = await localApiClient.createHealthcareProvider({
        name: `${user?.name || 'User'}'s Healthcare Facility`,
        type: providerTypes[Math.floor(Math.random() * providerTypes.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        address: 'Demo Address, Pakistan',
        license: `LIC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        capacity: Math.floor(Math.random() * 500) + 50,
        status: 'active',
      });

      toast.success(`Healthcare provider registered! You earned 100 BUILD tokens 🎉`);
      fetchProviders();
    } catch (error: any) {
      toast.error(`Registration failed: ${error.message}`);
    }
  };

  const handleRecordData = async () => {
    if (!walletConnected && !demoMode) {
      toast.info('Please connect your wallet first');
      return;
    }

    try {
      await localApiClient.recordHealthcareData({
        providerId: providers[Math.floor(Math.random() * providers.length)]?.id || 'demo',
        dataType: 'anonymized_patient_record',
        timestamp: new Date().toISOString(),
      });

      toast.success('Healthcare data recorded! You earned 10 BUILD tokens 🏥');
      
      // Auto-refresh after a short delay
      setTimeout(() => {
        fetchProviders();
      }, 1000);
    } catch (error: any) {
      toast.error(`Failed to record data: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

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
            <h2 className="text-3xl font-bold text-emerald-900 mb-2">Healthcare Data Network</h2>
            <p className="text-muted-foreground">
              Decentralized healthcare data collection from hospitals, clinics, and diagnostic centers
            </p>
          </div>
          <div className="flex gap-2">
            {(walletConnected || demoMode) && (
              <>
                <Button onClick={handleRecordData} variant="outline">
                  <Database className="mr-2 h-4 w-4" />
                  Submit Data
                </Button>
                <Button onClick={handleQuickRegister} variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Quick Register
                </Button>
              </>
            )}
            <Button onClick={() => setRegisterFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Register Provider
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Providers</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProviders}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeProviders} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Points Shared</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDataPoints.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Anonymized records
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEarnings} BUILD</div>
              <p className="text-xs text-muted-foreground">
                Network rewards
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Network Capacity</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {providers.reduce((sum, p) => sum + p.capacity, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Patients/day capacity
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Providers List */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Registered Healthcare Providers</h3>
          
          {providers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Healthcare Providers Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Register the first healthcare provider to start earning BUILD tokens
                </p>
                <Button onClick={() => setRegisterFormOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Register Healthcare Provider
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {providers.map((provider) => {
                const Icon = PROVIDER_TYPE_ICONS[provider.type];
                return (
                  <Card key={provider.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-emerald-100 rounded-lg">
                            <Icon className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{provider.name}</CardTitle>
                            <CardDescription className="text-xs">
                              {PROVIDER_TYPE_LABELS[provider.type]}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge 
                          variant={provider.status === 'active' ? 'default' : 'secondary'}
                          className={provider.status === 'active' ? 'bg-emerald-600' : ''}
                        >
                          {provider.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Location:</span>
                          <span className="font-medium">{provider.location}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">License:</span>
                          <span className="font-mono text-xs">{provider.license}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Capacity:</span>
                          <span className="font-medium">{provider.capacity}/day</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Data Points:</span>
                          <span className="font-medium">{provider.dataPoints.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-muted-foreground">Earnings:</span>
                          <span className="font-bold text-emerald-600">
                            {provider.earnings} BUILD
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Info Section */}
        <Card className="mt-6 bg-gradient-to-br from-emerald-50 to-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-emerald-600" />
              Healthcare Data Network Benefits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">For Healthcare Providers:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Earn 100 BUILD tokens per provider registration</li>
                  <li>• Earn 10 BUILD tokens per anonymized data contribution</li>
                  <li>• Contribute to medical research without privacy concerns</li>
                  <li>• Access aggregated health insights for better care</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Network Impact:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Privacy-preserving healthcare data collection</li>
                  <li>• Accelerate medical research and drug development</li>
                  <li>• Improve public health policy with real data</li>
                  <li>• Create decentralized health records system</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <RegisterHealthcareProviderForm
        open={registerFormOpen}
        onOpenChange={setRegisterFormOpen}
        onSuccess={handleRegisterSuccess}
      />
    </div>
  );
}
