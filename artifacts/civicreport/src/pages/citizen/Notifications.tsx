import { useAuth } from "@/lib/auth";
import { useListNotifications, useMarkAllNotificationsRead, getListNotificationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle2, Info, BellRing } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function Notifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useListNotifications(
    { query: { enabled: !!user, queryKey: getListNotificationsQueryKey() } }
  );

  const markReadMut = useMarkAllNotificationsRead();

  const handleMarkAllRead = async () => {
    try {
      await markReadMut.mutateAsync();
      queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
      toast({ title: "All notifications marked as read" });
    } catch (e: any) {
      toast({ title: "Action failed", description: e.message, variant: "destructive" });
    }
  };

  const getIcon = (type?: string) => {
    switch (type) {
      case "status_update":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "new_note":
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <BellRing className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground mt-1">Updates on your reports and community activity.</p>
        </div>
        {notifications && notifications.some(n => !n.read) && (
          <Button variant="outline" onClick={handleMarkAllRead} disabled={markReadMut.isPending}>
            Mark all as read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
        </div>
      ) : notifications && notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map(notif => (
            <Card key={notif.id} className={`transition-colors ${!notif.read ? 'bg-primary/5 border-primary/20' : 'bg-white'}`}>
              <CardContent className="p-4 flex items-start gap-4">
                <div className={`p-2 rounded-full shrink-0 ${!notif.read ? 'bg-white' : 'bg-muted'}`}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${!notif.read ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                    {notif.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                  </p>
                  {notif.issueId && (
                    <Link href={`/citizen/issues/${notif.issueId}`}>
                      <Button variant="link" className="px-0 h-auto text-xs mt-2">View Issue</Button>
                    </Link>
                  )}
                </div>
                {!notif.read && (
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-2xl border border-border/50">
          <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">You're all caught up</h3>
          <p className="text-muted-foreground">You don't have any notifications right now.</p>
        </div>
      )}
    </div>
  );
}
