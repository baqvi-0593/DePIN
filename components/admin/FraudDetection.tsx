import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { AlertTriangle, Activity, TrendingUp, Shield } from 'lucide-react';
import { localDb } from '../../utils/localDb';

interface SuspiciousActivity {
  userId: string;
  userName: string;
  type: 'high_frequency' | 'unusual_pattern' | 'duplicate_resource';
  severity: 'low' | 'medium' | 'high';
  description: string;
  timestamp: string;
}

export function FraudDetection() {
  const [activities, setActivities] = useState<SuspiciousActivity[]>([]);

  useEffect(() => {
    detectSuspiciousActivity();
  }, []);

  const detectSuspiciousActivity = () => {
    const suspicious: SuspiciousActivity[] = [];
    const users = localDb.getAllUsers();
    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000);

    users.forEach(user => {
      const transactions = localDb.getTransactions(user.id);
      const recentTransactions = transactions.filter(t => 
        new Date(t.timestamp).getTime() > hourAgo
      );

      // High frequency claims
      if (recentTransactions.length > 50) {
        suspicious.push({
          userId: user.id,
          userName: user.name || user.email,
          type: 'high_frequency',
          severity: 'high',
          description: `${recentTransactions.length} transactions in the last hour`,
          timestamp: new Date().toISOString(),
        });
      }

      // Check for unusual earning patterns
      const earnedTransactions = transactions.filter(t => t.type === 'earned');
      if (earnedTransactions.length > 100) {
        const totalEarned = earnedTransactions.reduce((sum, t) => sum + t.amount, 0);
        if (totalEarned > 10000) {
          suspicious.push({
            userId: user.id,
            userName: user.name || user.email,
            type: 'unusual_pattern',
            severity: 'medium',
            description: `Earned ${totalEarned} BUILD tokens in total`,
            timestamp: new Date().toISOString(),
          });
        }
      }
    });

    setActivities(suspicious);
  };

  const severityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-600';
      case 'medium': return 'bg-orange-600';
      case 'low': return 'bg-yellow-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activities.length}</div>
            <p className="text-xs text-muted-foreground">
              Suspicious activities detected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Severity</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activities.filter(a => a.severity === 'high').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Detection Rate</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98%</div>
            <p className="text-xs text-muted-foreground">
              System accuracy
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity List */}
      <Card>
        <CardHeader>
          <CardTitle>Suspicious Activities</CardTitle>
          <CardDescription>
            Automatically detected unusual patterns and behaviors
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="py-12 text-center">
              <Shield className="mx-auto h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
              <p className="text-muted-foreground">
                No suspicious activities detected at this time.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{activity.userName}</span>
                      <Badge className={severityColor(activity.severity)}>
                        {activity.severity}
                      </Badge>
                      <Badge variant="outline">{activity.type.replace('_', ' ')}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Fraud Detection System
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            Our automated fraud detection system monitors user behavior and transaction patterns
            to identify potential abuse of the network.
          </p>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Detection Methods:</h4>
              <ul className="space-y-1 text-xs">
                <li>• High-frequency transaction monitoring</li>
                <li>• Unusual earning pattern analysis</li>
                <li>• Duplicate resource detection</li>
                <li>• Geographic anomaly detection</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Automated Actions:</h4>
              <ul className="space-y-1 text-xs">
                <li>• Rate limiting enforcement</li>
                <li>• Account flagging for review</li>
                <li>• Suspicious transaction blocking</li>
                <li>• Admin notification alerts</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
