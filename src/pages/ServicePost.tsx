import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

export function ServicePost() {
  const navigate = useNavigate();
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
      navigate("/dashboard");
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
                onClick={() => navigate("/dashboard")}
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

// Step Components
function BasicInfoStep({ data, onDataChange, categories }: any) {
  const [stepData, setStepData] = useState({
    title: data.title || "",
    description: data.description || "",
    categoryId: data.categoryId || "",
    subcategoryId: data.subcategoryId || "",
    tags: data.tags || []
  });

  useEffect(() => {
    onDataChange(stepData);
  }, [stepData]);

  const addTag = (tag: string) => {
    if (tag && !stepData.tags.includes(tag)) {
      setStepData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setStepData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="title">Título do Serviço *</Label>
        <Input
          id="title"
          value={stepData.title}
          onChange={(e) => setStepData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Ex: Consultoria em Marketing Digital"
          className="mt-2"
        />
        <p className="text-sm text-muted-foreground mt-1">
          Use um título claro e específico que descreva seu serviço
        </p>
      </div>

      <div>
        <Label htmlFor="description">Descrição *</Label>
        <Textarea
          id="description"
          value={stepData.description}
          onChange={(e) => setStepData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Descreva detalhadamente seu serviço, o que está incluído, benefícios..."
          className="mt-2 min-h-[120px]"
        />
        <p className="text-sm text-muted-foreground mt-1">
          {stepData.description.length}/1000 caracteres
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Categoria *</Label>
          <Select 
            value={stepData.categoryId} 
            onValueChange={(value) => setStepData(prev => ({ ...prev, categoryId: value, subcategoryId: "" }))}
          >
            <SelectTrigger className="mt-2">
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
          <Label htmlFor="subcategory">Subcategoria</Label>
          <Select 
            value={stepData.subcategoryId} 
            onValueChange={(value) => setStepData(prev => ({ ...prev, subcategoryId: value }))}
            disabled={!stepData.categoryId}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Selecione uma subcategoria" />
            </SelectTrigger>
            <SelectContent>
              {/* Subcategories would be loaded based on selected category */}
              <SelectItem value="sub1">Subcategoria 1</SelectItem>
              <SelectItem value="sub2">Subcategoria 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2 mt-2 mb-3">
          {stepData.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Adicionar tag"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={(e) => {
              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
              addTag(input.value);
              input.value = '';
            }}
          >
            Adicionar
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Pressione Enter ou clique em Adicionar para incluir uma tag
        </p>
      </div>
    </div>
  );
}

function PackagesStep({ data, onDataChange }: any) {
  const [packages, setPackages] = useState<ServicePackage[]>(
    data.packages || [
      {
        id: "basic",
        name: "Básico",
        description: "",
        price: 0,
        deliveryTime: 1,
        revisions: 1,
        features: []
      }
    ]
  );

  useEffect(() => {
    onDataChange({ packages });
  }, [packages]);

  const addPackage = () => {
    const packageTypes = ["basic", "standard", "premium"];
    const existingTypes = packages.map(p => p.id);
    const availableType = packageTypes.find(type => !existingTypes.includes(type));
    
    if (availableType) {
      const newPackage: ServicePackage = {
        id: availableType,
        name: availableType === "standard" ? "Padrão" : "Premium",
        description: "",
        price: 0,
        deliveryTime: 1,
        revisions: 1,
        features: []
      };
      setPackages(prev => [...prev, newPackage]);
    }
  };

  const removePackage = (packageId: string) => {
    if (packages.length > 1) {
      setPackages(prev => prev.filter(p => p.id !== packageId));
    }
  };

  const updatePackage = (packageId: string, updates: Partial<ServicePackage>) => {
    setPackages(prev => prev.map(p => 
      p.id === packageId ? { ...p, ...updates } : p
    ));
  };

  const addFeature = (packageId: string, feature: string) => {
    if (feature.trim()) {
      updatePackage(packageId, {
        features: [...packages.find(p => p.id === packageId)!.features, feature.trim()]
      });
    }
  };

  const removeFeature = (packageId: string, featureIndex: number) => {
    const pkg = packages.find(p => p.id === packageId)!;
    updatePackage(packageId, {
      features: pkg.features.filter((_, i) => i !== featureIndex)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Pacotes de Serviço</h3>
          <p className="text-muted-foreground">
            Configure diferentes opções com preços variados
          </p>
        </div>
        {packages.length < 3 && (
          <Button onClick={addPackage} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Pacote
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
        {packages.map((pkg, index) => (
          <Card key={pkg.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Input
                  value={pkg.name}
                  onChange={(e) => updatePackage(pkg.id, { name: e.target.value })}
                  className="font-semibold text-lg border-none p-0 h-auto"
                  placeholder="Nome do pacote"
                />
                {packages.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePackage(pkg.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={pkg.description}
                  onChange={(e) => updatePackage(pkg.id, { description: e.target.value })}
                  placeholder="Descreva o que está incluído neste pacote"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Preço (R$)</Label>
                  <Input
                    type="number"
                    value={pkg.price}
                    onChange={(e) => updatePackage(pkg.id, { price: Number(e.target.value) })}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Prazo (dias)</Label>
                  <Input
                    type="number"
                    value={pkg.deliveryTime}
                    onChange={(e) => updatePackage(pkg.id, { deliveryTime: Number(e.target.value) })}
                    placeholder="1"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Revisões Incluídas</Label>
                <Input
                  type="number"
                  value={pkg.revisions}
                  onChange={(e) => updatePackage(pkg.id, { revisions: Number(e.target.value) })}
                  placeholder="1"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Características Incluídas</Label>
                <div className="space-y-2 mt-2">
                  {pkg.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm flex-1">{feature}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFeature(pkg.id, featureIndex)}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nova característica"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addFeature(pkg.id, e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                      className="text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        addFeature(pkg.id, input.value);
                        input.value = '';
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function GalleryStep({ data, onDataChange }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Galeria do Serviço</h3>
        <p className="text-muted-foreground">
          Adicione imagens e vídeos que demonstrem seu trabalho
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Images Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Imagens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h4 className="font-semibold mb-2">Upload de Imagens</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Formatos aceitos: JPG, PNG, GIF (max 5MB cada)
              </p>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Selecionar Imagens
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Videos Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Vídeos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h4 className="font-semibold mb-2">Upload de Vídeos</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Formatos aceitos: MP4, MOV, AVI (max 100MB cada)
              </p>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Selecionar Vídeos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100">
              Dicas para uma boa galeria
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 mt-2 space-y-1">
              <li>• Use imagens de alta qualidade que mostrem seu trabalho</li>
              <li>• Inclua exemplos de antes e depois quando aplicável</li>
              <li>• Vídeos demonstrativos aumentam a conversão</li>
              <li>• Primeira imagem será usada como capa do serviço</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function ServiceAreaStep({ data, onDataChange }: any) {
  const [areaData, setAreaData] = useState({
    type: data.serviceArea?.type || "remote",
    coverage: data.serviceArea?.coverage || [],
    travelRadius: data.serviceArea?.travelRadius || 0
  });

  useEffect(() => {
    onDataChange({ serviceArea: areaData });
  }, [areaData]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Área de Atuação</h3>
        <p className="text-muted-foreground">
          Defina onde você pode prestar seus serviços
        </p>
      </div>

      <div>
        <Label>Tipo de Atendimento</Label>
        <RadioGroup
          value={areaData.type}
          onValueChange={(value) => setAreaData(prev => ({ ...prev, type: value as any }))}
          className="mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="remote" id="remote" />
            <Label htmlFor="remote" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Remoto (online)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="local" id="local" />
            <Label htmlFor="local" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Presencial (local específico)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="both" id="both" />
            <Label htmlFor="both" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Ambos (remoto e presencial)
            </Label>
          </div>
        </RadioGroup>
      </div>

      {(areaData.type === "local" || areaData.type === "both") && (
        <div className="space-y-4">
          <div>
            <Label>Estados onde atende</Label>
            <Select>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Selecione os estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SP">São Paulo</SelectItem>
                <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                <SelectItem value="MG">Minas Gerais</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Raio de atendimento (km)</Label>
            <Input
              type="number"
              value={areaData.travelRadius}
              onChange={(e) => setAreaData(prev => ({ ...prev, travelRadius: Number(e.target.value) }))}
              placeholder="50"
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Distância máxima que você viaja para atendimento presencial
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function AvailabilityStep({ data, onDataChange }: any) {
  const [availability, setAvailability] = useState({
    daysOfWeek: data.availability?.daysOfWeek || [],
    startTime: data.availability?.startTime || "09:00",
    endTime: data.availability?.endTime || "18:00",
    timezone: data.availability?.timezone || "America/Sao_Paulo"
  });

  useEffect(() => {
    onDataChange({ availability });
  }, [availability]);

  const weekDays = [
    { value: "monday", label: "Segunda" },
    { value: "tuesday", label: "Terça" },
    { value: "wednesday", label: "Quarta" },
    { value: "thursday", label: "Quinta" },
    { value: "friday", label: "Sexta" },
    { value: "saturday", label: "Sábado" },
    { value: "sunday", label: "Domingo" }
  ];

  const toggleDay = (day: string) => {
    setAvailability(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day]
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Disponibilidade</h3>
        <p className="text-muted-foreground">
          Configure seus horários de atendimento
        </p>
      </div>

      <div>
        <Label>Dias da semana</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
          {weekDays.map((day) => (
            <div key={day.value} className="flex items-center space-x-2">
              <Checkbox
                id={day.value}
                checked={availability.daysOfWeek.includes(day.value)}
                onCheckedChange={() => toggleDay(day.value)}
              />
              <Label htmlFor={day.value}>{day.label}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startTime">Horário de Início</Label>
          <Input
            id="startTime"
            type="time"
            value={availability.startTime}
            onChange={(e) => setAvailability(prev => ({ ...prev, startTime: e.target.value }))}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="endTime">Horário de Término</Label>
          <Input
            id="endTime"
            type="time"
            value={availability.endTime}
            onChange={(e) => setAvailability(prev => ({ ...prev, endTime: e.target.value }))}
            className="mt-2"
          />
        </div>
      </div>

      <div>
        <Label>Fuso Horário</Label>
        <Select 
          value={availability.timezone}
          onValueChange={(value) => setAvailability(prev => ({ ...prev, timezone: value }))}
        >
          <SelectTrigger className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="America/Sao_Paulo">Brasília (GMT-3)</SelectItem>
            <SelectItem value="America/Manaus">Manaus (GMT-4)</SelectItem>
            <SelectItem value="America/Rio_Branco">Acre (GMT-5)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function PoliciesStep({ data, onDataChange }: any) {
  const [policies, setPolicies] = useState({
    cancellation: data.policies?.cancellation || "",
    refund: data.policies?.refund || "",
    communication: data.policies?.communication || ""
  });

  const [faqs, setFaqs] = useState(data.faqs || []);
  const [requirements, setRequirements] = useState(data.requirements || []);

  useEffect(() => {
    onDataChange({ policies, faqs, requirements });
  }, [policies, faqs, requirements]);

  const addFaq = () => {
    setFaqs(prev => [...prev, { question: "", answer: "" }]);
  };

  const updateFaq = (index: number, field: string, value: string) => {
    setFaqs(prev => prev.map((faq, i) => 
      i === index ? { ...faq, [field]: value } : faq
    ));
  };

  const removeFaq = (index: number) => {
    setFaqs(prev => prev.filter((_, i) => i !== index));
  };

  const addRequirement = (requirement: string) => {
    if (requirement.trim()) {
      setRequirements(prev => [...prev, requirement.trim()]);
    }
  };

  const removeRequirement = (index: number) => {
    setRequirements(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Políticas do Serviço</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="cancellation">Política de Cancelamento</Label>
            <Textarea
              id="cancellation"
              value={policies.cancellation}
              onChange={(e) => setPolicies(prev => ({ ...prev, cancellation: e.target.value }))}
              placeholder="Descreva sua política de cancelamento..."
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="refund">Política de Reembolso</Label>
            <Textarea
              id="refund"
              value={policies.refund}
              onChange={(e) => setPolicies(prev => ({ ...prev, refund: e.target.value }))}
              placeholder="Descreva sua política de reembolso..."
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="communication">Política de Comunicação</Label>
            <Textarea
              id="communication"
              value={policies.communication}
              onChange={(e) => setPolicies(prev => ({ ...prev, communication: e.target.value }))}
              placeholder="Como você prefere se comunicar com os clientes..."
              className="mt-2"
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Perguntas Frequentes</h3>
            <p className="text-muted-foreground">
              Antecipe dúvidas comuns dos clientes
            </p>
          </div>
          <Button onClick={addFaq} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar FAQ
          </Button>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index}>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Input
                      value={faq.question}
                      onChange={(e) => updateFaq(index, "question", e.target.value)}
                      placeholder="Pergunta..."
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFaq(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Textarea
                    value={faq.answer}
                    onChange={(e) => updateFaq(index, "answer", e.target.value)}
                    placeholder="Resposta..."
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Requisitos do Cliente</h3>
          <p className="text-muted-foreground">
            O que o cliente precisa fornecer para você começar o trabalho
          </p>
        </div>

        <div className="space-y-3">
          {requirements.map((req, index) => (
            <div key={index} className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="flex-1">{req}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeRequirement(index)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          <div className="flex gap-2">
            <Input
              placeholder="Novo requisito"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addRequirement(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
            <Button
              variant="outline"
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                addRequirement(input.value);
                input.value = '';
              }}
            >
              Adicionar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewStep({ data }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Revisão do Serviço</h3>
        <p className="text-muted-foreground">
          Revise todas as informações antes de publicar
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div>
              <span className="font-medium">Título:</span> {data.title}
            </div>
            <div>
              <span className="font-medium">Categoria:</span> {data.categoryId}
            </div>
            <div>
              <span className="font-medium">Tags:</span> {data.tags.join(", ")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pacotes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            {data.packages.map((pkg: ServicePackage) => (
              <div key={pkg.id} className="border-l-2 border-primary pl-3">
                <div className="font-medium">{pkg.name}</div>
                <div>R$ {pkg.price} • {pkg.deliveryTime} dias</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Configurações</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div>
              <span className="font-medium">Área:</span> {data.serviceArea.type}
            </div>
            <div>
              <span className="font-medium">Dias:</span> {data.availability.daysOfWeek.length} dias/semana
            </div>
            <div>
              <span className="font-medium">Horário:</span> {data.availability.startTime} - {data.availability.endTime}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <div>
            <h4 className="font-semibold text-green-900 dark:text-green-100">
              Pronto para publicar!
            </h4>
            <p className="text-sm text-green-800 dark:text-green-200">
              Seu serviço será publicado e ficará visível para clientes imediatamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}