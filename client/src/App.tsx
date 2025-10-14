import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/hooks/useAuth";
import Login from "@/pages/login";
import type { User } from "@shared/schema";
import Dashboard from "@/pages/dashboard";
import Invoices from "@/pages/invoices";
import ProformaInvoices from "@/pages/proforma-invoices";
import Customers from "@/pages/customers";
import Expenses from "@/pages/expenses";
import Employees from "@/pages/employees";
import Salaries from "@/pages/salaries";
import Stock from "@/pages/stock";
import AuditReports from "@/pages/audit-reports";
import Permissions from "@/pages/permissions";
import LeaveManagement from "@/pages/leave";
import Attendance from "@/pages/attendance";
import PerformanceReviews from "@/pages/performance";
import EmployeeDocuments from "@/pages/documents";
import Benefits from "@/pages/benefits";
import Training from "@/pages/training";
import ExitManagement from "@/pages/exit";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AIChatWidget } from "@/components/ai-chat-widget";
import { User as UserIcon, LogOut } from "lucide-react";
import { NotificationBell } from "@/components/notification-bell";
function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/invoices" component={Invoices} />
      <Route path="/proforma-invoices" component={ProformaInvoices} />
      <Route path="/customers" component={Customers} />
      <Route path="/expenses" component={Expenses} />
      <Route path="/employees" component={Employees} />
      <Route path="/salaries" component={Salaries} />
      <Route path="/stock" component={Stock} />
      <Route path="/audit-reports" component={AuditReports} />
      <Route path="/permissions" component={Permissions} />
      <Route path="/leave" component={LeaveManagement} />
      <Route path="/attendance" component={Attendance} />
      <Route path="/performance" component={PerformanceReviews} />
      <Route path="/documents" component={EmployeeDocuments} />
      <Route path="/benefits" component={Benefits} />
      <Route path="/training" component={Training} />
      <Route path="/exit" component={ExitManagement} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function UserProfile() {
  const { user } = useAuth();

  if (!user) return null;

  const userData = user as User;

  const getInitials = () => {
    if (userData.firstName && userData.lastName) {
      return `${userData.firstName[0]}${userData.lastName[0]}`.toUpperCase();
    }
    if (userData.email) {
      return userData.email[0].toUpperCase();
    }
    if (userData.username) {
      return userData.username[0].toUpperCase();
    }
    return "U";
  };

  const displayName =
    userData.firstName && userData.lastName
      ? `${userData.firstName} ${userData.lastName}`
      : userData.username || "User";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          data-testid="button-user-menu"
        >
          <Avatar>
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="font-medium">{displayName}</span>
            {userData.email && (
              <span className="text-xs text-muted-foreground">
                {userData.email}
              </span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await fetch("/api/logout", { method: "POST" });
            queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
            window.location.href = "/";
          }}
          data-testid="button-logout"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <AppContent style={style} />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function AppContent({ style }: { style: { [key: string]: string } }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading || !isAuthenticated) {
    return <Login />;
  }

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-4 p-4 border-b border-border">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-2">
              <NotificationBell />
              <ThemeToggle />
              <UserProfile />
            </div>
          </header>
          <main className="flex-1 overflow-auto p-8">
            <Router />
          </main>
        </div>
      </div>
      <AIChatWidget />
    </SidebarProvider>
  );
}

export default App;
