import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { useEffect } from "react";
import { useNotificationStream } from "@/hooks/use-notification-stream";
import NotFound from "@/pages/not-found";

import { Layout } from "@/components/layout/Layout";
import Landing from "@/pages/Landing";
import CitizenAuth from "@/pages/citizen/Auth";
import GovLogin from "@/pages/gov/Login";
import CitizenDashboard from "@/pages/citizen/Dashboard";
import NewIssue from "@/pages/citizen/NewIssue";
import IssueDetail from "@/pages/citizen/IssueDetail";
import Notifications from "@/pages/citizen/Notifications";
import GovDashboard from "@/pages/gov/Dashboard";
import Heatmap from "@/pages/Heatmap";

const queryClient = new QueryClient();

function AuthTokenSetter() {
  const { token } = useAuth();
  
  useEffect(() => {
    setAuthTokenGetter(() => token);
  }, [token]);

  return null;
}

function NotificationStreamSubscriber() {
  useNotificationStream();
  return null;
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/heatmap" component={Heatmap} />
        
        <Route path="/citizen/auth" component={CitizenAuth} />
        <Route path="/gov/login" component={GovLogin} />
        
        <Route path="/citizen" component={CitizenDashboard} />
        <Route path="/citizen/new" component={NewIssue} />
        <Route path="/citizen/issues/:id" component={IssueDetail} />
        <Route path="/citizen/notifications" component={Notifications} />
        
        <Route path="/gov" component={GovDashboard} />
        
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AuthTokenSetter />
          <NotificationStreamSubscriber />
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
