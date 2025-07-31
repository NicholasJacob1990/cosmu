'use client';

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Plus, X, Clock, Package } from "lucide-react";

export function GeneralServicesStep({ data, onDataChange, entityType = 'pf' }: any) {
  const [stepData, setStepData] = useState({
    services: data.services || [{
      name: "",
      description: "",
      price: "",
      duration: "",
      unit: "hour"
    }],
    paymentMethods: data.paymentMethods || [],
    cancellationPolicy: data.cancellationPolicy || "",
    additionalTerms: data.additionalTerms || ""
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onDataChange(stepData);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [stepData]);

  const addService = () => {
    setStepData(prev => ({
      ...prev,
      services: [...prev.services, {
        name: "",
        description: "",
        price: "",
        duration: "",
        unit: "hour"
      }]
    }));
  };

  const removeService = (index: number) => {
    setStepData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const updateService = (index: number, field: string, value: string) => {
    setStepData(prev => ({
      ...prev,
      services: prev.services.map((service, i) => 
        i === index ? { ...service, [field]: value } : service
      )
    }));
  };

  const priceUnits = [
    { value: "hour", label: "Por hora" },
    { value: "day", label: "Por dia" },
    { value: "service", label: "Por serviço" },
    { value: "project", label: "Por projeto" },
    { value: "visit", label: "Por visita" }
  ];

  const paymentMethodOptions = [
    "Dinheiro",
    "PIX",
    "Cartão de Débito",
    "Cartão de Crédito",
    "Transferência Bancária"
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 galaxia-text-gradient">
          <Package className="h-5 w-5 text-primary" />
          4.1 Serviços Oferecidos
        </h3>
        
        {stepData.services.map((service, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Serviço {index + 1}</CardTitle>
                {stepData.services.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeService(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor={`service-name-${index}`}>Nome do Serviço *</Label>
                <Input
                  id={`service-name-${index}`}
                  value={service.name}
                  onChange={(e) => updateService(index, 'name', e.target.value)}
                  placeholder="Ex: Limpeza Residencial, Instalação Elétrica"
                />
              </div>
              
              <div>
                <Label htmlFor={`service-description-${index}`}>Descrição *</Label>
                <Textarea
                  id={`service-description-${index}`}
                  value={service.description}
                  onChange={(e) => updateService(index, 'description', e.target.value)}
                  placeholder="Descreva detalhadamente o que está incluso no serviço..."
                  rows={3}
                />
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor={`service-price-${index}`}>Preço *</Label>
                  <Input
                    id={`service-price-${index}`}
                    value={service.price}
                    onChange={(e) => updateService(index, 'price', e.target.value)}
                    placeholder="50,00"
                  />
                </div>
                <div>
                  <Label htmlFor={`service-unit-${index}`}>Unidade *</Label>
                  <Select
                    value={service.unit}
                    onValueChange={(value) => updateService(index, 'unit', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priceUnits.map(unit => (
                        <SelectItem key={unit.value} value={unit.value}>{unit.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`service-duration-${index}`}>Duração Estimada</Label>
                  <Input
                    id={`service-duration-${index}`}
                    value={service.duration}
                    onChange={(e) => updateService(index, 'duration', e.target.value)}
                    placeholder="Ex: 2 horas, 1 dia"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        <Button
          variant="outline"
          onClick={addService}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Outro Serviço
        </Button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 galaxia-text-gradient">
          <DollarSign className="h-5 w-5 text-primary" />
          4.2 Condições Comerciais
        </h3>
        
        <div>
          <Label>Formas de Pagamento Aceitas *</Label>
          <p className="text-sm text-muted-foreground mb-2">Selecione todas que você aceita</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {paymentMethodOptions.map(method => (
              <label key={method} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={stepData.paymentMethods.includes(method)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setStepData(prev => ({
                        ...prev,
                        paymentMethods: [...prev.paymentMethods, method]
                      }));
                    } else {
                      setStepData(prev => ({
                        ...prev,
                        paymentMethods: prev.paymentMethods.filter(m => m !== method)
                      }));
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">{method}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="cancellationPolicy">Política de Cancelamento *</Label>
          <Textarea
            id="cancellationPolicy"
            value={stepData.cancellationPolicy}
            onChange={(e) => setStepData(prev => ({ ...prev, cancellationPolicy: e.target.value }))}
            placeholder="Ex: Cancelamento gratuito até 24h antes. Após esse prazo, será cobrada taxa de 20%..."
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="additionalTerms">Termos Adicionais (opcional)</Label>
          <Textarea
            id="additionalTerms"
            value={stepData.additionalTerms}
            onChange={(e) => setStepData(prev => ({ ...prev, additionalTerms: e.target.value }))}
            placeholder="Qualquer informação adicional sobre seus serviços..."
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}