import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useReduxNotifications } from '@/hooks/useReduxNotifications';
import type { Notification } from '@/redux/slices/notificationsSlice';

export function NotificationsPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    loading,
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadNotifications,
    hasMore,
    page,
  } = useReduxNotifications();

  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const hasFetchedRef = useRef(false);
  const isOpenRef = useRef(isOpen);

  // Update ref when isOpen changes
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    // Only fetch if popover is open AND we haven't fetched yet
    if (isOpen && !hasFetchedRef.current && !loading) {
      getNotifications(1);
      hasFetchedRef.current = true;
    }

    // Reset when popover closes
    if (!isOpen && hasFetchedRef.current) {
      hasFetchedRef.current = false;
    }
  }, [isOpen, getNotifications, loading]);

  // Alternative: Use this simpler useEffect
  // useEffect(() => {
  //   if (isOpen) {
  //     getNotifications(1);
  //   }
  // }, [isOpen]); // Remove getNotifications from dependencies

  const handleLoadMore = () => {
    if (hasMore) {
      getNotifications(page + 1);
    }
  };

  const handleMarkAsRead = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    markAsRead(notificationId);
  };

  const handleDeleteNotification = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    deleteNotification(notificationId);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'order_updates':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'promotions':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'security':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'system':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'order_updates':
        return '📦';
      case 'promotions':
        return '🎁';
      case 'security':
        return '🔒';
      case 'system':
        return '⚙️';
      default:
        return '📢';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'order_updates':
        return 'Order Update';
      case 'promotions':
        return 'Promotion';
      case 'security':
        return 'Security';
      case 'system':
        return 'System';
      default:
        return 'Notification';
    }
  };

  const displayedNotifications = activeTab === 'unread' 
    ? getUnreadNotifications() 
    : notifications;

  const NotificationItem = ({ notification }: { notification: Notification }) => (
    <div 
      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer ${
        !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''
      }`}
      onClick={() => markAsRead(notification.id)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="text-lg">{getCategoryIcon(notification.category)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-sm truncate">{notification.title}</h4>
              <Badge 
                variant="outline" 
                className={`text-xs px-2 py-0 ${getCategoryColor(notification.category)}`}
              >
                {getCategoryLabel(notification.category)}
              </Badge>
              {!notification.isRead && (
                <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {notification.body}
            </p>
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
              <span>
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => handleMarkAsRead(e, notification.id)}
                  title="Mark as read"
                >
                  {notification.isRead ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={(e) => handleDeleteNotification(e, notification.id)}
                  title="Delete notification"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-full"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-112 p-0 mt-3 dark:bg-[#303030]" align="end">
        <div className="border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="h-8 text-xs"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Mark all as read
                </Button>
              )}
             
            </div>
          </div>
        </div>

        <Tabs defaultValue="all" onValueChange={(value) => setActiveTab(value as 'all' | 'unread')}>
          <div className="border-b px-4">
            <TabsList className="w-full dark:bg-transparent">
              <TabsTrigger value="all" className="flex-1">
                All
                {notifications.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {notifications.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex-1">
                Unread
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-0">
            <ScrollArea className="h-[400px]">
              {loading && notifications.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="animate-spin" />
                </div>
              ) : displayedNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                  <Bell className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">No notifications yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    You're all caught up!
                  </p>
                </div>
              ) : (
                <>
                  {displayedNotifications.map((notification) => (
                    <React.Fragment key={notification.id}>
                      <NotificationItem notification={notification} />
                      <Separator />
                    </React.Fragment>
                  ))}
                  {hasMore && (
                    <div className="p-4 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLoadMore}
                        disabled={loading}
                      >
                        {loading ? 'Loading...' : 'Load more'}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="unread" className="mt-0">
            <ScrollArea className="h-[400px]">
              {loading && getUnreadNotifications().length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : getUnreadNotifications().length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                  <Check className="h-12 w-12 text-green-500 mb-4" />
                  <p className="text-gray-500">No unread notifications</p>
                  <p className="text-sm text-gray-400 mt-1">
                    You're all caught up!
                  </p>
                </div>
              ) : (
                <>
                  {getUnreadNotifications().map((notification) => (
                    <React.Fragment key={notification.id}>
                      <NotificationItem notification={notification} />
                      <Separator />
                    </React.Fragment>
                  ))}
                </>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="border-t p-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-gray-600 hover:text-gray-900"
            onClick={() => {
              setIsOpen(false);
            }}
          >
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}