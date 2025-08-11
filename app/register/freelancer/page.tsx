'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Building2,
  Code,
  Heart,
  Briefcase,
  CheckCircle,
  Upload,
  MapPin,
  DollarSign,
  Clock,
  Star,
  Globe,
  Shield,
  FileText,
  Phone,
  Mail,
  User,
  Camera,
  Award,
  UserCheck,
  Palette,
  Video,
  Brush,
  Film,
  Layout,
  Box,
  Music,
  Headphones,
  Layers,
  Wrench,
  Hammer,
  HardHat,
  Home,
  Truck,
  Package
} from "lucide-react";
import { ValidatedInput } from "@/components/ui/validated-input";
import { DocumentUpload } from "@/components/ui/document-upload";

interface RegistrationStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
}

interface RegistrationFlow {
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  steps: RegistrationStep[];
  estimatedTime: string;
}

// Professional type flows
const REGISTRATION_FLOWS: Record<string, RegistrationFlow> = {
  health: {
    name: "Profissional da Saúde",
    icon: Heart,
    color: "text-red-500",
    estimatedTime: "15-20 min",
    steps: [
      { id: "basic", title: "Informações Básicas", description: "Dados pessoais e contato", component: BasicInfoStep },
      { id: "professional", title: "Dados Profissionais", description: "Formação e especialidades", component: HealthProfessionalStep },
      { id: "documents", title: "Documentação", description: "Registros profissionais e certificações", component: HealthDocumentsStep },
      { id: "services", title: "Serviços e Preços", description: "Configure seus atendimentos", component: HealthServicesStep },
      { id: "coverage", title: "Área de Atuação", description: "Onde você atende", component: CoverageStep }
    ]
  },
  general: {
    name: "Profissional de Serviços Gerais",
    icon: UserCheck,
    color: "text-indigo-500",
    estimatedTime: "10-12 min",
    steps: [
      { id: "basic", title: "Informações Básicas", description: "Dados pessoais e contato", component: BasicInfoStep },
      { id: "professional", title: "Dados Profissionais", description: "Profissão e experiência", component: GeneralProfessionalStep },
      { id: "documents", title: "Documentação", description: "Documentos e certificações", component: GeneralDocumentsStep },
      { id: "services", title: "Serviços e Preços", description: "Configure seus serviços", component: GeneralServicesStep },
      { id: "coverage", title: "Área de Atuação", description: "Onde você atende", component: CoverageStep }
    ]
  },
  creative: {
    name: "Profissional Criativo",
    icon: Camera,
    color: "text-purple-500",
    estimatedTime: "12-15 min",
    steps: [
      { id: "basic", title: "Informações Básicas", description: "Dados pessoais e contato", component: BasicInfoStep },
      { id: "creative", title: "Perfil Criativo", description: "Especialidades e estilo", component: CreativeProfessionalStep },
      { id: "portfolio", title: "Portfolio", description: "Mostre seus trabalhos", component: PortfolioStep },
      { id: "services", title: "Serviços e Preços", description: "Configure seus pacotes", component: CreativeServicesStep },
      { id: "coverage", title: "Área de Atuação", description: "Onde você trabalha", component: CoverageStep }
    ]
  },
  tech: {
    name: "Profissional de Tecnologia",
    icon: Code,
    color: "text-blue-500",
    estimatedTime: "10-12 min",
    steps: [
      { id: "basic", title: "Informações Básicas", description: "Dados pessoais e contato", component: BasicInfoStep },
      { id: "tech", title: "Stack Tecnológico", description: "Tecnologias e experiência", component: TechProfessionalStep },
      { id: "experience", title: "Experiência", description: "Projetos e certificações", component: TechExperienceStep },
      { id: "services", title: "Serviços e Preços", description: "Configure seus serviços", component: TechServicesStep },
      { id: "coverage", title: "Preferências", description: "Modalidade e disponibilidade", component: TechCoverageStep }
    ]
  },
  business: {
    name: "Profissional de Negócios",
    icon: Briefcase,
    color: "text-green-500",
    estimatedTime: "12-15 min",
    steps: [
      { id: "basic", title: "Informações Básicas", description: "Dados pessoais e contato", component: BasicInfoStep },
      { id: "business", title: "Área de Atuação", description: "Especialidades e experiência", component: BusinessProfessionalStep },
      { id: "credentials", title: "Credenciais", description: "Formação e certificações", component: BusinessCredentialsStep },
      { id: "services", title: "Serviços e Preços", description: "Configure suas consultorias", component: BusinessServicesStep },
      { id: "coverage", title: "Área de Atuação", description: "Onde você atende", component: CoverageStep }
    ]
  }
};

