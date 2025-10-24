import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Sprout, Thermometer, Droplets, Cloud, Coins, TrendingUp, MapPin, Plus, BarChart3, Activity, CheckCircle, AlertTriangle, LineChart, PieChart, Leaf, Sun } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { RegisterFarmForm } from './RegisterFarmForm';
import { localApiClient } from '../utils/localApi';
import { useWalletAuth } from '../hooks/useWalletAuth';
import { toast } from 'sonner@2.0.3';

interface Farm {
  id: string;
  name: string;
  ownerId: string;
  location: string;
  size: number;
  cropType: string;
  sensors: number;
  lastUpdate: string;
  earnings: number;
  createdAt: string;
}

interface SensorReading {
  parameter: string;
  value: number;
  unit: string;
  status: 'optimal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

const mockSensorReadings: SensorReading[] = [
  {
    parameter: 'Soil Moisture',
    value: 68,
    unit: '%',
    status: 'optimal',
    trend: 'stable'
  },
  {
    parameter: 'Temperature',
    value: 26,
    unit: '°C',
    status: 'optimal',
    trend: 'up'
  },
  {
    parameter: 'Humidity',
    value: 72,
    unit: '%',
    status: 'warning',
    trend: 'down'
  },
  {
    parameter: 'pH Level',
    value: 6.8,
    unit: 'pH',
    status: 'optimal',
    trend: 'stable'
  }
];

interface AgricultureDashboardProps {
  demoMode?: boolean;
}

export function AgricultureDashboard({ demoMode = false }: AgricultureDashboardProps) {
  const { user } = useWalletAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showSensorPanel, setShowSensorPanel] = useState(false);
  const [showYieldAnalytics, setShowYieldAnalytics] = useState(false);

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const data = await localApiClient.getFarms();
        setFarms(data);
      } catch (error) {
        console.error('Failed to fetch farms:', error);
        toast.error('Failed to load farm data');
      } finally {
        setLoading(false);
      }
    };

    fetchFarms();
  }, []);

  const handleFormSuccess = () => {
    // Refresh farms list after successful registration
    const fetchFarms = async () => {
      try {
        const data = await localApiClient.getFarms();
        setFarms(data);
      } catch (error) {
        console.error('Failed to refresh farms:', error);
      }
    };
    fetchFarms();
  };

  const handleAddFarm = async () => {
    if (!user && !demoMode) {
      toast.info('🚀 Connect your Solana wallet to register farms and earn PKN tokens!', {
        action: {
          label: "Connect Wallet",
          onClick: () => window.dispatchEvent(new CustomEvent('openWalletModal'))
        }
      });
      return;
    }

    const cropTypes = ['Wheat', 'Cotton', 'Rice', 'Sugarcane', 'Maize', 'Apple', 'Mango'];
    const locations = ['Sargodha, Punjab', 'Hyderabad, Sindh', 'Swat, KPK', 'Quetta, Balochistan', 'Lahore, Punjab'];

    if (demoMode) {
      const demoFarm = {
        id: `demo-${Date.now()}`,
        name: 'Demo Farm',
        ownerId: 'demo-user',
        location: locations[Math.floor(Math.random() * locations.length)],
        size: Math.floor(Math.random() * 40) + 10,
        cropType: cropTypes[Math.floor(Math.random() * cropTypes.length)],
        sensors: Math.floor(Math.random() * 10) + 4,
        lastUpdate: new Date().toISOString(),
        earnings: Math.floor(Math.random() * 400) + 100,
        createdAt: new Date().toISOString()
      };

      setFarms(prev => [...prev, demoFarm]);
      toast.success('🎯 Demo: Farm registered successfully! You earned 75 PKN tokens.');
      return;
    }

    try {
      const newFarm = await localApiClient.createFarm({
        name: `${user.name || 'User'}'s Farm`,
        location: locations[Math.floor(Math.random() * locations.length)],
        size: Math.floor(Math.random() * 40) + 10,
        cropType: cropTypes[Math.floor(Math.random() * cropTypes.length)],
        sensors: Math.floor(Math.random() * 10) + 4,
        lastUpdate: new Date().toISOString(),
        earnings: 0
      });

      setFarms(prev => [...prev, newFarm]);
      toast.success('Farm registered successfully! You earned 75 PKN tokens.');
    } catch (error) {
      console.error('Failed to register farm:', error);
      toast.error('Failed to register farm');
    }
  };

  const handleRecordSensorData = async () => {
    if (!user && !demoMode) {
      toast.info('🚀 Connect your Solana wallet to record sensor data and earn PKN tokens!', {
        action: {
          label: "Connect Wallet",
          onClick: () => window.dispatchEvent(new CustomEvent('openWalletModal'))
        }
      });
      return;
    }

    if (farms.length === 0 && !demoMode) {
      toast.error('Please register a farm first');
      return;
    }

    // Toggle the sensor panel
    setShowSensorPanel(!showSensorPanel);

    if (!showSensorPanel) {
      const message = demoMode
        ? '🎯 Sensor Data Recording Panel Opened! Live data collection from 24 connected sensors across your farms.'
        : '📊 Real-time sensor monitoring activated! Recording data to earn 2 PKN tokens per data point.';
      
      toast.success(message, { duration: 4000 });

      if (demoMode || user) {
        try {
          if (!demoMode) {
            await localApiClient.recordSensorData({
              farmId: farms[Math.floor(Math.random() * farms.length)].id,
              soilMoisture: Math.random() * 100,
              temperature: 20 + Math.random() * 15,
              humidity: 60 + Math.random() * 30,
              pH: 6 + Math.random() * 2,
              timestamp: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error('Failed to record sensor data:', error);
        }
      }
    }
  };

  const handleYieldAnalytics = () => {
    if (!user && !demoMode) {
      toast.info('📈 Connect your Solana wallet to access yield analytics and insights!', {
        action: {
          label: "Connect Wallet",
          onClick: () => window.dispatchEvent(new CustomEvent('openWalletModal'))        }
      });
      return;
    }
    
    // Toggle the analytics panel
    setShowYieldAnalytics(!showYieldAnalytics);

    if (!showYieldAnalytics) {
      const message = demoMode
        ? '🎯 Yield Analytics Dashboard Opened! AI analysis of crop performance, irrigation optimization, and revenue projections.'
        : '🌾 Advanced Analytics Activated! ML-powered insights showing 22% yield improvement. Earning 5 PKN per insight!';
      
      toast.success(message, { duration: 4000 });
    }
  };

  const totalFarms = farms.length;
  const totalSensors = farms.reduce((sum, f) => sum + f.sensors, 0);
  const totalTokens = farms.reduce((sum, f) => sum + f.earnings, 0);
  const avgFarmSize = farms.length > 0 
    ? farms.reduce((sum, f) => sum + f.size, 0) / farms.length 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading agriculture data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Hero Section */}
      <div className="relative rounded-xl overflow-hidden">
        <ImageWithFallback 
          src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYWtpc3RhbiUyMGFncmljdWx0dXJlJTIwZmFybSUyMHNlbnNvcnxlbnwxfHx8fDE3NTc3NTM1MTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Pakistan Agriculture Monitoring"
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/80 to-emerald-900/60 flex items-center">
          <div className="p-8 text-white">
            <h2 className="text-3xl font-bold mb-2">Agricultural Monitoring Network</h2>
            <p className="text-green-100 mb-4">Precision agriculture through IoT sensors and data sharing</p>
            <div className="flex gap-4 text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full">{totalFarms} Registered Farms</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">{totalSensors} Active Sensors</span>
            </div>
          </div>
        </div>
      </div>

      {/* Agriculture Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Sprout className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{totalFarms}</div>
            <div className="text-sm text-muted-foreground">Registered Farms</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Thermometer className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{totalSensors}</div>
            <div className="text-sm text-muted-foreground">Active Sensors</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Cloud className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{avgFarmSize.toFixed(1)} acres</div>
            <div className="text-sm text-muted-foreground">Avg Farm Size</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Coins className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{totalTokens.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">PKN Tokens Earned</div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Sensor Data */}
      <Card>
        <CardHeader>
          <CardTitle>Real-time Environmental Data</CardTitle>
          <CardDescription>Latest sensor readings from connected farms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockSensorReadings.map((reading, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {reading.parameter === 'Soil Moisture' && <Droplets className="h-4 w-4 text-blue-600" />}
                    {reading.parameter === 'Temperature' && <Thermometer className="h-4 w-4 text-red-600" />}
                    {reading.parameter === 'Humidity' && <Cloud className="h-4 w-4 text-gray-600" />}
                    {reading.parameter === 'pH Level' && <Sprout className="h-4 w-4 text-green-600" />}
                    <span className="text-sm font-medium">{reading.parameter}</span>
                  </div>
                  <Badge variant={
                    reading.status === 'optimal' ? 'secondary' : 
                    reading.status === 'warning' ? 'outline' : 'destructive'
                  } className={
                    reading.status === 'optimal' ? 'bg-green-100 text-green-800' : 
                    reading.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : ''
                  }>
                    {reading.status}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{reading.value}{reading.unit}</span>
                  <div className="flex items-center gap-1">
                    <TrendingUp className={`h-4 w-4 ${
                      reading.trend === 'up' ? 'text-green-500' : 
                      reading.trend === 'down' ? 'text-red-500 rotate-180' : 'text-gray-400'
                    }`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Farm Network */}
      <Card>
        <CardHeader>
          <CardTitle>Farm Network Status</CardTitle>
          <CardDescription>Connected farms and their monitoring systems</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {farms.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Sprout className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No farms registered yet. Register your first farm to start earning PKN tokens!</p>
              </div>
            ) : (
              farms.map((farm) => (
                <div key={farm.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-green-100">
                      <Sprout className="h-4 w-4 text-green-600" />
                    </div>
                    
                    <div>
                      <h4 className="font-medium">{farm.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {farm.location}
                        </span>
                        <span>Crop: {farm.cropType}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-medium">{farm.size} acres</div>
                      <div className="text-muted-foreground">Farm Size</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="font-medium">{farm.sensors}</div>
                      <div className="text-muted-foreground">Sensors</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="font-medium text-amber-600">{farm.earnings}</div>
                      <div className="text-muted-foreground">PKN Tokens</div>
                    </div>

                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Active
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
          className="bg-green-600 hover:bg-green-700"
          onClick={() => setShowRegisterForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Register Farm
        </Button>
        <Button 
          variant="outline"
          onClick={handleAddFarm}
          disabled={!user && !demoMode}
        >
          {(!user && !demoMode) ? '🔐 Connect Wallet for Demo' : demoMode ? '🎯 Register Demo Farm' : 'Quick Register Farm'}
        </Button>
        <Button 
          variant="outline"
          onClick={handleRecordSensorData}
          disabled={(!user && !demoMode) || (farms.length === 0 && !demoMode)}
          className={`${showSensorPanel 
            ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-300' 
            : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
          } hover:from-green-100 hover:to-emerald-100`}
        >
          <Activity className="h-4 w-4 mr-2" />
          {(!user && !demoMode) ? '🔐 Connect to Record Data' : 
           showSensorPanel ? 'Hide Sensor Data' : 
           demoMode ? 'Show Sensor Data' : 'Record Sensor Data'}
        </Button>
        <Button 
          variant="outline" 
          onClick={handleYieldAnalytics}
          className={`${showYieldAnalytics 
            ? 'bg-gradient-to-r from-amber-100 to-yellow-100 border-amber-300' 
            : 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200'
          } hover:from-amber-100 hover:to-yellow-100`}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          {showYieldAnalytics ? 'Hide Analytics' : 'Yield Analytics'}
        </Button>
      </div>

      {/* Advanced Sensor Data Recording Panel */}
      {showSensorPanel && (
        <div className="space-y-6 mt-6 p-6 bg-gradient-to-r from-green-50/50 to-emerald-50/50 border border-green-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-green-900 flex items-center gap-2">
                <Activity className="h-6 w-6" />
                Live Sensor Data Collection
              </h3>
              <p className="text-green-700 mt-1">Real-time monitoring of environmental conditions across your farm network</p>
            </div>
            <Badge className="bg-green-100 text-green-800">
              {totalSensors} Sensors Active
            </Badge>
          </div>

          {/* Enhanced Real-time Readings */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockSensorReadings.map((reading, index) => (
              <div key={index} className="p-4 bg-white border border-green-100 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {reading.parameter === 'Soil Moisture' && <Droplets className="h-5 w-5 text-blue-600" />}
                    {reading.parameter === 'Temperature' && <Thermometer className="h-5 w-5 text-red-600" />}
                    {reading.parameter === 'Humidity' && <Cloud className="h-5 w-5 text-gray-600" />}
                    {reading.parameter === 'pH Level' && <Sprout className="h-5 w-5 text-green-600" />}
                    <span className="font-medium">{reading.parameter}</span>
                  </div>
                  <Badge variant={
                    reading.status === 'optimal' ? 'secondary' : 
                    reading.status === 'warning' ? 'outline' : 'destructive'
                  } className={
                    reading.status === 'optimal' ? 'bg-green-100 text-green-800' : 
                    reading.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : ''
                  }>
                    {reading.status}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{reading.value}{reading.unit}</span>
                    <TrendingUp className={`h-4 w-4 ${
                      reading.trend === 'up' ? 'text-green-500' : 
                      reading.trend === 'down' ? 'text-red-500 rotate-180' : 'text-gray-400'
                    }`} />
                  </div>
                  
                  {/* Progress bar for optimal ranges */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Optimal Range</span>
                      <span>
                        {reading.parameter === 'Soil Moisture' ? '60-80%' :
                         reading.parameter === 'Temperature' ? '20-30°C' :
                         reading.parameter === 'Humidity' ? '65-75%' : '6.5-7.5'}
                      </span>
                    </div>
                    <Progress 
                      value={
                        reading.parameter === 'Soil Moisture' ? (reading.value / 100) * 100 :
                        reading.parameter === 'Temperature' ? ((reading.value - 15) / 20) * 100 :
                        reading.parameter === 'Humidity' ? (reading.value / 100) * 100 :
                        ((reading.value - 5) / 4) * 100
                      } 
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Real-time Data Feed */}
          <div className="bg-white border border-green-100 rounded-lg p-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Recent Data Collection Events
            </h4>
            <div className="space-y-3 text-sm max-h-40 overflow-y-auto">
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <strong className="text-green-800">Soil Analysis Complete:</strong>
                  <div className="text-green-700 mt-1">
                    Farm "Wheat Field Alpha" - Moisture: 68%, pH: 6.8, Temperature: 26°C
                    <div className="text-xs text-green-600 mt-1">📊 Data point recorded • +2 PKN earned • 2 minutes ago</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <strong className="text-blue-800">Weather Station Update:</strong>
                  <div className="text-blue-700 mt-1">
                    Regional humidity increased to 72%. Irrigation system automatically adjusted.
                    <div className="text-xs text-blue-600 mt-1">🌦️ Auto-optimization active • +5 PKN bonus • 5 minutes ago</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <strong className="text-purple-800">Sensor Network Sync:</strong>
                  <div className="text-purple-700 mt-1">
                    All 24 sensors across 3 farms synchronized. Data quality: 98.5%
                    <div className="text-xs text-purple-600 mt-1">🔄 Network optimization • +10 PKN earned • 8 minutes ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Data Collection Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white border border-green-100 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">847</div>
              <div className="text-sm text-green-700">Data Points Today</div>
              <div className="text-xs text-muted-foreground mt-1">+2 PKN each</div>
            </div>
            
            <div className="p-4 bg-white border border-green-100 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">98.5%</div>
              <div className="text-sm text-blue-700">Data Accuracy</div>
              <div className="text-xs text-muted-foreground mt-1">Quality bonus: +15%</div>
            </div>
            
            <div className="p-4 bg-white border border-green-100 rounded-lg text-center">
              <div className="text-2xl font-bold text-amber-600 mb-1">1,694</div>
              <div className="text-sm text-amber-700">PKN Earned Today</div>
              <div className="text-xs text-muted-foreground mt-1">Data contribution</div>
            </div>
          </div>

          {/* Recording Guide */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2 text-emerald-800">
              <Leaf className="h-5 w-5" />
              Smart Data Recording Tips
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-emerald-700">
              <div>
                <p className="font-medium">📊 Optimal Recording Times:</p>
                <ul className="list-disc list-inside space-y-1 ml-2 mt-1">
                  <li>Early morning (6-8 AM) for baseline readings</li>
                  <li>Mid-day (12-2 PM) for peak conditions</li>
                  <li>Evening (6-8 PM) for daily comparisons</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">💰 Bonus Opportunities:</p>
                <ul className="list-disc list-inside space-y-1 ml-2 mt-1">
                  <li>Consistent daily recording: +20% PKN</li>
                  <li>Weather event documentation: +50 PKN</li>
                  <li>Cross-farm data sharing: +30 PKN</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {!user && !demoMode && (
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            💡 <strong>Demo Mode:</strong> You're viewing existing agricultural monitoring network. 
            Connect your Solana wallet to register farms and record sensor data to earn PKN tokens!
          </p>
        </div>
      )}
      {/* Advanced Yield Analytics Dashboard */}
      {showYieldAnalytics && (
        <div className="space-y-6 mt-6 p-6 bg-gradient-to-r from-amber-50/50 to-yellow-50/50 border border-amber-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-amber-900 flex items-center gap-2">
                <BarChart3 className="h-6 w-6" />
                AI-Powered Yield Analytics
              </h3>
              <p className="text-amber-700 mt-1">Machine learning insights for crop optimization and revenue maximization</p>
            </div>
            <Badge className="bg-amber-100 text-amber-800">
              ML Analysis Active
            </Badge>
          </div>

          {/* Yield Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-amber-100 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Yield Improvement</span>
              </div>
              <div className="text-2xl font-bold text-green-600">+28%</div>
              <div className="text-sm text-muted-foreground">vs traditional methods</div>
            </div>
            
            <div className="p-4 bg-white border border-amber-100 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Water Efficiency</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">-18%</div>
              <div className="text-sm text-muted-foreground">irrigation reduction</div>
            </div>
            
            <div className="p-4 bg-white border border-amber-100 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium">Revenue Impact</span>
              </div>
              <div className="text-2xl font-bold text-amber-600">+₨45K</div>
              <div className="text-sm text-muted-foreground">per acre annually</div>
            </div>
            
            <div className="p-4 bg-white border border-amber-100 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Crop Health</span>
              </div>
              <div className="text-2xl font-bold text-green-600">94%</div>
              <div className="text-sm text-muted-foreground">optimal conditions</div>
            </div>
          </div>

          {/* Crop Performance Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-amber-100 rounded-lg p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <PieChart className="h-5 w-5 text-amber-600" />
                Crop Performance by Type
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Wheat</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-green-600">+28%</div>
                    <div className="text-xs text-muted-foreground">18.5 tons/hectare</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Cotton</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-blue-600">+19%</div>
                    <div className="text-xs text-muted-foreground">2.8 tons/hectare</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
                    <span className="text-sm">Rice</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-amber-600">+31%</div>
                    <div className="text-xs text-muted-foreground">7.2 tons/hectare</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">Sugarcane</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-orange-600">+22%</div>
                    <div className="text-xs text-muted-foreground">85 tons/hectare</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-amber-100 rounded-lg p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <LineChart className="h-5 w-5 text-amber-600" />
                Seasonal Yield Trends
              </h4>
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-emerald-800">Rabi Season (Oct-Apr)</span>
                    <span className="text-emerald-600 font-medium">+35%</span>
                  </div>
                  <div className="text-sm text-emerald-700">
                    Optimal sensor-guided irrigation during winter crops. Best performance in wheat and mustard.
                  </div>
                </div>
                
                <div className="p-3 bg-amber-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-amber-800">Kharif Season (May-Sep)</span>
                    <span className="text-amber-600 font-medium">+24%</span>
                  </div>
                  <div className="text-sm text-amber-700">
                    Heat stress mitigation through smart irrigation. Strong rice and cotton yields despite monsoon variability.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Insights and Recommendations */}
          <div className="bg-white border border-amber-100 rounded-lg p-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-amber-600" />
              AI-Generated Insights & Recommendations
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <strong className="text-green-800">Irrigation Optimization:</strong>
                  <div className="text-green-700 mt-1">
                    Reduce morning irrigation by 20% for wheat fields. Soil moisture sensors indicate optimal retention levels.
                    <div className="text-xs text-green-600 mt-1">💧 Expected water savings: 2,400L/day • Revenue impact: +₨3,200/month</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <strong className="text-blue-800">Pest Risk Alert:</strong>
                  <div className="text-blue-700 mt-1">
                    Temperature patterns suggest increased pest activity in 5-7 days. Early preventive measures recommended.
                    <div className="text-xs text-blue-600 mt-1">🐛 Preventive cost: ₨1,200/acre • Potential loss avoided: ₨12,000/acre</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <strong className="text-purple-800">Harvest Timing:</strong>
                  <div className="text-purple-700 mt-1">
                    Cotton fields showing 92% maturity. Optimal harvest window: Next 10-14 days for maximum quality.
                    <div className="text-xs text-purple-600 mt-1">📅 Quality bonus potential: +15% market price • Extra ₨8,500/acre</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div>
                  <strong className="text-orange-800">Nutrient Management:</strong>
                  <div className="text-orange-700 mt-1">
                    Soil pH trends suggest potassium deficiency developing. Targeted fertilizer application recommended.
                    <div className="text-xs text-orange-600 mt-1">🌱 Treatment cost: ₨2,800/acre • Yield protection: 15-20%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Economic Impact Summary */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium mb-3 flex items-center gap-2 text-green-800">
              <Coins className="h-5 w-5" />
              Economic Impact & PKN Rewards
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium text-green-800">💰 Revenue Improvements:</p>
                <ul className="list-disc list-inside space-y-1 ml-2 mt-1">
                  <li>Yield optimization: +₨45,000/acre/year</li>
                  <li>Water cost reduction: +₨8,400/acre/year</li>
                  <li>Quality bonuses: +₨12,200/acre/year</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-green-800">📊 Data Contribution Rewards:</p>
                <ul className="list-disc list-inside space-y-1 ml-2 mt-1">
                  <li>Daily sensor data: 2 PKN per reading</li>
                  <li>Yield reports: 50 PKN per season</li>
                  <li>Weather insights: 10 PKN per update</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-green-800">🏆 Performance Bonuses:</p>
                <ul className="list-disc list-inside space-y-1 ml-2 mt-1">
                  <li>Consistent data quality: +25% PKN</li>
                  <li>Cross-farm collaboration: +100 PKN</li>
                  <li>Innovation insights: +500 PKN</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {demoMode && !user && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            🎯 <strong>Interactive Demo Active:</strong> Register farms, record sensor data, and access yield analytics with real-time functionality!
          </p>
        </div>
      )}

      {/* Register Farm Form */}
      <RegisterFarmForm
        open={showRegisterForm}
        onOpenChange={setShowRegisterForm}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}