'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, Camera, Code, Briefcase, Clock, Users, CheckCircle2, Star, User, Building2 } from "lucide-react";
import { GalaxiaLogo } from "@/components/GalaxiaLogo";
import { ThemeToggle } from "@/components/ThemeToggle";

const PROFESSIONAL_TYPES = {
  health: {
    name: "Profissional da Saúde",
    description: "Médicos, dentistas, psicólogos e outros profissionais da saúde",
    icon: Heart,
    color: "from-red-500 to-pink-500",
    borderColor: "border-red-300",
    textColor: "text-red-600",
    hoverColor: "hover:bg-red-50",
    estimatedTime: "15-20 min",
    features: [
      "Registro profissional (CRM, CRO, CRP)",
      "Especialidades médicas",
      "Documentação específica",
      "Área de cobertura geográfica",
      "Configuração de consultas"
    ],
    emoji: "🏥"
  },
  creative: {
    name: "Profissional Criativo", 
    description: "Designers, fotógrafos, videomakers e artistas",
    icon: Camera,
    color: "from-purple-500 to-indigo-500",
    borderColor: "border-purple-300",
    textColor: "text-purple-600",
    hoverColor: "hover:bg-purple-50",
    estimatedTime: "12-15 min",
    features: [
      "Portfolio visual",
      "Especialidades criativas",
      "Ferramentas e softwares",
      "Tipos de projetos",
      "Pacotes de serviços"
    ],
    emoji: "🎨"
  },
  tech: {
    name: "Profissional de Tecnologia",
    description: "Desenvolvedores, analistas, especialistas em TI",
    icon: Code,
    color: "from-blue-500 to-cyan-500",
    borderColor: "border-blue-300",
    textColor: "text-blue-600",
    hoverColor: "hover:bg-blue-50",
    estimatedTime: "10-15 min",
    features: [
      "Stack tecnológico",
      "Projetos e experiência",
      "Certificações",
      "Linguagens de programação",
      "Pacotes de desenvolvimento"
    ],
    emoji: "💻"
  },
  business: {
    name: "Profissional de Negócios",
    description: "Consultores, advogados, contadores e especialistas em gestão",
    icon: Briefcase,
    color: "from-green-500 to-emerald-500",
    borderColor: "border-green-300",
    textColor: "text-green-600",
    hoverColor: "hover:bg-green-50",
    estimatedTime: "12-18 min",
    features: [
      "Área de especialização",
      "Credenciais profissionais",
      "Experiência empresarial",
      "Casos de sucesso",
      "Serviços consultivos"
    ],
    emoji: "💼"
  },
  general: {
    name: "Outros Serviços",
    description: "Prestadores de serviços em geral e outras áreas",
    icon: Star,
    color: "from-gray-500 to-slate-500",
    borderColor: "border-gray-300",
    textColor: "text-gray-600",
    hoverColor: "hover:bg-gray-50",
    estimatedTime: "8-12 min",
    features: [
      "Descrição personalizada",
      "Serviços oferecidos",
      "Área de atuação",
      "Experiência relevante",
      "Pacotes flexíveis"
    ],
    emoji: "⭐"
  }
};

