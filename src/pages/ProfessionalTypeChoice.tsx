import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, Camera, Code, Briefcase, Clock, Users, CheckCircle2, Star, User, Building2 } from "lucide-react";
import { GalaxiaLogo } from "@/components/GalaxiaLogo";

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
    estimatedTime: "10-12 min",
    features: [
      "Stack tecnológico",
      "Linguagens de programação",
      "Frameworks e ferramentas",
      "Projetos no GitHub",
      "Especialidades técnicas"
    ],
    emoji: "💻"
  },
  business: {
    name: "Profissional de Negócios",
    description: "Consultores, advogados, contadores e administradores",
    icon: Briefcase,
    color: "from-green-500 to-emerald-500",
    borderColor: "border-green-300",
    textColor: "text-green-600", 
    hoverColor: "hover:bg-green-50",
    estimatedTime: "12-18 min",
    features: [
      "Área de atuação",
      "Certificações profissionais",
      "Experiência corporativa",
      "Tipos de consultoria",
      "Credenciais e registros"
    ],
    emoji: "💼"
  },
  general: {
    name: "Profissional Geral",
    description: "Outros tipos de serviços e profissões",
    icon: Users,
    color: "from-galaxia-magenta to-galaxia-neon",
    borderColor: "border-galaxia-grad-b",
    textColor: "text-galaxia-grad-b",
    hoverColor: "hover:bg-galaxia-surface",
    estimatedTime: "10-12 min",
    features: [
      "Serviços de marcenaria, reformas e reparos",
      "Engenharia e arquitetura",
      "Transporte e logística",
      "Portfolio de trabalhos realizados",
      "Pacotes de serviços personalizados"
    ],
    emoji: "⚡"
  }
};

