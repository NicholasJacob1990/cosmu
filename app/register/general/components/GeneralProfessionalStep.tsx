'use client';

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, Award, Star } from "lucide-react";

export function GeneralProfessionalStep({ data, onDataChange, entityType = 'pf' }: any) {
  const [stepData, setStepData] = useState({
    profession: data.profession || "",
    category: data.category || "",
    experience: data.experience || "",
    description: data.description || "",
    skills: data.skills || [],
    certifications: data.certifications || [],
    previousWork: data.previousWork || "",
    availability: data.availability || "",
    workMode: data.workMode || "",
    specializations: data.specializations || []
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onDataChange(stepData);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [stepData]);

  const experienceLevels = [
    { value: "beginner", label: "Iniciante (0-1 anos)" },
    { value: "intermediate", label: "Intermediário (1-3 anos)" },
    { value: "experienced", label: "Experiente (3-5 anos)" },
    { value: "expert", label: "Especialista (5+ anos)" }
  ];

  const workModes = [
    { value: "presential", label: "Presencial" },
    { value: "remote", label: "Remoto" },
    { value: "hybrid", label: "Híbrido" }
  ];

  const categories = [
    "Serviços Domésticos",
    "Manutenção e Reparos",
    "Beleza e Estética",
    "Fitness e Saúde",
    "Educação e Tutoria",
    "Eventos e Entretenimento",
    "Transporte e Logística",
    "Limpeza e Organização",
    "Jardinagem e Paisagismo",
    "Outros Serviços"
  ];

  return (
    <div className="space-y-6">
      {/* Profissão */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 galaxia-text-gradient">
          <Briefcase className="h-5 w-5 text-primary" />
          2.1 Profissão e Categoria
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="profession">Profissão *</Label>
            <Input
              id="profession"
              value={stepData.profession}
              onChange={(e) => setStepData(prev => ({ ...prev, profession: e.target.value }))}
              placeholder="Ex: Diarista, Eletricista, Personal Trainer"
            />
          </div>
          <div>
            <Label htmlFor="category">Categoria *</Label>
            <Select
              value={stepData.category}
              onValueChange={(value) => setStepData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Experiência */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 galaxia-text-gradient">
          <Star className="h-5 w-5 text-primary" />
          2.2 Experiência e Habilidades
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="experience">Nível de Experiência *</Label>
            <Select
              value={stepData.experience}
              onValueChange={(value) => setStepData(prev => ({ ...prev, experience: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o nível" />
              </SelectTrigger>
              <SelectContent>
                {experienceLevels.map(level => (
                  <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="workMode">Modalidade de Trabalho *</Label>
            <Select
              value={stepData.workMode}
              onValueChange={(value) => setStepData(prev => ({ ...prev, workMode: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Como você trabalha?" />
              </SelectTrigger>
              <SelectContent>
                {workModes.map(mode => (
                  <SelectItem key={mode.value} value={mode.value}>{mode.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Descrição dos Serviços *</Label>
          <Textarea
            id="description"
            value={stepData.description}
            onChange={(e) => setStepData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descreva em detalhes os serviços que você oferece, sua experiência e diferencial..."
            rows={4}
          />
        </div>
      </div>

      {/* Disponibilidade */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 galaxia-text-gradient">
          <Award className="h-5 w-5 text-primary" />
          2.3 Disponibilidade
        </h3>
        
        <div>
          <Label htmlFor="availability">Horários Disponíveis *</Label>
          <Textarea
            id="availability"
            value={stepData.availability}
            onChange={(e) => setStepData(prev => ({ ...prev, availability: e.target.value }))}
            placeholder="Ex: Segunda a Sexta, 8h às 18h. Finais de semana sob consulta..."
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="previousWork">Trabalhos Anteriores (opcional)</Label>
          <Textarea
            id="previousWork"
            value={stepData.previousWork}
            onChange={(e) => setStepData(prev => ({ ...prev, previousWork: e.target.value }))}
            placeholder="Descreva brevemente seus trabalhos anteriores relevantes..."
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}