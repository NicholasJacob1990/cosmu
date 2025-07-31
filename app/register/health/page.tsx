'use client';

import { useState, useEffect, useCallback } from 'react';

// Force dynamic rendering for pages using useSearchParams
export const dynamic = 'force-dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

// Importar todos os componentes de etapa
import { BasicInfoStep } from './components/BasicInfoStep';
import { HealthProfessionalStep } from './components/HealthProfessionalStep';
import { HealthDocumentsStep } from './components/HealthDocumentsStep';
import { HealthServicesStep } from './components/HealthServicesStep';
import { CoverageStep } from './components/CoverageStep';

interface RegistrationStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
}

const HEALTH_REGISTRATION_STEPS: RegistrationStep[] = [
  { 
    id: "basic", 
    title: "1. Informações Básicas", 
    description: "Dados pessoais e contato", 
    component: BasicInfoStep 
  },
  { 
    id: "professional", 
    title: "2. Dados Profissionais", 
    description: "Formação e especialidades", 
    component: HealthProfessionalStep 
  },
  { 
    id: "documents", 
    title: "3. Documentação", 
    description: "Registros profissionais e certificações", 
    component: HealthDocumentsStep 
  },
  { 
    id: "services", 
    title: "4. Serviços e Preços", 
    description: "Configure seus atendimentos", 
    component: HealthServicesStep 
  },
  { 
    id: "coverage", 
    title: "5. Área de Atuação", 
    description: "Onde você atende", 
    component: CoverageStep 
  }
];

export default function HealthRegistrationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const entityType = searchParams.get('entity') || 'pf'; // pf = pessoa física, pj = pessoa jurídica
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const flow = {
    name: "Profissional da Saúde",
    icon: Heart,
    color: "text-red-500",
    estimatedTime: "15-20 min",
    steps: HEALTH_REGISTRATION_STEPS
  };

  const progress = ((currentStep + 1) / flow.steps.length) * 100;
  const currentStepData = flow.steps[currentStep];
  const CurrentStepComponent = currentStepData.component;

  // Debug logging
  useEffect(() => {
    console.log("Health Registration - entityType:", entityType);
    console.log("Health Registration - currentStep:", currentStep);
    console.log("Health Registration - formData:", formData);
  }, [entityType, currentStep, formData]);

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
      router.push('/register');
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Preparar dados para registro
      const registrationData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        userType: "professional",
        professionalType: "health",
        entityType: entityType,
        plan: "free", // Default to free plan
        ...formData
      };

      console.log("Submitting registration data:", registrationData);
      
      // Aqui você faria a chamada para a API
      // await authApi.register(registrationData);
      
      toast.success("Cadastro realizado com sucesso!");
      
      // Redirecionar para o dashboard de saúde
      router.push("/dashboard/health");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Erro ao realizar cadastro. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = useCallback((stepData: any) => {
    setFormData(prev => ({ ...prev, ...stepData }));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-muted">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg shadow-lg">
              <flow.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold galaxia-text-gradient">
              {flow.name}
            </h1>
            <Badge variant="secondary">
              {flow.estimatedTime}
            </Badge>
            {entityType && (
              <Badge variant="outline">
                {entityType === 'pf' ? 'Pessoa Física' : 'Pessoa Jurídica'}
              </Badge>
            )}
          </div>
          <Progress value={progress} className="h-2 mb-4" />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Etapa {currentStep + 1} de {flow.steps.length}</span>
            <span>{Math.round(progress)}% concluído</span>
          </div>
        </div>

        {/* Step Content */}
        <Card className="max-w-4xl mx-auto">
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
              flowType="health"
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
                className="flex items-center gap-2 galaxia-button-primary"
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

        {/* Progress Steps Indicator */}
        <div className="max-w-4xl mx-auto mt-8">
          <div className="flex justify-between">
            {flow.steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex flex-col items-center text-center ${
                  index <= currentStep ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2 ${
                    index < currentStep
                      ? 'bg-primary text-primary-foreground'
                      : index === currentStep
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {index + 1}
                </div>
                <div className="text-xs max-w-20">
                  {step.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}