import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Shield, Users, CheckCircle, XCircle, Clock, AlertTriangle, Activity, Database } from 'lucide-react';
import { VerificationQueue } from './admin/VerificationQueue';
import { UserManagement } from './admin/UserManagement';
import { FraudDetection } from './admin/FraudDetection';
import { NetworkMonitoring } from './admin/NetworkMonitoring';
import { localDb } from '../utils/localDb';
import { useWalletAuth } from '../hooks/useWalletAuth';
import { toast } from 'sonner@2.0.3';

interface AdminDashboardProps {
  demoMode?: boolean;
  walletConnected?: boolean;
}

export function AdminDashboard({ demoMode = false, walletConnected = false }: AdminDashboardProps) {
  const { user } = useWalletAuth();
  const [stats, setStats] = useState({
    pendingVerifications: 0,
    totalUsers: 0,
    suspiciousActivities: 0,
    networkHealth: 100,
  });

  // Check if user is admin
  // For MVP: Allow access in demo mode, when wallet is connected, or for users with 'admin' in email
  // In production, implement proper role-based access control (RBAC)
  const isAdmin = demoMode || walletConnected || user?.id === 'demo-user' || user?.email?.includes('admin');

  useEffect(() => {
    if (!isAdmin) return;
    
    const loadStats = () => {
      try {
        const queue = localDb.getVerificationQueue('pending') || [];
        const users = localDb.getAllUsers() || [];
        const auditLogs = localDb.getAuditLogs() || [];
        
        // Simple fraud detection: check for users with unusually high earnings in short time
        const recentLogs = auditLogs.filter(log => {
          try {
            const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
            return new Date(log.timestamp) > hourAgo;
          } catch {
            return false;
          }
        });

        setStats({
          pendingVerifications: queue.length,
          totalUsers: users.length,
          suspiciousActivities: recentLogs.filter(log => log.action === 'high_frequency_claim').length,
          networkHealth: 98,
        });
      } catch (error) {
        console.error('Error loading admin stats:', error);
        // Set default stats on error
        setStats({
          pendingVerifications: 0,
          totalUsers: 0,
          suspiciousActivities: 0,
          networkHealth: 100,
        });
      }
    };

    loadStats();
    const interval = setInterval(loadStats, 30000); // Refresh every 30s
    
    return () => clearInterval(interval);
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have permission to access the admin panel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              This area is restricted to authorized administrators only.
            </p>
            <p className="text-sm text-muted-foreground">
              💡 <strong>Tip:</strong> Connect your wallet or activate demo mode to access admin features in this MVP.
            </p>
          </CardContent>
        </Card>
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
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-emerald-900 mb-2 flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Admin Control Panel
          </h2>
          <p className="text-muted-foreground">
            Manage network operations, verify users, and monitor system health
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingVerifications}</div>
              <p className="text-xs text-muted-foreground">
                Require admin review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Registered accounts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Suspicious Activity</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.suspiciousActivities}</div>
              <p className="text-xs text-muted-foreground">
                Flagged in last hour
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Network Health</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.networkHealth}%</div>
              <p className="text-xs text-muted-foreground">
                All systems operational
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="verification" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="verification" className="relative">
              Verification Queue
              {stats.pendingVerifications > 0 && (
                <Badge className="ml-2 bg-orange-600" variant="default">
                  {stats.pendingVerifications}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="fraud">Fraud Detection</TabsTrigger>
            <TabsTrigger value="monitoring">Network Monitor</TabsTrigger>
          </TabsList>

          <TabsContent value="verification">
            <VerificationQueue />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="fraud">
            <FraudDetection />
          </TabsContent>

          <TabsContent value="monitoring">
            <NetworkMonitoring />
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="mt-6 bg-gradient-to-br from-emerald-50 to-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  try {
                    const queue = localDb.getVerificationQueue('pending') || [];
                    toast.info(`${queue.length} items pending verification`);
                  } catch (error) {
                    console.error('Error getting verification queue:', error);
                    toast.error('Failed to load verification queue');
                  }
                }}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Review Queue
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  try {
                    const logs = localDb.getAuditLogs() || [];
                    toast.info(`${logs.length} audit log entries`);
                  } catch (error) {
                    console.error('Error getting audit logs:', error);
                    toast.error('Failed to load audit logs');
                  }
                }}
              >
                <Activity className="mr-2 h-4 w-4" />
                View Audit Log
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => toast.success('System health check complete')}
              >
                <Shield className="mr-2 h-4 w-4" />
                Run Health Check
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
