'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { UserCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

// Importar todos os componentes de etapa
import { BasicInfoStep } from '../health/components/BasicInfoStep';
import { GeneralProfessionalStep } from './components/GeneralProfessionalStep';
import { GeneralDocumentsStep } from './components/GeneralDocumentsStep';
import { GeneralServicesStep } from './components/GeneralServicesStep';
import { CoverageStep } from '../health/components/CoverageStep';

interface RegistrationStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
}

const GENERAL_REGISTRATION_STEPS: RegistrationStep[] = [
  { 
    id: "basic", 
    title: "1. Informações Básicas", 
    description: "Dados pessoais e contato", 
    component: BasicInfoStep 
  },
  { 
    id: "professional", 
    title: "2. Dados Profissionais", 
    description: "Profissão e experiência", 
    component: GeneralProfessionalStep 
  },
  { 
    id: "documents", 
    title: "3. Documentação", 
    description: "Documentos e certificações", 
    component: GeneralDocumentsStep 
  },
  { 
    id: "services", 
    title: "4. Serviços e Preços", 
    description: "Configure seus serviços", 
    component: GeneralServicesStep 
  },
  { 
    id: "coverage", 
    title: "5. Área de Atuação", 
    description: "Onde você atende", 
    component: CoverageStep 
  }
];

export default function GeneralRegistrationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const entityType = searchParams.get('entity') || 'pf';
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const flow = {
    name: "Profissional de Serviços Gerais",
    icon: UserCheck,
    color: "text-indigo-500",
    estimatedTime: "10-12 min",
    steps: GENERAL_REGISTRATION_STEPS
  };

  const progress = ((currentStep + 1) / flow.steps.length) * 100;
  const currentStepData = flow.steps[currentStep];
  const CurrentStepComponent = currentStepData.component;

  useEffect(() => {
    console.log("General Registration - entityType:", entityType);
    console.log("General Registration - currentStep:", currentStep);
    console.log("General Registration - formData:", formData);
  }, [entityType, currentStep, formData]);

  const handleNext = async () => {
    if (currentStep < flow.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.push('/register/professional-type');
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      console.log("Final form data:", formData);
      
      // TODO: Implementar chamada para API Django
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Cadastro realizado com sucesso!");
      router.push("/dashboard/general");
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
              flowType="general"
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
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index <= currentStep 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {index + 1}
                </div>
                <span className="text-xs mt-2 max-w-20">{step.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}