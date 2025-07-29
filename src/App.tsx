import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { FreelancerProfile } from "./pages/FreelancerProfile";
import { ServiceDetail } from "./pages/ServiceDetail";
import { ProjectDetail } from "./pages/ProjectDetail";
import { FreelancerDashboard } from "./pages/FreelancerDashboard";
import { ClientDashboard } from "./pages/ClientDashboard";
import { KYCVerification } from "./pages/KYCVerification";
import { PaymentPage } from "./pages/PaymentPage";
import { Registration } from "./pages/Registration";
import { ServicePost } from "./pages/ServicePost";
import { ProjectPost } from "./pages/ProjectPost";
import { Pricing } from "./pages/Pricing";
import { Login } from "./pages/Login";
import { Services } from "./pages/Services";
import { Freelancers } from "./pages/Freelancers";
import { RegisterChoice } from "./pages/RegisterChoice";
import { SimpleRegistration } from "./pages/SimpleRegistration";
import { ProfessionalTypeChoice } from "./pages/ProfessionalTypeChoice";
import { HealthcareDashboard } from "./pages/HealthcareDashboard";
import { CreativeDashboard } from "./pages/CreativeDashboard";
import { TechDashboard } from "./pages/TechDashboard";
import { BusinessDashboard } from "./pages/BusinessDashboard";
import { ComparePage } from "./pages/ComparePage";
import { ManageProposals } from "./pages/ManageProposals";
import { ProjectWorkspace } from "./pages/ProjectWorkspace";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/freelancer/:id" element={<FreelancerProfile />} />
          <Route path="/service/:id" element={<ServiceDetail />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/project/:id/proposals" element={<ManageProposals />} />
          <Route path="/workspace/project/:id" element={<ProjectWorkspace />} />
          <Route path="/dashboard" element={<FreelancerDashboard />} />
          <Route path="/client-dashboard" element={<ClientDashboard />} />
          <Route path="/kyc" element={<KYCVerification />} />
          <Route path="/payment/:orderId" element={<PaymentPage />} />
          <Route path="/register" element={<RegisterChoice />} />
          <Route path="/register/professional-type" element={<ProfessionalTypeChoice />} />
          <Route path="/register/client" element={<SimpleRegistration />} />
          <Route path="/register/freelancer" element={<SimpleRegistration />} />
          <Route path="/register/:type" element={<Registration />} />
          <Route path="/create-service" element={<ServicePost />} />
          <Route path="/create-project" element={<ProjectPost />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/services" element={<Services />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/freelancers" element={<Freelancers />} />
          <Route path="/dashboard/health" element={<HealthcareDashboard />} />
          <Route path="/dashboard/creative" element={<CreativeDashboard />} />
          <Route path="/dashboard/tech" element={<TechDashboard />} />
          <Route path="/dashboard/business" element={<BusinessDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
