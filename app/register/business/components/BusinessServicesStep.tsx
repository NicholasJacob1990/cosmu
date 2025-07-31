'use client';

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react";

export function BusinessServicesStep({ data, onDataChange, entityType = 'pf' }: any) {
  const [stepData, setStepData] = useState({
    // Serviços oferecidos
    services: data.services || [{
      name: "",
      description: "",
      duration: "",
      deliverables: "",
      price: ""
    }],
    
    // Modelo de precificação
    pricingModel: data.pricingModel || "hourly", // hourly, project, retainer
    hourlyRate: data.hourlyRate || "",
    minimumProject: data.minimumProject || "",
    
    // Termos de trabalho
    paymentTerms: data.paymentTerms || "",
    contractTerms: data.contractTerms || "",
    
    // Disponibilidade
    availability: data.availability || "available",
    capacity: data.capacity || ""
  });

  useEffect(() => {
    onDataChange(stepData);
  }, [stepData, onDataChange]);

  const handleAddService = () => {
    setStepData(prev => ({
      ...prev,
      services: [...prev.services, {
        name: "",
        description: "",
        duration: "",
        deliverables: "",
        price: ""
      }]
    }));
  };

  const handleRemoveService = (index: number) => {
    setStepData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Informação contextual */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">
          {entityType === 'pf' ? '💼 Configuração de Consultorias' : '🏢 Serviços da Empresa'}
        </h3>
        <p className="text-sm text-muted-foreground">
          Configure os serviços de consultoria que você oferece e suas condições.
        </p>
      </div>

      {/* Serviços */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Serviços de Consultoria</h3>
        
        {stepData.services.map((service, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="font-medium">Serviço {index + 1}</h4>
              {stepData.services.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveService(index)}
                  className="text-red-600"
                >
                  Remover
                </Button>
              )}
            </div>

            <div>
              <Label>Nome do Serviço *</Label>
              <Input
                value={service.name}
                onChange={(e) => {
                  const newServices = [...stepData.services];
                  newServices[index].name = e.target.value;
                  setStepData(prev => ({ ...prev, services: newServices }));
                }}
                placeholder="Ex: Consultoria em Estratégia de Negócios"
              />
            </div>

            <div>
              <Label>Descrição do Serviço *</Label>
              <Textarea
                value={service.description}
                onChange={(e) => {
                  const newServices = [...stepData.services];
                  newServices[index].description = e.target.value;
                  setStepData(prev => ({ ...prev, services: newServices }));
                }}
                placeholder="Descreva detalhadamente o serviço, metodologia e benefícios..."
                rows={3}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Duração Estimada</Label>
                <Input
                  value={service.duration}
                  onChange={(e) => {
                    const newServices = [...stepData.services];
                    newServices[index].duration = e.target.value;
                    setStepData(prev => ({ ...prev, services: newServices }));
                  }}
                  placeholder="Ex: 4-6 semanas"
                />
              </div>
              <div>
                <Label>Preço Base (R$)</Label>
                <Input
                  type="number"
                  value={service.price}
                  onChange={(e) => {
                    const newServices = [...stepData.services];
                    newServices[index].price = e.target.value;
                    setStepData(prev => ({ ...prev, services: newServices }));
                  }}
                  placeholder="Ex: 15000"
                />
              </div>
            </div>

            <div>
              <Label>Entregáveis</Label>
              <Textarea
                value={service.deliverables}
                onChange={(e) => {
                  const newServices = [...stepData.services];
                  newServices[index].deliverables = e.target.value;
                  setStepData(prev => ({ ...prev, services: newServices }));
                }}
                placeholder="Liste os entregáveis: relatórios, apresentações, implementação..."
                rows={2}
              />
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
      </div>

      {/* Modelo de Precificação */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Modelo de Precificação
        </h3>

        <div>
          <Label>Modelo Principal *</Label>
          <Select 
            value={stepData.pricingModel}
            onValueChange={(value) => setStepData(prev => ({ ...prev, pricingModel: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o modelo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hourly">Por Hora</SelectItem>
              <SelectItem value="project">Por Projeto</SelectItem>
              <SelectItem value="retainer">Retainer Mensal</SelectItem>
              <SelectItem value="mixed">Misto</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="hourlyRate">Valor por Hora (R$)</Label>
            <Input
              id="hourlyRate"
              type="number"
              value={stepData.hourlyRate}
              onChange={(e) => setStepData(prev => ({ ...prev, hourlyRate: e.target.value }))}
              placeholder="Ex: 300"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Sugestão: Consultant R$200-400, Senior R$400-800, Director R$800+
            </p>
          </div>
          <div>
            <Label htmlFor="minimumProject">Projeto Mínimo (R$)</Label>
            <Input
              id="minimumProject"
              type="number"
              value={stepData.minimumProject}
              onChange={(e) => setStepData(prev => ({ ...prev, minimumProject: e.target.value }))}
              placeholder="Ex: 10000"
            />
          </div>
        </div>
      </div>

      {/* Termos de Trabalho */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Termos de Trabalho</h3>

        <div>
          <Label htmlFor="paymentTerms">Condições de Pagamento</Label>
          <Select
            value={stepData.paymentTerms}
            onValueChange={(value) => setStepData(prev => ({ ...prev, paymentTerms: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione as condições" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="advance-50">50% antecipado + 50% entrega</SelectItem>
              <SelectItem value="advance-30">30% antecipado + 70% entrega</SelectItem>
              <SelectItem value="monthly">Pagamento mensal</SelectItem>
              <SelectItem value="milestones">Por marcos do projeto</SelectItem>
              <SelectItem value="net-30">30 dias após entrega</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="availability">Disponibilidade Atual</Label>
          <Select
            value={stepData.availability}
            onValueChange={(value) => setStepData(prev => ({ ...prev, availability: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Disponível imediatamente</SelectItem>
              <SelectItem value="limited">Capacidade limitada</SelectItem>
              <SelectItem value="busy">Ocupado (lista de espera)</SelectItem>
              <SelectItem value="not-available">Não disponível</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="capacity">Capacidade Mensal</Label>
          <Select
            value={stepData.capacity}
            onValueChange={(value) => setStepData(prev => ({ ...prev, capacity: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione sua capacidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-project">1 projeto por vez</SelectItem>
              <SelectItem value="2-3-projects">2-3 projetos</SelectItem>
              <SelectItem value="multiple">Múltiplos projetos</SelectItem>
              <SelectItem value="team">Equipe disponível</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}