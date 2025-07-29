import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  FileText,
  DollarSign,
  Clock,
  Upload,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  X,
  Calendar,
  Target,
  Briefcase
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { GalaxiaLogo } from "@/components/GalaxiaLogo";

interface ProjectFormData {
  title: string;
  description: string;
  categoryId: string;
  subcategoryId: string;
  skills: string[];
  budget: {
    type: "fixed" | "hourly";
    amount: number;
    currency: "BRL";
  };
  deadline: string;
  urgency: "low" | "medium" | "high";
  attachments: File[];
  requirements: string[];
}

// Mock data - seria substituído por API real
const mockCategories = [
  {
    id: "design",
    name: "Design Gráfico",
    subcategories: [
      { id: "logo", name: "Logo e Identidade Visual" },
      { id: "web-design", name: "Web Design" },
      { id: "print", name: "Material Gráfico" }
    ]
  },
  {
    id: "development",
    name: "Desenvolvimento",
    subcategories: [
      { id: "web-dev", name: "Desenvolvimento Web" },
      { id: "mobile", name: "Apps Mobile" },
      { id: "ecommerce", name: "E-commerce" }
    ]
  },
  {
    id: "marketing",
    name: "Marketing Digital",
    subcategories: [
      { id: "social-media", name: "Redes Sociais" },
      { id: "content", name: "Produção de Conteúdo" },
      { id: "ads", name: "Gestão de Anúncios" }
    ]
  }
];

const commonSkills = [
  "Photoshop", "Illustrator", "Figma", "React", "WordPress", 
  "SEO", "Google Ads", "Instagram", "Branding", "UI/UX"
];

