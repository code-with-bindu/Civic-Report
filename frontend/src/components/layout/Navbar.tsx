import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { Bell, Map, LogOut, ShieldAlert, Sun, Moon } from "lucide-react";
import { useListNotifications, getListNotificationsQueryKey } from "@workspace/api-client-react";

export function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [, setLocation] = useLocation();

  const { data: notifications } = useListNotifications(
    { query: { enabled: !!user && user.role !== 'guest', queryKey: getListNotificationsQueryKey() } }
  );

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:shadow-md transition-shadow">
            C
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">CivicReport</span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/heatmap">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <Map className="w-4 h-4" />
              <span className="hidden sm:inline">City Map</span>
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="text-muted-foreground hover:text-foreground"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>

          {!user ? (
            <div className="flex items-center gap-2">
              <Link href="/citizen/auth">
                <Button variant="ghost" size="sm">Citizen Portal</Button>
              </Link>
              <Link href="/gov/login">
                <Button size="sm" variant="outline" className="border-primary/20 text-primary hover:bg-primary/5">
                  <ShieldAlert className="w-4 h-4 mr-2" />
                  Official Login
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {(user.role === 'citizen' || user.role === 'guest') && (
                <>
                  <Link href="/citizen">
                    <Button variant="ghost" size="sm">Dashboard</Button>
                  </Link>
                  {user.role === 'citizen' && (
                    <Link href="/citizen/notifications">
                      <Button variant="ghost" size="icon" className="relative">
                        <Bell className="w-5 h-5 text-muted-foreground" />
                        {unreadCount > 0 && (
                          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
                        )}
                      </Button>
                    </Link>
                  )}
                </>
              )}
              
              {user.role === 'government' && (
                <Link href="/gov">
                  <Button variant="ghost" size="sm">Dashboard</Button>
                </Link>
              )}

              <div className="h-6 w-px bg-border mx-2" />
              
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
