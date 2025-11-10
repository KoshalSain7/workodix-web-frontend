"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Check, Archive, CheckCheck } from "lucide-react";
import { inboxApi } from "@/lib/api";
import { format } from "date-fns";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  status: string;
  link?: string;
  createdAt: string;
}

export default function InboxPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | undefined>();

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, [filter]);

  const loadNotifications = async () => {
    try {
      const data = await inboxApi.getNotifications(filter);
      setNotifications(data);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const data = await inboxApi.getUnreadCount();
      setUnreadCount(data.count);
    } catch (error) {
      console.error("Failed to load unread count:", error);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await inboxApi.markAsRead(id);
      await loadNotifications();
      await loadUnreadCount();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await inboxApi.markAllAsRead();
      await loadNotifications();
      await loadUnreadCount();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await inboxApi.archive(id);
      await loadNotifications();
    } catch (error) {
      console.error("Failed to archive:", error);
    }
  };

  const unreadNotifications = notifications.filter(
    (n) => n.status === "Unread"
  );

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Inbox</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilter(undefined)}
            >
              All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilter("Unread")}
            >
              Unread
            </Button>
            {unreadNotifications.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-purple-500" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No notifications</p>
                <p className="text-sm text-muted-foreground">
                  You&apos;re all caught up! No notifications at the moment.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border ${
                      notification.status === "Unread"
                        ? "bg-primary/5 border-primary/20"
                        : "bg-card"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{notification.title}</h3>
                          {notification.status === "Unread" && (
                            <span className="h-2 w-2 bg-primary rounded-full"></span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(notification.createdAt), "PPp")}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {notification.status === "Unread" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleArchive(notification.id)}
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

