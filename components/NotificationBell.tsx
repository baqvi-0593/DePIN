import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ScrollArea } from './ui/scroll-area';
import { localDb } from '../utils/localDb';
import { useWalletAuth } from '../hooks/useWalletAuth';

const NOTIFICATION_COLORS = {
  reward: 'bg-emerald-100 text-emerald-700',
  system: 'bg-blue-100 text-blue-700',
  verification: 'bg-purple-100 text-purple-700',
  governance: 'bg-indigo-100 text-indigo-700',
  security: 'bg-red-100 text-red-700',
};

export function NotificationBell() {
  const { user } = useWalletAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000); // Refresh every 30s
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadNotifications = () => {
    if (!user) return;
    
    const allNotifications = localDb.getNotifications(user.id);
    const unread = allNotifications.filter(n => !n.read);
    const recent = allNotifications.slice(0, 5); // Show only 5 most recent
    
    setNotifications(recent);
    setUnreadCount(unread.length);
  };

  const markAsRead = (id: string) => {
    localDb.markNotificationAsRead(id);
    loadNotifications();
  };

  if (!user) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-600 text-white text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Badge className="bg-red-600">{unreadCount} new</Badge>
            )}
          </div>
        </div>
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="p-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                    notification.read ? 'hover:bg-muted' : 'bg-blue-50 hover:bg-blue-100'
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-2">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${NOTIFICATION_COLORS[notification.type]}`}>
                      {notification.type}
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-blue-600 mt-1"></div>
                    )}
                  </div>
                  <h4 className="font-semibold text-sm mt-1">{notification.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="p-2 border-t">
          <Button variant="ghost" className="w-full text-sm" size="sm">
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
