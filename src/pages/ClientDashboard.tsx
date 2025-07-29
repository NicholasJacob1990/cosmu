import { useEffect } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { ClientWelcome } from "@/components/dashboard/client/ClientWelcome";
import { ProjectsCommandPanel } from "@/components/dashboard/client/ProjectsCommandPanel";
import { MessagesCenter } from "@/components/dashboard/client/MessagesCenter";
import { PersonalizedDiscovery } from "@/components/dashboard/client/PersonalizedDiscovery";
import { SuccessMetrics } from "@/components/dashboard/client/SuccessMetrics";
import { useDashboardStore } from "@/store/dashboardStore";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useProjects } from "@/lib/api/hooks/useProjects";
import { useMessages } from "@/lib/api/hooks/useMessages";
import { Loader2 } from "lucide-react";

export function ClientDashboard() {
  const user = useDashboardStore((state) => state.user);
  const fetchDashboardData = useDashboardStore((state) => state.fetchDashboardData);
  
  // Mock user for development - replace with actual auth
  const userId = user?.id || "client-1";
  
  // Enable WebSocket connection
  useWebSocket({ 
    userId, 
    userType: 'client',
    enabled: true 
  });
  
  // Fetch data with React Query
  const { isLoading: projectsLoading } = useProjects({ userId });
  const { isLoading: messagesLoading } = useMessages();
  
  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);
  
  const isLoading = projectsLoading || messagesLoading;
  
  if (isLoading) {
    return (
      <DashboardLayout userType="client">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-galaxia-neon" />
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout userType="client">
      <div className="space-y-6">
        <ClientWelcome />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProjectsCommandPanel />
          <MessagesCenter />
        </div>
        <PersonalizedDiscovery />
        <SuccessMetrics />
      </div>
    </DashboardLayout>
  );
}