export default function FreelancerRegistration() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type');
  const entityType = searchParams.get('entity') || 'pf'; // pf = pessoa física, pj = pessoa jurídica
  
  // Debug logging
  console.log("Registration - type from params:", type);
  console.log("Registration - entity from params:", entityType);
  console.log("Registration - available flows:", Object.keys(REGISTRATION_FLOWS));
  
  // Check if type is valid and exists in REGISTRATION_FLOWS
  const validType = type && REGISTRATION_FLOWS[type] ? type : null;
  console.log("Registration - validType:", validType);
  
  const [selectedFlow, setSelectedFlow] = useState<string | null>(
    type === 'client' || type === 'freelancer' ? null : validType
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const flow = selectedFlow ? REGISTRATION_FLOWS[selectedFlow] : null;
  const progress = flow ? ((currentStep + 1) / flow.steps.length) * 100 : 0;

  // If no flow selected, show flow selection
  if (!selectedFlow || !flow) {
    return <FlowSelection onSelectFlow={setSelectedFlow} />;
  }

  const currentStepData = flow.steps[currentStep];
  const CurrentStepComponent = currentStepData.component;

  const handleNext = async () => {
    if (currentStep < flow.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - submit registration
      await handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      setSelectedFlow(null);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      console.log("Submitting registration data:", formData);
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Cadastro realizado com sucesso!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Erro ao realizar cadastro. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (stepData: any) => {
    setFormData((prev: any) => ({ ...prev, ...stepData }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${flow.color.replace('text-', 'from-').replace('-500', '-500/20')}`}>
                <flow.icon className={`h-8 w-8 ${flow.color}`} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{flow.name}</h1>
                <p className="text-muted-foreground text-sm">
                  Tempo estimado: {flow.estimatedTime}
                </p>
              </div>
            </div>
            <Button variant="ghost" onClick={() => router.push("/register")}>
              Cancelar
            </Button>
          </div>
          
          {/* Progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Etapa {currentStep + 1} de {flow.steps.length}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}% concluído
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>{currentStepData.title}</CardTitle>
              <p className="text-muted-foreground">{currentStepData.description}</p>
            </CardHeader>
            <CardContent>
              <CurrentStepComponent
                data={formData}
                onDataChange={updateFormData}
                entityType={entityType}
              />

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={isLoading}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  {currentStep === 0 ? "Voltar" : "Anterior"}
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-galaxia-magenta to-galaxia-neon text-white"
                >
                  {isLoading ? "Processando..." : 
                   currentStep === flow.steps.length - 1 ? "Finalizar Cadastro" : "Próximo"
                  }
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Flow Selection Component
function FlowSelection({ onSelectFlow }: { onSelectFlow: (flow: string) => void }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Escolha seu Tipo Profissional</h1>
            <p className="text-muted-foreground">
              Selecione a categoria que melhor descreve sua área de atuação
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(REGISTRATION_FLOWS).map(([key, flow]) => (
              <Card 
                key={key}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => onSelectFlow(key)}
              >
                <CardContent className="p-6 text-center">
                  <div className={`p-4 rounded-xl bg-gradient-to-r ${flow.color.replace('text-', 'from-').replace('-500', '-500/20')} inline-block mb-4`}>
                    <flow.icon className={`h-12 w-12 ${flow.color}`} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{flow.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Tempo estimado: {flow.estimatedTime}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    {flow.steps.length} etapas
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" onClick={() => router.push("/register")}>
              Voltar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Basic step components (simplified versions)
function BasicInfoStep({ data, onDataChange }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Nome *</Label>
          <Input
            id="firstName"
            value={data.firstName || ""}
            onChange={(e) => onDataChange({ firstName: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Sobrenome *</Label>
          <Input
            id="lastName"
            value={data.lastName || ""}
            onChange={(e) => onDataChange({ lastName: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={data.email || ""}
          onChange={(e) => onDataChange({ email: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telefone *</Label>
        <Input
          id="phone"
          type="tel"
          value={data.phone || ""}
          onChange={(e) => onDataChange({ phone: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Descrição Profissional *</Label>
        <Textarea
          id="bio"
          value={data.bio || ""}
          onChange={(e) => onDataChange({ bio: e.target.value })}
          className="min-h-[100px]"
          placeholder="Conte um pouco sobre sua experiência e especialidades..."
          required
        />
      </div>
    </div>
  );
}

// Placeholder components for other steps
function HealthProfessionalStep({ data, onDataChange }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ValidatedInput
          label="Número do Conselho (CRM/CRO/CRP)"
          fieldName="healthRegistry"
          value={data.healthRegistry || ""}
          onChange={(e: any) => onDataChange({ healthRegistry: e.target.value })}
          required
        />
        <ValidatedInput
          label="Especialidade Principal"
          fieldName="healthSpecialty"
          value={data.healthSpecialty || ""}
          onChange={(e: any) => onDataChange({ healthSpecialty: e.target.value })}
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ValidatedInput
          label="Anos de Experiência"
          fieldName="yearsExperience"
          type="number"
          value={data.yearsExperience || ""}
          onChange={(e: any) => onDataChange({ yearsExperience: e.target.value })}
          required
        />
        <ValidatedInput
          label="Cidade de Atendimento"
          fieldName="serviceCity"
          value={data.serviceCity || ""}
          onChange={(e: any) => onDataChange({ serviceCity: e.target.value })}
        />
      </div>
    </div>
  );
}

function HealthDocumentsStep({ data, onDataChange }: any) {
  return (
    <div className="space-y-6">
      <DocumentUpload
        label="Carteira Profissional (frente e verso)"
        accept=".jpg,.jpeg,.png,.pdf"
        maxSizeMB={10}
        onFilesChange={(files) => onDataChange({ healthDocs: files })}
      />
      <DocumentUpload
        label="Comprovante de Endereço (últimos 3 meses)"
        accept=".jpg,.jpeg,.png,.pdf"
        maxSizeMB={10}
        onFilesChange={(files) => onDataChange({ addressProof: files })}
      />
    </div>
  );
}

function HealthServicesStep({ data, onDataChange }: any) {
  return <div>Health Services Step - Implementation needed</div>;
}

function GeneralProfessionalStep({ data, onDataChange }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ValidatedInput
          label="Profissão"
          fieldName="profession"
          value={data.profession || ""}
          onChange={(e: any) => onDataChange({ profession: e.target.value })}
          required
        />
        <ValidatedInput
          label="Anos de Experiência"
          fieldName="experienceYears"
          type="number"
          value={data.experienceYears || ""}
          onChange={(e: any) => onDataChange({ experienceYears: e.target.value })}
        />
      </div>
      <ValidatedInput
        label="Principais Habilidades (separadas por vírgula)"
        fieldName="skills"
        value={data.skills || ""}
        onChange={(e: any) => onDataChange({ skills: e.target.value })}
      />
    </div>
  );
}

function GeneralDocumentsStep({ data, onDataChange }: any) {
  return <div>General Documents Step - Implementation needed</div>;
}

function GeneralServicesStep({ data, onDataChange }: any) {
  return <div>General Services Step - Implementation needed</div>;
}

function CreativeProfessionalStep({ data, onDataChange }: any) {
  return (
    <div className="space-y-6">
      <ValidatedInput
        label="Especialidades Criativas"
        fieldName="creativeSpecialties"
        value={data.creativeSpecialties || ""}
        onChange={(e: any) => onDataChange({ creativeSpecialties: e.target.value })}
      />
      <ValidatedInput
        label="Ferramentas (ex: Adobe, Figma)"
        fieldName="creativeTools"
        value={data.creativeTools || ""}
        onChange={(e: any) => onDataChange({ creativeTools: e.target.value })}
      />
    </div>
  );
}

function PortfolioStep({ data, onDataChange }: any) {
  return (
    <div className="space-y-6">
      <DocumentUpload
        label="Upload de Portfólio (imagens/vídeos/pdf)"
        accept=".jpg,.jpeg,.png,.webp,.mp4,.mov,.pdf"
        maxSizeMB={100}
        onFilesChange={(files) => onDataChange({ portfolioFiles: files })}
      />
    </div>
  );
}

function CreativeServicesStep({ data, onDataChange }: any) {
  return <div>Creative Services Step - Implementation needed</div>;
}

function TechProfessionalStep({ data, onDataChange }: any) {
  return (
    <div className="space-y-6">
      <ValidatedInput
        label="Linguagens/Stack"
        fieldName="techStack"
        value={data.techStack || ""}
        onChange={(e: any) => onDataChange({ techStack: e.target.value })}
      />
      <ValidatedInput
        label="GitHub URL"
        fieldName="githubUrl"
        value={data.githubUrl || ""}
        onChange={(e: any) => onDataChange({ githubUrl: e.target.value })}
      />
    </div>
  );
}

function TechExperienceStep({ data, onDataChange }: any) {
  return (
    <div className="space-y-6">
      <ValidatedInput
        label="Principais Projetos (links separados por vírgula)"
        fieldName="techProjects"
        value={data.techProjects || ""}
        onChange={(e: any) => onDataChange({ techProjects: e.target.value })}
      />
    </div>
  );
}

function TechServicesStep({ data, onDataChange }: any) {
  return <div>Tech Services Step - Implementation needed</div>;
}

function TechCoverageStep({ data, onDataChange }: any) {
  return <div>Tech Coverage Step - Implementation needed</div>;
}

function BusinessProfessionalStep({ data, onDataChange }: any) {
  return (
    <div className="space-y-6">
      <ValidatedInput
        label="Área de Atuação (ex: Marketing, Jurídico)"
        fieldName="businessArea"
        value={data.businessArea || ""}
        onChange={(e: any) => onDataChange({ businessArea: e.target.value })}
      />
    </div>
  );
}

function BusinessCredentialsStep({ data, onDataChange }: any) {
  return (
    <div className="space-y-6">
      <ValidatedInput
        label="Certificações (separadas por vírgula)"
        fieldName="businessCertifications"
        value={data.businessCertifications || ""}
        onChange={(e: any) => onDataChange({ businessCertifications: e.target.value })}
      />
      <DocumentUpload
        label="Upload de Certificados"
        accept=".pdf,.jpg,.jpeg,.png"
        onFilesChange={(files) => onDataChange({ businessCertFiles: files })}
      />
    </div>
  );
}

function BusinessServicesStep({ data, onDataChange }: any) {
  return <div>Business Services Step - Implementation needed</div>;
}

function CoverageStep({ data, onDataChange }: any) {
  return (
    <div className="space-y-6">
      <ValidatedInput
        label="Área de Cobertura (local, regional, nacional, remoto)"
        fieldName="coverage"
        value={data.coverage || ""}
        onChange={(e: any) => onDataChange({ coverage: e.target.value })}
      />
      <ValidatedInput
        label="Disponibilidade (ex: seg-sex, 9-18h)"
        fieldName="availability"
        value={data.availability || ""}
        onChange={(e: any) => onDataChange({ availability: e.target.value })}
      />
    </div>
  );
}