export default function ProfessionalTypeChoice() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [entityType, setEntityType] = useState<'pf' | 'pj'>('pf');

  const handleTypeSelection = (type: string) => {
    setSelectedType(type);
  };

  const handleEntitySelection = (entity: 'pf' | 'pj') => {
    setEntityType(entity);
  };

  const handleNavigation = (type: string, entity: 'pf' | 'pj') => {
    // Navegação para a página de registro específica do tipo
    const path = `/register/${type}?entity=${entity}`;
    router.push(path);
  };

  const handleContinue = () => {
    if (selectedType) {
      handleNavigation(selectedType, entityType);
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
              <Link href="/register" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Link>
              <div className="flex items-center gap-3">
                <GalaxiaLogo />
                <ThemeToggle />
              </div>
              <Link href="/login" className="text-primary hover:underline">
                Já tem uma conta? Entre
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4 text-foreground">
                Qual é a sua área de{" "}
                <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  atuação profissional
                </span>
                ?
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Escolha sua categoria para uma experiência personalizada de cadastro
              </p>
            </div>

            {/* Quick Registration Option */}
            <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-xl p-6 mb-12 border border-blue-500/20">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Star className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold">Cadastro Rápido</h3>
                  <Star className="h-5 w-5 text-blue-500" />
                </div>
                <p className="text-muted-foreground mb-4">
                  Quer começar rapidamente? Use nosso formulário completo em uma página só
                </p>
                <div className="flex gap-3 justify-center">
                  <Link 
                    href="/register/simple?entity=pf&type=general"
                    className="inline-flex"
                  >
                    <Button variant="outline" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Pessoa Física
                    </Button>
                  </Link>
                  <Link 
                    href="/register/simple?entity=pj&type=general"
                    className="inline-flex"
                  >
                    <Button variant="outline" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Pessoa Jurídica  
                    </Button>
                  </Link>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Cadastro completo em aproximadamente 5 minutos
                </p>
              </div>
            </div>

            <div className="text-center mb-8">
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-border"></div>
                <span className="text-sm text-muted-foreground">ou</span>
                <div className="flex-1 h-px bg-border"></div>
              </div>
              <p className="text-lg text-muted-foreground mt-4">
                Escolha sua especialidade para um cadastro guiado
              </p>
            </div>

            {/* Professional Types Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {Object.entries(PROFESSIONAL_TYPES).map(([key, type]) => {
                const IconComponent = type.icon;
                const isSelected = selectedType === key;
                
                return (
                  <Card 
                    key={key}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
                      isSelected 
                        ? 'border-primary shadow-lg bg-gradient-to-br from-background to-muted/50' 
                        : 'border-border hover:border-muted-foreground/30'
                    }`}
                    onClick={() => handleTypeSelection(key)}
                  >
                    <CardHeader className="text-center pb-4">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center bg-gradient-to-r ${type.color} shadow-md`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-xl mb-2">
                        {type.emoji} {type.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {type.description}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30">
                          <Clock className="w-3 h-3 mr-1" />
                          {type.estimatedTime}
                        </Badge>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Inclui:</h4>
                        <ul className="space-y-1">
                          {type.features.slice(0, 3).map((feature, index) => (
                            <li key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                          {type.features.length > 3 && (
                            <li className="text-xs text-muted-foreground pl-5">
                              +{type.features.length - 3} outros recursos
                            </li>
                          )}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Entity Type Selection */}
            {selectedType && (
              <div className="bg-muted/30 rounded-xl p-6 mb-8 border border-border/40">
                <h3 className="text-lg font-semibold mb-4 text-center">Tipo de Pessoa</h3>
                <div className="flex gap-4 justify-center">
                  <Card 
                    className={`cursor-pointer transition-all duration-300 w-48 ${
                      entityType === 'pf' 
                        ? 'border-primary shadow-lg bg-muted/50' 
                        : 'border-border hover:border-muted-foreground/30'
                    }`}
                    onClick={() => handleEntitySelection('pf')}
                  >
                    <CardContent className="p-4 text-center">
                      <User className="w-8 h-8 mx-auto mb-2 text-foreground" />
                      <h4 className="font-medium">Pessoa Física</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Profissional autônomo
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className={`cursor-pointer transition-all duration-300 w-48 ${
                      entityType === 'pj' 
                        ? 'border-primary shadow-lg bg-muted/50' 
                        : 'border-border hover:border-muted-foreground/30'
                    }`}
                    onClick={() => handleEntitySelection('pj')}
                  >
                    <CardContent className="p-4 text-center">
                      <Building2 className="w-8 h-8 mx-auto mb-2 text-foreground" />
                      <h4 className="font-medium">Pessoa Jurídica</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Empresa ou consultório
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Continue Button */}
            <div className="text-center">
              <Button
                size="lg"
                disabled={!selectedType}
                onClick={handleContinue}
                className={`px-8 py-3 text-lg transition-all duration-300 ${
                  selectedType 
                    ? 'galaxia-button-primary'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                {selectedType 
                  ? `Continuar como ${PROFESSIONAL_TYPES[selectedType].name}`
                  : 'Selecione uma categoria para continuar'
                }
              </Button>
            </div>

            {/* Help Text */}
            <div className="text-center mt-8">
              <p className="text-sm text-muted-foreground">
                Não se preocupe, você poderá ajustar essas informações posteriormente.
              </p>
              
              {/* Theme Test */}
              <div className="mt-4 p-4 border border-border rounded-lg">
                <p className="text-xs text-muted-foreground">
                  Teste de tema: Este texto deve mudar de cor entre claro/escuro
                </p>
                <div className="flex justify-center gap-2 mt-2">
                  <div className="w-4 h-4 bg-background border border-border"></div>
                  <div className="w-4 h-4 bg-foreground"></div>
                  <div className="w-4 h-4 bg-muted"></div>
                  <div className="w-4 h-4 bg-primary"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}