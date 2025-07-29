import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
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
import { authApi, usersApi, documentsApi, categoriesApi } from "@/lib/api";
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
  }
};

export function Registration() {
  const navigate = useNavigate();
  const { type } = useParams();
  const [searchParams] = useSearchParams();
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
      // Register user
      const registrationData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        userType: "professional",
        professionalType: selectedFlow,
        plan: "free", // Default to free plan
        ...formData
      };

      await authApi.register(registrationData);
      
      toast.success("Cadastro realizado com sucesso!");
      
      // Redirect to appropriate dashboard based on professional type
      const dashboardRoutes = {
        health: "/dashboard/health",
        creative: "/dashboard/creative", 
        tech: "/dashboard/tech",
        business: "/dashboard/business"
      };
      
      const dashboardPath = dashboardRoutes[selectedFlow] || "/dashboard";
      navigate(dashboardPath);
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Erro ao realizar cadastro. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (stepData: any) => {
    setFormData(prev => ({ ...prev, ...stepData }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <flow.icon className={`h-6 w-6 ${flow.color}`} />
            <h1 className="text-2xl font-bold">{flow.name}</h1>
            <Badge variant="secondary">{flow.estimatedTime}</Badge>
          </div>
          <Progress value={progress} className="h-2 mb-4" />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Etapa {currentStep + 1} de {flow.steps.length}</span>
            <span>{Math.round(progress)}% concluído</span>
          </div>
        </div>

        {/* Step Content */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm">
                {currentStep + 1}
              </span>
              {currentStepData.title}
            </CardTitle>
            <p className="text-muted-foreground">{currentStepData.description}</p>
          </CardHeader>
          <CardContent>
            <CurrentStepComponent
              data={formData}
              onDataChange={updateFormData}
              flowType={selectedFlow}
              entityType={entityType}
            />

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                {currentStep === 0 ? "Voltar" : "Anterior"}
              </Button>

              <Button
                onClick={handleNext}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {currentStep === flow.steps.length - 1 ? (
                  isLoading ? "Finalizando..." : "Finalizar Cadastro"
                ) : (
                  <>
                    Próximo
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Flow Selection Component
function FlowSelection({ onSelectFlow }: { onSelectFlow: (flow: string) => void }) {
  const [entityType, setEntityType] = useState<'pf' | 'pj'>('pf');

  const handleFlowSelect = (flow: string) => {
    // Adiciona o parâmetro de entidade na URL
    const url = new URL(window.location.href);
    url.searchParams.set('entity', entityType);
    window.history.replaceState({}, '', url.toString());
    onSelectFlow(flow);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Cadastro de Prestador de Serviços</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Escolha sua área profissional para um cadastro personalizado
          </p>
          
          {/* Seletor de Tipo de Entidade */}
          <div className="max-w-md mx-auto mb-8">
            <Label className="text-base font-semibold">Tipo de Cadastro</Label>
            <RadioGroup 
              value={entityType} 
              onValueChange={(value: 'pf' | 'pj') => setEntityType(value)}
              className="flex justify-center gap-8 mt-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pf" id="pf" />
                <Label htmlFor="pf" className="font-normal cursor-pointer">
                  <User className="h-4 w-4 inline mr-2" />
                  Pessoa Física
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pj" id="pj" />
                <Label htmlFor="pj" className="font-normal cursor-pointer">
                  <Building2 className="h-4 w-4 inline mr-2" />
                  Pessoa Jurídica
                </Label>
              </div>
            </RadioGroup>
            <p className="text-sm text-muted-foreground mt-2">
              {entityType === 'pf' 
                ? 'Cadastro como profissional autônomo' 
                : 'Cadastro como empresa/clínica/estúdio'
              }
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {Object.entries(REGISTRATION_FLOWS).map(([key, flow]) => (
            <Card 
              key={key}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-primary"
              onClick={() => handleFlowSelect(key)}
            >
              <CardContent className="p-6 text-center">
                <flow.icon className={`h-12 w-12 mx-auto mb-4 ${flow.color}`} />
                <h3 className="text-lg font-semibold mb-2">{flow.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Cadastro personalizado para sua área de atuação
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {flow.estimatedTime}
                </div>
                <Button className="w-full mt-4">
                  Começar Cadastro
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Já tem uma conta? <Button variant="link" onClick={() => window.location.href = "/login"}>Fazer login</Button>
          </p>
        </div>
      </div>
    </div>
  );
}

// Step Components
function BasicInfoStep({ data, onDataChange, entityType = 'pf' }: any) {
  const [stepData, setStepData] = useState({
    // Campos comuns
    firstName: data.firstName || "",
    lastName: data.lastName || "",
    fullName: data.fullName || "",
    email: data.email || "",
    phone: data.phone || "",
    password: data.password || "",
    confirmPassword: data.confirmPassword || "",
    profileUrl: data.profileUrl || "",
    
    // Campos PF (Pessoa Física)
    cpf: data.cpf || "",
    rg: data.rg || "",
    cns: data.cns || "", // Cartão Nacional de Saúde
    birthDate: data.birthDate || "",
    nationality: data.nationality || "Brasileira",
    gender: data.gender || "",
    
    // Campos PJ (Pessoa Jurídica)
    cnpj: data.cnpj || "",
    companyName: data.companyName || "",
    fantasyName: data.fantasyName || "",
    cnesNumber: data.cnesNumber || "",
    establishmentType: data.establishmentType || "",
    
    // Endereço (comum mas com labels diferentes)
    address: data.address || "",
    number: data.number || "",
    complement: data.complement || "",
    neighborhood: data.neighborhood || "",
    city: data.city || "",
    cep: data.cep || "",
    state: data.state || "",
    
    // Responsável técnico (apenas PJ)
    technicalDirector: data.technicalDirector || "",
    technicalDirectorRegistry: data.technicalDirectorRegistry || ""
  });

  useEffect(() => {
    onDataChange(stepData);
  }, [stepData]);

  return (
    <div className="space-y-6">
      {/* Identificação */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          {entityType === 'pf' ? <User className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
          {entityType === 'pf' ? '1.1 Identificação Civil' : '1.1 Dados da Empresa'}
        </h3>
        
        {entityType === 'pf' ? (
          /* Campos para Pessoa Física */
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">Nome Completo (conforme documento oficial) *</Label>
              <Input
                id="fullName"
                value={stepData.fullName}
                onChange={(e) => setStepData(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Nome completo conforme RG/CNH"
              />
            </div>
          </div>
        ) : (
          /* Campos para Pessoa Jurídica */
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Razão Social *</Label>
                <Input
                  id="companyName"
                  value={stepData.companyName || ""}
                  onChange={(e) => setStepData(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Nome oficial da empresa"
                />
              </div>
              <div>
                <Label htmlFor="fantasyName">Nome Fantasia</Label>
                <Input
                  id="fantasyName"
                  value={stepData.fantasyName || ""}
                  onChange={(e) => setStepData(prev => ({ ...prev, fantasyName: e.target.value }))}
                  placeholder="Nome comercial (se diferente)"
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <ValidatedInput
                  label="CNPJ"
                  fieldName="cnpj"
                  value={stepData.cnpj || ""}
                  onChange={(e) => setStepData(prev => ({ ...prev, cnpj: e.target.value }))}
                  placeholder="00.000.000/0001-00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="cnesNumber">Número CNES *</Label>
                <Input
                  id="cnesNumber"
                  value={stepData.cnesNumber || ""}
                  onChange={(e) => setStepData(prev => ({ ...prev, cnesNumber: e.target.value }))}
                  placeholder="Cadastro Nacional de Estabelecimentos de Saúde"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Campos Pessoais (apenas PF) */}
      {entityType === 'pf' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <User className="h-5 w-5" />
            Dados Pessoais
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Nome *</Label>
              <Input
                id="firstName"
                value={stepData.firstName}
                onChange={(e) => setStepData(prev => ({ ...prev, firstName: e.target.value }))}
                placeholder="Seu primeiro nome"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Sobrenome *</Label>
              <Input
                id="lastName"
                value={stepData.lastName}
                onChange={(e) => setStepData(prev => ({ ...prev, lastName: e.target.value }))}
                placeholder="Seu sobrenome"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <ValidatedInput
                label="CPF"
                fieldName="cpf"
                value={stepData.cpf}
                onChange={(e) => setStepData(prev => ({ ...prev, cpf: e.target.value }))}
                placeholder="000.000.000-00"
                required
              />
            </div>
            <div>
              <Label htmlFor="rg">RG/CNH *</Label>
              <Input
                id="rg"
                value={stepData.rg}
                onChange={(e) => setStepData(prev => ({ ...prev, rg: e.target.value }))}
                placeholder="12.345.678-9"
              />
            </div>
            <div>
              <Label htmlFor="birthDate">Data de Nascimento *</Label>
              <Input
                id="birthDate"
                type="date"
                value={stepData.birthDate}
                onChange={(e) => setStepData(prev => ({ ...prev, birthDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gender">Gênero</Label>
              <Select 
                value={stepData.gender} 
                onValueChange={(value) => setStepData(prev => ({ ...prev, gender: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="feminino">Feminino</SelectItem>
                  <SelectItem value="nao-binario">Não-binário</SelectItem>
                  <SelectItem value="nao-informar">Prefiro não informar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="nationality">Nacionalidade</Label>
              <Input
                id="nationality"
                value={stepData.nationality}
                onChange={(e) => setStepData(prev => ({ ...prev, nationality: e.target.value }))}
                placeholder="Brasileira"
              />
            </div>
          </div>
        </div>
      )}

      {/* Responsável Técnico (apenas PJ) */}
      {entityType === 'pj' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Responsável Técnico
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="technicalDirector">Nome do Responsável Técnico *</Label>
              <Input
                id="technicalDirector"
                value={stepData.technicalDirector}
                onChange={(e) => setStepData(prev => ({ ...prev, technicalDirector: e.target.value }))}
                placeholder="Nome completo do profissional responsável"
              />
            </div>
            <div>
              <Label htmlFor="technicalDirectorRegistry">Registro Profissional *</Label>
              <Input
                id="technicalDirectorRegistry"
                value={stepData.technicalDirectorRegistry}
                onChange={(e) => setStepData(prev => ({ ...prev, technicalDirectorRegistry: e.target.value }))}
                placeholder="CRM/CRO/CRP do responsável"
              />
            </div>
          </div>
        </div>
      )}

      {/* URL do Perfil Personalizada */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Globe className="h-5 w-5" />
          URL do Perfil Profissional
        </h3>
        
        <div className="space-y-3">
          <div>
            <Label htmlFor="profileUrl">URL Personalizada *</Label>
            <div className="flex">
              <div className="flex items-center px-3 bg-muted border border-r-0 rounded-l-md text-sm text-muted-foreground">
                profissionais.gov.br/
              </div>
              <Input
                id="profileUrl"
                value={stepData.profileUrl || ""}
                onChange={(e) => {
                  const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                  setStepData(prev => ({ ...prev, profileUrl: value }));
                }}
                placeholder="seu-nome-profissional"
                className="rounded-l-none"
                maxLength={30}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Apenas letras, números e hífens. Será seu link público: profissionais.gov.br/{stepData.profileUrl || 'seu-nome'}
            </p>
            {stepData.profileUrl && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                <strong>Seu perfil ficará em:</strong> 
                <a href={`https://profissionais.gov.br/${stepData.profileUrl}`} className="text-green-600 underline ml-1" target="_blank">
                  profissionais.gov.br/{stepData.profileUrl}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contato e Endereço */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Contato e Localização
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <ValidatedInput
              label="E-mail"
              fieldName="email"
              type="email"
              value={stepData.email}
              onChange={(e) => setStepData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="seu@email.com"
              required
            />
          </div>
          <div>
            <ValidatedInput
              label="Telefone"
              fieldName="phone"
              value={stepData.phone}
              onChange={(e) => setStepData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="(11) 99999-9999"
              required
            />
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-muted-foreground">
            {entityType === 'pf' ? 'Endereço Residencial *' : 'Endereço do Estabelecimento *'}
          </h4>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="address">Logradouro *</Label>
              <Input
                id="address"
                value={stepData.address}
                onChange={(e) => setStepData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Rua, Avenida, etc"
              />
            </div>
            <div>
              <Label htmlFor="number">Número *</Label>
              <Input
                id="number"
                value={stepData.number}
                onChange={(e) => setStepData(prev => ({ ...prev, number: e.target.value }))}
                placeholder="123"
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="complement">Complemento</Label>
              <Input
                id="complement"
                value={stepData.complement}
                onChange={(e) => setStepData(prev => ({ ...prev, complement: e.target.value }))}
                placeholder={entityType === 'pf' ? 'Apto, Casa' : 'Sala, Andar'}
              />
            </div>
            <div>
              <Label htmlFor="neighborhood">Bairro *</Label>
              <Input
                id="neighborhood"
                value={stepData.neighborhood}
                onChange={(e) => setStepData(prev => ({ ...prev, neighborhood: e.target.value }))}
                placeholder="Nome do bairro"
              />
            </div>
            <div>
              <ValidatedInput
                label="CEP"
                fieldName="cep"
                value={stepData.cep}
                onChange={(e) => setStepData(prev => ({ ...prev, cep: e.target.value }))}
                placeholder="00000-000"
                required
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">Cidade *</Label>
              <Input
                id="city"
                value={stepData.city}
                onChange={(e) => setStepData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Nome da cidade"
              />
            </div>
            <div>
              <Label htmlFor="state">Estado *</Label>
              <Select value={stepData.state} onValueChange={(value) => setStepData(prev => ({ ...prev, state: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SP">São Paulo</SelectItem>
                  <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                  <SelectItem value="MG">Minas Gerais</SelectItem>
                  <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                  <SelectItem value="SC">Santa Catarina</SelectItem>
                  <SelectItem value="PR">Paraná</SelectItem>
                  <SelectItem value="BA">Bahia</SelectItem>
                  <SelectItem value="GO">Goiás</SelectItem>
                  <SelectItem value="DF">Distrito Federal</SelectItem>
                  {/* Outros estados... */}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Credenciais */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Credenciais de Acesso
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <ValidatedInput
              label="Senha"
              fieldName="password"
              type="password"
              value={stepData.password}
              onChange={(e) => setStepData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Mínimo 8 caracteres"
              showPasswordStrength={true}
              required
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={stepData.confirmPassword}
              onChange={(e) => setStepData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              placeholder="Repita sua senha"
              className={stepData.password && stepData.confirmPassword && stepData.password !== stepData.confirmPassword ? 'border-red-500' : ''}
            />
            {stepData.password && stepData.confirmPassword && stepData.password !== stepData.confirmPassword && (
              <p className="text-sm text-red-600 mt-1">As senhas não coincidem</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function HealthProfessionalStep({ data, onDataChange, entityType = 'pf' }: any) {
  const [stepData, setStepData] = useState({
    profession: data.profession || "",
    council: data.council || "",
    councilNumber: data.councilNumber || "",
    councilState: data.councilState || "",
    councilStatus: data.councilStatus || "", // ativo, provisório, transferência
    rqe: data.rqe || "", // Registro de Qualificação de Especialista (médicos)
    specialty: data.specialty || "",
    subSpecialties: data.subSpecialties || [],
    university: data.university || "",
    graduationYear: data.graduationYear || "",
    diplomaNumber: data.diplomaNumber || "",
    residency: data.residency || "", // Residência médica
    residencyYear: data.residencyYear || "",
    cnrm: data.cnrm || "", // Certificado Nacional de Residência Médica
    postGraduation: data.postGraduation || [],
    certifications: data.certifications || [],
    // Para estabelecimentos (Pessoa Jurídica)
    establishmentType: data.establishmentType || "", // consultório, clínica, hospital
    cnpj: data.cnpj || "",
    companyName: data.companyName || "",
    fantasyName: data.fantasyName || "",
    cnesNumber: data.cnesNumber || "", // Cadastro Nacional de Estabelecimentos de Saúde
    technicalDirector: data.technicalDirector || "",
    technicalDirectorRegistry: data.technicalDirectorRegistry || ""
  });

  useEffect(() => {
    onDataChange(stepData);
  }, [stepData]);

  const professions = [
    { value: "medico", label: "Médico", council: "CRM" },
    { value: "dentista", label: "Dentista", council: "CRO" },
    { value: "psicologo", label: "Psicólogo", council: "CRP" },
    { value: "fisioterapeuta", label: "Fisioterapeuta", council: "CREFITO" },
    { value: "nutricionista", label: "Nutricionista", council: "CRN" },
    { value: "enfermeiro", label: "Enfermeiro", council: "COREN" }
  ];

  return (
    <div className="space-y-6">
      {/* Dados Profissionais Básicos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Heart className="h-5 w-5" />
          2.1 Conselho de Classe
        </h3>

        <div>
          <Label htmlFor="profession">Profissão *</Label>
          <Select 
            value={stepData.profession} 
            onValueChange={(value) => {
              const prof = professions.find(p => p.value === value);
              setStepData(prev => ({ 
                ...prev, 
                profession: value,
                council: prof?.council || ""
              }));
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione sua profissão" />
            </SelectTrigger>
            <SelectContent>
              {professions.map((prof) => (
                <SelectItem key={prof.value} value={prof.value}>
                  {prof.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="council">Conselho</Label>
            <Input
              id="council"
              value={stepData.council}
              onChange={(e) => setStepData(prev => ({ ...prev, council: e.target.value }))}
              placeholder="Ex: CRM"
              disabled
            />
          </div>
          <div>
            <Label htmlFor="councilNumber">Número do Registro *</Label>
            <Input
              id="councilNumber"
              value={stepData.councilNumber}
              onChange={(e) => setStepData(prev => ({ ...prev, councilNumber: e.target.value }))}
              placeholder="123456"
            />
          </div>
          <div>
            <Label htmlFor="councilState">Estado *</Label>
            <Select 
              value={stepData.councilState} 
              onValueChange={(value) => setStepData(prev => ({ ...prev, councilState: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AC">AC</SelectItem>
                <SelectItem value="AL">AL</SelectItem>
                <SelectItem value="AP">AP</SelectItem>
                <SelectItem value="AM">AM</SelectItem>
                <SelectItem value="BA">BA</SelectItem>
                <SelectItem value="CE">CE</SelectItem>
                <SelectItem value="DF">DF</SelectItem>
                <SelectItem value="ES">ES</SelectItem>
                <SelectItem value="GO">GO</SelectItem>
                <SelectItem value="MA">MA</SelectItem>
                <SelectItem value="MT">MT</SelectItem>
                <SelectItem value="MS">MS</SelectItem>
                <SelectItem value="MG">MG</SelectItem>
                <SelectItem value="PA">PA</SelectItem>
                <SelectItem value="PB">PB</SelectItem>
                <SelectItem value="PR">PR</SelectItem>
                <SelectItem value="PE">PE</SelectItem>
                <SelectItem value="PI">PI</SelectItem>
                <SelectItem value="RJ">RJ</SelectItem>
                <SelectItem value="RN">RN</SelectItem>
                <SelectItem value="RS">RS</SelectItem>
                <SelectItem value="RO">RO</SelectItem>
                <SelectItem value="RR">RR</SelectItem>
                <SelectItem value="SC">SC</SelectItem>
                <SelectItem value="SP">SP</SelectItem>
                <SelectItem value="SE">SE</SelectItem>
                <SelectItem value="TO">TO</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="councilStatus">Situação *</Label>
            <Select 
              value={stepData.councilStatus} 
              onValueChange={(value) => setStepData(prev => ({ ...prev, councilStatus: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Situação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="provisorio">Provisório</SelectItem>
                <SelectItem value="transferencia">Transferência</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Especialidades */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Award className="h-5 w-5" />
          2.2 Especialidades e Habilitações
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="specialty">Especialidade Principal *</Label>
            <Input
              id="specialty"
              value={stepData.specialty}
              onChange={(e) => setStepData(prev => ({ ...prev, specialty: e.target.value }))}
              placeholder="Cardiologia, Odontologia, etc."
            />
          </div>
          <div>
            <Label htmlFor="rqe">RQE (Registro de Qualificação de Especialista)</Label>
            <Input
              id="rqe"
              value={stepData.rqe}
              onChange={(e) => setStepData(prev => ({ ...prev, rqe: e.target.value }))}
              placeholder="Número do RQE (se aplicável)"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="subSpecialties">Subespecialidades</Label>
          <Textarea
            id="subSpecialties"
            value={stepData.subSpecialties.join(", ")}
            onChange={(e) => setStepData(prev => ({ 
              ...prev, 
              subSpecialties: e.target.value.split(", ").filter(s => s.trim()) 
            }))}
            placeholder="Liste suas subespecialidades separadas por vírgula"
            rows={2}
          />
        </div>
      </div>

      {/* Formação Acadêmica */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          3. Titulação e Formação Acadêmica
        </h3>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="university">Universidade *</Label>
            <Input
              id="university"
              value={stepData.university}
              onChange={(e) => setStepData(prev => ({ ...prev, university: e.target.value }))}
              placeholder="Nome da universidade"
            />
          </div>
          <div>
            <Label htmlFor="graduationYear">Ano de Graduação *</Label>
            <Input
              id="graduationYear"
              type="number"
              value={stepData.graduationYear}
              onChange={(e) => setStepData(prev => ({ ...prev, graduationYear: e.target.value }))}
              placeholder="2015"
            />
          </div>
          <div>
            <Label htmlFor="diplomaNumber">Número do Diploma</Label>
            <Input
              id="diplomaNumber"
              value={stepData.diplomaNumber}
              onChange={(e) => setStepData(prev => ({ ...prev, diplomaNumber: e.target.value }))}
              placeholder="Número do diploma"
            />
          </div>
        </div>

        {/* Residência Médica */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="residency">Residência Médica</Label>
            <Input
              id="residency"
              value={stepData.residency}
              onChange={(e) => setStepData(prev => ({ ...prev, residency: e.target.value }))}
              placeholder="Área da residência"
            />
          </div>
          <div>
            <Label htmlFor="residencyYear">Ano da Residência</Label>
            <Input
              id="residencyYear"
              type="number"
              value={stepData.residencyYear}
              onChange={(e) => setStepData(prev => ({ ...prev, residencyYear: e.target.value }))}
              placeholder="2018"
            />
          </div>
          <div>
            <Label htmlFor="cnrm">CNRM (Certificado Nacional)</Label>
            <Input
              id="cnrm"
              value={stepData.cnrm}
              onChange={(e) => setStepData(prev => ({ ...prev, cnrm: e.target.value }))}
              placeholder="Número do CNRM"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="certifications">Certificações e Cursos Complementares</Label>
          <Textarea
            id="certifications"
            value={stepData.certifications.join(", ")}
            onChange={(e) => setStepData(prev => ({ 
              ...prev, 
              certifications: e.target.value.split(", ").filter(s => s.trim()) 
            }))}
            placeholder="Liste suas certificações separadas por vírgula"
            rows={3}
          />
        </div>
      </div>

      {/* Estabelecimento (apenas para PJ) */}
      {entityType === 'pj' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            5. Informações do Estabelecimento *
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="establishmentType">Tipo de Estabelecimento *</Label>
              <Select 
                value={stepData.establishmentType} 
                onValueChange={(value) => setStepData(prev => ({ ...prev, establishmentType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultorio">Consultório</SelectItem>
                  <SelectItem value="clinica">Clínica</SelectItem>
                  <SelectItem value="hospital">Hospital</SelectItem>
                  <SelectItem value="unidade-basica">Unidade Básica</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="cnesNumber">Número CNES *</Label>
              <Input
                id="cnesNumber"
                value={stepData.cnesNumber}
                onChange={(e) => setStepData(prev => ({ ...prev, cnesNumber: e.target.value }))}
                placeholder="Cadastro Nacional de Estabelecimentos de Saúde"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="technicalDirector">Responsável Técnico *</Label>
              <Input
                id="technicalDirector"
                value={stepData.technicalDirector}
                onChange={(e) => setStepData(prev => ({ ...prev, technicalDirector: e.target.value }))}
                placeholder="Nome do responsável técnico"
              />
            </div>
            <div>
              <Label htmlFor="technicalDirectorRegistry">Registro do Responsável Técnico *</Label>
              <Input
                id="technicalDirectorRegistry"
                value={stepData.technicalDirectorRegistry}
                onChange={(e) => setStepData(prev => ({ ...prev, technicalDirectorRegistry: e.target.value }))}
                placeholder="CRM/CRO/CRP do responsável técnico"
              />
            </div>
          </div>
        </div>
      )}

      {/* Informação contextual */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Importante:</strong> {entityType === 'pf' 
            ? 'Como pessoa física, você deve informar seus dados profissionais individuais.' 
            : 'Como pessoa jurídica, informe os dados do estabelecimento e do responsável técnico.'
          }
        </p>
      </div>
    </div>
  );
}

function HealthDocumentsStep({ data, onDataChange, entityType = 'pf', flowType = 'health' }: any) {
  const [stepData, setStepData] = useState({
    // Documentos de Identidade
    rgDocument: data.rgDocument || null,
    cpfDocument: data.cpfDocument || null,
    titleDocument: data.titleDocument || null, // Título de eleitor
    reservistDocument: data.reservistDocument || null, // Certificado de reservista (homens)
    // Foto para Carteira e Perfil
    photo3x4: data.photo3x4 || null,
    selfieKyc: data.selfieKyc || null,
    // Documentos Profissionais
    diploma: data.diploma || null,
    historico: data.historico || null, // Histórico escolar
    councilCard: data.councilCard || null, // Carteira profissional
    cnrmCertificate: data.cnrmCertificate || null, // Certificado de residência médica
    ambCertificate: data.ambCertificate || null, // Certificado AMB/CFM
    rqeCertificate: data.rqeCertificate || null, // Certificado RQE
    // Comprovante de residência
    residenceProof: data.residenceProof || null,
    // Documentos de Estabelecimento (se PJ)
    cnpjDocument: data.cnpjDocument || null,
    sanitaryLicense: data.sanitaryLicense || null,
    operatingPermit: data.operatingPermit || null,
    cnesDocument: data.cnesDocument || null,
    // Status dos uploads
    uploadStatus: data.uploadStatus || {}
  });

  useEffect(() => {
    onDataChange(stepData);
  }, [stepData]);

  const requiredDocuments = [
    {
      key: 'photo3x4',
      name: 'Fotos 3x4',
      description: 'Fotos recentes, fundo branco, sem óculos, sem retoques',
      required: true,
      icon: Camera,
      color: 'text-blue-500'
    },
    {
      key: 'selfieKyc',
      name: 'Selfie para KYC',
      description: 'Selfie para reconhecimento facial',
      required: true,
      icon: User,
      color: 'text-green-500'
    },
    {
      key: 'rgDocument',
      name: 'RG ou CNH',
      description: 'Documento de identidade (cópia legível)',
      required: true,
      icon: FileText,
      color: 'text-blue-500'
    },
    {
      key: 'cpfDocument',
      name: 'CPF',
      description: 'Cópia do CPF',
      required: true,
      icon: FileText,
      color: 'text-blue-500'
    },
    {
      key: 'diploma',
      name: 'Diploma de Graduação',
      description: 'Diploma ou certidão de colação de grau (frente e verso)',
      required: true,
      icon: Award,
      color: 'text-purple-500'
    },
    {
      key: 'councilCard',
      name: 'Carteira do Conselho',
      description: 'Cédula de identidade profissional (CRM, CRO, CRP, etc)',
      required: true,
      icon: Shield,
      color: 'text-green-500'
    },
    {
      key: 'residenceProof',
      name: 'Comprovante de Residência',
      description: 'Conta de água, luz, gás ou telefone recente com CEP visível',
      required: true,
      icon: MapPin,
      color: 'text-orange-500'
    }
  ];

  const optionalDocuments = [
    {
      key: 'historico',
      name: 'Histórico Escolar',
      description: 'Histórico escolar ou declaração de colação',
      required: false,
      icon: FileText,
      color: 'text-gray-500'
    },
    {
      key: 'cnrmCertificate',
      name: 'Certificado CNRM',
      description: 'Certificado de residência médica',
      required: false,
      icon: Award,
      color: 'text-purple-500'
    },
    {
      key: 'rqeCertificate',
      name: 'Certificado RQE',
      description: 'Registro de Qualificação de Especialista',
      required: false,
      icon: Award,
      color: 'text-purple-500'
    },
    {
      key: 'titleDocument',
      name: 'Título de Eleitor',
      description: 'Cópia do título de eleitor',
      required: false,
      icon: FileText,
      color: 'text-gray-500'
    },
    {
      key: 'reservistDocument',
      name: 'Certificado de Reservista',
      description: 'Para homens - certificado de reservista',
      required: false,
      icon: FileText,
      color: 'text-gray-500'
    }
  ];

  const getEstablishmentDocuments = (flowType: string) => {
    const baseDocuments = [
      {
        key: 'cnpjDocument',
        name: 'Comprovante de CNPJ',
        description: 'Cartão CNPJ ou consulta da Receita Federal',
        required: true,
        icon: Building2,
        color: 'text-indigo-500'
      },
      {
        key: 'operatingPermit',
        name: 'Alvará de Funcionamento',
        description: 'Emitido pela prefeitura ou órgão responsável',
        required: true,
        icon: FileText,
        color: 'text-blue-500'
      }
    ];

    // Documentos específicos por tipo de profissão
    const specificDocuments = {
      health: [
        {
          key: 'sanitaryLicense',
          name: 'Licença da Vigilância Sanitária',
          description: 'Licença que atesta conformidade com normas sanitárias',
          required: true,
          icon: Shield,
          color: 'text-green-500'
        },
        {
          key: 'cnesDocument',
          name: 'Registro CNES',
          description: 'Cadastro Nacional de Estabelecimentos de Saúde',
          required: true,
          icon: Building2,
          color: 'text-indigo-500'
        }
      ],
      creative: [
        {
          key: 'culturalLicense',
          name: 'Licença Cultural',
          description: 'Para atividades artísticas e culturais (se aplicável)',
          required: false,
          icon: Award,
          color: 'text-purple-500'
        }
      ],
      tech: [
        {
          key: 'softwareLicense',
          name: 'Licenças de Software',
          description: 'Comprovantes de licenças de software utilizados',
          required: false,
          icon: Code,
          color: 'text-blue-500'
        }
      ],
      business: [
        {
          key: 'councilRegistration',
          name: 'Registro no Conselho Profissional',
          description: 'CRC, OAB, CREA ou outro conselho da área',
          required: false,
          icon: Shield,
          color: 'text-green-500'
        }
      ]
    };

    return [...baseDocuments, ...(specificDocuments[flowType] || [])];
  };

  const establishmentDocuments = getEstablishmentDocuments(flowType);

  const handleFileUpload = (documentKey: string, file: File) => {
    setStepData(prev => ({
      ...prev,
      [documentKey]: file,
      uploadStatus: {
        ...prev.uploadStatus,
        [documentKey]: 'uploaded'
      }
    }));
  };

  const handleFileRemove = (documentKey: string) => {
    setStepData(prev => ({
      ...prev,
      [documentKey]: null,
      uploadStatus: {
        ...prev.uploadStatus,
        [documentKey]: 'idle'
      }
    }));
  };


  return (
    <div className="space-y-6">
      <div className="text-center p-6 border-2 border-dashed border-muted rounded-lg">
        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">4. Documentos Comprobatórios</h3>
        <p className="text-muted-foreground mb-4">
          Faça upload dos documentos necessários para validação do seu cadastro profissional
        </p>
        <p className="text-sm text-muted-foreground">
          Formatos aceitos: PDF, JPG, PNG • Tamanho máximo: 5MB por arquivo
        </p>
      </div>

      {/* Documentos Obrigatórios */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5 text-red-500" />
          Documentos Obrigatórios
        </h4>
        
        {requiredDocuments.map((doc) => (
          <DocumentUpload
            key={doc.key}
            documentKey={doc.key}
            name={doc.name}
            description={doc.description}
            required={doc.required}
            icon={doc.icon}
            color={doc.color}
            value={stepData[doc.key]}
            uploadStatus={stepData.uploadStatus[doc.key]}
            onUpload={(file) => handleFileUpload(doc.key, file)}
            onRemove={() => handleFileRemove(doc.key)}
          />
        ))}
      </div>

      {/* Documentos Opcionais */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold flex items-center gap-2">
          <Award className="h-5 w-5 text-purple-500" />
          Documentos Opcionais (Recomendados)
        </h4>
        
        {optionalDocuments.map((doc) => (
          <DocumentUpload
            key={doc.key}
            documentKey={doc.key}
            name={doc.name}
            description={doc.description}
            required={doc.required}
            icon={doc.icon}
            color={doc.color}
            value={stepData[doc.key]}
            uploadStatus={stepData.uploadStatus[doc.key]}
            onUpload={(file) => handleFileUpload(doc.key, file)}
            onRemove={() => handleFileRemove(doc.key)}
          />
        ))}
      </div>

      {/* Documentos de Estabelecimento (apenas PJ) */}
      {entityType === 'pj' && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-indigo-500" />
            Documentos da Empresa *
          </h4>
          <p className="text-sm text-muted-foreground">
            Documentos necessários para empresas (Pessoa Jurídica)
          </p>
        
          {establishmentDocuments.map((doc) => (
            <DocumentUpload
              key={doc.key}
              documentKey={doc.key}
              name={doc.name}
              description={doc.description}
              required={doc.required}
              icon={doc.icon}
              color={doc.color}
              value={stepData[doc.key]}
              uploadStatus={stepData.uploadStatus[doc.key]}
              onUpload={(file) => handleFileUpload(doc.key, file)}
              onRemove={() => handleFileRemove(doc.key)}
            />
          ))}
        </div>
      )}

      {/* Instruções Importantes */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h5 className="font-semibold text-blue-900 mb-2">📋 Instruções Importantes:</h5>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Documentos devem estar legíveis e com boa qualidade</li>
          <li>• Para diplomas: envie frente e verso</li>
          <li>• Fotos 3x4: fundo branco, sem óculos, cabeça ereta</li>
          <li>• Comprovante de residência deve ter CEP visível e ser recente</li>
          <li>• Documentos em PDF são preferíveis para melhor qualidade</li>
        </ul>
      </div>
    </div>
  );
}

function HealthServicesStep({ data, onDataChange, entityType = 'pf' }: any) {
  const [stepData, setStepData] = useState({
    services: data.services || [],
    consultationTypes: data.consultationTypes || [],
    availability: data.availability || {}
  });

  return (
    <div className="space-y-6">
      {/* Informação contextual */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">
          {entityType === 'pf' ? '💼 Configuração de Serviços Individuais' : '🏥 Configuração de Serviços do Estabelecimento'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {entityType === 'pf' 
            ? 'Configure os tipos de consulta e valores que você oferece como profissional autônomo.' 
            : 'Configure os serviços oferecidos pelo seu estabelecimento de saúde.'
          }
        </p>
      </div>

      <div>
        <Label>Tipos de {entityType === 'pf' ? 'Consulta' : 'Atendimento'}</Label>
        <div className="grid md:grid-cols-2 gap-3 mt-2">
          {["Presencial", "Telemedicina", "Domiciliar", "Emergência"].map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox id={type} />
              <Label htmlFor={type}>{type}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>Valor da Consulta (R$)</Label>
        <div className="grid md:grid-cols-2 gap-4 mt-2">
          <div>
            <Label className="text-sm text-muted-foreground">Presencial</Label>
            <Input placeholder="150,00" />
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Telemedicina</Label>
            <Input placeholder="120,00" />
          </div>
        </div>
      </div>

      <div>
        <Label>Duração da Consulta</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a duração" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">30 minutos</SelectItem>
            <SelectItem value="45">45 minutos</SelectItem>
            <SelectItem value="60">1 hora</SelectItem>
            <SelectItem value="90">1h30</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Convênios Aceitos</Label>
        <Textarea
          placeholder="Liste os convênios que você aceita, separados por vírgula"
          className="mt-2"
        />
      </div>
    </div>
  );
}

function CoverageStep({ data, onDataChange, entityType = 'pf' }: any) {
  return (
    <div className="space-y-6">
      {/* Informação contextual */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">
          {entityType === 'pf' ? '📍 Área de Atuação Individual' : '🏢 Área de Cobertura do Estabelecimento'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {entityType === 'pf' 
            ? 'Defina onde você atende como profissional autônomo.' 
            : 'Configure a área de cobertura geográfica do seu estabelecimento.'
          }
        </p>
      </div>

      <div>
        <Label>Áreas de Atendimento</Label>
        <div className="grid md:grid-cols-2 gap-4 mt-2">
          <div>
            <Label className="text-sm text-muted-foreground">Estado</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SP">São Paulo</SelectItem>
                <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                <SelectItem value="MG">Minas Gerais</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Cidade</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sao-paulo">São Paulo</SelectItem>
                <SelectItem value="campinas">Campinas</SelectItem>
                <SelectItem value="santos">Santos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <Label>Raio de Atendimento (km)</Label>
        <Input placeholder="Ex: 50" className="mt-2" />
      </div>

      <div>
        <Label>
          {entityType === 'pf' ? 'Endereço de Atendimento' : 'Endereço do Estabelecimento'}
        </Label>
        <div className="space-y-3 mt-2">
          <Input placeholder="CEP" />
          <Input placeholder="Rua, número" />
          <div className="grid md:grid-cols-2 gap-3">
            <Input placeholder="Bairro" />
            <Input placeholder="Complemento" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Step para Profissionais Criativos
function CreativeProfessionalStep({ data, onDataChange, entityType = 'pf' }: any) {
  const [stepData, setStepData] = useState({
    // Informações básicas do perfil criativo
    professionalTitle: data.professionalTitle || "",
    profileUrl: data.profileUrl || "",
    bio: data.bio || "",
    
    // Categorias e especialidades
    primaryCategory: data.primaryCategory || "",
    categories: data.categories || [],
    specialties: data.specialties || [],
    skills: data.skills || [],
    
    // Experiência
    experienceLevel: data.experienceLevel || "", // junior, intermediate, senior, expert
    yearsOfExperience: data.yearsOfExperience || "",
    
    // Precificação
    pricingModel: data.pricingModel || "hourly", // hourly, fixed, both
    hourlyRate: data.hourlyRate || "",
    minimumProjectValue: data.minimumProjectValue || "",
    
    // Idiomas
    languages: data.languages || [{ language: "Português", proficiency: "native" }],
    
    // Para PJ
    companyName: data.companyName || "",
    fantasyName: data.fantasyName || "",
    cnpj: data.cnpj || "",
    mei: data.mei || false,
    businessType: data.businessType || "", // MEI, LTDA, EIRELI, etc
    
    // Links externos
    portfolio: data.portfolio || "",
    behance: data.behance || "",
    dribbble: data.dribbble || "",
    instagram: data.instagram || "",
    website: data.website || "",
    
    // Equipamentos (importante para fotógrafos/videomakers)
    equipment: data.equipment || []
  });

  useEffect(() => {
    onDataChange(stepData);
  }, [stepData]);

  const creativeCategories = [
    { value: "photography", label: "Fotografia", icon: Camera },
    { value: "graphic-design", label: "Design Gráfico", icon: Palette },
    { value: "video", label: "Videomaking", icon: Video },
    { value: "illustration", label: "Ilustração", icon: Brush },
    { value: "animation", label: "Animação", icon: Film },
    { value: "ui-ux", label: "UI/UX Design", icon: Layout },
    { value: "3d", label: "Modelagem 3D", icon: Box },
    { value: "music", label: "Produção Musical", icon: Music },
    { value: "audio", label: "Edição de Áudio", icon: Headphones }
  ];

  const photographySpecialties = [
    "Casamento", "Eventos", "Corporativo", "Moda", "Produto", 
    "Gastronomia", "Arquitetura", "Natureza", "Retratos", "Newborn"
  ];

  const designSpecialties = [
    "Identidade Visual", "Logo Design", "Material Impresso", "Social Media",
    "Packaging", "Editorial", "Infográficos", "Apresentações", "Web Design"
  ];

  const videoSpecialties = [
    "Institucional", "Publicitário", "Documentário", "Eventos", 
    "Motion Graphics", "Drone", "YouTube", "Reels/TikTok", "Educacional"
  ];

  return (
    <div className="space-y-6">
      {/* Informação contextual */}
      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">
          {entityType === 'pf' ? '🎨 Perfil Profissional Criativo' : '🏢 Empresa Criativa'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {entityType === 'pf' 
            ? 'Configure seu perfil para se destacar como profissional criativo independente.' 
            : 'Configure o perfil da sua agência ou estúdio criativo.'
          }
        </p>
      </div>

      {/* Título e URL do Perfil */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <User className="h-5 w-5" />
          Identidade Profissional
        </h3>

        <div>
          <Label htmlFor="professionalTitle">Título Profissional *</Label>
          <Input
            id="professionalTitle"
            value={stepData.professionalTitle}
            onChange={(e) => setStepData(prev => ({ ...prev, professionalTitle: e.target.value }))}
            placeholder="Ex: Fotógrafo Especialista em Casamentos"
            maxLength={80}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {stepData.professionalTitle.length}/80 caracteres - Seja específico e profissional
          </p>
        </div>

        {entityType === 'pf' && (
          <div>
            <Label htmlFor="profileUrl">URL do Perfil (opcional)</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">galaxia.com.br/</span>
              <Input
                id="profileUrl"
                value={stepData.profileUrl}
                onChange={(e) => setStepData(prev => ({ 
                  ...prev, 
                  profileUrl: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') 
                }))}
                placeholder="seu-nome-criativo"
                className="flex-1"
                maxLength={20}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Entre 4-20 caracteres. Use apenas letras, números e hífen.
            </p>
          </div>
        )}

        <div>
          <Label htmlFor="bio">Biografia Profissional *</Label>
          <Textarea
            id="bio"
            value={stepData.bio}
            onChange={(e) => setStepData(prev => ({ ...prev, bio: e.target.value }))}
            placeholder="Descreva sua experiência, estilo de trabalho e o que te diferencia..."
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {stepData.bio.length}/500 caracteres - Destaque seus diferenciais
          </p>
        </div>
      </div>

      {/* Categorias e Especialidades */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Área de Atuação
        </h3>

        <div>
          <Label htmlFor="primaryCategory">Categoria Principal *</Label>
          <Select 
            value={stepData.primaryCategory} 
            onValueChange={(value) => setStepData(prev => ({ ...prev, primaryCategory: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione sua categoria principal" />
            </SelectTrigger>
            <SelectContent>
              {creativeCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <SelectItem key={cat.value} value={cat.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {cat.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Especialidades baseadas na categoria */}
        {stepData.primaryCategory && (
          <div>
            <Label>Especialidades (até 4) *</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {(stepData.primaryCategory === 'photography' ? photographySpecialties :
                stepData.primaryCategory === 'graphic-design' ? designSpecialties :
                stepData.primaryCategory === 'video' ? videoSpecialties : []
              ).map((specialty) => (
                <div key={specialty} className="flex items-center space-x-2">
                  <Checkbox 
                    id={specialty}
                    checked={stepData.specialties.includes(specialty)}
                    onCheckedChange={(checked) => {
                      if (checked && stepData.specialties.length < 4) {
                        setStepData(prev => ({
                          ...prev,
                          specialties: [...prev.specialties, specialty]
                        }));
                      } else if (!checked) {
                        setStepData(prev => ({
                          ...prev,
                          specialties: prev.specialties.filter(s => s !== specialty)
                        }));
                      }
                    }}
                    disabled={!stepData.specialties.includes(specialty) && stepData.specialties.length >= 4}
                  />
                  <Label htmlFor={specialty} className="text-sm font-normal cursor-pointer">
                    {specialty}
                  </Label>
                </div>
              ))}
            </div>
            {stepData.specialties.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                Selecionadas: {stepData.specialties.length}/4
              </p>
            )}
          </div>
        )}
      </div>

      {/* Experiência e Precificação */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Experiência e Valores
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="experienceLevel">Nível de Experiência *</Label>
            <Select 
              value={stepData.experienceLevel} 
              onValueChange={(value) => setStepData(prev => ({ ...prev, experienceLevel: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione seu nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entry">
                  <div>
                    <div className="font-medium">Iniciante</div>
                    <div className="text-xs text-muted-foreground">0-2 anos de experiência</div>
                  </div>
                </SelectItem>
                <SelectItem value="intermediate">
                  <div>
                    <div className="font-medium">Intermediário</div>
                    <div className="text-xs text-muted-foreground">2-5 anos de experiência</div>
                  </div>
                </SelectItem>
                <SelectItem value="expert">
                  <div>
                    <div className="font-medium">Experiente</div>
                    <div className="text-xs text-muted-foreground">5+ anos de experiência</div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="yearsOfExperience">Anos de Experiência *</Label>
            <Input
              id="yearsOfExperience"
              type="number"
              min="0"
              max="50"
              value={stepData.yearsOfExperience}
              onChange={(e) => setStepData(prev => ({ ...prev, yearsOfExperience: e.target.value }))}
              placeholder="Ex: 5"
            />
          </div>
        </div>

        <div>
          <Label>Modelo de Precificação *</Label>
          <RadioGroup 
            value={stepData.pricingModel}
            onValueChange={(value) => setStepData(prev => ({ ...prev, pricingModel: value }))}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hourly" id="hourly" />
              <Label htmlFor="hourly" className="font-normal">Por hora</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="fixed" id="fixed" />
              <Label htmlFor="fixed" className="font-normal">Por projeto (valor fixo)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="both" id="both" />
              <Label htmlFor="both" className="font-normal">Ambos</Label>
            </div>
          </RadioGroup>
        </div>

        {(stepData.pricingModel === 'hourly' || stepData.pricingModel === 'both') && (
          <div>
            <Label htmlFor="hourlyRate">Valor por Hora (R$) *</Label>
            <Input
              id="hourlyRate"
              type="number"
              min="25"
              max="1000"
              value={stepData.hourlyRate}
              onChange={(e) => setStepData(prev => ({ ...prev, hourlyRate: e.target.value }))}
              placeholder="Ex: 150"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Sugestão para {stepData.primaryCategory}: R$ 80-300/hora
            </p>
          </div>
        )}

        {(stepData.pricingModel === 'fixed' || stepData.pricingModel === 'both') && (
          <div>
            <Label htmlFor="minimumProjectValue">Valor Mínimo de Projeto (R$) *</Label>
            <Input
              id="minimumProjectValue"
              type="number"
              min="100"
              value={stepData.minimumProjectValue}
              onChange={(e) => setStepData(prev => ({ ...prev, minimumProjectValue: e.target.value }))}
              placeholder="Ex: 500"
            />
          </div>
        )}
      </div>

      {/* Links de Portfólio */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Portfólio e Redes
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="portfolio">Portfólio Principal</Label>
            <Input
              id="portfolio"
              type="url"
              value={stepData.portfolio}
              onChange={(e) => setStepData(prev => ({ ...prev, portfolio: e.target.value }))}
              placeholder="https://seuportfolio.com"
            />
          </div>
          <div>
            <Label htmlFor="behance">Behance</Label>
            <Input
              id="behance"
              value={stepData.behance}
              onChange={(e) => setStepData(prev => ({ ...prev, behance: e.target.value }))}
              placeholder="behance.net/seuperfil"
            />
          </div>
          <div>
            <Label htmlFor="instagram">Instagram Profissional</Label>
            <Input
              id="instagram"
              value={stepData.instagram}
              onChange={(e) => setStepData(prev => ({ ...prev, instagram: e.target.value }))}
              placeholder="@seuperfil"
            />
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={stepData.website}
              onChange={(e) => setStepData(prev => ({ ...prev, website: e.target.value }))}
              placeholder="https://seusite.com.br"
            />
          </div>
        </div>
      </div>

      {/* Informações PJ */}
      {entityType === 'pj' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Dados da Empresa
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName">Razão Social *</Label>
              <Input
                id="companyName"
                value={stepData.companyName}
                onChange={(e) => setStepData(prev => ({ ...prev, companyName: e.target.value }))}
                placeholder="Empresa Criativa LTDA"
              />
            </div>
            <div>
              <Label htmlFor="fantasyName">Nome Fantasia *</Label>
              <Input
                id="fantasyName"
                value={stepData.fantasyName}
                onChange={(e) => setStepData(prev => ({ ...prev, fantasyName: e.target.value }))}
                placeholder="Estúdio Criativo"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="businessType">Tipo de Empresa *</Label>
            <Select 
              value={stepData.businessType} 
              onValueChange={(value) => setStepData(prev => ({ ...prev, businessType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mei">MEI - Microempreendedor Individual</SelectItem>
                <SelectItem value="eireli">EIRELI</SelectItem>
                <SelectItem value="ltda">LTDA</SelectItem>
                <SelectItem value="sa">S.A.</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}

function PortfolioStep({ data, onDataChange, entityType = 'pf' }: any) {
  const [stepData, setStepData] = useState({
    // Experiência profissional
    experiences: data.experiences || [{
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
      achievements: []
    }],
    
    // Formação
    education: data.education || [{
      degree: "",
      institution: "",
      course: "",
      startYear: "",
      endYear: "",
      status: "" // cursando, concluido, interrompido
    }],
    
    // Certificações
    certifications: data.certifications || [],
    
    // Habilidades técnicas
    skills: data.skills || [],
    
    // Idiomas
    languages: data.languages || [
      { language: "Português", proficiency: "native" }
    ],
    
    // Equipamentos (para fotógrafos/videomakers)
    equipment: data.equipment || [],
    
    // Software/Ferramentas
    tools: data.tools || [],
    
    // Depoimentos
    testimonials: data.testimonials || [],
    
    // Projetos destacados
    featuredProjects: data.featuredProjects || []
  });

  useEffect(() => {
    onDataChange(stepData);
  }, [stepData]);

  const skillSuggestions = {
    photography: [
      "Adobe Lightroom", "Adobe Photoshop", "Capture One", "DaVinci Resolve",
      "Fotografia de Retrato", "Fotografia de Paisagem", "Edição de Imagem",
      "Iluminação de Estúdio", "Fotografia Noturna", "HDR", "Drone"
    ],
    "graphic-design": [
      "Adobe Illustrator", "Adobe Photoshop", "Adobe InDesign", "Figma",
      "Sketch", "CorelDRAW", "Canva", "Branding", "Tipografia", "Layout"
    ],
    video: [
      "Adobe Premiere", "Final Cut Pro", "DaVinci Resolve", "After Effects",
      "Motion Graphics", "Color Grading", "Edição de Vídeo", "Roteiro",
      "Cinematografia", "Drone", "Streaming"
    ]
  };

  const toolSuggestions = {
    photography: [
      "Canon EOS R5", "Nikon Z9", "Sony A7 IV", "Lente 24-70mm f/2.8",
      "Flash Profissional", "Tripé", "Softbox", "Refletor", "Drone DJI"
    ],
    "graphic-design": [
      "Wacom Tablet", "iPad Pro", "Apple Pencil", "Monitor Calibrado",
      "MacBook Pro", "Mesa Digitalizadora"
    ],
    video: [
      "Câmera Cinema", "Gimbal", "Microfone Rode", "Iluminação LED",
      "Green Screen", "Teleprompter", "Slider", "Monitor Externo"
    ]
  };

  const handleAddExperience = () => {
    setStepData(prev => ({
      ...prev,
      experiences: [...prev.experiences, {
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
        achievements: []
      }]
    }));
  };

  const handleRemoveExperience = (index: number) => {
    setStepData(prev => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== index)
    }));
  };

  const handleAddEducation = () => {
    setStepData(prev => ({
      ...prev,
      education: [...prev.education, {
        degree: "",
        institution: "",
        course: "",
        startYear: "",
        endYear: "",
        status: ""
      }]
    }));
  };

  const handleAddLanguage = () => {
    setStepData(prev => ({
      ...prev,
      languages: [...prev.languages, { language: "", proficiency: "" }]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Experiência Profissional */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Experiência Profissional
        </h3>

        {stepData.experiences.map((exp, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="font-medium">Experiência {index + 1}</h4>
              {stepData.experiences.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveExperience(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  Remover
                </Button>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Empresa/Cliente</Label>
                <Input
                  value={exp.company}
                  onChange={(e) => {
                    const newExperiences = [...stepData.experiences];
                    newExperiences[index].company = e.target.value;
                    setStepData(prev => ({ ...prev, experiences: newExperiences }));
                  }}
                  placeholder="Nome da empresa ou 'Freelancer'"
                />
              </div>
              <div>
                <Label>Cargo/Função</Label>
                <Input
                  value={exp.position}
                  onChange={(e) => {
                    const newExperiences = [...stepData.experiences];
                    newExperiences[index].position = e.target.value;
                    setStepData(prev => ({ ...prev, experiences: newExperiences }));
                  }}
                  placeholder="Ex: Designer Gráfico Senior"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Data Início</Label>
                <Input
                  type="month"
                  value={exp.startDate}
                  onChange={(e) => {
                    const newExperiences = [...stepData.experiences];
                    newExperiences[index].startDate = e.target.value;
                    setStepData(prev => ({ ...prev, experiences: newExperiences }));
                  }}
                />
              </div>
              <div>
                <Label>Data Fim</Label>
                <Input
                  type="month"
                  value={exp.endDate}
                  onChange={(e) => {
                    const newExperiences = [...stepData.experiences];
                    newExperiences[index].endDate = e.target.value;
                    setStepData(prev => ({ ...prev, experiences: newExperiences }));
                  }}
                  disabled={exp.current}
                />
              </div>
              <div className="flex items-end">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`current-${index}`}
                    checked={exp.current}
                    onCheckedChange={(checked) => {
                      const newExperiences = [...stepData.experiences];
                      newExperiences[index].current = checked as boolean;
                      if (checked) newExperiences[index].endDate = "";
                      setStepData(prev => ({ ...prev, experiences: newExperiences }));
                    }}
                  />
                  <Label htmlFor={`current-${index}`} className="font-normal">
                    Trabalho atual
                  </Label>
                </div>
              </div>
            </div>

            <div>
              <Label>Descrição das Atividades</Label>
              <Textarea
                value={exp.description}
                onChange={(e) => {
                  const newExperiences = [...stepData.experiences];
                  newExperiences[index].description = e.target.value;
                  setStepData(prev => ({ ...prev, experiences: newExperiences }));
                }}
                placeholder="Descreva suas principais responsabilidades e conquistas..."
                rows={3}
              />
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={handleAddExperience}
          className="w-full"
        >
          + Adicionar Experiência
        </Button>
      </div>

      {/* Formação Acadêmica */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Award className="h-5 w-5" />
          Formação Acadêmica
        </h3>

        {stepData.education.map((edu, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Nível</Label>
                <Select
                  value={edu.degree}
                  onValueChange={(value) => {
                    const newEducation = [...stepData.education];
                    newEducation[index].degree = value;
                    setStepData(prev => ({ ...prev, education: newEducation }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medio">Ensino Médio</SelectItem>
                    <SelectItem value="tecnico">Técnico</SelectItem>
                    <SelectItem value="superior">Superior</SelectItem>
                    <SelectItem value="pos">Pós-graduação</SelectItem>
                    <SelectItem value="mba">MBA</SelectItem>
                    <SelectItem value="mestrado">Mestrado</SelectItem>
                    <SelectItem value="doutorado">Doutorado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={edu.status}
                  onValueChange={(value) => {
                    const newEducation = [...stepData.education];
                    newEducation[index].status = value;
                    setStepData(prev => ({ ...prev, education: newEducation }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cursando">Cursando</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="interrompido">Interrompido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Curso</Label>
              <Input
                value={edu.course}
                onChange={(e) => {
                  const newEducation = [...stepData.education];
                  newEducation[index].course = e.target.value;
                  setStepData(prev => ({ ...prev, education: newEducation }));
                }}
                placeholder="Ex: Design Gráfico, Fotografia, Comunicação Visual"
              />
            </div>

            <div>
              <Label>Instituição</Label>
              <Input
                value={edu.institution}
                onChange={(e) => {
                  const newEducation = [...stepData.education];
                  newEducation[index].institution = e.target.value;
                  setStepData(prev => ({ ...prev, education: newEducation }));
                }}
                placeholder="Nome da instituição"
              />
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={handleAddEducation}
          className="w-full"
        >
          + Adicionar Formação
        </Button>
      </div>

      {/* Habilidades */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Star className="h-5 w-5" />
          Habilidades Técnicas
        </h3>

        <div>
          <Label>Suas Habilidades (máx. 15)</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {stepData.skills.map((skill, index) => (
              <Badge key={index} variant="secondary" className="px-3 py-1">
                {skill}
                <button
                  type="button"
                  onClick={() => {
                    setStepData(prev => ({
                      ...prev,
                      skills: prev.skills.filter((_, i) => i !== index)
                    }));
                  }}
                  className="ml-2 text-xs hover:text-red-600"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
          
          {stepData.skills.length < 15 && (
            <div className="mt-2">
              <Input
                placeholder="Digite uma habilidade e pressione Enter"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    e.preventDefault();
                    const newSkill = e.currentTarget.value.trim();
                    if (!stepData.skills.includes(newSkill)) {
                      setStepData(prev => ({
                        ...prev,
                        skills: [...prev.skills, newSkill]
                      }));
                    }
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
          )}
          
          <p className="text-xs text-muted-foreground mt-2">
            {stepData.skills.length}/15 habilidades adicionadas
          </p>
        </div>
      </div>

      {/* Idiomas */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Idiomas
        </h3>

        {stepData.languages.map((lang, index) => (
          <div key={index} className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Idioma</Label>
              <Input
                value={lang.language}
                onChange={(e) => {
                  const newLanguages = [...stepData.languages];
                  newLanguages[index].language = e.target.value;
                  setStepData(prev => ({ ...prev, languages: newLanguages }));
                }}
                placeholder="Ex: Inglês, Espanhol"
                disabled={index === 0} // Português é fixo
              />
            </div>
            <div>
              <Label>Proficiência</Label>
              <Select
                value={lang.proficiency}
                onValueChange={(value) => {
                  const newLanguages = [...stepData.languages];
                  newLanguages[index].proficiency = value;
                  setStepData(prev => ({ ...prev, languages: newLanguages }));
                }}
                disabled={index === 0} // Português é nativo
              >
                <SelectTrigger>
                  <SelectValue placeholder="Nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Básico</SelectItem>
                  <SelectItem value="intermediate">Intermediário</SelectItem>
                  <SelectItem value="advanced">Avançado</SelectItem>
                  <SelectItem value="fluent">Fluente</SelectItem>
                  <SelectItem value="native">Nativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={handleAddLanguage}
          className="w-full"
        >
          + Adicionar Idioma
        </Button>
      </div>

      {/* Certificações */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Award className="h-5 w-5" />
          Certificações Profissionais
        </h3>

        <div className="space-y-2">
          <Label>Certificações (opcional)</Label>
          <Textarea
            value={stepData.certifications.join('\n')}
            onChange={(e) => {
              const certs = e.target.value.split('\n').filter(c => c.trim());
              setStepData(prev => ({ ...prev, certifications: certs }));
            }}
            placeholder="Liste suas certificações, uma por linha&#10;Ex: Adobe Certified Expert - Photoshop&#10;Google Analytics Certified"
            rows={4}
          />
        </div>
      </div>
    </div>
  );
}

function CreativeServicesStep({ data, onDataChange, entityType = 'pf' }: any) {
  const [stepData, setStepData] = useState({
    // Pacotes de serviço
    services: data.services || [{
      name: "",
      description: "",
      category: "",
      deliveryTime: "",
      revisions: "",
      packages: {
        basic: { name: "Básico", price: "", features: [] },
        standard: { name: "Padrão", price: "", features: [] },
        premium: { name: "Premium", price: "", features: [] }
      }
    }],
    
    // Status e disponibilidade
    availability: data.availability || "available", // available, busy, vacation
    maxSimultaneousProjects: data.maxSimultaneousProjects || "3",
    
    // Termos de trabalho
    workProcess: data.workProcess || "",
    requirements: data.requirements || [],
    deliverables: data.deliverables || [],
    
    // Extras
    extras: data.extras || [],
    
    // Políticas
    cancellationPolicy: data.cancellationPolicy || "flexible", // flexible, moderate, strict
    copyrightPolicy: data.copyrightPolicy || "client", // client, shared, photographer
    
    // Para PJ - informações adicionais
    teamSize: data.teamSize || "",
    studioInfo: data.studioInfo || ""
  });

  useEffect(() => {
    onDataChange(stepData);
  }, [stepData]);

  const serviceCategories = {
    photography: [
      "Ensaio Fotográfico", "Cobertura de Eventos", "Fotografia de Produto",
      "Fotografia Corporativa", "Book Fotográfico", "Fotografia de Imóveis"
    ],
    "graphic-design": [
      "Identidade Visual", "Design de Logo", "Material Gráfico", 
      "Social Media", "Embalagem", "Apresentações"
    ],
    video: [
      "Vídeo Institucional", "Vídeo Publicitário", "Cobertura de Eventos",
      "Motion Graphics", "Edição de Vídeo", "Vídeo para Redes Sociais"
    ]
  };

  const deliveryTimeOptions = [
    { value: "1", label: "1 dia" },
    { value: "3", label: "3 dias" },
    { value: "5", label: "5 dias" },
    { value: "7", label: "1 semana" },
    { value: "14", label: "2 semanas" },
    { value: "21", label: "3 semanas" },
    { value: "30", label: "1 mês" },
    { value: "custom", label: "Personalizado" }
  ];

  const extraSuggestions = [
    "Entrega expressa (24h)",
    "Revisões extras",
    "Arquivos fonte",
    "Licença comercial estendida",
    "Tratamento premium",
    "Versões adicionais",
    "Consultoria pós-projeto"
  ];

  const handleAddService = () => {
    setStepData(prev => ({
      ...prev,
      services: [...prev.services, {
        name: "",
        description: "",
        category: "",
        deliveryTime: "",
        revisions: "",
        packages: {
          basic: { name: "Básico", price: "", features: [] },
          standard: { name: "Padrão", price: "", features: [] },
          premium: { name: "Premium", price: "", features: [] }
        }
      }]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Informação contextual */}
      <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">
          {entityType === 'pf' ? '💼 Configure seus Serviços' : '🏢 Serviços da Empresa'}
        </h3>
        <p className="text-sm text-muted-foreground">
          Crie pacotes de serviços atrativos seguindo o modelo de sucesso do Fiverr. 
          Ofereça 3 níveis de preço para atender diferentes orçamentos.
        </p>
      </div>

      {/* Serviços */}
      {stepData.services.map((service, serviceIndex) => (
        <div key={serviceIndex} className="p-6 border-2 rounded-lg space-y-6">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold">Serviço {serviceIndex + 1}</h3>
            {stepData.services.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStepData(prev => ({
                    ...prev,
                    services: prev.services.filter((_, i) => i !== serviceIndex)
                  }));
                }}
                className="text-red-600"
              >
                Remover
              </Button>
            )}
          </div>

          {/* Informações básicas do serviço */}
          <div className="space-y-4">
            <div>
              <Label>Nome do Serviço *</Label>
              <Input
                value={service.name}
                onChange={(e) => {
                  const newServices = [...stepData.services];
                  newServices[serviceIndex].name = e.target.value;
                  setStepData(prev => ({ ...prev, services: newServices }));
                }}
                placeholder="Ex: Ensaio Fotográfico Profissional"
                maxLength={80}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {service.name.length}/80 - Seja claro e específico
              </p>
            </div>

            <div>
              <Label>Descrição Detalhada *</Label>
              <Textarea
                value={service.description}
                onChange={(e) => {
                  const newServices = [...stepData.services];
                  newServices[serviceIndex].description = e.target.value;
                  setStepData(prev => ({ ...prev, services: newServices }));
                }}
                placeholder="Descreva em detalhes o que está incluído, processo de trabalho, diferenciais..."
                rows={4}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {service.description.length}/1000 caracteres
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Categoria *</Label>
                <Select
                  value={service.category}
                  onValueChange={(value) => {
                    const newServices = [...stepData.services];
                    newServices[serviceIndex].category = value;
                    setStepData(prev => ({ ...prev, services: newServices }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Aqui você mostraria categorias baseadas no tipo do profissional */}
                    <SelectItem value="portrait">Retrato</SelectItem>
                    <SelectItem value="event">Eventos</SelectItem>
                    <SelectItem value="product">Produto</SelectItem>
                    <SelectItem value="corporate">Corporativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Prazo de Entrega *</Label>
                <Select
                  value={service.deliveryTime}
                  onValueChange={(value) => {
                    const newServices = [...stepData.services];
                    newServices[serviceIndex].deliveryTime = value;
                    setStepData(prev => ({ ...prev, services: newServices }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {deliveryTimeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Revisões Incluídas *</Label>
                <Select
                  value={service.revisions}
                  onValueChange={(value) => {
                    const newServices = [...stepData.services];
                    newServices[serviceIndex].revisions = value;
                    setStepData(prev => ({ ...prev, services: newServices }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sem revisões</SelectItem>
                    <SelectItem value="1">1 revisão</SelectItem>
                    <SelectItem value="2">2 revisões</SelectItem>
                    <SelectItem value="3">3 revisões</SelectItem>
                    <SelectItem value="5">5 revisões</SelectItem>
                    <SelectItem value="unlimited">Ilimitadas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Pacotes de preço */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Pacotes de Preço (Modelo Fiverr)
            </h4>

            <div className="grid md:grid-cols-3 gap-4">
              {/* Pacote Básico */}
              <div className="p-4 border rounded-lg space-y-3 bg-gray-50">
                <div className="text-center">
                  <Badge variant="secondary">🥉 Básico</Badge>
                </div>
                <div>
                  <Label>Preço (R$) *</Label>
                  <Input
                    type="number"
                    value={service.packages.basic.price}
                    onChange={(e) => {
                      const newServices = [...stepData.services];
                      newServices[serviceIndex].packages.basic.price = e.target.value;
                      setStepData(prev => ({ ...prev, services: newServices }));
                    }}
                    placeholder="150"
                    min="50"
                  />
                </div>
                <div>
                  <Label>O que inclui:</Label>
                  <Textarea
                    value={service.packages.basic.features.join('\n')}
                    onChange={(e) => {
                      const newServices = [...stepData.services];
                      newServices[serviceIndex].packages.basic.features = 
                        e.target.value.split('\n').filter(f => f.trim());
                      setStepData(prev => ({ ...prev, services: newServices }));
                    }}
                    placeholder="- 10 fotos editadas&#10;- 1 hora de sessão&#10;- Entrega digital"
                    rows={4}
                  />
                </div>
              </div>

              {/* Pacote Padrão */}
              <div className="p-4 border-2 border-blue-300 rounded-lg space-y-3 bg-blue-50">
                <div className="text-center">
                  <Badge className="bg-blue-500 text-white">🥈 Padrão</Badge>
                  <p className="text-xs text-muted-foreground mt-1">Mais popular</p>
                </div>
                <div>
                  <Label>Preço (R$) *</Label>
                  <Input
                    type="number"
                    value={service.packages.standard.price}
                    onChange={(e) => {
                      const newServices = [...stepData.services];
                      newServices[serviceIndex].packages.standard.price = e.target.value;
                      setStepData(prev => ({ ...prev, services: newServices }));
                    }}
                    placeholder="300"
                    min="50"
                  />
                </div>
                <div>
                  <Label>O que inclui:</Label>
                  <Textarea
                    value={service.packages.standard.features.join('\n')}
                    onChange={(e) => {
                      const newServices = [...stepData.services];
                      newServices[serviceIndex].packages.standard.features = 
                        e.target.value.split('\n').filter(f => f.trim());
                      setStepData(prev => ({ ...prev, services: newServices }));
                    }}
                    placeholder="- 25 fotos editadas&#10;- 2 horas de sessão&#10;- Entrega digital + impressa&#10;- 2 looks/cenários"
                    rows={4}
                  />
                </div>
              </div>

              {/* Pacote Premium */}
              <div className="p-4 border-2 border-yellow-400 rounded-lg space-y-3 bg-yellow-50">
                <div className="text-center">
                  <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                    🥇 Premium
                  </Badge>
                </div>
                <div>
                  <Label>Preço (R$) *</Label>
                  <Input
                    type="number"
                    value={service.packages.premium.price}
                    onChange={(e) => {
                      const newServices = [...stepData.services];
                      newServices[serviceIndex].packages.premium.price = e.target.value;
                      setStepData(prev => ({ ...prev, services: newServices }));
                    }}
                    placeholder="600"
                    min="50"
                  />
                </div>
                <div>
                  <Label>O que inclui:</Label>
                  <Textarea
                    value={service.packages.premium.features.join('\n')}
                    onChange={(e) => {
                      const newServices = [...stepData.services];
                      newServices[serviceIndex].packages.premium.features = 
                        e.target.value.split('\n').filter(f => f.trim());
                      setStepData(prev => ({ ...prev, services: newServices }));
                    }}
                    placeholder="- 50 fotos editadas&#10;- 4 horas de sessão&#10;- Entrega completa&#10;- 4 looks/cenários&#10;- Álbum premium&#10;- Direitos comerciais"
                    rows={4}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={handleAddService}
        className="w-full"
      >
        + Adicionar Outro Serviço
      </Button>

      {/* Extras e Add-ons */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Star className="h-5 w-5" />
          Extras e Complementos
        </h3>

        <div>
          <Label>Serviços Extras (opcional)</Label>
          <div className="space-y-2 mt-2">
            {extraSuggestions.map((extra) => (
              <div key={extra} className="flex items-center space-x-2">
                <Checkbox
                  id={extra}
                  checked={stepData.extras.includes(extra)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setStepData(prev => ({
                        ...prev,
                        extras: [...prev.extras, extra]
                      }));
                    } else {
                      setStepData(prev => ({
                        ...prev,
                        extras: prev.extras.filter(e => e !== extra)
                      }));
                    }
                  }}
                />
                <Label htmlFor={extra} className="font-normal cursor-pointer">
                  {extra}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Disponibilidade */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Disponibilidade e Capacidade
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Status de Disponibilidade *</Label>
            <Select
              value={stepData.availability}
              onValueChange={(value) => setStepData(prev => ({ ...prev, availability: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Disponível
                  </div>
                </SelectItem>
                <SelectItem value="busy">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    Ocupado (aceita com prazo maior)
                  </div>
                </SelectItem>
                <SelectItem value="vacation">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Em férias/Indisponível
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Projetos Simultâneos (máx.) *</Label>
            <Select
              value={stepData.maxSimultaneousProjects}
              onValueChange={(value) => setStepData(prev => ({ ...prev, maxSimultaneousProjects: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 projeto por vez</SelectItem>
                <SelectItem value="3">Até 3 projetos</SelectItem>
                <SelectItem value="5">Até 5 projetos</SelectItem>
                <SelectItem value="10">Até 10 projetos</SelectItem>
                <SelectItem value="unlimited">Sem limite</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Políticas */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Políticas e Termos
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Política de Cancelamento *</Label>
            <Select
              value={stepData.cancellationPolicy}
              onValueChange={(value) => setStepData(prev => ({ ...prev, cancellationPolicy: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flexible">
                  <div>
                    <div className="font-medium">Flexível</div>
                    <div className="text-xs text-muted-foreground">
                      Reembolso total até 24h antes
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="moderate">
                  <div>
                    <div className="font-medium">Moderada</div>
                    <div className="text-xs text-muted-foreground">
                      50% de reembolso até 48h antes
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="strict">
                  <div>
                    <div className="font-medium">Rígida</div>
                    <div className="text-xs text-muted-foreground">
                      Sem reembolso após confirmação
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Direitos Autorais *</Label>
            <Select
              value={stepData.copyrightPolicy}
              onValueChange={(value) => setStepData(prev => ({ ...prev, copyrightPolicy: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="client">
                  <div>
                    <div className="font-medium">Cliente</div>
                    <div className="text-xs text-muted-foreground">
                      Todos os direitos para o cliente
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="shared">
                  <div>
                    <div className="font-medium">Compartilhado</div>
                    <div className="text-xs text-muted-foreground">
                      Uso comercial mediante acordo
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="photographer">
                  <div>
                    <div className="font-medium">Profissional</div>
                    <div className="text-xs text-muted-foreground">
                      Cliente tem uso pessoal apenas
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Informações PJ */}
      {entityType === 'pj' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Informações do Estúdio/Agência
          </h3>

          <div>
            <Label>Tamanho da Equipe</Label>
            <Select
              value={stepData.teamSize}
              onValueChange={(value) => setStepData(prev => ({ ...prev, teamSize: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Individual</SelectItem>
                <SelectItem value="2-5">2-5 pessoas</SelectItem>
                <SelectItem value="6-10">6-10 pessoas</SelectItem>
                <SelectItem value="11-20">11-20 pessoas</SelectItem>
                <SelectItem value="20+">Mais de 20 pessoas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Sobre o Estúdio/Agência</Label>
            <Textarea
              value={stepData.studioInfo}
              onChange={(e) => setStepData(prev => ({ ...prev, studioInfo: e.target.value }))}
              placeholder="Descreva a estrutura, equipamentos disponíveis, diferenciais do estúdio..."
              rows={3}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function TechProfessionalStep({ data, onDataChange, entityType = 'pf' }: any) {
  const [stepData, setStepData] = useState({
    // Informações básicas
    professionalTitle: data.professionalTitle || "",
    bio: data.bio || "",
    
    // Stack tecnológico
    primaryStack: data.primaryStack || "", // frontend, backend, fullstack, mobile, devops, data
    programmingLanguages: data.programmingLanguages || [],
    frameworks: data.frameworks || [],
    databases: data.databases || [],
    tools: data.tools || [],
    
    // Experiência
    experienceLevel: data.experienceLevel || "", // junior, pleno, senior, especialista
    yearsOfExperience: data.yearsOfExperience || "",
    
    // Especialidades
    specialties: data.specialties || [], // web-dev, mobile-dev, ai-ml, blockchain, etc
    industries: data.industries || [], // fintech, healthtech, e-commerce, etc
    
    // Metodologias
    methodologies: data.methodologies || [], // agile, scrum, kanban, etc
    
    // Precificação
    pricingModel: data.pricingModel || "hourly", // hourly, fixed, both
    hourlyRate: data.hourlyRate || "",
    minimumProjectValue: data.minimumProjectValue || "",
    
    // Links profissionais
    github: data.github || "",
    linkedin: data.linkedin || "",
    portfolio: data.portfolio || "",
    
    // Para PJ
    companyName: data.companyName || "",
    fantasyName: data.fantasyName || "",
    cnpj: data.cnpj || "",
    businessType: data.businessType || "", // MEI, LTDA, EIRELI, etc
    teamSize: data.teamSize || "" // 1-5, 6-20, 21-50, 50+
  });

  useEffect(() => {
    onDataChange(stepData);
  }, [stepData]);

  const techStacks = [
    { value: "frontend", label: "Frontend", description: "React, Vue, Angular, etc." },
    { value: "backend", label: "Backend", description: "Node.js, Python, Java, etc." },
    { value: "fullstack", label: "Fullstack", description: "Frontend + Backend" },
    { value: "mobile", label: "Mobile", description: "React Native, Flutter, Swift, etc." },
    { value: "devops", label: "DevOps", description: "Docker, AWS, Kubernetes, etc." },
    { value: "data", label: "Data Science", description: "Python, R, Machine Learning" },
    { value: "qa", label: "Quality Assurance", description: "Testes automatizados" },
    { value: "ui-ux", label: "UI/UX", description: "Design de interfaces" }
  ];

  const programmingLanguages = [
    "JavaScript", "TypeScript", "Python", "Java", "C#", "PHP", "Go", "Rust", 
    "Swift", "Kotlin", "Dart", "C++", "Ruby", "Scala", "R", "SQL"
  ];

  const frameworks = [
    "React", "Vue.js", "Angular", "Next.js", "Nuxt.js", "Svelte",
    "Node.js", "Express", "NestJS", "Django", "Flask", "Spring Boot",
    "Laravel", "React Native", "Flutter", "Ionic"
  ];

  const databases = [
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", 
    "SQLServer", "Oracle", "Firebase", "DynamoDB", "Cassandra"
  ];

  const tools = [
    "Git", "Docker", "Kubernetes", "AWS", "Google Cloud", "Azure",
    "Figma", "Adobe XD", "Jira", "Trello", "Slack", "VS Code"
  ];

  return (
    <div className="space-y-6">
      {/* Informação contextual */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">
          {entityType === 'pf' ? '💻 Perfil Profissional de Tecnologia' : '🏢 Empresa de Tecnologia'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {entityType === 'pf' 
            ? 'Configure seu perfil técnico para se destacar no mercado de tecnologia.' 
            : 'Configure o perfil da sua empresa de tecnologia ou consultoria.'
          }
        </p>
      </div>

      {/* Identificação Profissional */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Code className="h-5 w-5" />
          Identificação Profissional
        </h3>

        <div>
          <Label htmlFor="professionalTitle">Título/Cargo Atual *</Label>
          <Input
            id="professionalTitle"
            value={stepData.professionalTitle}
            onChange={(e) => setStepData(prev => ({ ...prev, professionalTitle: e.target.value }))}
            placeholder="Ex: Desenvolvedor Full Stack, DevOps Engineer, Data Scientist"
          />
        </div>

        <div>
          <Label htmlFor="bio">Resumo Profissional *</Label>
          <Textarea
            id="bio"
            value={stepData.bio}
            onChange={(e) => setStepData(prev => ({ ...prev, bio: e.target.value }))}
            placeholder="Descreva sua experiência, principais tecnologias e áreas de expertise..."
            className="min-h-[100px]"
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {stepData.bio.length}/500 caracteres
          </p>
        </div>
      </div>

      {/* Stack Tecnológico */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Code className="h-5 w-5" />
          Stack Tecnológico
        </h3>

        <div>
          <Label>Área Principal *</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
            {techStacks.map((stack) => (
              <div
                key={stack.value}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  stepData.primaryStack === stack.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setStepData(prev => ({ ...prev, primaryStack: stack.value }))}
              >
                <div className="font-medium text-sm">{stack.label}</div>
                <div className="text-xs text-muted-foreground">{stack.description}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="experienceLevel">Nível de Experiência *</Label>
            <Select 
              value={stepData.experienceLevel} 
              onValueChange={(value) => setStepData(prev => ({ ...prev, experienceLevel: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione seu nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="junior">
                  <div>
                    <div className="font-medium">Júnior</div>
                    <div className="text-xs text-muted-foreground">0-2 anos de experiência</div>
                  </div>
                </SelectItem>
                <SelectItem value="pleno">
                  <div>
                    <div className="font-medium">Pleno</div>
                    <div className="text-xs text-muted-foreground">3-5 anos de experiência</div>
                  </div>
                </SelectItem>
                <SelectItem value="senior">
                  <div>
                    <div className="font-medium">Sênior</div>
                    <div className="text-xs text-muted-foreground">6-10 anos de experiência</div>
                  </div>
                </SelectItem>
                <SelectItem value="especialista">
                  <div>
                    <div className="font-medium">Especialista</div>
                    <div className="text-xs text-muted-foreground">10+ anos de experiência</div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="yearsOfExperience">Anos de Experiência *</Label>
            <Input
              id="yearsOfExperience"
              type="number"
              min="0"
              max="50"
              value={stepData.yearsOfExperience}
              onChange={(e) => setStepData(prev => ({ ...prev, yearsOfExperience: e.target.value }))}
              placeholder="Ex: 5"
            />
          </div>
        </div>
      </div>

      {/* Links Profissionais */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Links Profissionais
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="github">GitHub</Label>
            <Input
              id="github"
              type="url"
              value={stepData.github}
              onChange={(e) => setStepData(prev => ({ ...prev, github: e.target.value }))}
              placeholder="https://github.com/seuusuario"
            />
          </div>
          <div>
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              type="url"
              value={stepData.linkedin}
              onChange={(e) => setStepData(prev => ({ ...prev, linkedin: e.target.value }))}
              placeholder="https://linkedin.com/in/seuusuario"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="portfolio">Portfolio/Website</Label>
            <Input
              id="portfolio"
              type="url"
              value={stepData.portfolio}
              onChange={(e) => setStepData(prev => ({ ...prev, portfolio: e.target.value }))}
              placeholder="https://seuportfolio.com"
            />
          </div>
        </div>
      </div>

      {/* Informações PJ */}
      {entityType === 'pj' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Dados da Empresa
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName">Razão Social *</Label>
              <Input
                id="companyName"
                value={stepData.companyName}
                onChange={(e) => setStepData(prev => ({ ...prev, companyName: e.target.value }))}
                placeholder="Tech Solutions LTDA"
              />
            </div>
            <div>
              <Label htmlFor="fantasyName">Nome Fantasia *</Label>
              <Input
                id="fantasyName"
                value={stepData.fantasyName}
                onChange={(e) => setStepData(prev => ({ ...prev, fantasyName: e.target.value }))}
                placeholder="Tech Solutions"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="businessType">Tipo de Empresa *</Label>
              <Select 
                value={stepData.businessType} 
                onValueChange={(value) => setStepData(prev => ({ ...prev, businessType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mei">MEI - Microempreendedor Individual</SelectItem>
                  <SelectItem value="eireli">EIRELI</SelectItem>
                  <SelectItem value="ltda">LTDA</SelectItem>
                  <SelectItem value="sa">S.A.</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="teamSize">Tamanho da Equipe</Label>
              <Select 
                value={stepData.teamSize} 
                onValueChange={(value) => setStepData(prev => ({ ...prev, teamSize: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-5">1-5 pessoas</SelectItem>
                  <SelectItem value="6-20">6-20 pessoas</SelectItem>
                  <SelectItem value="21-50">21-50 pessoas</SelectItem>
                  <SelectItem value="50+">50+ pessoas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TechExperienceStep({ data, onDataChange, entityType = 'pf' }: any) {
  const [stepData, setStepData] = useState({
    // Tecnologias e ferramentas
    programmingLanguages: data.programmingLanguages || [],
    frameworks: data.frameworks || [],
    databases: data.databases || [],
    tools: data.tools || [],
    cloudProviders: data.cloudProviders || [],
    
    // Especialidades técnicas
    specialties: data.specialties || [], // web-dev, mobile-dev, ai-ml, blockchain, etc
    industries: data.industries || [], // fintech, healthtech, e-commerce, etc
    methodologies: data.methodologies || [], // agile, scrum, kanban, etc
    
    // Experiências profissionais
    experiences: data.experiences || [{
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
      technologies: [],
      achievements: []
    }],
    
    // Projetos destacados
    projects: data.projects || [{
      name: "",
      description: "",
      technologies: [],
      githubUrl: "",
      liveUrl: "",
      role: "",
      teamSize: ""
    }],
    
    // Educação
    education: data.education || [{
      degree: "",
      institution: "",
      course: "",
      startYear: "",
      endYear: "",
      status: "" // cursando, concluido, interrompido
    }],
    
    // Certificações
    certifications: data.certifications || []
  });

  useEffect(() => {
    onDataChange(stepData);
  }, [stepData]);

  const programmingLanguages = [
    "JavaScript", "TypeScript", "Python", "Java", "C#", "PHP", "Go", "Rust", 
    "Swift", "Kotlin", "Dart", "C++", "Ruby", "Scala", "R", "SQL"
  ];

  const frameworks = [
    "React", "Vue.js", "Angular", "Next.js", "Nuxt.js", "Svelte",
    "Node.js", "Express", "NestJS", "Django", "Flask", "Spring Boot",
    "Laravel", "React Native", "Flutter", "Ionic"
  ];

  const databases = [
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", 
    "SQLServer", "Oracle", "Firebase", "DynamoDB", "Cassandra"
  ];

  const tools = [
    "Git", "Docker", "Kubernetes", "Jenkins", "GitHub Actions", "GitLab CI",
    "Figma", "Adobe XD", "Jira", "Trello", "Slack", "VS Code", "IntelliJ"
  ];

  const cloudProviders = [
    "AWS", "Google Cloud", "Microsoft Azure", "Digital Ocean", "Heroku", "Vercel"
  ];

  const specialties = [
    { value: "web-dev", label: "Desenvolvimento Web" },
    { value: "mobile-dev", label: "Desenvolvimento Mobile" },
    { value: "ai-ml", label: "Inteligência Artificial/ML" },
    { value: "blockchain", label: "Blockchain" },
    { value: "iot", label: "Internet das Coisas" },
    { value: "cybersecurity", label: "Segurança Cibernética" },
    { value: "game-dev", label: "Desenvolvimento de Jogos" },
    { value: "data-science", label: "Data Science" },
    { value: "devops", label: "DevOps/SRE" },
    { value: "embedded", label: "Sistemas Embarcados" }
  ];

  const industries = [
    { value: "fintech", label: "Fintech" },
    { value: "healthtech", label: "Healthtech" },
    { value: "edtech", label: "Edtech" },
    { value: "e-commerce", label: "E-commerce" },
    { value: "logistics", label: "Logística" },
    { value: "automotive", label: "Automotivo" },
    { value: "entertainment", label: "Entretenimento" },
    { value: "government", label: "Governo" },
    { value: "banking", label: "Bancário" },
    { value: "insurance", label: "Seguros" }
  ];

  const methodologies = [
    "Agile", "Scrum", "Kanban", "Lean", "XP", "DevOps", "TDD", "BDD"
  ];

  const handleAddExperience = () => {
    setStepData(prev => ({
      ...prev,
      experiences: [...prev.experiences, {
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
        technologies: [],
        achievements: []
      }]
    }));
  };

  const handleRemoveExperience = (index: number) => {
    setStepData(prev => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== index)
    }));
  };

  const handleAddProject = () => {
    setStepData(prev => ({
      ...prev,
      projects: [...prev.projects, {
        name: "",
        description: "",
        technologies: [],
        githubUrl: "",
        liveUrl: "",
        role: "",
        teamSize: ""
      }]
    }));
  };

  const handleRemoveProject = (index: number) => {
    setStepData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  const toggleArrayItem = (array: string[], item: string, setter: (value: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item));
    } else {
      setter([...array, item]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Informação contextual */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">💻 Stack Tecnológico e Experiência</h3>
        <p className="text-sm text-muted-foreground">
          Detalhe suas competências técnicas, projetos e experiências profissionais.
        </p>
      </div>

      {/* Linguagens de Programação */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Code className="h-5 w-5" />
          Linguagens de Programação
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {programmingLanguages.map((lang) => (
            <div
              key={lang}
              className={`p-2 border rounded cursor-pointer text-sm transition-all ${
                stepData.programmingLanguages.includes(lang)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleArrayItem(
                stepData.programmingLanguages, 
                lang, 
                (newArray) => setStepData(prev => ({ ...prev, programmingLanguages: newArray }))
              )}
            >
              {lang}
            </div>
          ))}
        </div>
      </div>

      {/* Frameworks */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Frameworks e Bibliotecas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {frameworks.map((framework) => (
            <div
              key={framework}
              className={`p-2 border rounded cursor-pointer text-sm transition-all ${
                stepData.frameworks.includes(framework)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleArrayItem(
                stepData.frameworks, 
                framework, 
                (newArray) => setStepData(prev => ({ ...prev, frameworks: newArray }))
              )}
            >
              {framework}
            </div>
          ))}
        </div>
      </div>

      {/* Bancos de Dados */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Bancos de Dados</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {databases.map((db) => (
            <div
              key={db}
              className={`p-2 border rounded cursor-pointer text-sm transition-all ${
                stepData.databases.includes(db)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleArrayItem(
                stepData.databases, 
                db, 
                (newArray) => setStepData(prev => ({ ...prev, databases: newArray }))
              )}
            >
              {db}
            </div>
          ))}
        </div>
      </div>

      {/* Especialidades */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Especialidades Técnicas</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {specialties.map((specialty) => (
            <div
              key={specialty.value}
              className={`p-3 border rounded cursor-pointer text-sm transition-all ${
                stepData.specialties.includes(specialty.value)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleArrayItem(
                stepData.specialties, 
                specialty.value, 
                (newArray) => setStepData(prev => ({ ...prev, specialties: newArray }))
              )}
            >
              {specialty.label}
            </div>
          ))}
        </div>
      </div>

      {/* Experiências Profissionais */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Experiências Profissionais
          </h3>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={handleAddExperience}
          >
            Adicionar Experiência
          </Button>
        </div>

        {stepData.experiences.map((exp, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex justify-between items-start">
              <h4 className="font-medium">Experiência {index + 1}</h4>
              {stepData.experiences.length > 1 && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleRemoveExperience(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remover
                </Button>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Empresa *</Label>
                <Input
                  value={exp.company}
                  onChange={(e) => {
                    const newExperiences = [...stepData.experiences];
                    newExperiences[index].company = e.target.value;
                    setStepData(prev => ({ ...prev, experiences: newExperiences }));
                  }}
                  placeholder="Nome da empresa"
                />
              </div>
              <div>
                <Label>Cargo *</Label>
                <Input
                  value={exp.position}
                  onChange={(e) => {
                    const newExperiences = [...stepData.experiences];
                    newExperiences[index].position = e.target.value;
                    setStepData(prev => ({ ...prev, experiences: newExperiences }));
                  }}
                  placeholder="Desenvolvedor, Analista, etc."
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Data de Início *</Label>
                <Input
                  type="month"
                  value={exp.startDate}
                  onChange={(e) => {
                    const newExperiences = [...stepData.experiences];
                    newExperiences[index].startDate = e.target.value;
                    setStepData(prev => ({ ...prev, experiences: newExperiences }));
                  }}
                />
              </div>
              <div>
                <Label>Data de Fim</Label>
                <Input
                  type="month"
                  value={exp.endDate}
                  disabled={exp.current}
                  onChange={(e) => {
                    const newExperiences = [...stepData.experiences];
                    newExperiences[index].endDate = e.target.value;
                    setStepData(prev => ({ ...prev, experiences: newExperiences }));
                  }}
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Checkbox 
                  id={`current-${index}`}
                  checked={exp.current}
                  onCheckedChange={(checked) => {
                    const newExperiences = [...stepData.experiences];
                    newExperiences[index].current = checked as boolean;
                    if (checked) {
                      newExperiences[index].endDate = "";
                    }
                    setStepData(prev => ({ ...prev, experiences: newExperiences }));
                  }}
                />
                <Label htmlFor={`current-${index}`} className="text-sm">Trabalho atual</Label>
              </div>
            </div>

            <div>
              <Label>Descrição das Atividades</Label>
              <Textarea
                value={exp.description}
                onChange={(e) => {
                  const newExperiences = [...stepData.experiences];
                  newExperiences[index].description = e.target.value;
                  setStepData(prev => ({ ...prev, experiences: newExperiences }));
                }}
                placeholder="Descreva suas principais responsabilidades e conquistas..."
                className="min-h-[80px]"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Projetos Destacados */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Star className="h-5 w-5" />
            Projetos Destacados
          </h3>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={handleAddProject}
          >
            Adicionar Projeto
          </Button>
        </div>

        {stepData.projects.map((project, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex justify-between items-start">
              <h4 className="font-medium">Projeto {index + 1}</h4>
              {stepData.projects.length > 1 && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleRemoveProject(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remover
                </Button>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Nome do Projeto *</Label>
                <Input
                  value={project.name}
                  onChange={(e) => {
                    const newProjects = [...stepData.projects];
                    newProjects[index].name = e.target.value;
                    setStepData(prev => ({ ...prev, projects: newProjects }));
                  }}
                  placeholder="Nome do projeto"
                />
              </div>
              <div>
                <Label>Seu Papel</Label>
                <Input
                  value={project.role}
                  onChange={(e) => {
                    const newProjects = [...stepData.projects];
                    newProjects[index].role = e.target.value;
                    setStepData(prev => ({ ...prev, projects: newProjects }));
                  }}
                  placeholder="Frontend Developer, Tech Lead, etc."
                />
              </div>
            </div>

            <div>
              <Label>Descrição</Label>
              <Textarea
                value={project.description}
                onChange={(e) => {
                  const newProjects = [...stepData.projects];
                  newProjects[index].description = e.target.value;
                  setStepData(prev => ({ ...prev, projects: newProjects }));
                }}
                placeholder="Descreva o projeto, seus objetivos e principais funcionalidades..."
                className="min-h-[80px]"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>GitHub/Repositório</Label>
                <Input
                  type="url"
                  value={project.githubUrl}
                  onChange={(e) => {
                    const newProjects = [...stepData.projects];
                    newProjects[index].githubUrl = e.target.value;
                    setStepData(prev => ({ ...prev, projects: newProjects }));
                  }}
                  placeholder="https://github.com/user/repo"
                />
              </div>
              <div>
                <Label>URL do Projeto</Label>
                <Input
                  type="url"
                  value={project.liveUrl}
                  onChange={(e) => {
                    const newProjects = [...stepData.projects];
                    newProjects[index].liveUrl = e.target.value;
                    setStepData(prev => ({ ...prev, projects: newProjects }));
                  }}
                  placeholder="https://meuapp.com"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TechServicesStep({ data, onDataChange, entityType = 'pf' }: any) {
  const [stepData, setStepData] = useState({
    // Tipos de serviços
    serviceTypes: data.serviceTypes || [], // web-dev, mobile-app, api-dev, consulting, etc
    
    // Pacotes de serviços (modelo similar ao Fiverr)
    packages: data.packages || [
      {
        name: "Básico",
        description: "",
        price: "",
        deliveryDays: "",
        revisions: "1",
        features: [],
        extras: []
      },
      {
        name: "Padrão", 
        description: "",
        price: "",
        deliveryDays: "",
        revisions: "2",
        features: [],
        extras: []
      },
      {
        name: "Premium",
        description: "",
        price: "",
        deliveryDays: "",
        revisions: "Ilimitadas",
        features: [],
        extras: []
      }
    ],
    
    // Modalidades de trabalho
    workModes: data.workModes || [], // remote, onsite, hybrid
    
    // Precificação
    pricingModel: data.pricingModel || "hourly", // hourly, fixed, both
    hourlyRate: data.hourlyRate || "",
    minimumProjectValue: data.minimumProjectValue || "",
    
    // Disponibilidade
    availability: data.availability || "", // full-time, part-time, weekends
    weeklyHours: data.weeklyHours || "",
    
    // Políticas
    refundPolicy: data.refundPolicy || "",
    termsOfService: data.termsOfService || "",
    
    // Extras/Add-ons
    addOns: data.addOns || []
  });

  useEffect(() => {
    onDataChange(stepData);
  }, [stepData]);

  const serviceTypes = [
    { value: "web-dev", label: "Desenvolvimento Web", description: "Sites, web apps, e-commerce" },
    { value: "mobile-app", label: "Aplicativo Mobile", description: "iOS, Android, React Native" },
    { value: "api-dev", label: "Desenvolvimento de API", description: "REST, GraphQL, microserviços" },
    { value: "ui-ux", label: "UI/UX Design", description: "Design de interfaces e experiência" },
    { value: "consulting", label: "Consultoria Técnica", description: "Arquitetura, code review, mentoria" },
    { value: "devops", label: "DevOps/Infraestrutura", description: "CI/CD, cloud, containers" },
    { value: "data-analysis", label: "Análise de Dados", description: "BI, dashboards, ML" },
    { value: "automation", label: "Automação", description: "Scripts, bots, processos" },
    { value: "testing", label: "Testes de Software", description: "QA, testes automatizados" },
    { value: "maintenance", label: "Manutenção de Sistemas", description: "Suporte, correções, updates" }
  ];

  const workModes = [
    { value: "remote", label: "Remoto", icon: "🏠" },
    { value: "onsite", label: "Presencial", icon: "🏢" },
    { value: "hybrid", label: "Híbrido", icon: "🔄" }
  ];

  const availabilityOptions = [
    { value: "full-time", label: "Tempo Integral", description: "40+ horas/semana" },
    { value: "part-time", label: "Meio Período", description: "20-30 horas/semana" },
    { value: "weekends", label: "Fins de Semana", description: "Projetos de fim de semana" },
    { value: "evenings", label: "Noites", description: "Após horário comercial" },
    { value: "flexible", label: "Flexível", description: "Horários negociáveis" }
  ];

  const handlePackageChange = (packageIndex: number, field: string, value: string) => {
    const newPackages = [...stepData.packages];
    newPackages[packageIndex] = { ...newPackages[packageIndex], [field]: value };
    setStepData(prev => ({ ...prev, packages: newPackages }));
  };

  const handlePackageFeatureChange = (packageIndex: number, features: string[]) => {
    const newPackages = [...stepData.packages];
    newPackages[packageIndex] = { ...newPackages[packageIndex], features };
    setStepData(prev => ({ ...prev, packages: newPackages }));
  };

  const toggleArrayItem = (array: string[], item: string, setter: (value: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item));
    } else {
      setter([...array, item]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Informação contextual */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">💼 Serviços e Precificação</h3>
        <p className="text-sm text-muted-foreground">
          Configure seus serviços, pacotes e condições de trabalho.
        </p>
      </div>

      {/* Tipos de Serviços */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Code className="h-5 w-5" />
          Tipos de Serviços que Oferece
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {serviceTypes.map((service) => (
            <div
              key={service.value}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                stepData.serviceTypes.includes(service.value)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleArrayItem(
                stepData.serviceTypes, 
                service.value, 
                (newArray) => setStepData(prev => ({ ...prev, serviceTypes: newArray }))
              )}
            >
              <div className="font-medium">{service.label}</div>
              <div className="text-sm text-muted-foreground">{service.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pacotes de Serviços */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Pacotes de Serviços
        </h3>
        <p className="text-sm text-muted-foreground">
          Configure 3 opções de pacotes para seus clientes (similar ao modelo Fiverr)
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {stepData.packages.map((pkg, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="text-center">
                <h4 className={`text-lg font-semibold ${
                  index === 0 ? 'text-green-600' : 
                  index === 1 ? 'text-blue-600' : 
                  'text-purple-600'
                }`}>
                  {pkg.name}
                </h4>
                <div className="text-xs text-muted-foreground">
                  {index === 0 ? 'Opção mais econômica' : 
                   index === 1 ? 'Melhor custo-benefício' : 
                   'Solução completa'}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label>Descrição do Pacote *</Label>
                  <Textarea
                    value={pkg.description}
                    onChange={(e) => handlePackageChange(index, 'description', e.target.value)}
                    placeholder="Descreva o que está incluído neste pacote..."
                    className="min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Preço (R$) *</Label>
                    <Input
                      type="number"
                      value={pkg.price}
                      onChange={(e) => handlePackageChange(index, 'price', e.target.value)}
                      placeholder="500"
                    />
                  </div>
                  <div>
                    <Label>Prazo (dias) *</Label>
                    <Input
                      type="number"
                      value={pkg.deliveryDays}
                      onChange={(e) => handlePackageChange(index, 'deliveryDays', e.target.value)}
                      placeholder="7"
                    />
                  </div>
                </div>

                <div>
                  <Label>Revisões Incluídas</Label>
                  <Input
                    value={pkg.revisions}
                    onChange={(e) => handlePackageChange(index, 'revisions', e.target.value)}
                    placeholder="2"
                  />
                </div>

                <div>
                  <Label>Funcionalidades Incluídas</Label>
                  <Textarea
                    value={pkg.features.join('\n')}
                    onChange={(e) => handlePackageFeatureChange(index, e.target.value.split('\n').filter(f => f.trim()))}
                    placeholder="Lista uma funcionalidade por linha&#10;Design responsivo&#10;Integração com API&#10;Testes básicos"
                    className="min-h-[100px]"
                  />
                  <p className="text-xs text-muted-foreground">Uma funcionalidade por linha</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modalidades de Trabalho */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Modalidades de Trabalho</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {workModes.map((mode) => (
            <div
              key={mode.value}
              className={`p-4 border rounded-lg cursor-pointer transition-all text-center ${
                stepData.workModes.includes(mode.value)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleArrayItem(
                stepData.workModes, 
                mode.value, 
                (newArray) => setStepData(prev => ({ ...prev, workModes: newArray }))
              )}
            >
              <div className="text-2xl mb-2">{mode.icon}</div>
              <div className="font-medium">{mode.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Precificação */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Precificação</h3>
        
        <div>
          <Label>Modelo de Precificação *</Label>
          <RadioGroup 
            value={stepData.pricingModel}
            onValueChange={(value) => setStepData(prev => ({ ...prev, pricingModel: value }))}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hourly" id="hourly" />
              <Label htmlFor="hourly" className="font-normal">Por hora</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="fixed" id="fixed" />
              <Label htmlFor="fixed" className="font-normal">Por projeto (valor fixo)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="both" id="both" />
              <Label htmlFor="both" className="font-normal">Ambos</Label>
            </div>
          </RadioGroup>
        </div>

        {(stepData.pricingModel === 'hourly' || stepData.pricingModel === 'both') && (
          <div>
            <Label htmlFor="hourlyRate">Valor por Hora (R$) *</Label>
            <Input
              id="hourlyRate"
              type="number"
              min="25"
              max="1000"
              value={stepData.hourlyRate}
              onChange={(e) => setStepData(prev => ({ ...prev, hourlyRate: e.target.value }))}
              placeholder="Ex: 100"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Sugestão para desenvolvedores: R$ 50-300/hora dependendo da experiência
            </p>
          </div>
        )}

        {(stepData.pricingModel === 'fixed' || stepData.pricingModel === 'both') && (
          <div>
            <Label htmlFor="minimumProjectValue">Valor Mínimo de Projeto (R$) *</Label>
            <Input
              id="minimumProjectValue"
              type="number"
              min="100"
              value={stepData.minimumProjectValue}
              onChange={(e) => setStepData(prev => ({ ...prev, minimumProjectValue: e.target.value }))}
              placeholder="Ex: 1000"
            />
          </div>
        )}
      </div>

      {/* Disponibilidade */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Disponibilidade</h3>
        
        <div>
          <Label>Tipo de Disponibilidade *</Label>
          <Select 
            value={stepData.availability} 
            onValueChange={(value) => setStepData(prev => ({ ...prev, availability: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione sua disponibilidade" />
            </SelectTrigger>
            <SelectContent>
              {availabilityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="weeklyHours">Horas por Semana Disponíveis</Label>
          <Input
            id="weeklyHours"
            type="number"
            min="1"
            max="80"
            value={stepData.weeklyHours}
            onChange={(e) => setStepData(prev => ({ ...prev, weeklyHours: e.target.value }))}
            placeholder="Ex: 40"
          />
        </div>
      </div>

      {/* Políticas */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Políticas e Termos</h3>
        
        <div>
          <Label htmlFor="refundPolicy">Política de Reembolso</Label>
          <Textarea
            id="refundPolicy"
            value={stepData.refundPolicy}
            onChange={(e) => setStepData(prev => ({ ...prev, refundPolicy: e.target.value }))}
            placeholder="Descreva sua política de reembolso..."
            className="min-h-[80px]"
          />
        </div>

        <div>
          <Label htmlFor="termsOfService">Termos de Serviço</Label>
          <Textarea
            id="termsOfService"
            value={stepData.termsOfService}
            onChange={(e) => setStepData(prev => ({ ...prev, termsOfService: e.target.value }))}
            placeholder="Descreva suas condições de trabalho, prazos, forma de pagamento..."
            className="min-h-[100px]"
          />
        </div>
      </div>
    </div>
  );
}

function TechCoverageStep({ data, onDataChange, entityType = 'pf' }: any) {
  const [stepData, setStepData] = useState({
    // Modalidades de trabalho
    preferredWorkModes: data.preferredWorkModes || [], // remote, onsite, hybrid
    
    // Disponibilidade temporal
    availability: data.availability || "", // full-time, part-time, freelance, contract
    timeZone: data.timeZone || "America/Sao_Paulo",
    
    // Preferências de projeto
    projectTypes: data.projectTypes || [], // startup, enterprise, agency, government
    projectDuration: data.projectDuration || [], // short-term, medium-term, long-term
    teamSize: data.teamSize || [], // solo, small-team, large-team
    
    // Indústrias de interesse
    preferredIndustries: data.preferredIndustries || [],
    
    // Clientes alvo
    targetClients: data.targetClients || [], // startups, corporations, agencies, individuals
    
    // Localização geográfica (se trabalha presencial)
    workingLocations: data.workingLocations || [],
    willingToTravel: data.willingToTravel || false,
    maxTravelDistance: data.maxTravelDistance || "",
    
    // Comunicação
    languages: data.languages || [{ language: "Português", proficiency: "native" }],
    communicationTools: data.communicationTools || [], // slack, discord, teams, zoom
    
    // Horários de trabalho
    workingHours: data.workingHours || {
      start: "09:00",
      end: "18:00",
      timezone: "America/Sao_Paulo",
      weekends: false,
      holidays: false
    },
    
    // Outras preferências
    minimumNotice: data.minimumNotice || "", // 1-week, 2-weeks, 1-month
    contractPreference: data.contractPreference || "", // short-term, long-term, both
    budgetRange: data.budgetRange || "" // 1k-5k, 5k-20k, 20k+
  });

  useEffect(() => {
    onDataChange(stepData);
  }, [stepData]);

  const workModes = [
    { value: "remote", label: "100% Remoto", description: "Trabalho totalmente remoto", icon: "🏠" },
    { value: "hybrid", label: "Híbrido", description: "Combinação remoto + presencial", icon: "🔄" },
    { value: "onsite", label: "Presencial", description: "Trabalho no local do cliente", icon: "🏢" },
    { value: "flexible", label: "Flexível", description: "Adaptável conforme projeto", icon: "⚡" }
  ];

  const availabilityOptions = [
    { value: "full-time", label: "Tempo Integral", description: "40+ horas/semana, dedicação exclusiva" },
    { value: "part-time", label: "Meio Período", description: "20-30 horas/semana" },
    { value: "freelance", label: "Freelancer", description: "Projetos pontuais, múltiplos clientes" },
    { value: "contract", label: "Contrato", description: "Projetos de duração definida" },
    { value: "flexible", label: "Flexível", description: "Varia conforme oportunidade" }
  ];

  const projectTypes = [
    { value: "startup", label: "Startups", description: "Empresas em crescimento, ambiente dinâmico" },
    { value: "enterprise", label: "Grandes Empresas", description: "Corporações estabelecidas, projetos robustos" },
    { value: "agency", label: "Agências", description: "Agências digitais e de marketing" },
    { value: "government", label: "Governo", description: "Projetos do setor público" },
    { value: "nonprofit", label: "ONGs", description: "Organizações sem fins lucrativos" },
    { value: "education", label: "Educação", description: "Instituições de ensino" }
  ];

  const industries = [
    { value: "fintech", label: "Fintech" },
    { value: "healthtech", label: "Saúde" },
    { value: "edtech", label: "Educação" },
    { value: "ecommerce", label: "E-commerce" },
    { value: "logistics", label: "Logística" },
    { value: "automotive", label: "Automotivo" },
    { value: "entertainment", label: "Entretenimento" },
    { value: "real-estate", label: "Imobiliário" },
    { value: "agriculture", label: "Agronegócio" },
    { value: "energy", label: "Energia" }
  ];

  const communicationTools = [
    "Slack", "Microsoft Teams", "Discord", "Zoom", "Google Meet", 
    "Skype", "WhatsApp", "Telegram", "Email", "Jira", "Trello", "Notion"
  ];

  const brazilianStates = [
    "São Paulo", "Rio de Janeiro", "Minas Gerais", "Bahia", "Paraná", 
    "Rio Grande do Sul", "Pernambuco", "Ceará", "Pará", "Santa Catarina",
    "Maranhão", "Goiás", "Paraíba", "Espírito Santo", "Piauí"
  ];

  const toggleArrayItem = (array: string[], item: string, setter: (value: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item));
    } else {
      setter([...array, item]);
    }
  };

  const handleLanguageChange = (index: number, field: string, value: string) => {
    const newLanguages = [...stepData.languages];
    newLanguages[index] = { ...newLanguages[index], [field]: value };
    setStepData(prev => ({ ...prev, languages: newLanguages }));
  };

  const addLanguage = () => {
    setStepData(prev => ({
      ...prev,
      languages: [...prev.languages, { language: "", proficiency: "basic" }]
    }));
  };

  const removeLanguage = (index: number) => {
    setStepData(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Informação contextual */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">🎯 Preferências e Disponibilidade</h3>
        <p className="text-sm text-muted-foreground">
          Configure suas preferências de trabalho para receber projetos alinhados com seu perfil.
        </p>
      </div>

      {/* Modalidades de Trabalho */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Modalidades de Trabalho Preferidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workModes.map((mode) => (
            <div
              key={mode.value}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                stepData.preferredWorkModes.includes(mode.value)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleArrayItem(
                stepData.preferredWorkModes, 
                mode.value, 
                (newArray) => setStepData(prev => ({ ...prev, preferredWorkModes: newArray }))
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{mode.icon}</span>
                <div>
                  <div className="font-medium">{mode.label}</div>
                  <div className="text-sm text-muted-foreground">{mode.description}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disponibilidade */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Disponibilidade</h3>
        
        <div>
          <Label>Tipo de Disponibilidade *</Label>
          <Select 
            value={stepData.availability} 
            onValueChange={(value) => setStepData(prev => ({ ...prev, availability: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione sua disponibilidade" />
            </SelectTrigger>
            <SelectContent>
              {availabilityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Horário de Início</Label>
            <Input
              type="time"
              value={stepData.workingHours.start}
              onChange={(e) => setStepData(prev => ({
                ...prev,
                workingHours: { ...prev.workingHours, start: e.target.value }
              }))}
            />
          </div>
          <div>
            <Label>Horário de Fim</Label>
            <Input
              type="time"
              value={stepData.workingHours.end}
              onChange={(e) => setStepData(prev => ({
                ...prev,
                workingHours: { ...prev.workingHours, end: e.target.value }
              }))}
            />
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="weekends"
              checked={stepData.workingHours.weekends}
              onCheckedChange={(checked) => setStepData(prev => ({
                ...prev,
                workingHours: { ...prev.workingHours, weekends: checked as boolean }
              }))}
            />
            <Label htmlFor="weekends" className="text-sm">Disponível aos fins de semana</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="holidays"
              checked={stepData.workingHours.holidays}
              onCheckedChange={(checked) => setStepData(prev => ({
                ...prev,
                workingHours: { ...prev.workingHours, holidays: checked as boolean }
              }))}
            />
            <Label htmlFor="holidays" className="text-sm">Disponível em feriados</Label>
          </div>
        </div>
      </div>

      {/* Tipos de Projeto */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Tipos de Projeto Preferidos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {projectTypes.map((type) => (
            <div
              key={type.value}
              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                stepData.projectTypes.includes(type.value)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleArrayItem(
                stepData.projectTypes, 
                type.value, 
                (newArray) => setStepData(prev => ({ ...prev, projectTypes: newArray }))
              )}
            >
              <div className="font-medium">{type.label}</div>
              <div className="text-sm text-muted-foreground">{type.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Indústrias de Interesse */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Indústrias de Interesse</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {industries.map((industry) => (
            <div
              key={industry.value}
              className={`p-2 border rounded cursor-pointer text-sm text-center transition-all ${
                stepData.preferredIndustries.includes(industry.value)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleArrayItem(
                stepData.preferredIndustries, 
                industry.value, 
                (newArray) => setStepData(prev => ({ ...prev, preferredIndustries: newArray }))
              )}
            >
              {industry.label}
            </div>
          ))}
        </div>
      </div>

      {/* Localização (se trabalha presencial) */}
      {stepData.preferredWorkModes.some(mode => ['onsite', 'hybrid'].includes(mode)) && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Localização para Trabalho Presencial</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {brazilianStates.map((state) => (
              <div
                key={state}
                className={`p-2 border rounded cursor-pointer text-sm text-center transition-all ${
                  stepData.workingLocations.includes(state)
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleArrayItem(
                  stepData.workingLocations, 
                  state, 
                  (newArray) => setStepData(prev => ({ ...prev, workingLocations: newArray }))
                )}
              >
                {state}
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="willingToTravel"
                checked={stepData.willingToTravel}
                onCheckedChange={(checked) => setStepData(prev => ({ ...prev, willingToTravel: checked as boolean }))}
              />
              <Label htmlFor="willingToTravel" className="text-sm">Disposto a viajar para projetos</Label>
            </div>

            {stepData.willingToTravel && (
              <div>
                <Label htmlFor="maxTravelDistance">Distância máxima para viagem</Label>
                <Select 
                  value={stepData.maxTravelDistance} 
                  onValueChange={(value) => setStepData(prev => ({ ...prev, maxTravelDistance: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">Mesma cidade</SelectItem>
                    <SelectItem value="state">Mesmo estado</SelectItem>
                    <SelectItem value="region">Mesma região</SelectItem>
                    <SelectItem value="national">Todo o Brasil</SelectItem>
                    <SelectItem value="international">Internacional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Idiomas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Idiomas</h3>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={addLanguage}
          >
            Adicionar Idioma
          </Button>
        </div>

        {stepData.languages.map((lang, index) => (
          <div key={index} className="grid grid-cols-2 md:grid-cols-3 gap-4 items-end">
            <div>
              <Label>Idioma</Label>
              <Input
                value={lang.language}
                onChange={(e) => handleLanguageChange(index, 'language', e.target.value)}
                placeholder="Inglês"
              />
            </div>
            <div>
              <Label>Nível</Label>
              <Select 
                value={lang.proficiency} 
                onValueChange={(value) => handleLanguageChange(index, 'proficiency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Básico</SelectItem>
                  <SelectItem value="intermediate">Intermediário</SelectItem>
                  <SelectItem value="advanced">Avançado</SelectItem>
                  <SelectItem value="fluent">Fluente</SelectItem>
                  <SelectItem value="native">Nativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {stepData.languages.length > 1 && (
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={() => removeLanguage(index)}
                className="text-red-600 hover:text-red-800"
              >
                Remover
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Ferramentas de Comunicação */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Ferramentas de Comunicação</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {communicationTools.map((tool) => (
            <div
              key={tool}
              className={`p-2 border rounded cursor-pointer text-sm text-center transition-all ${
                stepData.communicationTools.includes(tool)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleArrayItem(
                stepData.communicationTools, 
                tool, 
                (newArray) => setStepData(prev => ({ ...prev, communicationTools: newArray }))
              )}
            >
              {tool}
            </div>
          ))}
        </div>
      </div>

      {/* Preferências de Contrato */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Preferências de Contrato</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Aviso Mínimo para Início</Label>
            <Select 
              value={stepData.minimumNotice} 
              onValueChange={(value) => setStepData(prev => ({ ...prev, minimumNotice: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Imediato</SelectItem>
                <SelectItem value="1-week">1 semana</SelectItem>
                <SelectItem value="2-weeks">2 semanas</SelectItem>
                <SelectItem value="1-month">1 mês</SelectItem>
                <SelectItem value="2-months">2 meses</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Duração de Contrato Preferida</Label>
            <Select 
              value={stepData.contractPreference} 
              onValueChange={(value) => setStepData(prev => ({ ...prev, contractPreference: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short-term">Curto prazo (até 3 meses)</SelectItem>
                <SelectItem value="medium-term">Médio prazo (3-12 meses)</SelectItem>
                <SelectItem value="long-term">Longo prazo (1+ ano)</SelectItem>
                <SelectItem value="both">Flexível</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Faixa de Orçamento de Projetos</Label>
          <Select 
            value={stepData.budgetRange} 
            onValueChange={(value) => setStepData(prev => ({ ...prev, budgetRange: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a faixa que te interessa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1k-5k">R$ 1.000 - R$ 5.000</SelectItem>
              <SelectItem value="5k-20k">R$ 5.000 - R$ 20.000</SelectItem>
              <SelectItem value="20k-50k">R$ 20.000 - R$ 50.000</SelectItem>
              <SelectItem value="50k+">R$ 50.000+</SelectItem>
              <SelectItem value="any">Qualquer valor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

function BusinessProfessionalStep({ data, onDataChange, entityType = 'pf' }: any) {
  const [stepData, setStepData] = useState({
    // Informações básicas do profissional
    professionalTitle: data.professionalTitle || "",
    bio: data.bio || "",
    yearsOfExperience: data.yearsOfExperience || "",
    
    // Área de atuação principal
    businessArea: data.businessArea || "", // consulting, legal, accounting, management, marketing, finance
    specializations: data.specializations || [], // Array de especializações
    
    // Formação acadêmica
    education: data.education || [
      {
        degree: "",
        institution: "",
        field: "",
        year: "",
        ongoing: false
      }
    ],
    
    // Certificações e licenças
    certifications: data.certifications || [
      {
        name: "",
        issuer: "",
        issueDate: "",
        expirationDate: "",
        credentialId: "",
        verificationUrl: ""
      }
    ],
    
    // Links profissionais
    linkedinUrl: data.linkedinUrl || "",
    websiteUrl: data.websiteUrl || "",
    portfolioUrl: data.portfolioUrl || "",
    
    // Dados específicos para PJ
    ...(entityType === 'pj' && {
      companyName: data.companyName || "",
      cnpj: data.cnpj || "",
      businessType: data.businessType || "", // consultoria, escritorio, empresa
      foundingYear: data.foundingYear || "",
      teamSize: data.teamSize || "",
      companyDescription: data.companyDescription || "",
      businessRegistration: data.businessRegistration || "", // OAB, CRC, etc.
      responsibleProfessional: data.responsibleProfessional || {
        name: "",
        document: "",
        professionalId: ""
      }
    }),
    
    // Idiomas
    languages: data.languages || [{ language: "Português", proficiency: "native" }],
    
    // Metodologias e ferramentas
    methodologies: data.methodologies || [], // lean, agile, six-sigma, etc
    tools: data.tools || [] // CRM, ERP, BI, etc
  });

  useEffect(() => {
    onDataChange(stepData);
  }, [stepData]);

  const businessAreas = [
    { value: "consulting", label: "Consultoria Empresarial", description: "Estratégia, processos, transformação digital" },
    { value: "legal", label: "Jurídico", description: "Advocacia, assessoria jurídica" },
    { value: "accounting", label: "Contabilidade", description: "Contabilidade, auditoria, fiscal" },
    { value: "finance", label: "Finanças", description: "Gestão financeira, investimentos, controladoria" },
    { value: "management", label: "Gestão", description: "Administração, RH, operações" },
    { value: "marketing", label: "Marketing", description: "Marketing digital, branding, comunicação" },
    { value: "sales", label: "Vendas", description: "Desenvolvimento comercial, business development" },
    { value: "operations", label: "Operações", description: "Logística, supply chain, qualidade" },
    { value: "technology", label: "Tecnologia de Negócios", description: "CIO, transformação digital, TI" },
    { value: "other", label: "Outros", description: "Outras áreas de negócios" }
  ];

  const getSpecializationsByArea = (area: string) => {
    const specializations = {
      consulting: ["Estratégia Corporativa", "Transformação Digital", "Processos", "Lean Six Sigma", "Change Management", "Inovação"],
      legal: ["Direito Empresarial", "Direito Trabalhista", "Direito Tributário", "Contratos", "Propriedade Intelectual", "Compliance"],
      accounting: ["Contabilidade Gerencial", "Auditoria", "Controladoria", "Planejamento Tributário", "IFRS", "Perícia Contábil"],
      finance: ["Gestão Financeira", "Controladoria", "Investimentos", "Fusões e Aquisições", "Valuation", "Mercado de Capitais"],
      management: ["Gestão de Pessoas", "Liderança", "Gestão de Projetos", "Operações", "Qualidade", "Estratégia"],
      marketing: ["Marketing Digital", "Branding", "Growth Hacking", "Performance Marketing", "Content Marketing", "Social Media"],
      sales: ["Vendas B2B", "Vendas B2C", "Business Development", "Account Management", "Inside Sales", "Channel Management"],
      operations: ["Supply Chain", "Logística", "Qualidade", "Lean Manufacturing", "Gestão da Produção", "Melhoria Contínua"],
      technology: ["Governança de TI", "Transformação Digital", "Segurança da Informação", "Gestão de Dados", "Cloud Computing", "Innovation Management"],
      other: []
    };
    return specializations[area as keyof typeof specializations] || [];
  };

  const businessTypes = [
    { value: "consultoria", label: "Consultoria" },
    { value: "escritorio", label: "Escritório" },
    { value: "empresa", label: "Empresa" },
    { value: "holding", label: "Holding" },
    { value: "startup", label: "Startup" },
    { value: "organizacao", label: "Organização" }
  ];

  const teamSizes = [
    { value: "1", label: "Apenas eu" },
    { value: "2-5", label: "2-5 pessoas" },
    { value: "6-15", label: "6-15 pessoas" },
    { value: "16-50", label: "16-50 pessoas" },
    { value: "51+", label: "Mais de 50 pessoas" }
  ];

  const methodologies = [
    "Agile", "Scrum", "Lean", "Six Sigma", "Design Thinking", "OKR", 
    "Balanced Scorecard", "PDCA", "5S", "Kaizen", "Kanban", "PMI"
  ];

  const businessTools = [
    "CRM (Salesforce, HubSpot)", "ERP (SAP, Oracle)", "BI (Power BI, Tableau)", 
    "Project Management (MS Project, Asana)", "Analytics (Google Analytics)", 
    "Automation (Zapier, Power Automate)", "Financial (QuickBooks, Sage)",
    "Legal (Projuris, Themis)"
  ];

  const handleEducationChange = (index: number, field: string, value: string | boolean) => {
    const newEducation = [...stepData.education];
    newEducation[index] = { ...newEducation[index], [field]: value };
    setStepData(prev => ({ ...prev, education: newEducation }));
  };

  const addEducation = () => {
    setStepData(prev => ({
      ...prev,
      education: [...prev.education, { degree: "", institution: "", field: "", year: "", ongoing: false }]
    }));
  };

  const removeEducation = (index: number) => {
    if (stepData.education.length > 1) {
      setStepData(prev => ({
        ...prev,
        education: prev.education.filter((_, i) => i !== index)
      }));
    }
  };

  const handleCertificationChange = (index: number, field: string, value: string) => {
    const newCertifications = [...stepData.certifications];
    newCertifications[index] = { ...newCertifications[index], [field]: value };
    setStepData(prev => ({ ...prev, certifications: newCertifications }));
  };

  const addCertification = () => {
    setStepData(prev => ({
      ...prev,
      certifications: [...prev.certifications, { 
        name: "", issuer: "", issueDate: "", expirationDate: "", credentialId: "", verificationUrl: "" 
      }]
    }));
  };

  const removeCertification = (index: number) => {
    if (stepData.certifications.length > 1) {
      setStepData(prev => ({
        ...prev,
        certifications: prev.certifications.filter((_, i) => i !== index)
      }));
    }
  };

  const handleLanguageChange = (index: number, field: string, value: string) => {
    const newLanguages = [...stepData.languages];
    newLanguages[index] = { ...newLanguages[index], [field]: value };
    setStepData(prev => ({ ...prev, languages: newLanguages }));
  };

  const addLanguage = () => {
    setStepData(prev => ({
      ...prev,
      languages: [...prev.languages, { language: "", proficiency: "basic" }]
    }));
  };

  const removeLanguage = (index: number) => {
    if (stepData.languages.length > 1) {
      setStepData(prev => ({
        ...prev,
        languages: prev.languages.filter((_, i) => i !== index)
      }));
    }
  };

  const toggleArrayItem = (array: string[], item: string, setter: (value: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item));
    } else {
      setter([...array, item]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Informação contextual */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">💼 Perfil Profissional de Negócios</h3>
        <p className="text-sm text-muted-foreground">
          Configure seu perfil profissional {entityType === 'pj' ? 'empresarial' : 'individual'} na área de negócios.
        </p>
      </div>

      {/* Informações Básicas */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <User className="h-5 w-5" />
          Informações Básicas
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="professionalTitle">Título Profissional *</Label>
            <Input
              id="professionalTitle"
              value={stepData.professionalTitle}
              onChange={(e) => setStepData(prev => ({ ...prev, professionalTitle: e.target.value }))}
              placeholder="Consultor Empresarial, Advogado, Contador..."
            />
          </div>
          <div>
            <Label htmlFor="yearsOfExperience">Anos de Experiência *</Label>
            <Select 
              value={stepData.yearsOfExperience} 
              onValueChange={(value) => setStepData(prev => ({ ...prev, yearsOfExperience: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-2">1-2 anos</SelectItem>
                <SelectItem value="3-5">3-5 anos</SelectItem>
                <SelectItem value="6-10">6-10 anos</SelectItem>
                <SelectItem value="11-15">11-15 anos</SelectItem>
                <SelectItem value="16+">16+ anos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="bio">Descrição Profissional *</Label>
          <Textarea
            id="bio"
            value={stepData.bio}
            onChange={(e) => setStepData(prev => ({ ...prev, bio: e.target.value }))}
            placeholder="Descreva sua experiência, metodologia de trabalho e principais resultados obtidos..."
            className="min-h-[120px]"
          />
        </div>
      </div>

      {/* Dados da Empresa (apenas para PJ) */}
      {entityType === 'pj' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Dados da Empresa
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName">Nome da Empresa *</Label>
              <Input
                id="companyName"
                value={stepData.companyName}
                onChange={(e) => setStepData(prev => ({ ...prev, companyName: e.target.value }))}
                placeholder="Nome fantasia da empresa"
              />
            </div>
            <ValidatedInput
              label="CNPJ"
              fieldName="cnpj"
              entityType="pj"
              value={stepData.cnpj}
              onChange={(e) => setStepData(prev => ({ ...prev, cnpj: e.target.value }))}
              placeholder="00.000.000/0000-00"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="businessType">Tipo de Negócio *</Label>
              <Select 
                value={stepData.businessType} 
                onValueChange={(value) => setStepData(prev => ({ ...prev, businessType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="teamSize">Tamanho da Equipe</Label>
              <Select 
                value={stepData.teamSize} 
                onValueChange={(value) => setStepData(prev => ({ ...prev, teamSize: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {teamSizes.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="foundingYear">Ano de Fundação</Label>
              <Input
                id="foundingYear"
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                value={stepData.foundingYear}
                onChange={(e) => setStepData(prev => ({ ...prev, foundingYear: e.target.value }))}
                placeholder="2020"
              />
            </div>
            <div>
              <Label htmlFor="businessRegistration">Registro Profissional</Label>
              <Input
                id="businessRegistration"
                value={stepData.businessRegistration}
                onChange={(e) => setStepData(prev => ({ ...prev, businessRegistration: e.target.value }))}
                placeholder="OAB, CRC, CREA, etc."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="companyDescription">Descrição da Empresa</Label>
            <Textarea
              id="companyDescription"
              value={stepData.companyDescription}
              onChange={(e) => setStepData(prev => ({ ...prev, companyDescription: e.target.value }))}
              placeholder="Descreva os serviços da empresa, missão, visão e valores..."
              className="min-h-[100px]"
            />
          </div>
        </div>
      )}

      {/* Área de Atuação */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Área de Atuação</h3>
        
        <div>
          <Label>Área Principal *</Label>
          <Select 
            value={stepData.businessArea} 
            onValueChange={(value) => setStepData(prev => ({ ...prev, businessArea: value, specializations: [] }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione sua área principal" />
            </SelectTrigger>
            <SelectContent>
              {businessAreas.map((area) => (
                <SelectItem key={area.value} value={area.value}>
                  <div>
                    <div className="font-medium">{area.label}</div>
                    <div className="text-xs text-muted-foreground">{area.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {stepData.businessArea && getSpecializationsByArea(stepData.businessArea).length > 0 && (
          <div>
            <Label>Especializações</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {getSpecializationsByArea(stepData.businessArea).map((spec) => (
                <div
                  key={spec}
                  className={`p-2 border rounded cursor-pointer text-sm text-center transition-all ${
                    stepData.specializations.includes(spec)
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleArrayItem(
                    stepData.specializations, 
                    spec, 
                    (newArray) => setStepData(prev => ({ ...prev, specializations: newArray }))
                  )}
                >
                  {spec}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Links Profissionais */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Links Profissionais</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="linkedinUrl">LinkedIn</Label>
            <Input
              id="linkedinUrl"
              type="url"
              value={stepData.linkedinUrl}
              onChange={(e) => setStepData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
              placeholder="https://linkedin.com/in/seuperfil"
            />
          </div>
          <div>
            <Label htmlFor="websiteUrl">Website/Blog</Label>
            <Input
              id="websiteUrl"
              type="url"
              value={stepData.websiteUrl}
              onChange={(e) => setStepData(prev => ({ ...prev, websiteUrl: e.target.value }))}
              placeholder="https://seusite.com"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="portfolioUrl">Portfólio/Cases</Label>
          <Input
            id="portfolioUrl"
            type="url"
            value={stepData.portfolioUrl}
            onChange={(e) => setStepData(prev => ({ ...prev, portfolioUrl: e.target.value }))}
            placeholder="https://portfolio.com ou link para apresentação"
          />
        </div>
      </div>

      {/* Formação Acadêmica */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Formação Acadêmica</h3>
          <Button type="button" variant="outline" size="sm" onClick={addEducation}>
            Adicionar Formação
          </Button>
        </div>

        {stepData.education.map((edu, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="text-md font-medium">Formação {index + 1}</h4>
              {stepData.education.length > 1 && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => removeEducation(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remover
                </Button>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Grau *</Label>
                <Select 
                  value={edu.degree} 
                  onValueChange={(value) => handleEducationChange(index, 'degree', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tecnologo">Tecnólogo</SelectItem>
                    <SelectItem value="bacharelado">Bacharelado</SelectItem>
                    <SelectItem value="licenciatura">Licenciatura</SelectItem>
                    <SelectItem value="especializacao">Especialização</SelectItem>
                    <SelectItem value="mba">MBA</SelectItem>
                    <SelectItem value="mestrado">Mestrado</SelectItem>
                    <SelectItem value="doutorado">Doutorado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Instituição *</Label>
                <Input
                  value={edu.institution}
                  onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                  placeholder="Nome da instituição"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Curso/Área *</Label>
                <Input
                  value={edu.field}
                  onChange={(e) => handleEducationChange(index, 'field', e.target.value)}
                  placeholder="Administração, Direito, Contabilidade..."
                />
              </div>
              <div>
                <Label>Ano de Conclusão</Label>
                <Input
                  type="number"
                  min="1950"
                  max={new Date().getFullYear() + 10}
                  value={edu.year}
                  onChange={(e) => handleEducationChange(index, 'year', e.target.value)}
                  placeholder="2024"
                  disabled={edu.ongoing}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id={`ongoing-${index}`}
                checked={edu.ongoing}
                onCheckedChange={(checked) => handleEducationChange(index, 'ongoing', checked as boolean)}
              />
              <Label htmlFor={`ongoing-${index}`} className="text-sm">Em andamento</Label>
            </div>
          </div>
        ))}
      </div>

      {/* Metodologias e Ferramentas */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Metodologias e Ferramentas</h3>
        
        <div>
          <Label>Metodologias de Trabalho</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
            {methodologies.map((method) => (
              <div
                key={method}
                className={`p-2 border rounded cursor-pointer text-sm text-center transition-all ${
                  stepData.methodologies.includes(method)
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleArrayItem(
                  stepData.methodologies, 
                  method, 
                  (newArray) => setStepData(prev => ({ ...prev, methodologies: newArray }))
                )}
              >
                {method}
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>Ferramentas e Sistemas</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
            {businessTools.map((tool) => (
              <div
                key={tool}
                className={`p-2 border rounded cursor-pointer text-sm text-center transition-all ${
                  stepData.tools.includes(tool)
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleArrayItem(
                  stepData.tools, 
                  tool, 
                  (newArray) => setStepData(prev => ({ ...prev, tools: newArray }))
                )}
              >
                {tool}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Idiomas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Idiomas</h3>
          <Button type="button" variant="outline" size="sm" onClick={addLanguage}>
            Adicionar Idioma
          </Button>
        </div>

        {stepData.languages.map((lang, index) => (
          <div key={index} className="grid grid-cols-2 md:grid-cols-3 gap-4 items-end">
            <div>
              <Label>Idioma</Label>
              <Input
                value={lang.language}
                onChange={(e) => handleLanguageChange(index, 'language', e.target.value)}
                placeholder="Inglês"
              />
            </div>
            <div>
              <Label>Nível</Label>
              <Select 
                value={lang.proficiency} 
                onValueChange={(value) => handleLanguageChange(index, 'proficiency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Básico</SelectItem>
                  <SelectItem value="intermediate">Intermediário</SelectItem>
                  <SelectItem value="advanced">Avançado</SelectItem>
                  <SelectItem value="fluent">Fluente</SelectItem>
                  <SelectItem value="native">Nativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {stepData.languages.length > 1 && (
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={() => removeLanguage(index)}
                className="text-red-600 hover:text-red-800"
              >
                Remover
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function BusinessCredentialsStep({ data, onDataChange, entityType = 'pf' }: any) {
  const [stepData, setStepData] = useState({
    // Certificações e licenças
    certifications: data.certifications || [
      {
        name: "",
        issuer: "",
        issueDate: "",
        expirationDate: "",
        credentialId: "",
        verificationUrl: "",
        category: ""
      }
    ],
    
    // Experiências profissionais
    experiences: data.experiences || [
      {
        position: "",
        company: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
        achievements: [],
        location: "",
        employmentType: ""
      }
    ],
    
    // Cases de sucesso e projetos
    projects: data.projects || [
      {
        title: "",
        client: "",
        description: "",
        startDate: "",
        endDate: "",
        results: "",
        testimonial: "",
        category: "",
        budget: "",
        technologies: []
      }
    ],

    // Reconhecimentos e prêmios
    awards: data.awards || [
      {
        title: "",
        issuer: "",
        date: "",
        description: "",
        url: ""
      }
    ],

    // Publicações e artigos
    publications: data.publications || [
      {
        title: "",
        publisher: "",
        date: "",
        url: "",
        type: ""
      }
    ],

    // Avaliações e referências
    references: data.references || [
      {
        name: "",
        position: "",
        company: "",
        email: "",
        phone: "",
        relationship: ""
      }
    ],

    // Upload de documentos
    documents: data.documents || {}
  });

  useEffect(() => {
    onDataChange(stepData);
  }, [stepData]);

  const certificationCategories = [
    { value: "professional", label: "Registro Profissional" },
    { value: "technical", label: "Certificação Técnica" },
    { value: "management", label: "Gestão" },
    { value: "digital", label: "Marketing Digital" },
    { value: "finance", label: "Finanças" },
    { value: "legal", label: "Jurídico" },
    { value: "quality", label: "Qualidade" },
    { value: "other", label: "Outros" }
  ];

  const employmentTypes = [
    { value: "full-time", label: "Tempo Integral" },
    { value: "part-time", label: "Meio Período" },
    { value: "contract", label: "Contrato" },
    { value: "freelance", label: "Freelancer" },
    { value: "consultant", label: "Consultor" },
    { value: "intern", label: "Estágio" }
  ];

  const projectCategories = [
    { value: "strategy", label: "Estratégia" },
    { value: "consulting", label: "Consultoria" },
    { value: "implementation", label: "Implementação" },
    { value: "training", label: "Treinamento" },
    { value: "audit", label: "Auditoria" },
    { value: "legal", label: "Jurídico" },
    { value: "financial", label: "Financeiro" },
    { value: "marketing", label: "Marketing" },
    { value: "operations", label: "Operações" },
    { value: "other", label: "Outros" }
  ];

  const publicationTypes = [
    { value: "article", label: "Artigo" },
    { value: "book", label: "Livro" },
    { value: "whitepaper", label: "Whitepaper" },
    { value: "case-study", label: "Estudo de Caso" },
    { value: "blog-post", label: "Post de Blog" },
    { value: "research", label: "Pesquisa" },
    { value: "presentation", label: "Apresentação" }
  ];

  const relationshipTypes = [
    { value: "client", label: "Cliente" },
    { value: "colleague", label: "Colega" },
    { value: "supervisor", label: "Supervisor" },
    { value: "subordinate", label: "Subordinado" },
    { value: "partner", label: "Parceiro" },
    { value: "supplier", label: "Fornecedor" }
  ];

  // Handlers para certificações
  const handleCertificationChange = (index: number, field: string, value: string) => {
    const newCertifications = [...stepData.certifications];
    newCertifications[index] = { ...newCertifications[index], [field]: value };
    setStepData(prev => ({ ...prev, certifications: newCertifications }));
  };

  const addCertification = () => {
    setStepData(prev => ({
      ...prev,
      certifications: [...prev.certifications, { 
        name: "", issuer: "", issueDate: "", expirationDate: "", credentialId: "", verificationUrl: "", category: "" 
      }]
    }));
  };

  const removeCertification = (index: number) => {
    if (stepData.certifications.length > 1) {
      setStepData(prev => ({
        ...prev,
        certifications: prev.certifications.filter((_, i) => i !== index)
      }));
    }
  };

  // Handlers para experiências
  const handleExperienceChange = (index: number, field: string, value: string | boolean | string[]) => {
    const newExperiences = [...stepData.experiences];
    newExperiences[index] = { ...newExperiences[index], [field]: value };
    setStepData(prev => ({ ...prev, experiences: newExperiences }));
  };

  const addExperience = () => {
    setStepData(prev => ({
      ...prev,
      experiences: [...prev.experiences, { 
        position: "", company: "", startDate: "", endDate: "", current: false,
        description: "", achievements: [], location: "", employmentType: ""
      }]
    }));
  };

  const removeExperience = (index: number) => {
    if (stepData.experiences.length > 1) {
      setStepData(prev => ({
        ...prev,
        experiences: prev.experiences.filter((_, i) => i !== index)
      }));
    }
  };

  // Handlers para projetos
  const handleProjectChange = (index: number, field: string, value: string | string[]) => {
    const newProjects = [...stepData.projects];
    newProjects[index] = { ...newProjects[index], [field]: value };
    setStepData(prev => ({ ...prev, projects: newProjects }));
  };

  const addProject = () => {
    setStepData(prev => ({
      ...prev,
      projects: [...prev.projects, { 
        title: "", client: "", description: "", startDate: "", endDate: "",
        results: "", testimonial: "", category: "", budget: "", technologies: []
      }]
    }));
  };

  const removeProject = (index: number) => {
    if (stepData.projects.length > 1) {
      setStepData(prev => ({
        ...prev,
        projects: prev.projects.filter((_, i) => i !== index)
      }));
    }
  };

  // Handlers para prêmios
  const handleAwardChange = (index: number, field: string, value: string) => {
    const newAwards = [...stepData.awards];
    newAwards[index] = { ...newAwards[index], [field]: value };
    setStepData(prev => ({ ...prev, awards: newAwards }));
  };

  const addAward = () => {
    setStepData(prev => ({
      ...prev,
      awards: [...prev.awards, { title: "", issuer: "", date: "", description: "", url: "" }]
    }));
  };

  const removeAward = (index: number) => {
    if (stepData.awards.length > 1) {
      setStepData(prev => ({
        ...prev,
        awards: prev.awards.filter((_, i) => i !== index)
      }));
    }
  };

  // Handlers para publicações
  const handlePublicationChange = (index: number, field: string, value: string) => {
    const newPublications = [...stepData.publications];
    newPublications[index] = { ...newPublications[index], [field]: value };
    setStepData(prev => ({ ...prev, publications: newPublications }));
  };

  const addPublication = () => {
    setStepData(prev => ({
      ...prev,
      publications: [...prev.publications, { title: "", publisher: "", date: "", url: "", type: "" }]
    }));
  };

  const removePublication = (index: number) => {
    if (stepData.publications.length > 1) {
      setStepData(prev => ({
        ...prev,
        publications: prev.publications.filter((_, i) => i !== index)
      }));
    }
  };

  // Handlers para referências
  const handleReferenceChange = (index: number, field: string, value: string) => {
    const newReferences = [...stepData.references];
    newReferences[index] = { ...newReferences[index], [field]: value };
    setStepData(prev => ({ ...prev, references: newReferences }));
  };

  const addReference = () => {
    setStepData(prev => ({
      ...prev,
      references: [...prev.references, { 
        name: "", position: "", company: "", email: "", phone: "", relationship: ""
      }]
    }));
  };

  const removeReference = (index: number) => {
    if (stepData.references.length > 1) {
      setStepData(prev => ({
        ...prev,
        references: prev.references.filter((_, i) => i !== index)
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Informação contextual */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">🏆 Credenciais e Experiência</h3>
        <p className="text-sm text-muted-foreground">
          Adicione suas certificações, experiências profissionais e cases de sucesso para fortalecer seu perfil.
        </p>
      </div>

      {/* Certificações */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Award className="h-5 w-5" />
            Certificações e Licenças
          </h3>
          <Button type="button" variant="outline" size="sm" onClick={addCertification}>
            Adicionar Certificação
          </Button>
        </div>

        {stepData.certifications.map((cert, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="text-md font-medium">Certificação {index + 1}</h4>
              {stepData.certifications.length > 1 && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => removeCertification(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remover
                </Button>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Nome da Certificação *</Label>
                <Input
                  value={cert.name}
                  onChange={(e) => handleCertificationChange(index, 'name', e.target.value)}
                  placeholder="Ex: OAB, CRC, PMP, etc."
                />
              </div>
              <div>
                <Label>Categoria</Label>
                <Select 
                  value={cert.category} 
                  onValueChange={(value) => handleCertificationChange(index, 'category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {certificationCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Emissor/Órgão</Label>
                <Input
                  value={cert.issuer}
                  onChange={(e) => handleCertificationChange(index, 'issuer', e.target.value)}
                  placeholder="Ex: Conselho Federal de Administração"
                />
              </div>
              <div>
                <Label>ID da Credencial</Label>
                <Input
                  value={cert.credentialId}
                  onChange={(e) => handleCertificationChange(index, 'credentialId', e.target.value)}
                  placeholder="Número de registro ou ID"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Data de Emissão</Label>
                <Input
                  type="date"
                  value={cert.issueDate}
                  onChange={(e) => handleCertificationChange(index, 'issueDate', e.target.value)}
                />
              </div>
              <div>
                <Label>Data de Expiração</Label>
                <Input
                  type="date"
                  value={cert.expirationDate}
                  onChange={(e) => handleCertificationChange(index, 'expirationDate', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>URL de Verificação</Label>
              <Input
                type="url"
                value={cert.verificationUrl}
                onChange={(e) => handleCertificationChange(index, 'verificationUrl', e.target.value)}
                placeholder="Link para verificação da certificação"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Experiências Profissionais */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Experiências Profissionais
          </h3>
          <Button type="button" variant="outline" size="sm" onClick={addExperience}>
            Adicionar Experiência
          </Button>
        </div>

        {stepData.experiences.map((exp, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="text-md font-medium">Experiência {index + 1}</h4>
              {stepData.experiences.length > 1 && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => removeExperience(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remover
                </Button>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Cargo/Posição *</Label>
                <Input
                  value={exp.position}
                  onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                  placeholder="Ex: Consultor Sênior"
                />
              </div>
              <div>
                <Label>Empresa *</Label>
                <Input
                  value={exp.company}
                  onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                  placeholder="Nome da empresa"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Tipo de Vínculo</Label>
                <Select 
                  value={exp.employmentType} 
                  onValueChange={(value) => handleExperienceChange(index, 'employmentType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {employmentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Data de Início</Label>
                <Input
                  type="date"
                  value={exp.startDate}
                  onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                />
              </div>
              <div>
                <Label>Data de Fim</Label>
                <Input
                  type="date"
                  value={exp.endDate}
                  onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                  disabled={exp.current}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id={`current-${index}`}
                checked={exp.current}
                onCheckedChange={(checked) => handleExperienceChange(index, 'current', checked as boolean)}
              />
              <Label htmlFor={`current-${index}`} className="text-sm">Trabalho atual</Label>
            </div>

            <div>
              <Label>Localização</Label>
              <Input
                value={exp.location}
                onChange={(e) => handleExperienceChange(index, 'location', e.target.value)}
                placeholder="Ex: São Paulo, SP"
              />
            </div>

            <div>
              <Label>Descrição das Atividades</Label>
              <Textarea
                value={exp.description}
                onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                placeholder="Descreva suas principais responsabilidades e atividades..."
                className="min-h-[100px]"
              />
            </div>

            <div>
              <Label>Principais Conquistas</Label>
              <Textarea
                value={exp.achievements.join('\n')}
                onChange={(e) => handleExperienceChange(index, 'achievements', e.target.value.split('\n').filter(a => a.trim()))}
                placeholder="Liste suas principais realizações (uma por linha)&#10;Aumentou vendas em 30%&#10;Implementou novo processo&#10;Liderou equipe de 10 pessoas"
                className="min-h-[80px]"
              />
              <p className="text-xs text-muted-foreground">Uma conquista por linha</p>
            </div>
          </div>
        ))}
      </div>

      {/* Cases de Sucesso/Projetos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Star className="h-5 w-5" />
            Cases de Sucesso e Projetos
          </h3>
          <Button type="button" variant="outline" size="sm" onClick={addProject}>
            Adicionar Projeto
          </Button>
        </div>

        {stepData.projects.map((project, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="text-md font-medium">Projeto {index + 1}</h4>
              {stepData.projects.length > 1 && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => removeProject(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remover
                </Button>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Título do Projeto *</Label>
                <Input
                  value={project.title}
                  onChange={(e) => handleProjectChange(index, 'title', e.target.value)}
                  placeholder="Nome do projeto ou case"
                />
              </div>
              <div>
                <Label>Cliente/Empresa</Label>
                <Input
                  value={project.client}
                  onChange={(e) => handleProjectChange(index, 'client', e.target.value)}
                  placeholder="Nome do cliente (pode ser confidencial)"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Categoria</Label>
                <Select 
                  value={project.category} 
                  onValueChange={(value) => handleProjectChange(index, 'category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Data de Início</Label>
                <Input
                  type="date"
                  value={project.startDate}
                  onChange={(e) => handleProjectChange(index, 'startDate', e.target.value)}
                />
              </div>
              <div>
                <Label>Data de Conclusão</Label>
                <Input
                  type="date"
                  value={project.endDate}
                  onChange={(e) => handleProjectChange(index, 'endDate', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Orçamento do Projeto</Label>
              <Select 
                value={project.budget} 
                onValueChange={(value) => handleProjectChange(index, 'budget', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a faixa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1k-10k">R$ 1.000 - R$ 10.000</SelectItem>
                  <SelectItem value="10k-50k">R$ 10.000 - R$ 50.000</SelectItem>
                  <SelectItem value="50k-100k">R$ 50.000 - R$ 100.000</SelectItem>
                  <SelectItem value="100k-500k">R$ 100.000 - R$ 500.000</SelectItem>
                  <SelectItem value="500k+">R$ 500.000+</SelectItem>
                  <SelectItem value="confidential">Confidencial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Descrição do Projeto</Label>
              <Textarea
                value={project.description}
                onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                placeholder="Descreva o contexto, desafios e sua abordagem..."
                className="min-h-[100px]"
              />
            </div>

            <div>
              <Label>Resultados Obtidos</Label>
              <Textarea
                value={project.results}
                onChange={(e) => handleProjectChange(index, 'results', e.target.value)}
                placeholder="Descreva os resultados quantitativos e qualitativos alcançados..."
                className="min-h-[80px]"
              />
            </div>

            <div>
              <Label>Depoimento do Cliente</Label>
              <Textarea
                value={project.testimonial}
                onChange={(e) => handleProjectChange(index, 'testimonial', e.target.value)}
                placeholder="Depoimento ou feedback positivo do cliente (opcional)"
                className="min-h-[60px]"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Reconhecimentos e Prêmios */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Reconhecimentos e Prêmios
          </h3>
          <Button type="button" variant="outline" size="sm" onClick={addAward}>
            Adicionar Prêmio
          </Button>
        </div>

        {stepData.awards.map((award, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="text-md font-medium">Prêmio {index + 1}</h4>
              {stepData.awards.length > 1 && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => removeAward(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remover
                </Button>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Título do Prêmio</Label>
                <Input
                  value={award.title}
                  onChange={(e) => handleAwardChange(index, 'title', e.target.value)}
                  placeholder="Nome do prêmio ou reconhecimento"
                />
              </div>
              <div>
                <Label>Emissor/Organização</Label>
                <Input
                  value={award.issuer}
                  onChange={(e) => handleAwardChange(index, 'issuer', e.target.value)}
                  placeholder="Quem concedeu o prêmio"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Data</Label>
                <Input
                  type="date"
                  value={award.date}
                  onChange={(e) => handleAwardChange(index, 'date', e.target.value)}
                />
              </div>
              <div>
                <Label>URL de Verificação</Label>
                <Input
                  type="url"
                  value={award.url}
                  onChange={(e) => handleAwardChange(index, 'url', e.target.value)}
                  placeholder="Link para verificação ou notícia"
                />
              </div>
            </div>

            <div>
              <Label>Descrição</Label>
              <Textarea
                value={award.description}
                onChange={(e) => handleAwardChange(index, 'description', e.target.value)}
                placeholder="Descrição do prêmio e critérios..."
                className="min-h-[60px]"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Publicações */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Publicações e Artigos
          </h3>
          <Button type="button" variant="outline" size="sm" onClick={addPublication}>
            Adicionar Publicação
          </Button>
        </div>

        {stepData.publications.map((pub, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="text-md font-medium">Publicação {index + 1}</h4>
              {stepData.publications.length > 1 && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => removePublication(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remover
                </Button>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Título</Label>
                <Input
                  value={pub.title}
                  onChange={(e) => handlePublicationChange(index, 'title', e.target.value)}
                  placeholder="Título da publicação"
                />
              </div>
              <div>
                <Label>Tipo</Label>
                <Select 
                  value={pub.type} 
                  onValueChange={(value) => handlePublicationChange(index, 'type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {publicationTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Editor/Veículo</Label>
                <Input
                  value={pub.publisher}
                  onChange={(e) => handlePublicationChange(index, 'publisher', e.target.value)}
                  placeholder="Revista, jornal, editora..."
                />
              </div>
              <div>
                <Label>Data de Publicação</Label>
                <Input
                  type="date"
                  value={pub.date}
                  onChange={(e) => handlePublicationChange(index, 'date', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>URL da Publicação</Label>
              <Input
                type="url"
                value={pub.url}
                onChange={(e) => handlePublicationChange(index, 'url', e.target.value)}
                placeholder="Link para acessar a publicação"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Referências */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Referências Profissionais
          </h3>
          <Button type="button" variant="outline" size="sm" onClick={addReference}>
            Adicionar Referência
          </Button>
        </div>

        {stepData.references.map((ref, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="text-md font-medium">Referência {index + 1}</h4>
              {stepData.references.length > 1 && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => removeReference(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remover
                </Button>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Nome Completo</Label>
                <Input
                  value={ref.name}
                  onChange={(e) => handleReferenceChange(index, 'name', e.target.value)}
                  placeholder="Nome da pessoa de referência"
                />
              </div>
              <div>
                <Label>Cargo/Posição</Label>
                <Input
                  value={ref.position}
                  onChange={(e) => handleReferenceChange(index, 'position', e.target.value)}
                  placeholder="Cargo da pessoa"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Empresa</Label>
                <Input
                  value={ref.company}
                  onChange={(e) => handleReferenceChange(index, 'company', e.target.value)}
                  placeholder="Empresa onde trabalha"
                />
              </div>
              <div>
                <Label>Relacionamento</Label>
                <Select 
                  value={ref.relationship} 
                  onValueChange={(value) => handleReferenceChange(index, 'relationship', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationshipTypes.map((rel) => (
                      <SelectItem key={rel.value} value={rel.value}>
                        {rel.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={ref.email}
                  onChange={(e) => handleReferenceChange(index, 'email', e.target.value)}
                  placeholder="email@empresa.com"
                />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input
                  value={ref.phone}
                  onChange={(e) => handleReferenceChange(index, 'phone', e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload de Documentos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Documentos Comprobatórios
        </h3>

        <div className="grid gap-4">
          <DocumentUpload
            documentKey="resume"
            name="Currículo Atualizado"
            description="Seu currículo completo em PDF"
            required={true}
            icon={FileText}
            color="text-blue-500"
            acceptedFormats={['pdf']}
            maxSize={5}
            value={stepData.documents.resume}
            onUpload={(file) => setStepData(prev => ({ 
              ...prev, 
              documents: { ...prev.documents, resume: file }
            }))}
            onRemove={() => setStepData(prev => ({ 
              ...prev, 
              documents: { ...prev.documents, resume: null }
            }))}
          />

          <DocumentUpload
            documentKey="portfolio"
            name="Portfólio ou Apresentação"
            description="Cases de sucesso, portfolio ou apresentação institucional"
            icon={Presentation}
            color="text-purple-500"
            acceptedFormats={['pdf', 'ppt', 'pptx']}
            maxSize={20}
            value={stepData.documents.portfolio}
            onUpload={(file) => setStepData(prev => ({ 
              ...prev, 
              documents: { ...prev.documents, portfolio: file }
            }))}
            onRemove={() => setStepData(prev => ({ 
              ...prev, 
              documents: { ...prev.documents, portfolio: null }
            }))}
          />

          <DocumentUpload
            documentKey="certifications"
            name="Certificações Digitalizadas"
            description="Diplomas, certificados e licenças em um arquivo ZIP"
            icon={Award}
            color="text-gold-500"
            acceptedFormats={['zip', 'pdf']}
            maxSize={30}
            value={stepData.documents.certifications}
            onUpload={(file) => setStepData(prev => ({ 
              ...prev, 
              documents: { ...prev.documents, certifications: file }
            }))}
            onRemove={() => setStepData(prev => ({ 
              ...prev, 
              documents: { ...prev.documents, certifications: null }
            }))}
          />
        </div>
      </div>
    </div>
  );
}

function BusinessServicesStep({ data, onDataChange, entityType = 'pf' }: any) {
  const [stepData, setStepData] = useState({
    // Tipos de serviços oferecidos
    serviceTypes: data.serviceTypes || [], // strategy, legal, finance, accounting, marketing, operations
    
    // Pacotes de serviços (modelo Fiverr)
    packages: data.packages || [
      {
        name: "Básico",
        description: "",
        price: "",
        deliveryDays: "",
        revisions: "1",
        features: [],
        extras: []
      },
      {
        name: "Padrão", 
        description: "",
        price: "",
        deliveryDays: "",
        revisions: "2",
        features: [],
        extras: []
      },
      {
        name: "Premium",
        description: "",
        price: "",
        deliveryDays: "",
        revisions: "Ilimitadas",
        features: [],
        extras: []
      }
    ],

    // Metodologia de trabalho
    workMethodology: data.workMethodology || "",
    processDescription: data.processDescription || "",
    
    // Modalidades de atendimento
    serviceDeliveryModes: data.serviceDeliveryModes || [], // presencial, remote, hybrid
    meetingPreferences: data.meetingPreferences || [], // office, client-site, online
    
    // Especializações por segmento
    industrySpecializations: data.industrySpecializations || [],
    companySize: data.companySize || [], // startup, small, medium, large, enterprise
    
    // Precificação
    pricingModel: data.pricingModel || "hourly", // hourly, project, retainer, value-based
    hourlyRate: data.hourlyRate || "",
    minimumEngagement: data.minimumEngagement || "",
    retainerMinimum: data.retainerMinimum || "",
    
    // Disponibilidade e capacidade
    availability: data.availability || "", // full-time, part-time, project-based
    monthlyCapacity: data.monthlyCapacity || "",
    leadTime: data.leadTime || "",
    
    // Termos e condições
    paymentTerms: data.paymentTerms || "",
    contractMinimum: data.contractMinimum || "",
    travelWillingness: data.travelWillingness || false,
    maxTravelDistance: data.maxTravelDistance || "",
    
    // Políticas
    cancellationPolicy: data.cancellationPolicy || "",
    confidentialityAgreement: data.confidentialityAgreement || "",
    
    // Extras e add-ons
    addOnServices: data.addOnServices || []
  });

  useEffect(() => {
    onDataChange(stepData);
  }, [stepData]);

  const businessServiceTypes = [
    { 
      value: "strategy", 
      label: "Consultoria Estratégica", 
      description: "Planejamento estratégico, análise de mercado, business plan",
      examples: ["Plano de negócios", "Análise SWOT", "Roadmap estratégico"]
    },
    { 
      value: "finance", 
      label: "Consultoria Financeira", 
      description: "Gestão financeira, controladoria, investimentos",
      examples: ["Análise de fluxo de caixa", "Modelagem financeira", "Due diligence"]
    },
    { 
      value: "legal", 
      label: "Consultoria Jurídica", 
      description: "Assessoria legal, contratos, compliance",
      examples: ["Revisão de contratos", "Consultoria tributária", "Compliance"]
    },
    { 
      value: "accounting", 
      label: "Serviços Contábeis", 
      description: "Contabilidade, auditoria, planejamento tributário",
      examples: ["Escrituração contábil", "Auditoria", "Planejamento tributário"]
    },
    { 
      value: "marketing", 
      label: "Consultoria em Marketing", 
      description: "Estratégia de marketing, branding, digital",
      examples: ["Estratégia de marca", "Marketing digital", "Pesquisa de mercado"]
    },
    { 
      value: "operations", 
      label: "Consultoria Operacional", 
      description: "Otimização de processos, qualidade, lean",
      examples: ["Mapeamento de processos", "Lean Six Sigma", "Qualidade"]
    },
    { 
      value: "hr", 
      label: "Consultoria em RH", 
      description: "Gestão de pessoas, recrutamento, cultura",
      examples: ["Recrutamento", "Avaliação de desempenho", "Cultura organizacional"]
    },
    { 
      value: "technology", 
      label: "Consultoria em TI", 
      description: "Transformação digital, governança de TI",
      examples: ["Transformação digital", "Governança de TI", "Seleção de sistemas"]
    }
  ];

  const workMethodologies = [
    { value: "consulting", label: "Consultoria Tradicional", description: "Diagnóstico, planejamento e implementação" },
    { value: "coaching", label: "Business Coaching", description: "Mentoria e desenvolvimento de competências" },
    { value: "project-management", label: "Gestão de Projetos", description: "Liderança de projetos específicos" },
    { value: "interim-management", label: "Gestão Interina", description: "Assumir temporariamente posições executivas" },
    { value: "advisory", label: "Advisory Board", description: "Conselheiro estratégico contínuo" },
    { value: "training", label: "Treinamento e Capacitação", description: "Desenvolvimento de equipes" }
  ];

  const deliveryModes = [
    { value: "presencial", label: "100% Presencial", icon: "🏢", description: "Atendimento no escritório do cliente" },
    { value: "remote", label: "100% Remoto", icon: "💻", description: "Atendimento totalmente à distância" },
    { value: "hybrid", label: "Híbrido", icon: "🔄", description: "Combinação presencial e remoto" },
    { value: "flexible", label: "Flexível", icon: "⚡", description: "Adaptável conforme necessidade" }
  ];

  const meetingPrefs = [
    { value: "my-office", label: "Meu Escritório", icon: "🏠" },
    { value: "client-office", label: "Escritório do Cliente", icon: "🏢" },
    { value: "online", label: "Reuniões Online", icon: "📹" },
    { value: "neutral-location", label: "Local Neutro", icon: "☕" }
  ];

  const industries = [
    { value: "technology", label: "Tecnologia" },
    { value: "finance", label: "Serviços Financeiros" },
    { value: "healthcare", label: "Saúde" },
    { value: "retail", label: "Varejo" },
    { value: "manufacturing", label: "Indústria" },
    { value: "real-estate", label: "Imobiliário" },
    { value: "education", label: "Educação" },
    { value: "agriculture", label: "Agronegócio" },
    { value: "energy", label: "Energia" },
    { value: "government", label: "Setor Público" }
  ];

  const companySizes = [
    { value: "startup", label: "Startups", description: "Até 20 funcionários" },
    { value: "small", label: "Pequenas Empresas", description: "21-100 funcionários" },
    { value: "medium", label: "Médias Empresas", description: "101-500 funcionários" },
    { value: "large", label: "Grandes Empresas", description: "501-2000 funcionários" },
    { value: "enterprise", label: "Corporações", description: "2000+ funcionários" }
  ];

  const availabilityOptions = [
    { value: "full-time", label: "Dedicação Exclusiva", description: "40+ horas/semana para um cliente" },
    { value: "part-time", label: "Tempo Parcial", description: "20-30 horas/semana" },
    { value: "project-based", label: "Por Projeto", description: "Múltiplos projetos simultâneos" },
    { value: "retainer", label: "Retenção Mensal", description: "Disponibilidade contínua" },
    { value: "on-demand", label: "Sob Demanda", description: "Consultoria pontual conforme necessidade" }
  ];

  const addOnServices = [
    "Relatórios executivos detalhados",
    "Apresentações para C-Level",
    "Treinamento de equipe",
    "Implementação hands-on",
    "Mentoria pós-projeto",
    "Reuniões de follow-up",
    "Análise de concorrência",
    "Benchmarking de mercado",
    "Due diligence adicional",
    "Suporte de emergência 24/7"
  ];

  const handlePackageChange = (packageIndex: number, field: string, value: string) => {
    const newPackages = [...stepData.packages];
    newPackages[packageIndex] = { ...newPackages[packageIndex], [field]: value };
    setStepData(prev => ({ ...prev, packages: newPackages }));
  };

  const handlePackageFeatureChange = (packageIndex: number, features: string[]) => {
    const newPackages = [...stepData.packages];
    newPackages[packageIndex] = { ...newPackages[packageIndex], features };
    setStepData(prev => ({ ...prev, packages: newPackages }));
  };

  const toggleArrayItem = (array: string[], item: string, setter: (value: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item));
    } else {
      setter([...array, item]);
    }
  };

  const getServiceExamples = (serviceType: string) => {
    const service = businessServiceTypes.find(s => s.value === serviceType);
    return service?.examples || [];
  };

  return (
    <div className="space-y-6">
      {/* Informação contextual */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">💼 Serviços e Metodologia</h3>
        <p className="text-sm text-muted-foreground">
          Configure seus serviços, metodologia de trabalho e condições comerciais.
        </p>
      </div>

      {/* Tipos de Serviços */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Tipos de Serviços
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {businessServiceTypes.map((service) => (
            <div
              key={service.value}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                stepData.serviceTypes.includes(service.value)
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleArrayItem(
                stepData.serviceTypes, 
                service.value, 
                (newArray) => setStepData(prev => ({ ...prev, serviceTypes: newArray }))
              )}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium text-lg">{service.label}</div>
                  <div className="text-sm text-muted-foreground mb-2">{service.description}</div>
                  <div className="flex flex-wrap gap-1">
                    {service.examples.map((example, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {example}
                      </span>
                    ))}
                  </div>
                </div>
                {stepData.serviceTypes.includes(service.value) && (
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 ml-2" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Metodologia de Trabalho */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Metodologia de Trabalho</h3>
        
        <div>
          <Label>Abordagem Principal *</Label>
          <Select 
            value={stepData.workMethodology} 
            onValueChange={(value) => setStepData(prev => ({ ...prev, workMethodology: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione sua metodologia" />
            </SelectTrigger>
            <SelectContent>
              {workMethodologies.map((method) => (
                <SelectItem key={method.value} value={method.value}>
                  <div>
                    <div className="font-medium">{method.label}</div>
                    <div className="text-xs text-muted-foreground">{method.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="processDescription">Descrição do seu Processo de Trabalho *</Label>
          <Textarea
            id="processDescription"
            value={stepData.processDescription}
            onChange={(e) => setStepData(prev => ({ ...prev, processDescription: e.target.value }))}
            placeholder="Descreva como você conduz seus projetos: diagnóstico inicial, metodologia, entregas, follow-up..."
            className="min-h-[120px]"
          />
        </div>
      </div>

      {/* Pacotes de Serviços */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Pacotes de Serviços
        </h3>
        <p className="text-sm text-muted-foreground">
          Configure 3 opções de pacotes para atender diferentes necessidades dos clientes
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {stepData.packages.map((pkg, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="text-center">
                <h4 className={`text-lg font-semibold ${
                  index === 0 ? 'text-green-600' : 
                  index === 1 ? 'text-blue-600' : 
                  'text-purple-600'
                }`}>
                  {pkg.name}
                </h4>
                <div className="text-xs text-muted-foreground">
                  {index === 0 ? 'Entrada no mercado' : 
                   index === 1 ? 'Solução completa' : 
                   'Transformação total'}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label>Descrição do Pacote *</Label>
                  <Textarea
                    value={pkg.description}
                    onChange={(e) => handlePackageChange(index, 'description', e.target.value)}
                    placeholder="Descreva o escopo e objetivos deste pacote..."
                    className="min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Investimento (R$) *</Label>
                    <Input
                      type="number"
                      value={pkg.price}
                      onChange={(e) => handlePackageChange(index, 'price', e.target.value)}
                      placeholder="5000"
                    />
                  </div>
                  <div>
                    <Label>Prazo (dias) *</Label>
                    <Input
                      type="number"
                      value={pkg.deliveryDays}
                      onChange={(e) => handlePackageChange(index, 'deliveryDays', e.target.value)}
                      placeholder="30"
                    />
                  </div>
                </div>

                <div>
                  <Label>Revisões Incluídas</Label>
                  <Input
                    value={pkg.revisions}
                    onChange={(e) => handlePackageChange(index, 'revisions', e.target.value)}
                    placeholder="2"
                  />
                </div>

                <div>
                  <Label>Entregas Incluídas</Label>
                  <Textarea
                    value={pkg.features.join('\n')}
                    onChange={(e) => handlePackageFeatureChange(index, e.target.value.split('\n').filter(f => f.trim()))}
                    placeholder="Lista uma entrega por linha&#10;Diagnóstico situacional&#10;Plano de ação&#10;Relatório executivo&#10;Apresentação final"
                    className="min-h-[100px]"
                  />
                  <p className="text-xs text-muted-foreground">Uma entrega por linha</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modalidades de Atendimento */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Modalidades de Atendimento</h3>
        
        <div>
          <Label>Formas de Entrega do Serviço</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {deliveryModes.map((mode) => (
              <div
                key={mode.value}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  stepData.serviceDeliveryModes.includes(mode.value)
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleArrayItem(
                  stepData.serviceDeliveryModes, 
                  mode.value, 
                  (newArray) => setStepData(prev => ({ ...prev, serviceDeliveryModes: newArray }))
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{mode.icon}</span>
                  <div>
                    <div className="font-medium">{mode.label}</div>
                    <div className="text-sm text-muted-foreground">{mode.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>Preferências de Reunião</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
            {meetingPrefs.map((pref) => (
              <div
                key={pref.value}
                className={`p-3 border rounded-lg cursor-pointer transition-all text-center ${
                  stepData.meetingPreferences.includes(pref.value)
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleArrayItem(
                  stepData.meetingPreferences, 
                  pref.value, 
                  (newArray) => setStepData(prev => ({ ...prev, meetingPreferences: newArray }))
                )}
              >
                <div className="text-xl mb-1">{pref.icon}</div>
                <div className="text-sm font-medium">{pref.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Especializações */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Especializações</h3>
        
        <div>
          <Label>Segmentos de Atuação</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
            {industries.map((industry) => (
              <div
                key={industry.value}
                className={`p-2 border rounded cursor-pointer text-sm text-center transition-all ${
                  stepData.industrySpecializations.includes(industry.value)
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleArrayItem(
                  stepData.industrySpecializations, 
                  industry.value, 
                  (newArray) => setStepData(prev => ({ ...prev, industrySpecializations: newArray }))
                )}
              >
                {industry.label}
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>Porte de Empresas que Atende</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            {companySizes.map((size) => (
              <div
                key={size.value}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  stepData.companySize.includes(size.value)
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleArrayItem(
                  stepData.companySize, 
                  size.value, 
                  (newArray) => setStepData(prev => ({ ...prev, companySize: newArray }))
                )}
              >
                <div className="font-medium">{size.label}</div>
                <div className="text-sm text-muted-foreground">{size.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Precificação */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Modelo de Precificação</h3>
        
        <div>
          <Label>Modelo Principal *</Label>
          <RadioGroup 
            value={stepData.pricingModel}
            onValueChange={(value) => setStepData(prev => ({ ...prev, pricingModel: value }))}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hourly" id="hourly-business" />
              <Label htmlFor="hourly-business" className="font-normal">Por hora</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="project" id="project-business" />
              <Label htmlFor="project-business" className="font-normal">Por projeto (valor fixo)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="retainer" id="retainer-business" />
              <Label htmlFor="retainer-business" className="font-normal">Retainer mensal</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="value-based" id="value-business" />
              <Label htmlFor="value-business" className="font-normal">Baseado em valor/resultados</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {(stepData.pricingModel === 'hourly' || stepData.pricingModel === 'value-based') && (
            <div>
              <Label htmlFor="hourlyRate">Valor por Hora (R$)</Label>
              <Input
                id="hourlyRate"
                type="number"
                min="100"
                max="3000"
                value={stepData.hourlyRate}
                onChange={(e) => setStepData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                placeholder="Ex: 300"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Consultores sênior: R$ 200-800/hora
              </p>
            </div>
          )}

          {stepData.pricingModel === 'project' && (
            <div>
              <Label htmlFor="minimumEngagement">Valor Mínimo de Projeto (R$)</Label>
              <Input
                id="minimumEngagement"
                type="number"
                min="1000"
                value={stepData.minimumEngagement}
                onChange={(e) => setStepData(prev => ({ ...prev, minimumEngagement: e.target.value }))}
                placeholder="Ex: 10000"
              />
            </div>
          )}

          {stepData.pricingModel === 'retainer' && (
            <div>
              <Label htmlFor="retainerMinimum">Valor Mínimo Mensal (R$)</Label>
              <Input
                id="retainerMinimum"
                type="number"
                min="2000"
                value={stepData.retainerMinimum}
                onChange={(e) => setStepData(prev => ({ ...prev, retainerMinimum: e.target.value }))}
                placeholder="Ex: 15000"
              />
            </div>
          )}
        </div>
      </div>

      {/* Disponibilidade */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Disponibilidade e Capacidade</h3>
        
        <div>
          <Label>Tipo de Disponibilidade *</Label>
          <Select 
            value={stepData.availability} 
            onValueChange={(value) => setStepData(prev => ({ ...prev, availability: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {availabilityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="monthlyCapacity">Capacidade Mensal (horas)</Label>
            <Input
              id="monthlyCapacity"
              type="number"
              min="20"
              max="200"
              value={stepData.monthlyCapacity}
              onChange={(e) => setStepData(prev => ({ ...prev, monthlyCapacity: e.target.value }))}
              placeholder="Ex: 120"
            />
          </div>
          <div>
            <Label htmlFor="leadTime">Prazo para Início</Label>
            <Select 
              value={stepData.leadTime} 
              onValueChange={(value) => setStepData(prev => ({ ...prev, leadTime: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Imediato</SelectItem>
                <SelectItem value="1-week">1 semana</SelectItem>
                <SelectItem value="2-weeks">2 semanas</SelectItem>
                <SelectItem value="1-month">1 mês</SelectItem>
                <SelectItem value="2-months">2 meses</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Termos e Condições */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Termos e Condições</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="paymentTerms">Condições de Pagamento</Label>
            <Select 
              value={stepData.paymentTerms} 
              onValueChange={(value) => setStepData(prev => ({ ...prev, paymentTerms: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50-50">50% início + 50% entrega</SelectItem>
                <SelectItem value="30-70">30% início + 70% entrega</SelectItem>
                <SelectItem value="monthly">Pagamento mensal</SelectItem>
                <SelectItem value="milestones">Por marcos/entregas</SelectItem>
                <SelectItem value="upfront">100% antecipado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="contractMinimum">Contrato Mínimo</Label>
            <Select 
              value={stepData.contractMinimum} 
              onValueChange={(value) => setStepData(prev => ({ ...prev, contractMinimum: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-minimum">Sem mínimo</SelectItem>
                <SelectItem value="1-month">1 mês</SelectItem>
                <SelectItem value="3-months">3 meses</SelectItem>
                <SelectItem value="6-months">6 meses</SelectItem>
                <SelectItem value="12-months">12 meses</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="travelWillingness"
              checked={stepData.travelWillingness}
              onCheckedChange={(checked) => setStepData(prev => ({ ...prev, travelWillingness: checked as boolean }))}
            />
            <Label htmlFor="travelWillingness" className="text-sm">Disponível para viagens</Label>
          </div>

          {stepData.travelWillingness && (
            <div>
              <Label htmlFor="maxTravelDistance">Alcance para Viagens</Label>
              <Select 
                value={stepData.maxTravelDistance} 
                onValueChange={(value) => setStepData(prev => ({ ...prev, maxTravelDistance: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Mesma cidade</SelectItem>
                  <SelectItem value="state">Mesmo estado</SelectItem>
                  <SelectItem value="region">Mesma região</SelectItem>
                  <SelectItem value="national">Todo o Brasil</SelectItem>
                  <SelectItem value="international">Internacional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="cancellationPolicy">Política de Cancelamento</Label>
          <Textarea
            id="cancellationPolicy"
            value={stepData.cancellationPolicy}
            onChange={(e) => setStepData(prev => ({ ...prev, cancellationPolicy: e.target.value }))}
            placeholder="Descreva sua política de cancelamento de projetos..."
            className="min-h-[80px]"
          />
        </div>

        <div>
          <Label htmlFor="confidentialityAgreement">Acordo de Confidencialidade</Label>
          <Textarea
            id="confidentialityAgreement"
            value={stepData.confidentialityAgreement}
            onChange={(e) => setStepData(prev => ({ ...prev, confidentialityAgreement: e.target.value }))}
            placeholder="Descreva como você garante a confidencialidade das informações do cliente..."
            className="min-h-[80px]"
          />
        </div>
      </div>

      {/* Serviços Adicionais */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Serviços Adicionais (Add-ons)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {addOnServices.map((service) => (
            <div
              key={service}
              className={`p-3 border rounded cursor-pointer text-sm transition-all ${
                stepData.addOnServices.includes(service)
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleArrayItem(
                stepData.addOnServices, 
                service, 
                (newArray) => setStepData(prev => ({ ...prev, addOnServices: newArray }))
              )}
            >
              {service}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// General Professional Step
function GeneralProfessionalStep({ data, onDataChange, entityType = 'pf' }: any) {
  const [stepData, setStepData] = useState({
    category: '',
    specialty: '',
    professionalRegistry: '',
    registryNumber: '',
    experienceYears: '',
    workDescription: '',
    ...data
  });

  useEffect(() => {
    onDataChange(stepData);
  }, [stepData, onDataChange]);

  const professionalCategories = [
    {
      value: 'construction',
      label: 'Construção Civil',
      icon: '🏗️',
      specialties: [
        'Pedreiro', 'Pintor', 'Eletricista', 'Encanador', 'Azulejista', 
        'Gesseiro', 'Carpinteiro', 'Soldador', 'Serralheiro', 'Vidraceiro'
      ]
    },
    {
      value: 'maintenance',
      label: 'Manutenção e Reparos',
      icon: '🔧',
      specialties: [
        'Técnico em Refrigeração', 'Técnico em Eletrônicos', 'Mecânico',
        'Técnico em Informática', 'Chaveiro', 'Desentupidor', 'Jardineiro'
      ]
    },
    {
      value: 'renovation',
      label: 'Reformas',
      icon: '🏠',
      specialties: [
        'Designer de Interiores', 'Decorador', 'Arquiteto de Interiores',
        'Organizador de Ambientes', 'Paisagista'
      ]
    },
    {
      value: 'carpentry',
      label: 'Marcenaria',
      icon: '🪚',
      specialties: [
        'Marceneiro', 'Moveleiro', 'Carpinteiro', 'Restaurador de Móveis',
        'Designer de Móveis'
      ]
    },
    {
      value: 'transport',
      label: 'Transporte e Logística',
      icon: '🚛',
      specialties: [
        'Motorista', 'Entregador', 'Mudanceiro', 'Freteiro', 'Motoboy'
      ]
    },
    {
      value: 'engineering',
      label: 'Engenharia',
      icon: '⚙️',
      specialties: [
        'Engenheiro Civil', 'Engenheiro Elétrico', 'Engenheiro Mecânico',
        'Engenheiro de Segurança', 'Engenheiro Ambiental'
      ]
    },
    {
      value: 'architecture',
      label: 'Arquitetura',
      icon: '📐',
      specialties: [
        'Arquiteto', 'Urbanista', 'Arquiteto Paisagista',
        'Designer de Interiores', 'Consultor em Sustentabilidade'
      ]
    },
    {
      value: 'other',
      label: 'Outros Serviços',
      icon: '🛠️',
      specialties: [
        'Personal Trainer', 'Professor Particular', 'Cuidador',
        'Diarista', 'Organizador', 'Consultor Geral'
      ]
    }
  ];

  const selectedCategory = professionalCategories.find(cat => cat.value === stepData.category);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Dados Profissionais</h2>
        <p className="text-muted-foreground">
          Conte-nos sobre sua área de atuação e experiência profissional
        </p>
      </div>

      {/* Categoria Profissional */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Categoria Profissional</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {professionalCategories.map((category) => (
            <div
              key={category.value}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                stepData.category === category.value
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setStepData(prev => ({ 
                ...prev, 
                category: category.value,
                specialty: '' // Reset specialty when category changes
              }))}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{category.icon}</span>
                <div>
                  <div className="font-medium">{category.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Especialidade */}
      {selectedCategory && (
        <div>
          <Label htmlFor="specialty">Especialidade *</Label>
          <Select value={stepData.specialty} onValueChange={(value) => setStepData(prev => ({ ...prev, specialty: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione sua especialidade" />
            </SelectTrigger>
            <SelectContent>
              {selectedCategory.specialties.map((specialty) => (
                <SelectItem key={specialty} value={specialty}>
                  {specialty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Registro Profissional (para profissões regulamentadas) */}
      {(stepData.category === 'engineering' || stepData.category === 'architecture') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="professionalRegistry">Conselho Profissional *</Label>
            <Select 
              value={stepData.professionalRegistry} 
              onValueChange={(value) => setStepData(prev => ({ ...prev, professionalRegistry: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o conselho" />
              </SelectTrigger>
              <SelectContent>
                {stepData.category === 'engineering' && (
                  <>
                    <SelectItem value="CREA">CREA - Conselho Regional de Engenharia</SelectItem>
                    <SelectItem value="CONFEA">CONFEA - Conselho Federal de Engenharia</SelectItem>
                  </>
                )}
                {stepData.category === 'architecture' && (
                  <>
                    <SelectItem value="CAU">CAU - Conselho de Arquitetura e Urbanismo</SelectItem>
                    <SelectItem value="IAB">IAB - Instituto de Arquitetos do Brasil</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="registryNumber">Número do Registro *</Label>
            <Input
              id="registryNumber"
              value={stepData.registryNumber}
              onChange={(e) => setStepData(prev => ({ ...prev, registryNumber: e.target.value }))}
              placeholder="Ex: 123456789"
            />
          </div>
        </div>
      )}

      {/* Experiência */}
      <div>
        <Label htmlFor="experienceYears">Anos de Experiência *</Label>
        <Select value={stepData.experienceYears} onValueChange={(value) => setStepData(prev => ({ ...prev, experienceYears: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione sua experiência" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="menos-1">Menos de 1 ano</SelectItem>
            <SelectItem value="1-2">1 a 2 anos</SelectItem>
            <SelectItem value="3-5">3 a 5 anos</SelectItem>
            <SelectItem value="6-10">6 a 10 anos</SelectItem>
            <SelectItem value="11-15">11 a 15 anos</SelectItem>
            <SelectItem value="mais-15">Mais de 15 anos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Descrição do Trabalho */}
      <div>
        <Label htmlFor="workDescription">Descrição dos Seus Serviços *</Label>
        <Textarea
          id="workDescription"
          value={stepData.workDescription}
          onChange={(e) => setStepData(prev => ({ ...prev, workDescription: e.target.value }))}
          placeholder="Descreva os tipos de serviços que você oferece, sua metodologia de trabalho e o que te diferencia dos demais profissionais..."
          className="min-h-[120px]"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Seja específico sobre seus serviços para atrair os clientes certos
        </p>
      </div>
    </div>
  );
}

// General Documents Step  
function GeneralDocumentsStep({ data, onDataChange, entityType }: StepProps & { entityType: string }) {
  const [stepData, setStepData] = useState({
    documents: {},
    certifications: [],
    portfolio: [],
    ...data
  });

  useEffect(() => {
    onDataChange(stepData);
  }, [stepData, onDataChange]);

  const handleFileUpload = (docType: string, file: File) => {
    // Simular upload - em produção, fazer upload real
    const fakeUrl = `https://profissionais.gov.br/uploads/${file.name}`;
    setStepData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docType]: {
          name: file.name,
          url: fakeUrl,
          uploadedAt: new Date().toISOString()
        }
      }
    }));
  };

  const requiredDocsPF = [
    { key: 'cpf', label: 'CPF', description: 'Documento de identificação fiscal' },
    { key: 'rg', label: 'RG ou CNH', description: 'Documento de identificação com foto' },
    { key: 'comprovante_residencia', label: 'Comprovante de Residência', description: 'Conta de luz, água ou telefone (últimos 3 meses)' }
  ];

  const requiredDocsPJ = [
    { key: 'cnpj', label: 'Cartão CNPJ', description: 'Comprovante de inscrição no CNPJ' },
    { key: 'contrato_social', label: 'Contrato Social', description: 'Documento de constituição da empresa' },
    { key: 'alvara', label: 'Alvará de Funcionamento', description: 'Licença municipal para funcionamento' },
    { key: 'inscricao_estadual', label: 'Inscrição Estadual', description: 'Se aplicável à sua atividade' }
  ];

  const requiredDocs = entityType === 'pj' ? requiredDocsPJ : requiredDocsPF;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Documentação</h2>
        <p className="text-muted-foreground">
          Envie os documentos necessários para validar seu cadastro profissional
        </p>
      </div>

      {/* Documentos Obrigatórios */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Documentos Obrigatórios {entityType === 'pj' ? '(Pessoa Jurídica)' : '(Pessoa Física)'}
        </h3>
        
        {requiredDocs.map((doc) => (
          <div key={doc.key} className="border rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-medium">{doc.label}</h4>
                <p className="text-sm text-muted-foreground">{doc.description}</p>
              </div>
              {stepData.documents[doc.key] && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
            </div>
            
            <div className="mt-3">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(doc.key, file);
                }}
                className="hidden"
                id={`upload-${doc.key}`}
              />
              <label
                htmlFor={`upload-${doc.key}`}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <Upload className="h-4 w-4" />
                {stepData.documents[doc.key] ? 'Alterar Arquivo' : 'Selecionar Arquivo'}
              </label>
              
              {stepData.documents[doc.key] && (
                <div className="mt-2 text-sm text-green-600">
                  ✓ {stepData.documents[doc.key].name}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Certificações (Opcional) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Certificações e Cursos (Opcional)</h3>
        <p className="text-sm text-muted-foreground">
          Adicione certificações, cursos ou especializações para destacar seu perfil
        </p>
        
        <div className="space-y-3">
          {stepData.certifications.map((cert: any, index: number) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome da Certificação</Label>
                  <Input
                    value={cert.name || ''}
                    onChange={(e) => {
                      const newCerts = [...stepData.certifications];
                      newCerts[index] = { ...cert, name: e.target.value };
                      setStepData(prev => ({ ...prev, certifications: newCerts }));
                    }}
                    placeholder="Ex: Curso de Soldagem Industrial"
                  />
                </div>
                <div>
                  <Label>Instituição</Label>
                  <Input
                    value={cert.institution || ''}
                    onChange={(e) => {
                      const newCerts = [...stepData.certifications];
                      newCerts[index] = { ...cert, institution: e.target.value };
                      setStepData(prev => ({ ...prev, certifications: newCerts }));
                    }}
                    placeholder="Ex: SENAI"
                  />
                </div>
              </div>
              <div className="mt-3">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const newCerts = [...stepData.certifications];
                      newCerts[index] = { ...cert, certificate: file };
                      setStepData(prev => ({ ...prev, certifications: newCerts }));
                    }
                  }}
                  className="hidden"
                  id={`cert-upload-${index}`}
                />
                <label
                  htmlFor={`cert-upload-${index}`}
                  className="inline-flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 rounded cursor-pointer hover:bg-gray-50"
                >
                  <Upload className="h-3 w-3" />
                  Certificado
                </label>
              </div>
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={() => setStepData(prev => ({
              ...prev,
              certifications: [...prev.certifications, { name: '', institution: '' }]
            }))}
            className="w-full"
          >
            + Adicionar Certificação
          </Button>
        </div>
      </div>

      {/* Portfolio de Trabalhos (Opcional) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Portfolio de Trabalhos (Opcional)</h3>
        <p className="text-sm text-muted-foreground">
          Adicione fotos dos seus trabalhos realizados para atrair mais clientes
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stepData.portfolio.map((item: any, index: number) => (
            <div key={index} className="border rounded-lg p-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const newPortfolio = [...stepData.portfolio];
                    newPortfolio[index] = { ...item, image: file };
                    setStepData(prev => ({ ...prev, portfolio: newPortfolio }));
                  }
                }}
                className="hidden"
                id={`portfolio-${index}`}
              />
              <label
                htmlFor={`portfolio-${index}`}
                className="block w-full h-32 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-gray-400 flex items-center justify-center"
              >
                {item.image ? (
                  <span className="text-sm text-green-600">✓ Imagem selecionada</span>
                ) : (
                  <div className="text-center">
                    <Camera className="h-6 w-6 mx-auto mb-1 text-gray-400" />
                    <span className="text-xs text-gray-500">Clique para adicionar</span>
                  </div>
                )}
              </label>
              <Input
                className="mt-2"
                value={item.description || ''}
                onChange={(e) => {
                  const newPortfolio = [...stepData.portfolio];
                  newPortfolio[index] = { ...item, description: e.target.value };
                  setStepData(prev => ({ ...prev, portfolio: newPortfolio }));
                }}
                placeholder="Descrição do trabalho"
              />
            </div>
          ))}
          
          {stepData.portfolio.length < 6 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStepData(prev => ({
                ...prev,
                portfolio: [...prev.portfolio, { description: '' }]
              }))}
              className="h-32 border-2 border-dashed border-gray-300 hover:border-gray-400"
            >
              <div className="text-center">
                <Camera className="h-6 w-6 mx-auto mb-1" />
                <span className="text-sm">Adicionar Foto</span>
              </div>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// General Services Step
function GeneralServicesStep({ data, onDataChange }: StepProps) {
  const [stepData, setStepData] = useState({
    services: [
      {
        name: '',
        description: '',
        category: '',
        packages: [
          { name: 'Básico', price: '', deliveryDays: '', features: [], description: '' },
          { name: 'Padrão', price: '', deliveryDays: '', features: [], description: '' },
          { name: 'Premium', price: '', deliveryDays: '', features: [], description: '' }
        ]
      }
    ],
    serviceArea: [],
    workingHours: {},
    ...data
  });

  useEffect(() => {
    onDataChange(stepData);
  }, [stepData, onDataChange]);

  const serviceCategories = [
    'Construção e Reforma', 'Manutenção e Reparos', 'Transporte e Mudanças',
    'Limpeza e Organização', 'Jardinagem e Paisagismo', 'Educação e Ensino',
    'Cuidados Pessoais', 'Consultoria e Assessoria', 'Outros Serviços'
  ];

  const brazilianStates = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 
    'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 
    'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const handleServiceChange = (index: number, field: string, value: any) => {
    const newServices = [...stepData.services];
    newServices[index] = { ...newServices[index], [field]: value };
    setStepData(prev => ({ ...prev, services: newServices }));
  };

  const handlePackageChange = (serviceIndex: number, packageIndex: number, field: string, value: any) => {
    const newServices = [...stepData.services];
    newServices[serviceIndex].packages[packageIndex] = {
      ...newServices[serviceIndex].packages[packageIndex],
      [field]: value
    };
    setStepData(prev => ({ ...prev, services: newServices }));
  };

  const toggleArrayItem = (array: string[], item: string, setter: (newArray: string[]) => void) => {
    const newArray = array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
    setter(newArray);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Serviços e Preços</h2>
        <p className="text-muted-foreground">
          Configure os serviços que você oferece e seus pacotes de preços
        </p>
      </div>

      {/* Serviços */}
      <div className="space-y-6">
        {stepData.services.map((service: any, serviceIndex: number) => (
          <div key={serviceIndex} className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">
              Serviço {serviceIndex + 1}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label>Nome do Serviço *</Label>
                <Input
                  value={service.name}
                  onChange={(e) => handleServiceChange(serviceIndex, 'name', e.target.value)}
                  placeholder="Ex: Instalação Elétrica Residencial"
                />
              </div>
              <div>
                <Label>Categoria *</Label>
                <Select 
                  value={service.category} 
                  onValueChange={(value) => handleServiceChange(serviceIndex, 'category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mb-6">
              <Label>Descrição do Serviço *</Label>
              <Textarea
                value={service.description}
                onChange={(e) => handleServiceChange(serviceIndex, 'description', e.target.value)}
                placeholder="Descreva detalhadamente o que está incluído neste serviço..."
                className="min-h-[100px]"
              />
            </div>

            {/* Pacotes de Preços */}
            <div className="space-y-4">
              <h4 className="font-medium">Pacotes de Preços</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {service.packages.map((pkg: any, packageIndex: number) => (
                  <div key={packageIndex} className="border rounded-lg p-4">
                    <div className="text-center mb-3">
                      <h5 className="font-semibold text-lg">{pkg.name}</h5>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label>Preço (R$) *</Label>
                        <Input
                          type="number"
                          value={pkg.price}
                          onChange={(e) => handlePackageChange(serviceIndex, packageIndex, 'price', e.target.value)}
                          placeholder="150"
                        />
                      </div>

                      <div>
                        <Label>Prazo (dias) *</Label>
                        <Input
                          type="number"
                          value={pkg.deliveryDays}
                          onChange={(e) => handlePackageChange(serviceIndex, packageIndex, 'deliveryDays', e.target.value)}
                          placeholder="3"
                        />
                      </div>

                      <div>
                        <Label>Descrição do Pacote</Label>
                        <Textarea
                          value={pkg.description}
                          onChange={(e) => handlePackageChange(serviceIndex, packageIndex, 'description', e.target.value)}
                          placeholder="O que está incluído neste pacote..."
                          className="min-h-[80px]"
                        />
                      </div>

                      <div>
                        <Label>Itens Incluídos</Label>
                        <Textarea
                          value={pkg.features.join('\n')}
                          onChange={(e) => handlePackageChange(
                            serviceIndex, 
                            packageIndex, 
                            'features', 
                            e.target.value.split('\n').filter(f => f.trim())
                          )}
                          placeholder="Um item por linha&#10;Diagnóstico inicial&#10;Execução do serviço&#10;Garantia de 30 dias"
                          className="min-h-[80px]"
                        />
                        <p className="text-xs text-muted-foreground">Um item por linha</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={() => setStepData(prev => ({
            ...prev,
            services: [...prev.services, {
              name: '',
              description: '',
              category: '',
              packages: [
                { name: 'Básico', price: '', deliveryDays: '', features: [], description: '' },
                { name: 'Padrão', price: '', deliveryDays: '', features: [], description: '' },
                { name: 'Premium', price: '', deliveryDays: '', features: [], description: '' }
              ]
            }]
          }))}
          className="w-full"
        >
          + Adicionar Outro Serviço
        </Button>
      </div>

      {/* Área de Atendimento */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Área de Atendimento</h3>
        <p className="text-sm text-muted-foreground">
          Selecione os estados onde você oferece seus serviços
        </p>
        
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {brazilianStates.map((state) => (
            <div
              key={state}
              className={`p-2 border rounded text-center cursor-pointer transition-all ${
                stepData.serviceArea.includes(state)
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleArrayItem(
                stepData.serviceArea, 
                state, 
                (newArray) => setStepData(prev => ({ ...prev, serviceArea: newArray }))
              )}
            >
              {state}
            </div>
          ))}
        </div>
      </div>

      {/* Horário de Trabalho */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Disponibilidade</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Horário Preferencial</Label>
            <Select 
              value={stepData.workingHours.preferred} 
              onValueChange={(value) => setStepData(prev => ({ 
                ...prev, 
                workingHours: { ...prev.workingHours, preferred: value }
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o horário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comercial">Horário Comercial (8h às 18h)</SelectItem>
                <SelectItem value="flexivel">Horário Flexível</SelectItem>
                <SelectItem value="noturno">Período Noturno</SelectItem>
                <SelectItem value="fins-semana">Fins de Semana</SelectItem>
                <SelectItem value="24h">24 horas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Dias da Semana</Label>
            <Select 
              value={stepData.workingHours.days} 
              onValueChange={(value) => setStepData(prev => ({ 
                ...prev, 
                workingHours: { ...prev.workingHours, days: value }
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione os dias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seg-sex">Segunda a Sexta</SelectItem>
                <SelectItem value="seg-sab">Segunda a Sábado</SelectItem>
                <SelectItem value="todos">Todos os dias</SelectItem>
                <SelectItem value="fins-semana">Apenas fins de semana</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Observações sobre Disponibilidade</Label>
          <Textarea
            value={stepData.workingHours.notes || ''}
            onChange={(e) => setStepData(prev => ({ 
              ...prev, 
              workingHours: { ...prev.workingHours, notes: e.target.value }
            }))}
            placeholder="Ex: Atendo emergências 24h com taxa adicional, não trabalho em feriados..."
            className="min-h-[80px]"
          />
        </div>  
      </div>
    </div>
  );
}