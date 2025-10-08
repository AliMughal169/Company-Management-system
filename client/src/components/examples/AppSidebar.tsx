import { AppSidebar } from "../app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Router } from "wouter";

export default function AppSidebarExample() {
  const style = {
    "--sidebar-width": "16rem",
  };

  return (
    <Router>
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-96 w-full">
          <AppSidebar />
        </div>
      </SidebarProvider>
    </Router>
  );
}
