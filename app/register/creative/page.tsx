'use client';

import { useState, useEffect, useCallback } from 'react';

// Force dynamic rendering for pages using useSearchParams
export const dynamic = 'force-dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Camera, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

// Importar todos os componentes de etapa
import { BasicInfoStep } from './components/BasicInfoStep';
import { CreativeProfessionalStep } from './components/CreativeProfessionalStep';
import { PortfolioStep } from './components/PortfolioStep';
import { CreativeServicesStep } from './components/CreativeServicesStep';
import { CoverageStep } from './components/CoverageStep';

interface RegistrationStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
}

const CREATIVE_REGISTRATION_STEPS: RegistrationStep[] = [
  { 
    id: "basic", 
    title: "1. Informações Básicas", 
    description: "Dados pessoais e contato", 
    component: BasicInfoStep 
  },
  { 
    id: "creative", 
    title: "2. Perfil Criativo", 
    description: "Especialidades e estilo", 
    component: CreativeProfessionalStep 
  },
  { 
    id: "portfolio", 
    title: "3. Portfolio", 
    description: "Mostre seus trabalhos", 
    component: PortfolioStep 
  },
  { 
    id: "services", 
    title: "4. Serviços e Preços", 
    description: "Configure seus pacotes", 
    component: CreativeServicesStep 
  },
  { 
    id: "coverage", 
    title: "5. Área de Atuação", 
    description: "Onde você trabalha", 
    component: CoverageStep 
  }
];

export default function CreativeRegistrationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const entityType = searchParams.get('entity') || 'pf'; // pf = pessoa física, pj = pessoa jurídica
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const flow = {
    name: "Profissional Criativo",
    icon: Camera,
    color: "text-purple-500",
    estimatedTime: "12-15 min",
    steps: CREATIVE_REGISTRATION_STEPS
  };

  const progress = ((currentStep + 1) / flow.steps.length) * 100;
  const currentStepData = flow.steps[currentStep];
  const CurrentStepComponent = currentStepData.component;

  // Debug logging
  useEffect(() => {
    console.log("Creative Registration - entityType:", entityType);
    console.log("Creative Registration - currentStep:", currentStep);
    console.log("Creative Registration - formData:", formData);
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
        professionalType: "creative",
        entityType: entityType,
        plan: "free", // Default to free plan
        ...formData
      };

      console.log("Submitting registration data:", registrationData);
      
      // Aqui você faria a chamada para a API
      // await authApi.register(registrationData);
      
      toast.success("Cadastro realizado com sucesso!");
      
      // Redirecionar para o dashboard criativo
      router.push("/dashboard/creative");
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <flow.icon className={`h-6 w-6 ${flow.color}`} />
            <h1 className="text-2xl font-bold">{flow.name}</h1>
            <Badge variant="secondary">{flow.estimatedTime}</Badge>
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
              flowType="creative"
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