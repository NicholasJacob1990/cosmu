'use client';

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { GalaxiaLogo } from "@/components/GalaxiaLogo";

// Importar todos os componentes de etapa em um único formulário
import { BasicInfoStep } from '../health/components/BasicInfoStep';
import { GeneralProfessionalStep } from '../general/components/GeneralProfessionalStep';
import { GeneralDocumentsStep } from '../general/components/GeneralDocumentsStep';
import { GeneralServicesStep } from '../general/components/GeneralServicesStep';
import { CoverageStep } from '../health/components/CoverageStep';

export default function SimpleRegistrationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const entityType = searchParams.get('entity') || 'pf';
  
  const [formData, setFormData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleDataChange = useCallback((stepData: any) => {
    setFormData(prev => ({ ...prev, ...stepData }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Submitting simple registration form:", formData);
      // TODO: Implementar chamada para API Django
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Cadastro rápido realizado com sucesso!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Simple registration error:", error);
      toast.error("Erro ao realizar cadastro. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-galaxia-grad-a/5 via-galaxia-grad-b/5 to-galaxia-grad-c/5 opacity-40"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/40 bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/register/professional-type" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Link>
              <GalaxiaLogo />
              <Link href="/login" className="text-primary hover:underline">
                Já tem uma conta?
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4 galaxia-text-gradient">
                Cadastro Rápido
              </h1>
              <p className="text-xl text-galaxia-text-muted">
                Preencha todas as informações em uma única página
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="galaxia-text-gradient">1. Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent>
                  <BasicInfoStep data={formData} onDataChange={handleDataChange} entityType={entityType} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="galaxia-text-gradient">2. Dados Profissionais</CardTitle>
                </CardHeader>
                <CardContent>
                  <GeneralProfessionalStep data={formData} onDataChange={handleDataChange} entityType={entityType} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="galaxia-text-gradient">3. Documentação</CardTitle>
                </CardHeader>
                <CardContent>
                  <GeneralDocumentsStep data={formData} onDataChange={handleDataChange} entityType={entityType} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="galaxia-text-gradient">4. Serviços e Preços</CardTitle>
                </CardHeader>
                <CardContent>
                  <GeneralServicesStep data={formData} onDataChange={handleDataChange} entityType={entityType} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="galaxia-text-gradient">5. Área de Atuação</CardTitle>
                </CardHeader>
                <CardContent>
                  <CoverageStep data={formData} onDataChange={handleDataChange} entityType={entityType} />
                </CardContent>
              </Card>

              <div className="text-center pt-6">
                <Button
                  size="lg"
                  type="submit"
                  disabled={isLoading}
                  className="w-full max-w-xs mx-auto galaxia-button-primary"
                >
                  {isLoading ? "Enviando..." : "Finalizar Cadastro Rápido"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
