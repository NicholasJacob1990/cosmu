'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Upload,
  Globe,
  MapPin,
  DollarSign,
  Clock,
  Star,
  CheckCircle,
  AlertCircle,
  FileText,
  Image,
  Video,
  Settings,
  Save,
  Eye,
  ChevronRight,
  Package,
  Target,
  Users,
  Calendar,
  Shield
} from "lucide-react";
import { servicesApi, categoriesApi, portfolioApi, coverageApi } from "@/lib/api";
import { Footer } from "@/components/Footer";

interface ServicePackage {
  id: string;
  name: string;
  description: string;
  price: number;
  deliveryTime: number;
  revisions: number;
  features: string[];
}

interface ServiceFormData {
  title: string;
  description: string;
  categoryId: string;
  subcategoryId: string;
  tags: string[];
  packages: ServicePackage[];
  images: File[];
  videos: File[];
  faqs: { question: string; answer: string }[];
  requirements: string[];
  serviceArea: {
    type: "local" | "remote" | "both";
    coverage: string[];
    travelRadius: number;
  };
  availability: {
    daysOfWeek: string[];
    startTime: string;
    endTime: string;
    timezone: string;
  };
  policies: {
    cancellation: string;
    refund: string;
    communication: string;
  };
  isActive: boolean;
}

