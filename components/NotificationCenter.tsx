import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Bell, Check, CheckCheck, X, Award, Shield, AlertCircle, Info } from 'lucide-react';
import { localDb } from '../utils/localDb';
import { useWalletAuth } from '../hooks/useWalletAuth';
import { toast } from 'sonner@2.0.3';

interface Notification {
  id: string;
  type: 'reward' | 'system' | 'verification' | 'governance' | 'security';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

const NOTIFICATION_ICONS = {
  reward: Award,
  system: Info,
  verification: Shield,
  governance: CheckCheck,
  security: AlertCircle,
};

const NOTIFICATION_COLORS = {
  reward: 'text-emerald-600 bg-emerald-100',
  system: 'text-blue-600 bg-blue-100',
  verification: 'text-purple-600 bg-purple-100',
  governance: 'text-indigo-600 bg-indigo-100',
  security: 'text-red-600 bg-red-100',
};

export function NotificationCenter() {
  const { user } = useWalletAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user, filter]);

  const loadNotifications = () => {
    if (!user) return;
    
    const allNotifications = localDb.getNotifications(user.id);
    const filtered = filter === 'unread' 
      ? allNotifications.filter(n => !n.read)
      : allNotifications;
    
    setNotifications(filtered);
  };

  const markAsRead = (id: string) => {
    localDb.markNotificationAsRead(id);
    loadNotifications();
  };

  const markAllAsRead = () => {
    if (!user) return;
    localDb.markAllNotificationsAsRead(user.id);
    loadNotifications();
    toast.success('All notifications marked as read');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge className="bg-red-600">{unreadCount}</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Stay updated with your network activity
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              Unread
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
              >
                <CheckCheck className="mr-2 h-4 w-4" />
                Mark all read
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="py-12 text-center">
            <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Notifications</h3>
            <p className="text-muted-foreground">
              {filter === 'unread' 
                ? "You're all caught up!"
                : "You haven't received any notifications yet."
              }
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {notifications.map((notification) => {
                const Icon = NOTIFICATION_ICONS[notification.type];
                const colorClass = NOTIFICATION_COLORS[notification.type];
                
                return (
                  <div
                    key={notification.id}
                    className={`flex gap-3 p-3 border rounded-lg transition-colors ${
                      notification.read ? 'bg-muted/20' : 'bg-background hover:bg-muted/50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${colorClass} h-fit`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm">{notification.title}</h4>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                          )}
                        </div>
                        <div className="flex gap-1">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>
                        {notification.actionUrl && (
                          <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                            View Details →
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
