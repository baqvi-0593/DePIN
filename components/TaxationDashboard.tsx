import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Building, FileText, Ship, Plus, TrendingUp, Database, Activity } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { RegisterTaxPointForm } from './RegisterTaxPointForm';
import { localApiClient } from '../utils/localApi';
import { useWalletAuth } from '../hooks/useWalletAuth';
import { toast } from 'sonner@2.0.3';

interface TaxCollectionPoint {
  id: string;
  name: string;
  type: 'fbr_office' | 'provincial_office' | 'excise_office' | 'customs_office';
  location: string;
  jurisdiction: string;
  transactionsLogged: number;
  dataPoints: number;
  earnings: number;
  status: 'active' | 'inactive';
}

interface TaxationDashboardProps {
  demoMode?: boolean;
}

const TAX_TYPE_ICONS = {
  fbr_office: Building,
  provincial_office: FileText,
  excise_office: Activity,
  customs_office: Ship,
};

const TAX_TYPE_LABELS = {
  fbr_office: 'FBR Office',
  provincial_office: 'Provincial Revenue',
  excise_office: 'Excise & Taxation',
  customs_office: 'Customs Office',
};

export function TaxationDashboard({ demoMode = false }: TaxationDashboardProps) {
  const [taxPoints, setTaxPoints] = useState<TaxCollectionPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [registerFormOpen, setRegisterFormOpen] = useState(false);
  const [stats, setStats] = useState({
    totalPoints: 0,
    activePoints: 0,
    totalTransactions: 0,
    totalEarnings: 0,
  });
  const { user, walletConnected } = useWalletAuth();

  useEffect(() => {
    fetchTaxPoints();
  }, [demoMode, walletConnected]);

  const fetchTaxPoints = async () => {
    try {
      const data = await localApiClient.getTaxCollectionPoints();
      setTaxPoints(data);
      
      // Calculate stats
      const stats = {
        totalPoints: data.length,
        activePoints: data.filter(p => p.status === 'active').length,
        totalTransactions: data.reduce((sum, p) => sum + p.transactionsLogged, 0),
        totalEarnings: data.reduce((sum, p) => sum + p.earnings, 0),
      };
      setStats(stats);
    } catch (error) {
      console.error('Failed to fetch tax collection points:', error);
      toast.error('Failed to load tax collection points');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSuccess = () => {
    fetchTaxPoints();
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
      const pointTypes: ('fbr_office' | 'provincial_office' | 'excise_office' | 'customs_office')[] = 
        ['fbr_office', 'provincial_office', 'excise_office', 'customs_office'];
      const locations = [
        'Karachi, Sindh',
        'Lahore, Punjab',
        'Islamabad, ICT',
        'Peshawar, KPK',
        'Quetta, Balochistan',
      ];

      const newPoint = await localApiClient.createTaxCollectionPoint({
        name: `${user?.name || 'User'}'s Tax Office`,
        type: pointTypes[Math.floor(Math.random() * pointTypes.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        address: 'Government Complex, Pakistan',
        jurisdiction: 'Regional Jurisdiction',
        status: 'active',
      });

      toast.success(`Tax collection point registered! You earned 150 BUILD tokens 🎉`);
      fetchTaxPoints();
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
      await localApiClient.recordTaxData({
        pointId: taxPoints[Math.floor(Math.random() * taxPoints.length)]?.id || 'demo',
        transactionType: 'income_tax',
        amount: Math.floor(Math.random() * 100000) + 10000,
        timestamp: new Date().toISOString(),
      });

      toast.success('Tax transaction recorded! You earned 15 BUILD tokens 🏛️');
      
      // Auto-refresh after a short delay
      setTimeout(() => {
        fetchTaxPoints();
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
            <h2 className="text-3xl font-bold text-emerald-900 mb-2">Government Taxation Network</h2>
            <p className="text-muted-foreground">
              Transparent tax collection data from FBR, provincial authorities, and customs offices
            </p>
          </div>
          <div className="flex gap-2">
            {(walletConnected || demoMode) && (
              <>
                <Button onClick={handleRecordData} variant="outline">
                  <Database className="mr-2 h-4 w-4" />
                  Log Transaction
                </Button>
                <Button onClick={handleQuickRegister} variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Quick Register
                </Button>
              </>
            )}
            <Button onClick={() => setRegisterFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Register Tax Point
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collection Points</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPoints}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activePoints} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions Logged</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTransactions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Tax collection records
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
              <CardTitle className="text-sm font-medium">Data Points</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {taxPoints.reduce((sum, p) => sum + p.dataPoints, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Anonymized records
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tax Points List */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Registered Tax Collection Points</h3>
          
          {taxPoints.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Building className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Tax Collection Points Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Register the first tax collection point to start earning BUILD tokens
                </p>
                <Button onClick={() => setRegisterFormOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Register Tax Collection Point
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {taxPoints.map((point) => {
                const Icon = TAX_TYPE_ICONS[point.type];
                return (
                  <Card key={point.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Icon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{point.name}</CardTitle>
                            <CardDescription className="text-xs">
                              {TAX_TYPE_LABELS[point.type]}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge 
                          variant={point.status === 'active' ? 'default' : 'secondary'}
                          className={point.status === 'active' ? 'bg-blue-600' : ''}
                        >
                          {point.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Location:</span>
                          <span className="font-medium">{point.location}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Jurisdiction:</span>
                          <span className="font-medium text-xs">{point.jurisdiction}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Transactions:</span>
                          <span className="font-medium">{point.transactionsLogged.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Data Points:</span>
                          <span className="font-medium">{point.dataPoints.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-muted-foreground">Earnings:</span>
                          <span className="font-bold text-blue-600">
                            {point.earnings} BUILD
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
        <Card className="mt-6 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-600" />
              Government Taxation Network Benefits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">For Government Bodies:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Earn 150 BUILD tokens per collection point registration</li>
                  <li>• Earn 15 BUILD tokens per transaction logged</li>
                  <li>• Transparent and immutable tax records</li>
                  <li>• Real-time revenue tracking and analytics</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Network Impact:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Reduce tax evasion through transparency</li>
                  <li>• Improve government revenue collection efficiency</li>
                  <li>• Enable data-driven policy making</li>
                  <li>• Create public trust through blockchain verification</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <RegisterTaxPointForm
        open={registerFormOpen}
        onOpenChange={setRegisterFormOpen}
        onSuccess={handleRegisterSuccess}
      />
    </div>
  );
}
