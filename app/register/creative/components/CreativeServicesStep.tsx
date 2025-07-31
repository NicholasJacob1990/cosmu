'use client';

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function CreativeServicesStep({ data, onDataChange, entityType = 'pf' }: any) {
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
    availability: data.availability || "available",
    maxSimultaneousProjects: data.maxSimultaneousProjects || "3",
    
    // Termos de trabalho
    workProcess: data.workProcess || "",
    requirements: data.requirements || [],
    deliverables: data.deliverables || [],
    
    // Extras
    extras: data.extras || [],
    
    // Políticas
    cancellationPolicy: data.cancellationPolicy || "flexible",
    copyrightPolicy: data.copyrightPolicy || "client",
    
    // Para PJ - informações adicionais
    teamSize: data.teamSize || "",
    studioInfo: data.studioInfo || ""
  });

  useEffect(() => {
    onDataChange(stepData);
  }, [stepData, onDataChange]);

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
            </div>

            <div>
              <Label>Descrição do Serviço *</Label>
              <Textarea
                value={service.description}
                onChange={(e) => {
                  const newServices = [...stepData.services];
                  newServices[serviceIndex].description = e.target.value;
                  setStepData(prev => ({ ...prev, services: newServices }));
                }}
                placeholder="Descreva detalhadamente o que está incluído no serviço..."
                rows={3}
                maxLength={500}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Tempo de Entrega *</Label>
                <Select
                  value={service.deliveryTime}
                  onValueChange={(value) => {
                    const newServices = [...stepData.services];
                    newServices[serviceIndex].deliveryTime = value;
                    setStepData(prev => ({ ...prev, services: newServices }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o prazo" />
                  </SelectTrigger>
                  <SelectContent>
                    {deliveryTimeOptions.map((option) => (
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
                    <SelectValue placeholder="Número de revisões" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 revisão</SelectItem>
                    <SelectItem value="2">2 revisões</SelectItem>
                    <SelectItem value="3">3 revisões</SelectItem>
                    <SelectItem value="unlimited">Revisões ilimitadas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Pacotes de Preço */}
            <div className="space-y-4">
              <h4 className="font-semibold">Pacotes de Preço</h4>
              <div className="grid md:grid-cols-3 gap-4">
                {Object.entries(service.packages).map(([packageType, packageData]) => (
                  <div key={packageType} className="border rounded-lg p-4">
                    <h5 className="font-medium mb-2 capitalize">{packageData.name}</h5>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-sm">Preço (R$)</Label>
                        <Input
                          type="number"
                          value={packageData.price}
                          onChange={(e) => {
                            const newServices = [...stepData.services];
                            newServices[serviceIndex].packages[packageType].price = e.target.value;
                            setStepData(prev => ({ ...prev, services: newServices }));
                          }}
                          placeholder="150"
                        />
                      </div>
                    </div>
                  </div>
                ))}
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
        + Adicionar Serviço
      </Button>

      {/* Configurações Gerais */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Configurações Gerais</h3>
        
        <div>
          <Label>Status de Disponibilidade</Label>
          <RadioGroup
            value={stepData.availability}
            onValueChange={(value) => setStepData(prev => ({ ...prev, availability: value }))}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="available" id="available" />
              <Label htmlFor="available" className="font-normal">Disponível para novos projetos</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="busy" id="busy" />
              <Label htmlFor="busy" className="font-normal">Ocupado (agenda limitada)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="vacation" id="vacation" />
              <Label htmlFor="vacation" className="font-normal">Em férias</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label>Máximo de Projetos Simultâneos</Label>
          <Select
            value={stepData.maxSimultaneousProjects}
            onValueChange={(value) => setStepData(prev => ({ ...prev, maxSimultaneousProjects: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 projeto</SelectItem>
              <SelectItem value="2">2 projetos</SelectItem>
              <SelectItem value="3">3 projetos</SelectItem>
              <SelectItem value="5">5 projetos</SelectItem>
              <SelectItem value="unlimited">Ilimitado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}