export function ProjectPost() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<ProjectFormData>>({
    skills: [],
    requirements: [],
    budget: { type: "fixed", amount: 0, currency: "BRL" }
  });
  const [isLoading, setIsLoading] = useState(false);

  const steps = [
    {
      title: "O que você precisa?",
      description: "Descreva o serviço que você está buscando.",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: "Orçamento e Prazo",
      description: "Defina seu orçamento e o prazo desejado.",
      icon: <DollarSign className="h-5 w-5" />,
    },
    {
      title: "Revisão e Publicação",
      description: "Revise os detalhes e publique seu projeto.",
      icon: <CheckCircle className="h-5 w-5" />,
    },
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Simular criação do projeto
      console.log("Submitting project data:", formData);
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Projeto publicado com sucesso! Você começará a receber propostas em breve.");
      navigate("/client-dashboard");
    } catch (error) {
      console.error("Project creation error:", error);
      toast.error("Erro ao publicar o projeto. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (stepData: Partial<ProjectFormData>) => {
    setFormData(prev => ({ ...prev, ...stepData }));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.title && formData.description && formData.categoryId;
      case 1:
        return formData.budget?.amount && formData.deadline;
      case 2:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <GalaxiaLogo />
              <div className="h-8 w-px bg-border" />
              <div>
                <h1 className="text-2xl font-bold">Postar um Novo Projeto</h1>
                <p className="text-muted-foreground text-sm">
                  Descreva sua necessidade e receba propostas dos melhores profissionais
                </p>
              </div>
            </div>
            <Button variant="ghost" onClick={() => navigate("/client-dashboard")}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
          
          {/* Progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div className={`flex items-center gap-2 ${
                    index <= currentStep ? 'text-galaxia-magenta' : 'text-muted-foreground'
                  }`}>
                    <div className={`p-2 rounded-full ${
                      index <= currentStep 
                        ? 'bg-galaxia-magenta text-white' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {step.icon}
                    </div>
                    <span className="text-sm font-medium hidden md:block">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-20 h-0.5 mx-4 ${
                      index < currentStep ? 'bg-galaxia-magenta' : 'bg-border'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {steps[currentStep].icon}
                {steps[currentStep].title}
              </CardTitle>
              <p className="text-muted-foreground">{steps[currentStep].description}</p>
            </CardHeader>
            <CardContent>
              {currentStep === 0 && (
                <ProjectDescriptionStep
                  data={formData}
                  onDataChange={updateFormData}
                  categories={mockCategories}
                />
              )}
              
              {currentStep === 1 && (
                <BudgetTimelineStep
                  data={formData}
                  onDataChange={updateFormData}
                />
              )}
              
              {currentStep === 2 && (
                <ReviewAndPublishStep data={formData} />
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>

                {currentStep === steps.length - 1 ? (
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isLoading || !isStepValid()}
                    className="bg-gradient-to-r from-galaxia-magenta to-galaxia-neon text-white"
                  >
                    {isLoading ? "Publicando..." : "Publicar Projeto"}
                    <Target className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleNext}
                    disabled={!isStepValid()}
                    className="bg-gradient-to-r from-galaxia-magenta to-galaxia-neon text-white"
                  >
                    Próximo 
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// Step Components
function ProjectDescriptionStep({ 
  data, 
  onDataChange, 
  categories 
}: { 
  data: Partial<ProjectFormData>; 
  onDataChange: (data: Partial<ProjectFormData>) => void;
  categories: any[];
}) {
  const [selectedCategory, setSelectedCategory] = useState(data.categoryId || "");
  const [newSkill, setNewSkill] = useState("");

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

  const addSkill = (skill: string) => {
    if (skill && !data.skills?.includes(skill)) {
      onDataChange({
        skills: [...(data.skills || []), skill]
      });
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    onDataChange({
      skills: data.skills?.filter(skill => skill !== skillToRemove) || []
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="title">Título do Projeto *</Label>
        <Input 
          id="title" 
          placeholder="Ex: Preciso de um logo para minha cafeteria"
          value={data.title || ""}
          onChange={(e) => onDataChange({ title: e.target.value })}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="description">Descrição Detalhada *</Label>
        <Textarea 
          id="description" 
          placeholder="Descreva com detalhes o que você precisa, seus objetivos, público-alvo, e qualquer outra informação relevante..."
          className="min-h-[150px] mt-1"
          value={data.description || ""}
          onChange={(e) => onDataChange({ description: e.target.value })}
        />
        <p className="text-xs text-muted-foreground mt-1">
          💡 Quanto mais detalhes, melhores propostas você receberá
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Categoria *</Label>
          <Select 
            value={selectedCategory} 
            onValueChange={(value) => {
              setSelectedCategory(value);
              onDataChange({ categoryId: value, subcategoryId: "" });
            }}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Subcategoria</Label>
          <Select 
            value={data.subcategoryId || ""} 
            onValueChange={(value) => onDataChange({ subcategoryId: value })}
            disabled={!selectedCategoryData}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione uma subcategoria" />
            </SelectTrigger>
            <SelectContent>
              {selectedCategoryData?.subcategories.map((sub: any) => (
                <SelectItem key={sub.id} value={sub.id}>
                  {sub.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Skills Necessárias</Label>
        <div className="mt-2">
          <div className="flex flex-wrap gap-2 mb-3">
            {commonSkills.map(skill => (
              <Button
                key={skill}
                variant={data.skills?.includes(skill) ? "default" : "outline"}
                size="sm"
                onClick={() => 
                  data.skills?.includes(skill) 
                    ? removeSkill(skill) 
                    : addSkill(skill)
                }
              >
                {skill}
              </Button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Input
              placeholder="Adicionar skill personalizada..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSkill(newSkill)}
            />
            <Button onClick={() => addSkill(newSkill)} variant="outline">
              Adicionar
            </Button>
          </div>
        </div>

        {data.skills && data.skills.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-medium mb-2">Skills selecionadas:</p>
            <div className="flex flex-wrap gap-2">
              {data.skills.map(skill => (
                <Badge key={skill} variant="default" className="flex items-center gap-1">
                  {skill}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeSkill(skill)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BudgetTimelineStep({ 
  data, 
  onDataChange 
}: { 
  data: Partial<ProjectFormData>; 
  onDataChange: (data: Partial<ProjectFormData>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <Label>Tipo de Orçamento *</Label>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <Card 
            className={`cursor-pointer border-2 ${
              data.budget?.type === 'fixed' 
                ? 'border-galaxia-magenta bg-galaxia-magenta/5' 
                : 'border-border'
            }`}
            onClick={() => onDataChange({ 
              budget: { ...data.budget!, type: 'fixed' } 
            })}
          >
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 mx-auto mb-2 text-galaxia-magenta" />
              <h3 className="font-semibold">Preço Fixo</h3>
              <p className="text-sm text-muted-foreground">
                Valor total definido para o projeto
              </p>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer border-2 ${
              data.budget?.type === 'hourly' 
                ? 'border-galaxia-magenta bg-galaxia-magenta/5' 
                : 'border-border'
            }`}
            onClick={() => onDataChange({ 
              budget: { ...data.budget!, type: 'hourly' } 
            })}
          >
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-galaxia-magenta" />
              <h3 className="font-semibold">Por Hora</h3>
              <p className="text-sm text-muted-foreground">
                Pagamento baseado em horas trabalhadas
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <Label htmlFor="budget-amount">
          {data.budget?.type === 'hourly' ? 'Valor por Hora (R$) *' : 'Orçamento Total (R$) *'}
        </Label>
        <Input
          id="budget-amount"
          type="number"
          placeholder="Ex: 1500"
          value={data.budget?.amount || ""}
          onChange={(e) => onDataChange({
            budget: { ...data.budget!, amount: Number(e.target.value) }
          })}
          className="mt-1"
        />
        <p className="text-xs text-muted-foreground mt-1">
          💡 {data.budget?.type === 'hourly' 
            ? 'Defina uma faixa de valor/hora que considera justa' 
            : 'Considere a complexidade e qualidade desejada'
          }
        </p>
      </div>

      <div>
        <Label htmlFor="deadline">Prazo Desejado *</Label>
        <Input
          id="deadline"
          type="date"
          value={data.deadline || ""}
          onChange={(e) => onDataChange({ deadline: e.target.value })}
          min={new Date().toISOString().split('T')[0]}
          className="mt-1"
        />
      </div>

      <div>
        <Label>Urgência do Projeto</Label>
        <div className="grid grid-cols-3 gap-3 mt-2">
          {[
            { value: 'low', label: 'Baixa', desc: 'Posso aguardar', color: 'text-green-600' },
            { value: 'medium', label: 'Média', desc: 'Prazo normal', color: 'text-yellow-600' },
            { value: 'high', label: 'Alta', desc: 'Preciso logo', color: 'text-red-600' }
          ].map(urgency => (
            <Card 
              key={urgency.value}
              className={`cursor-pointer border-2 ${
                data.urgency === urgency.value 
                  ? 'border-galaxia-magenta bg-galaxia-magenta/5' 
                  : 'border-border'
              }`}
              onClick={() => onDataChange({ urgency: urgency.value as any })}
            >
              <CardContent className="p-3 text-center">
                <h4 className={`font-semibold ${urgency.color}`}>{urgency.label}</h4>
                <p className="text-xs text-muted-foreground">{urgency.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReviewAndPublishStep({ data }: { data: Partial<ProjectFormData> }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="h-5 w-5 text-galaxia-magenta" />
        <h3 className="font-semibold">Revise as informações do seu projeto:</h3>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{data.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{data.description}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Categoria:</span>
                <p>{data.categoryId}</p>
              </div>
              <div>
                <span className="font-medium">Orçamento:</span>
                <p>
                  {data.budget?.type === 'hourly' ? 'R$ ' + data.budget.amount + '/hora' : 'R$ ' + data.budget?.amount + ' (fixo)'}
                </p>
              </div>
              <div>
                <span className="font-medium">Prazo:</span>
                <p>{data.deadline}</p>
              </div>
              <div>
                <span className="font-medium">Urgência:</span>
                <p>{data.urgency}</p>
              </div>
            </div>

            {data.skills && data.skills.length > 0 && (
              <div className="mt-4">
                <span className="font-medium text-sm">Skills necessárias:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {data.skills.map(skill => (
                    <Badge key={skill} variant="outline">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="bg-galaxia-magenta/5 border border-galaxia-magenta/20 rounded-lg p-4">
          <h4 className="font-semibold text-galaxia-magenta mb-2">📋 Próximos Passos</h4>
          <ul className="text-sm space-y-1">
            <li>✅ Seu projeto será publicado na plataforma</li>
            <li>📬 Profissionais qualificados enviarão propostas</li>
            <li>💬 Você pode conversar com os candidatos</li>
            <li>🤝 Escolha o melhor profissional e inicie o projeto</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 