export function ProfessionalTypeChoice() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [entityType, setEntityType] = useState<'pf' | 'pj' | null>(null);
  const [showEntityChoice, setShowEntityChoice] = useState(false);

  const handleTypeSelection = (type: string) => {
    setSelectedType(type);
    // Para todos os tipos, mostrar escolha PF/PJ 
    setShowEntityChoice(true);
  };

  const handleEntitySelection = (entity: 'pf' | 'pj') => {
    setEntityType(entity);
    if (selectedType) {
      handleNavigation(selectedType, entity);
    }
  };

  const handleNavigation = (type: string, entity: 'pf' | 'pj') => {
    console.log("ProfessionalTypeChoice - type:", type, "entity:", entity);
    const route = `/register/${type}?entity=${entity}`;
    console.log(`ProfessionalTypeChoice - navigating to ${route}`);
    navigate(route);
  };

  const handleContinue = () => {
    if (selectedType && entityType) {
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
              <Link to="/register" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Link>
              <GalaxiaLogo />
              <Link to="/login" className="text-primary hover:underline">
                Já tem uma conta? Entre
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-galaxia-magenta to-galaxia-neon rounded-2xl flex items-center justify-center">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">
              Qual o seu tipo de{" "}
              <span className="bg-gradient-to-r from-galaxia-grad-a via-galaxia-grad-b to-galaxia-grad-c bg-clip-text text-transparent">
                profissão?
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              Escolha sua área para um cadastro personalizado
            </p>
            <p className="text-sm text-muted-foreground">
              Cada tipo de profissão tem um processo de cadastro otimizado para suas necessidades específicas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
            {Object.entries(PROFESSIONAL_TYPES).map(([key, type]) => {
              const IconComponent = type.icon;
              const isSelected = selectedType === key;
              
              return (
                <Card 
                  key={key}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    isSelected 
                      ? `ring-2 ring-offset-2 ${type.borderColor.replace('border-', 'ring-')} shadow-lg bg-gradient-to-br from-background to-muted/20` 
                      : 'hover:shadow-md border-border/40'
                  }`}
                  onClick={() => handleTypeSelection(key)}
                >
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${type.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <span className="text-white text-2xl">{type.emoji}</span>
                    </div>
                    <CardTitle className="text-xl flex items-center justify-center gap-2">
                      {type.name}
                      {isSelected && (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      )}
                    </CardTitle>
                    <p className="text-muted-foreground text-sm">
                      {type.description}
                    </p>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Tempo estimado: {type.estimatedTime}</span>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Inclui:</h4>
                      <div className="space-y-1">
                        {type.features.slice(0, 3).map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
                            <span>{feature}</span>
                          </div>
                        ))}
                        {type.features.length > 3 && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
                            <span>+ {type.features.length - 3} funcionalidades</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {key === 'general' && (
                      <Badge variant="outline" className="w-full justify-center">
                        <Star className="h-3 w-3 mr-1" />
                        Recomendado para início rápido
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Entity Type Choice for All Professional Types */}
          {showEntityChoice && selectedType && (
            <div className="max-w-4xl mx-auto mb-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Como você quer se cadastrar?</h3>
                <p className="text-muted-foreground">
                  Escolha o tipo de cadastro adequado para sua situação profissional
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pessoa Física */}
                <Card 
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    entityType === 'pf' 
                      ? 'ring-2 ring-blue-500 shadow-lg bg-gradient-to-br from-background to-blue-50/20' 
                      : 'hover:shadow-md border-border/40'
                  }`}
                  onClick={() => handleEntitySelection('pf')}
                >
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                      <User className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl flex items-center justify-center gap-2">
                      Profissional (Pessoa Física)
                      {entityType === 'pf' && (
                        <CheckCircle2 className="h-5 w-5 text-blue-500" />
                      )}
                    </CardTitle>
                    <p className="text-muted-foreground text-sm">
                      Profissional autônomo prestando serviços individuais
                    </p>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Cadastro individual com CPF</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Registros profissionais individuais</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Documentos pessoais</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Processo mais rápido</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Pessoa Jurídica */}
                <Card 
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    entityType === 'pj' 
                      ? 'ring-2 ring-indigo-500 shadow-lg bg-gradient-to-br from-background to-indigo-50/20' 
                      : 'hover:shadow-md border-border/40'
                  }`}
                  onClick={() => handleEntitySelection('pj')}
                >
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl flex items-center justify-center gap-2">
                      Empresa (Pessoa Jurídica)
                      {entityType === 'pj' && (
                        <CheckCircle2 className="h-5 w-5 text-indigo-500" />
                      )}
                    </CardTitle>
                    <p className="text-muted-foreground text-sm">
                      {selectedType === 'health' 
                        ? 'Clínica, consultório, hospital ou estabelecimento de saúde'
                        : selectedType === 'creative'
                        ? 'Agência, estúdio criativo ou empresa de produção'
                        : selectedType === 'tech'
                        ? 'Software house, consultoria ou empresa de TI'
                        : selectedType === 'general'
                        ? 'Empresa ou microempreendimento individual (MEI)'
                        : 'Consultoria, escritório ou empresa de serviços'
                      }
                    </p>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                        <span>Cadastro empresarial com CNPJ</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                        <span>{selectedType === 'health' ? 'Registro CNES obrigatório' : 'Registros específicos da área'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                        <span>{selectedType === 'health' ? 'Licenças sanitárias' : 'Licenças e alvarás'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                        <span>Responsável técnico</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center mt-6">
                <p className="text-sm text-muted-foreground">
                  💡 <strong>Dica:</strong> Se você é um profissional trabalhando sozinho, escolha "Pessoa Física". 
                  Se possui uma {selectedType === 'health' ? 'clínica ou consultório' : selectedType === 'creative' ? 'agência ou estúdio' : 'empresa'} com CNPJ, escolha "Pessoa Jurídica".
                </p>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="max-w-md mx-auto">
            <Button 
              size="lg" 
              className="w-full bg-gradient-to-r from-galaxia-magenta to-galaxia-neon text-white hover:from-galaxia-neon hover:to-galaxia-magenta shadow-galaxia-glow"
              disabled={!selectedType || (showEntityChoice && !entityType)}
              onClick={handleContinue}
            >
              {!selectedType 
                ? 'Selecione um tipo de profissão'
                : showEntityChoice && !entityType
                ? 'Selecione o tipo de cadastro'  
                : entityType === 'pj'
                ? `Continuar como Empresa`
                : `Continuar como ${PROFESSIONAL_TYPES[selectedType].name}`
              }
            </Button>

            {selectedType && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                {selectedType === 'general' 
                  ? 'Você será direcionado para o cadastro simplificado'
                  : `Você será direcionado para o cadastro especializado em ${PROFESSIONAL_TYPES[selectedType].estimatedTime}`
                }
              </p>
            )}
          </div>

          {/* Stats Section */}
          <div className="mt-16 pt-12 border-t border-border/40">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
              <div className="space-y-2">
                <div className="text-2xl font-bold bg-gradient-to-r from-galaxia-grad-a to-galaxia-grad-c bg-clip-text text-transparent">
                  15K+
                </div>
                <p className="text-muted-foreground">Profissionais cadastrados</p>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold bg-gradient-to-r from-galaxia-grad-a to-galaxia-grad-c bg-clip-text text-transparent">
                  95%
                </div>
                <p className="text-muted-foreground">Taxa de aprovação</p>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold bg-gradient-to-r from-galaxia-grad-a to-galaxia-grad-c bg-clip-text text-transparent">
                  4.8★
                </div>
                <p className="text-muted-foreground">Avaliação média</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}