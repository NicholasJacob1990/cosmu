import { useEffect } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { ProfessionalWelcome } from "@/components/dashboard/professional/ProfessionalWelcome";
import { BusinessCommandPanel } from "@/components/dashboard/professional/BusinessCommandPanel";
import { SalesPipeline } from "@/components/dashboard/professional/SalesPipeline";
import { ActiveProjects } from "@/components/dashboard/professional/ActiveProjects";
import { MarketIntelligence } from "@/components/dashboard/professional/MarketIntelligence";
import { PerformanceAnalytics } from "@/components/dashboard/professional/PerformanceAnalytics";
import { AIRecommendations } from "@/components/ai/AIRecommendations";
import { useDashboardStore } from "@/store/dashboardStore";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useMetrics } from "@/lib/api/hooks/useMetrics";
import { Loader2 } from "lucide-react";

export function FreelancerDashboard() {
  const user = useDashboardStore((state) => state.user);
  const fetchDashboardData = useDashboardStore((state) => state.fetchDashboardData);
  
  // Mock user for development - replace with actual auth
  const userId = user?.id || "professional-1";
  
  // Enable WebSocket connection
  useWebSocket({ 
    userId, 
    userType: 'professional',
    enabled: true 
  });
  
  // Fetch metrics with React Query
  const { isLoading } = useMetrics(userId);
  
  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);
  
  if (isLoading) {
    return (
      <DashboardLayout userType="professional">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-galaxia-magenta" />
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout userType="professional">
      <div className="space-y-6">
        <ProfessionalWelcome />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BusinessCommandPanel />
          <SalesPipeline />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ActiveProjects />
          </div>
          <div>
            <AIRecommendations maxItems={2} showInsights={false} />
          </div>
        </div>
        <MarketIntelligence />
        <PerformanceAnalytics />
      </div>
    </DashboardLayout>
  );
}