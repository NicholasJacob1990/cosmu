'use client';

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DollarSign } from "lucide-react";

export function TechServicesStep({ data, onDataChange, entityType = 'pf' }: any) {
  const [stepData, setStepData] = useState({
    // Tipos de serviço
    serviceTypes: data.serviceTypes || [],
    
    // Modelo de precificação
    pricingModel: data.pricingModel || "hourly", // hourly, fixed, both
    hourlyRate: data.hourlyRate || "",
    projectMinValue: data.projectMinValue || "",
    
    // Especialidades técnicas
    techServices: data.techServices || [],
    
    // Modalidade de trabalho
    workMode: data.workMode || [], // remote, onsite, hybrid
    
    // Disponibilidade
    availability: data.availability || "available",
    hoursPerWeek: data.hoursPerWeek || "",
    
    // Termos de trabalho
    contractTypes: data.contractTypes || [], // clt, pj, freelance
    
    // Para PJ
    teamSize: data.teamSize || "",
    companyServices: data.companyServices || []
  });

  useEffect(() => {
    onDataChange(stepData);
  }, [stepData, onDataChange]);

  const serviceTypes = [
    "Desenvolvimento Web Frontend",
    "Desenvolvimento Web Backend", 
    "Desenvolvimento Full Stack",
    "Desenvolvimento Mobile",
    "APIs e Microserviços",
    "DevOps e Cloud",
    "Consultoria Técnica",
    "Code Review",
    "Arquitetura de Software",
    "Banco de Dados",
    "Integração de Sistemas",
    "Automação e Scripts"
  ];

  const techServices = [
    "Criação de Sites",
    "Sistemas Web",
    "E-commerce",
    "Aplicativos Mobile",
    "APIs REST/GraphQL",
    "Integração de Pagamentos",
    "Dashboards e Analytics",
    "Chatbots",
    "Automação de Processos",
    "Migração de Sistemas",
    "Otimização de Performance",
    "Segurança e Auditoria"
  ];

  const handleServiceTypeToggle = (service: string) => {
    setStepData(prev => ({
      ...prev,
      serviceTypes: prev.serviceTypes.includes(service)
        ? prev.serviceTypes.filter(s => s !== service)
        : [...prev.serviceTypes, service]
    }));
  };

  const handleTechServiceToggle = (service: string) => {
    setStepData(prev => ({
      ...prev,
      techServices: prev.techServices.includes(service)
        ? prev.techServices.filter(s => s !== service)
        : [...prev.techServices, service]
    }));
  };

  const handleWorkModeToggle = (mode: string) => {
    setStepData(prev => ({
      ...prev,
      workMode: prev.workMode.includes(mode)
        ? prev.workMode.filter(m => m !== mode)
        : [...prev.workMode, mode]
    }));
  };

  const handleContractTypeToggle = (type: string) => {
    setStepData(prev => ({
      ...prev,
      contractTypes: prev.contractTypes.includes(type)
        ? prev.contractTypes.filter(t => t !== type)
        : [...prev.contractTypes, type]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Informação contextual */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">
          {entityType === 'pf' ? '💼 Serviços Técnicos' : '🏢 Serviços da Empresa'}
        </h3>
        <p className="text-sm text-muted-foreground">
          Configure os serviços que você oferece e suas condições de trabalho.
        </p>
      </div>

      {/* Tipos de Serviço */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Tipos de Serviço</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {serviceTypes.map((service) => (
            <div key={service} className="flex items-center space-x-2">
              <Checkbox 
                id={service}
                checked={stepData.serviceTypes.includes(service)}
                onCheckedChange={() => handleServiceTypeToggle(service)}
              />
              <Label htmlFor={service} className="font-normal cursor-pointer">
                {service}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Especialidades Técnicas */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Especialidades Técnicas</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {techServices.map((service) => (
            <div key={service} className="flex items-center space-x-2">
              <Checkbox 
                id={service}
                checked={stepData.techServices.includes(service)}
                onCheckedChange={() => handleTechServiceToggle(service)}
              />
              <Label htmlFor={service} className="font-normal cursor-pointer">
                {service}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Precificação */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Precificação
        </h3>

        <div>
          <Label>Modelo de Precificação *</Label>
          <RadioGroup 
            value={stepData.pricingModel}
            onValueChange={(value) => setStepData(prev => ({ ...prev, pricingModel: value }))}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hourly" id="hourly" />
              <Label htmlFor="hourly" className="font-normal">Por hora</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="fixed" id="fixed" />
              <Label htmlFor="fixed" className="font-normal">Por projeto (valor fixo)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="both" id="both" />
              <Label htmlFor="both" className="font-normal">Ambos</Label>
            </div>
          </RadioGroup>
        </div>

        {(stepData.pricingModel === 'hourly' || stepData.pricingModel === 'both') && (
          <div>
            <Label htmlFor="hourlyRate">Valor por Hora (R$) *</Label>
            <Input
              id="hourlyRate"
              type="number"
              min="50"
              max="1000"
              value={stepData.hourlyRate}
              onChange={(e) => setStepData(prev => ({ ...prev, hourlyRate: e.target.value }))}
              placeholder="Ex: 120"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Sugestão: Junior R$50-80, Pleno R$80-150, Senior R$150-300+
            </p>
          </div>
        )}

        {(stepData.pricingModel === 'fixed' || stepData.pricingModel === 'both') && (
          <div>
            <Label htmlFor="projectMinValue">Valor Mínimo de Projeto (R$) *</Label>
            <Input
              id="projectMinValue"
              type="number"
              min="500"
              value={stepData.projectMinValue}
              onChange={(e) => setStepData(prev => ({ ...prev, projectMinValue: e.target.value }))}
              placeholder="Ex: 2000"
            />
          </div>
        )}
      </div>

      {/* Modalidade de Trabalho */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Modalidade de Trabalho</h3>
        <div className="grid md:grid-cols-3 gap-3">
          {[
            { id: "remote", label: "Remoto" },
            { id: "onsite", label: "Presencial" },
            { id: "hybrid", label: "Híbrido" }
          ].map((mode) => (
            <div key={mode.id} className="flex items-center space-x-2">
              <Checkbox 
                id={mode.id}
                checked={stepData.workMode.includes(mode.id)}
                onCheckedChange={() => handleWorkModeToggle(mode.id)}
              />
              <Label htmlFor={mode.id} className="font-normal cursor-pointer">
                {mode.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Tipo de Contrato */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Tipos de Contrato</h3>
        <div className="grid md:grid-cols-3 gap-3">
          {[
            { id: "freelance", label: "Freelance" },
            { id: "pj", label: "Pessoa Jurídica" },
            { id: "clt", label: "CLT" }
          ].map((type) => (
            <div key={type.id} className="flex items-center space-x-2">
              <Checkbox 
                id={type.id}
                checked={stepData.contractTypes.includes(type.id)}
                onCheckedChange={() => handleContractTypeToggle(type.id)}
              />
              <Label htmlFor={type.id} className="font-normal cursor-pointer">
                {type.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Disponibilidade */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Disponibilidade</h3>
        
        <div>
          <Label>Status Atual</Label>
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
              <RadioGroupItem value="not-available" id="not-available" />
              <Label htmlFor="not-available" className="font-normal">Não disponível</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="hoursPerWeek">Horas Disponíveis por Semana</Label>
          <Select
            value={stepData.hoursPerWeek}
            onValueChange={(value) => setStepData(prev => ({ ...prev, hoursPerWeek: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione suas horas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 horas/semana</SelectItem>
              <SelectItem value="20">20 horas/semana</SelectItem>
              <SelectItem value="30">30 horas/semana</SelectItem>
              <SelectItem value="40">40 horas/semana (integral)</SelectItem>
              <SelectItem value="flexible">Flexível</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}