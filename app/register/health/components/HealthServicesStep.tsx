'use client';

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export function HealthServicesStep({ data, onDataChange, entityType = 'pf' }: any) {
  const [stepData, setStepData] = useState({
    services: data.services || [],
    consultationTypes: data.consultationTypes || [],
    availability: data.availability || {},
    presentialPrice: data.presentialPrice || "",
    telemedicinePrice: data.telemedicinePrice || "",
    consultationDuration: data.consultationDuration || "",
    acceptedInsurance: data.acceptedInsurance || ""
  });

  useEffect(() => {
    onDataChange(stepData);
  }, [stepData, onDataChange]);

  const consultationTypeOptions = ["Presencial", "Telemedicina", "Domiciliar", "Emergência"];

  const handleConsultationTypeChange = (type: string, checked: boolean) => {
    setStepData(prev => ({
      ...prev,
      consultationTypes: checked 
        ? [...prev.consultationTypes, type]
        : prev.consultationTypes.filter((t: string) => t !== type)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Informação contextual */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">
          {entityType === 'pf' ? '💼 Configuração de Serviços Individuais' : '🏥 Configuração de Serviços do Estabelecimento'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {entityType === 'pf' 
            ? 'Configure os tipos de consulta e valores que você oferece como profissional autônomo.' 
            : 'Configure os serviços oferecidos pelo seu estabelecimento de saúde.'
          }
        </p>
      </div>

      <div className="space-y-4">
        <Label>Tipos de {entityType === 'pf' ? 'Consulta' : 'Atendimento'}</Label>
        <div className="grid md:grid-cols-2 gap-3">
          {consultationTypeOptions.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox 
                id={type}
                checked={stepData.consultationTypes.includes(type)}
                onCheckedChange={(checked) => handleConsultationTypeChange(type, checked as boolean)}
              />
              <Label htmlFor={type}>{type}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Label>Valor da Consulta (R$)</Label>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm text-muted-foreground">Presencial</Label>
            <Input 
              placeholder="150,00" 
              value={stepData.presentialPrice}
              onChange={(e) => setStepData(prev => ({ ...prev, presentialPrice: e.target.value }))}
            />
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Telemedicina</Label>
            <Input 
              placeholder="120,00" 
              value={stepData.telemedicinePrice}
              onChange={(e) => setStepData(prev => ({ ...prev, telemedicinePrice: e.target.value }))}
            />
          </div>
        </div>
      </div>

      <div>
        <Label>Duração da Consulta</Label>
        <Select 
          value={stepData.consultationDuration}
          onValueChange={(value) => setStepData(prev => ({ ...prev, consultationDuration: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a duração" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">30 minutos</SelectItem>
            <SelectItem value="45">45 minutos</SelectItem>
            <SelectItem value="60">1 hora</SelectItem>
            <SelectItem value="90">1h30</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Convênios Aceitos</Label>
        <Textarea
          placeholder="Liste os convênios que você aceita, separados por vírgula"
          value={stepData.acceptedInsurance}
          onChange={(e) => setStepData(prev => ({ ...prev, acceptedInsurance: e.target.value }))}
          className="mt-2"
        />
      </div>
    </div>
  );
}