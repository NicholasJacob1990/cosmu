'use client';

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function CoverageStep({ data, onDataChange, entityType = 'pf' }: any) {
  const [stepData, setStepData] = useState({
    state: data.state || "",
    city: data.city || "",
    serviceRadius: data.serviceRadius || "",
    cep: data.cep || "",
    address: data.address || "",
    neighborhood: data.neighborhood || "",
    complement: data.complement || ""
  });

  useEffect(() => {
    onDataChange(stepData);
  }, [stepData, onDataChange]);

  return (
    <div className="space-y-6">
      {/* Informação contextual */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">
          {entityType === 'pf' ? '📍 Área de Atuação Individual' : '🏢 Área de Cobertura do Estabelecimento'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {entityType === 'pf' 
            ? 'Defina onde você atende como profissional autônomo.' 
            : 'Configure a área de cobertura geográfica do seu estabelecimento.'
          }
        </p>
      </div>

      <div>
        <Label>Áreas de Atendimento</Label>
        <div className="grid md:grid-cols-2 gap-4 mt-2">
          <div>
            <Label className="text-sm text-muted-foreground">Estado</Label>
            <Select 
              value={stepData.state}
              onValueChange={(value) => setStepData(prev => ({ ...prev, state: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SP">São Paulo</SelectItem>
                <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                <SelectItem value="MG">Minas Gerais</SelectItem>
                <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                <SelectItem value="SC">Santa Catarina</SelectItem>
                <SelectItem value="PR">Paraná</SelectItem>
                <SelectItem value="BA">Bahia</SelectItem>
                <SelectItem value="GO">Goiás</SelectItem>
                <SelectItem value="DF">Distrito Federal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Cidade</Label>
            <Select
              value={stepData.city}
              onValueChange={(value) => setStepData(prev => ({ ...prev, city: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sao-paulo">São Paulo</SelectItem>
                <SelectItem value="campinas">Campinas</SelectItem>
                <SelectItem value="santos">Santos</SelectItem>
                <SelectItem value="rio-de-janeiro">Rio de Janeiro</SelectItem>
                <SelectItem value="belo-horizonte">Belo Horizonte</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <Label>Raio de Atendimento (km)</Label>
        <Input 
          placeholder="Ex: 50" 
          value={stepData.serviceRadius}
          onChange={(e) => setStepData(prev => ({ ...prev, serviceRadius: e.target.value }))}
          className="mt-2" 
        />
      </div>

      <div>
        <Label>
          {entityType === 'pf' ? 'Endereço de Atendimento' : 'Endereço do Estabelecimento'}
        </Label>
        <div className="space-y-3 mt-2">
          <Input 
            placeholder="CEP" 
            value={stepData.cep}
            onChange={(e) => setStepData(prev => ({ ...prev, cep: e.target.value }))}
          />
          <Input 
            placeholder="Rua, número" 
            value={stepData.address}
            onChange={(e) => setStepData(prev => ({ ...prev, address: e.target.value }))}
          />
          <div className="grid md:grid-cols-2 gap-3">
            <Input 
              placeholder="Bairro" 
              value={stepData.neighborhood}
              onChange={(e) => setStepData(prev => ({ ...prev, neighborhood: e.target.value }))}
            />
            <Input 
              placeholder="Complemento" 
              value={stepData.complement}
              onChange={(e) => setStepData(prev => ({ ...prev, complement: e.target.value }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}