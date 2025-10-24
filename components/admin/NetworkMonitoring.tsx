import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Activity, Server, Database, Zap, Wifi, CheckCircle } from 'lucide-react';
import { localDb } from '../../utils/localDb';

export function NetworkMonitoring() {
  const [metrics, setMetrics] = useState({
    totalHotspots: 0,
    activeHotspots: 0,
    totalPartners: 0,
    activePartners: 0,
    totalFarms: 0,
    healthcareProviders: 0,
    taxPoints: 0,
    systemUptime: 99.8,
    databaseSize: 0,
    apiResponseTime: 45,
  });

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, []);

  const loadMetrics = () => {
    const hotspots = localDb.getHotspots();
    const partners = localDb.getDeliveryPartners();
    const farms = localDb.getFarms();
    const healthcare = localDb.getHealthcareProviders();
    const taxPoints = localDb.getTaxCollectionPoints();

    // Calculate localStorage size
    let totalSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length + key.length;
      }
    }
    const sizeInKB = (totalSize / 1024).toFixed(2);

    setMetrics({
      totalHotspots: hotspots.length,
      activeHotspots: hotspots.filter(h => h.status === 'online').length,
      totalPartners: partners.length,
      activePartners: partners.filter(p => p.status === 'active').length,
      totalFarms: farms.length,
      healthcareProviders: healthcare.length,
      taxPoints: taxPoints.length,
      systemUptime: 99.8,
      databaseSize: parseFloat(sizeInKB),
      apiResponseTime: Math.floor(Math.random() * 20) + 35, // Simulate 35-55ms
    });
  };

  const healthStatus = (percentage: number) => {
    if (percentage >= 95) return { color: 'text-green-600', bg: 'bg-green-100', status: 'Excellent' };
    if (percentage >= 80) return { color: 'text-yellow-600', bg: 'bg-yellow-100', status: 'Good' };
    return { color: 'text-red-600', bg: 'bg-red-100', status: 'Needs Attention' };
  };

  const wifiHealth = (metrics.activeHotspots / Math.max(metrics.totalHotspots, 1)) * 100;
  const logisticsHealth = (metrics.activePartners / Math.max(metrics.totalPartners, 1)) * 100;
  const wifiStatus = healthStatus(wifiHealth);
  const logisticsStatus = healthStatus(logisticsHealth);

  return (
    <div className="space-y-4">
      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Server className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.systemUptime}%</div>
            <Progress value={metrics.systemUptime} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Response</CardTitle>
            <Zap className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.apiResponseTime}ms</div>
            <p className="text-xs text-muted-foreground mt-2">
              Average response time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Size</CardTitle>
            <Database className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.databaseSize} KB</div>
            <p className="text-xs text-muted-foreground mt-2">
              localStorage usage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Healthy</div>
            <p className="text-xs text-muted-foreground mt-2">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Phase-Specific Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5" />
              WiFi Network Health
            </CardTitle>
            <CardDescription>
              {metrics.activeHotspots} of {metrics.totalHotspots} hotspots online
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Network Coverage</span>
                <span className={`text-sm font-semibold ${wifiStatus.color}`}>
                  {wifiHealth.toFixed(0)}%
                </span>
              </div>
              <Progress value={wifiHealth} />
            </div>
            <div className={`p-3 rounded-lg ${wifiStatus.bg}`}>
              <div className={`text-sm font-semibold ${wifiStatus.color}`}>
                Status: {wifiStatus.status}
              </div>
              <div className="text-xs mt-1 text-muted-foreground">
                {metrics.totalHotspots} total hotspots deployed
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Logistics Network Health
            </CardTitle>
            <CardDescription>
              {metrics.activePartners} of {metrics.totalPartners} partners active
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Partner Activity</span>
                <span className={`text-sm font-semibold ${logisticsStatus.color}`}>
                  {logisticsHealth.toFixed(0)}%
                </span>
              </div>
              <Progress value={logisticsHealth} />
            </div>
            <div className={`p-3 rounded-lg ${logisticsStatus.bg}`}>
              <div className={`text-sm font-semibold ${logisticsStatus.color}`}>
                Status: {logisticsStatus.status}
              </div>
              <div className="text-xs mt-1 text-muted-foreground">
                {metrics.totalPartners} total delivery partners
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resource Inventory */}
      <Card>
        <CardHeader>
          <CardTitle>Network Resource Inventory</CardTitle>
          <CardDescription>
            Total registered resources across all phases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-emerald-600">{metrics.totalHotspots}</div>
              <div className="text-xs text-muted-foreground mt-1">WiFi Hotspots</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{metrics.totalPartners}</div>
              <div className="text-xs text-muted-foreground mt-1">Delivery Partners</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-amber-600">{metrics.totalFarms}</div>
              <div className="text-xs text-muted-foreground mt-1">Agricultural Farms</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-rose-600">{metrics.healthcareProviders}</div>
              <div className="text-xs text-muted-foreground mt-1">Healthcare Providers</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-indigo-600">{metrics.taxPoints}</div>
              <div className="text-xs text-muted-foreground mt-1">Tax Collection Points</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card className="bg-gradient-to-br from-emerald-50 to-green-50">
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Environment</div>
            <div className="font-semibold">Production (Local)</div>
          </div>
          <div>
            <div className="text-muted-foreground">Database</div>
            <div className="font-semibold">localStorage</div>
          </div>
          <div>
            <div className="text-muted-foreground">Last Backup</div>
            <div className="font-semibold">N/A (Local only)</div>
          </div>
          <div>
            <div className="text-muted-foreground">Version</div>
            <div className="font-semibold">1.0.0</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