export default function CreateService() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ServiceFormData>({
    title: "",
    description: "",
    categoryId: "",
    subcategoryId: "",
    tags: [],
    packages: [
      {
        id: "basic",
        name: "Básico",
        description: "",
        price: 0,
        deliveryTime: 1,
        revisions: 1,
        features: []
      }
    ],
    images: [],
    videos: [],
    faqs: [],
    requirements: [],
    serviceArea: {
      type: "remote",
      coverage: [],
      travelRadius: 0
    },
    availability: {
      daysOfWeek: [],
      startTime: "09:00",
      endTime: "18:00",
      timezone: "America/Sao_Paulo"
    },
    policies: {
      cancellation: "",
      refund: "",
      communication: ""
    },
    isActive: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDraft, setIsDraft] = useState(false);

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });

  // Fetch subcategories when category changes
  const { data: subcategories } = useQuery({
    queryKey: ['subcategories', formData.categoryId],
    queryFn: () => categoriesApi.getById(formData.categoryId),
    enabled: !!formData.categoryId,
  });

  const steps = [
    {
      title: "Informações Básicas",
      description: "Título, descrição e categoria",
      component: BasicInfoStep
    },
    {
      title: "Pacotes e Preços",
      description: "Configure seus pacotes de serviço",
      component: PackagesStep
    },
    {
      title: "Galeria",
      description: "Imagens e vídeos do seu serviço",
      component: GalleryStep
    },
    {
      title: "Área de Atuação",
      description: "Onde você atende",
      component: ServiceAreaStep
    },
    {
      title: "Disponibilidade",
      description: "Horários e dias de atendimento",
      component: AvailabilityStep
    },
    {
      title: "FAQ e Políticas",
      description: "Perguntas frequentes e políticas",
      component: PoliciesStep
    },
    {
      title: "Revisão",
      description: "Revise e publique",
      component: ReviewStep
    }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;
  const CurrentStepComponent = steps[currentStep].component;

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

  const handleSaveDraft = async () => {
    setIsDraft(true);
    await handleSubmit(true);
  };

  const handleSubmit = async (asDraft = false) => {
    setIsLoading(true);
    try {
      const submitData = {
        ...formData,
        status: asDraft ? "draft" : "active"
      };

      await servicesApi.create(submitData);
      
      toast.success(asDraft ? "Rascunho salvo com sucesso!" : "Serviço publicado com sucesso!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Service creation error:", error);
      toast.error("Erro ao criar serviço. Tente novamente.");
    } finally {
      setIsLoading(false);
      setIsDraft(false);
    }
  };

  const updateFormData = (stepData: Partial<ServiceFormData>) => {
    setFormData(prev => ({ ...prev, ...stepData }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">Criar Novo Serviço</h1>
              <p className="text-muted-foreground">
                Configure seu serviço para atrair clientes
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isLoading || isDraft}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isDraft ? "Salvando..." : "Salvar Rascunho"}
              </Button>
              <Button
                onClick={() => router.push("/dashboard")}
                variant="ghost"
              >
                Cancelar
              </Button>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Etapa {currentStep + 1} de {steps.length}</span>
              <span>{Math.round(progress)}% concluído</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Step indicator */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
              >
                <div className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    index <= currentStep 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {index < currentStep ? <CheckCircle className="h-4 w-4" /> : index + 1}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p className={`text-sm font-medium ${
                      index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    index < currentStep ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <Card>
            <CardHeader>
              <CardTitle>{steps[currentStep].title}</CardTitle>
              <p className="text-muted-foreground">{steps[currentStep].description}</p>
            </CardHeader>
            <CardContent>
              <CurrentStepComponent
                data={formData}
                onDataChange={updateFormData}
                categories={categories?.data}
                subcategories={subcategories?.data}
              />

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2"
                >
                  ← Anterior
                </Button>

                <div className="flex items-center gap-3">
                  {currentStep === steps.length - 1 ? (
                    <Button
                      onClick={() => handleSubmit(false)}
                      disabled={isLoading}
                      className="flex items-center gap-2"
                    >
                      {isLoading ? "Publicando..." : "Publicar Serviço"}
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      className="flex items-center gap-2"
                    >
                      Próximo
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// Step Components (simplified implementations)
function BasicInfoStep({ data, onDataChange, categories, subcategories }: any) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="title">Título do Serviço *</Label>
        <Input
          id="title"
          placeholder="Ex: Criação de Logo Profissional"
          value={data.title || ""}
          onChange={(e) => onDataChange({ title: e.target.value })}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="description">Descrição Detalhada *</Label>
        <Textarea
          id="description"
          placeholder="Descreva seu serviço com detalhes..."
          className="min-h-[150px] mt-1"
          value={data.description || ""}
          onChange={(e) => onDataChange({ description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Categoria *</Label>
          <Select 
            value={data.categoryId || ""} 
            onValueChange={(value) => onDataChange({ categoryId: value, subcategoryId: "" })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((category: any) => (
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
            disabled={!data.categoryId}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione uma subcategoria" />
            </SelectTrigger>
            <SelectContent>
              {subcategories?.subcategories?.map((sub: any) => (
                <SelectItem key={sub.id} value={sub.id}>
                  {sub.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

function PackagesStep({ data, onDataChange }: any) {
  const addPackage = () => {
    const newPackage: ServicePackage = {
      id: `package_${Date.now()}`,
      name: "",
      description: "",
      price: 0,
      deliveryTime: 1,
      revisions: 1,
      features: []
    };
    onDataChange({ packages: [...data.packages, newPackage] });
  };

  const updatePackage = (index: number, updates: Partial<ServicePackage>) => {
    const updatedPackages = data.packages.map((pkg: ServicePackage, i: number) => 
      i === index ? { ...pkg, ...updates } : pkg
    );
    onDataChange({ packages: updatedPackages });
  };

  const removePackage = (index: number) => {
    const updatedPackages = data.packages.filter((_: any, i: number) => i !== index);
    onDataChange({ packages: updatedPackages });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Pacotes de Serviço</h3>
        <Button onClick={addPackage} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Pacote
        </Button>
      </div>

      {data.packages.map((pkg: ServicePackage, index: number) => (
        <Card key={pkg.id} className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Pacote {index + 1}</h4>
            {data.packages.length > 1 && (
              <Button
                onClick={() => removePackage(index)}
                variant="ghost"
                size="sm"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nome do Pacote *</Label>
              <Input
                placeholder="Ex: Básico, Premium, Profissional"
                value={pkg.name}
                onChange={(e) => updatePackage(index, { name: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Preço (R$) *</Label>
              <Input
                type="number"
                placeholder="0"
                value={pkg.price}
                onChange={(e) => updatePackage(index, { price: Number(e.target.value) })}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Prazo de Entrega (dias) *</Label>
              <Input
                type="number"
                placeholder="1"
                value={pkg.deliveryTime}
                onChange={(e) => updatePackage(index, { deliveryTime: Number(e.target.value) })}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Revisões Incluídas *</Label>
              <Input
                type="number"
                placeholder="1"
                value={pkg.revisions}
                onChange={(e) => updatePackage(index, { revisions: Number(e.target.value) })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="mt-4">
            <Label>Descrição do Pacote *</Label>
            <Textarea
              placeholder="Descreva o que está incluído neste pacote..."
              value={pkg.description}
              onChange={(e) => updatePackage(index, { description: e.target.value })}
              className="mt-1"
            />
          </div>
        </Card>
      ))}
    </div>
  );
}

// Placeholder components for other steps
function GalleryStep({ data, onDataChange }: any) {
  return (
    <div className="space-y-6">
      <div className="text-center p-8 border-2 border-dashed border-muted rounded-lg">
        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="font-semibold mb-2">Upload de Imagens</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Adicione imagens do seu trabalho para mostrar a qualidade
        </p>
        <Button variant="outline">
          Selecionar Imagens
        </Button>
      </div>
    </div>
  );
}

function ServiceAreaStep({ data, onDataChange }: any) {
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold">Onde você atende?</Label>
        <RadioGroup 
          value={data.serviceArea?.type || "remote"} 
          onValueChange={(value) => onDataChange({ 
            serviceArea: { ...data.serviceArea, type: value } 
          })}
          className="mt-3"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="remote" id="remote" />
            <Label htmlFor="remote">Remoto</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="local" id="local" />
            <Label htmlFor="local">Presencial</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="both" id="both" />
            <Label htmlFor="both">Ambos</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}

function AvailabilityStep({ data, onDataChange }: any) {
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold">Dias da Semana</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
          {[
            { key: 'mon', label: 'Segunda' },
            { key: 'tue', label: 'Terça' },
            { key: 'wed', label: 'Quarta' },
            { key: 'thu', label: 'Quinta' },
            { key: 'fri', label: 'Sexta' },
            { key: 'sat', label: 'Sábado' },
            { key: 'sun', label: 'Domingo' }
          ].map(day => (
            <div key={day.key} className="flex items-center space-x-2">
              <Checkbox
                id={day.key}
                checked={data.availability?.daysOfWeek?.includes(day.key)}
                onCheckedChange={(checked) => {
                  const currentDays = data.availability?.daysOfWeek || [];
                  const newDays = checked 
                    ? [...currentDays, day.key]
                    : currentDays.filter((d: string) => d !== day.key);
                  onDataChange({
                    availability: { ...data.availability, daysOfWeek: newDays }
                  });
                }}
              />
              <Label htmlFor={day.key} className="text-sm">{day.label}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Horário de Início</Label>
          <Input
            type="time"
            value={data.availability?.startTime || "09:00"}
            onChange={(e) => onDataChange({
              availability: { ...data.availability, startTime: e.target.value }
            })}
            className="mt-1"
          />
        </div>

        <div>
          <Label>Horário de Fim</Label>
          <Input
            type="time"
            value={data.availability?.endTime || "18:00"}
            onChange={(e) => onDataChange({
              availability: { ...data.availability, endTime: e.target.value }
            })}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
}

function PoliciesStep({ data, onDataChange }: any) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="cancellation">Política de Cancelamento</Label>
        <Textarea
          id="cancellation"
          placeholder="Descreva sua política de cancelamento..."
          value={data.policies?.cancellation || ""}
          onChange={(e) => onDataChange({
            policies: { ...data.policies, cancellation: e.target.value }
          })}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="refund">Política de Reembolso</Label>
        <Textarea
          id="refund"
          placeholder="Descreva sua política de reembolso..."
          value={data.policies?.refund || ""}
          onChange={(e) => onDataChange({
            policies: { ...data.policies, refund: e.target.value }
          })}
          className="mt-1"
        />
      </div>
    </div>
  );
}

function ReviewStep({ data }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Eye className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Pré-visualização do Serviço</h3>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{data.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{data.description}</p>
          
          {data.packages?.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Pacotes:</h4>
              <div className="grid gap-2">
                {data.packages.map((pkg: ServicePackage, index: number) => (
                  <div key={pkg.id} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div>
                      <span className="font-medium">{pkg.name}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({pkg.deliveryTime} dias)
                      </span>
                    </div>
                    <span className="font-semibold">R$ {pkg.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <h4 className="font-semibold text-primary mb-2">📋 Próximos Passos</h4>
        <ul className="text-sm space-y-1">
          <li>✅ Seu serviço será publicado na plataforma</li>
          <li>📬 Clientes poderão visualizar e contratar</li>
          <li>💬 Você receberá notificações de novos pedidos</li>
          <li>🤝 Mantenha seu perfil sempre atualizado</li>
        </ul>
      </div>
    </div>
  );
}