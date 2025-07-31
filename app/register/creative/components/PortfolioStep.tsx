'use client';

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Briefcase, Award, Star, Globe } from "lucide-react";

export function PortfolioStep({ data, onDataChange, entityType = 'pf' }: any) {
  const [stepData, setStepData] = useState({
    // Experiência profissional
    experiences: data.experiences || [{
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
      achievements: []
    }],
    
    // Formação
    education: data.education || [{
      degree: "",
      institution: "",
      course: "",
      startYear: "",
      endYear: "",
      status: ""
    }],
    
    // Certificações
    certifications: data.certifications || [],
    
    // Habilidades técnicas
    skills: data.skills || [],
    
    // Idiomas
    languages: data.languages || [
      { language: "Português", proficiency: "native" }
    ],
    
    // Equipamentos
    equipment: data.equipment || [],
    
    // Software/Ferramentas
    tools: data.tools || [],
    
    // Depoimentos
    testimonials: data.testimonials || [],
    
    // Projetos destacados
    featuredProjects: data.featuredProjects || []
  });

  useEffect(() => {
    onDataChange(stepData);
  }, [stepData, onDataChange]);

  const handleAddExperience = () => {
    setStepData(prev => ({
      ...prev,
      experiences: [...prev.experiences, {
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
        achievements: []
      }]
    }));
  };

  const handleRemoveExperience = (index: number) => {
    setStepData(prev => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Experiência Profissional */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Experiência Profissional
        </h3>

        {stepData.experiences.map((exp, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="font-medium">Experiência {index + 1}</h4>
              {stepData.experiences.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveExperience(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  Remover
                </Button>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Empresa/Cliente</Label>
                <Input
                  value={exp.company}
                  onChange={(e) => {
                    const newExperiences = [...stepData.experiences];
                    newExperiences[index].company = e.target.value;
                    setStepData(prev => ({ ...prev, experiences: newExperiences }));
                  }}
                  placeholder="Nome da empresa ou 'Freelancer'"
                />
              </div>
              <div>
                <Label>Cargo/Função</Label>
                <Input
                  value={exp.position}
                  onChange={(e) => {
                    const newExperiences = [...stepData.experiences];
                    newExperiences[index].position = e.target.value;
                    setStepData(prev => ({ ...prev, experiences: newExperiences }));
                  }}
                  placeholder="Ex: Designer Gráfico Senior"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Data Início</Label>
                <Input
                  type="month"
                  value={exp.startDate}
                  onChange={(e) => {
                    const newExperiences = [...stepData.experiences];
                    newExperiences[index].startDate = e.target.value;
                    setStepData(prev => ({ ...prev, experiences: newExperiences }));
                  }}
                />
              </div>
              <div>
                <Label>Data Fim</Label>
                <Input
                  type="month"
                  value={exp.endDate}
                  onChange={(e) => {
                    const newExperiences = [...stepData.experiences];
                    newExperiences[index].endDate = e.target.value;
                    setStepData(prev => ({ ...prev, experiences: newExperiences }));
                  }}
                  disabled={exp.current}
                />
              </div>
              <div className="flex items-end">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`current-${index}`}
                    checked={exp.current}
                    onCheckedChange={(checked) => {
                      const newExperiences = [...stepData.experiences];
                      newExperiences[index].current = checked as boolean;
                      if (checked) newExperiences[index].endDate = "";
                      setStepData(prev => ({ ...prev, experiences: newExperiences }));
                    }}
                  />
                  <Label htmlFor={`current-${index}`} className="font-normal">
                    Trabalho atual
                  </Label>
                </div>
              </div>
            </div>

            <div>
              <Label>Descrição das Atividades</Label>
              <Textarea
                value={exp.description}
                onChange={(e) => {
                  const newExperiences = [...stepData.experiences];
                  newExperiences[index].description = e.target.value;
                  setStepData(prev => ({ ...prev, experiences: newExperiences }));
                }}
                placeholder="Descreva suas principais responsabilidades e conquistas..."
                rows={3}
              />
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={handleAddExperience}
          className="w-full"
        >
          + Adicionar Experiência
        </Button>
      </div>

      {/* Habilidades */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Star className="h-5 w-5" />
          Habilidades Técnicas
        </h3>

        <div>
          <Label>Suas Habilidades (máx. 15)</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {stepData.skills.map((skill, index) => (
              <Badge key={index} variant="secondary" className="px-3 py-1">
                {skill}
                <button
                  type="button"
                  onClick={() => {
                    setStepData(prev => ({
                      ...prev,
                      skills: prev.skills.filter((_, i) => i !== index)
                    }));
                  }}
                  className="ml-2 text-xs hover:text-red-600"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
          
          {stepData.skills.length < 15 && (
            <div className="mt-2">
              <Input
                placeholder="Digite uma habilidade e pressione Enter"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    e.preventDefault();
                    const newSkill = e.currentTarget.value.trim();
                    if (!stepData.skills.includes(newSkill)) {
                      setStepData(prev => ({
                        ...prev,
                        skills: [...prev.skills, newSkill]
                      }));
                    }
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
          )}
          
          <p className="text-xs text-muted-foreground mt-2">
            {stepData.skills.length}/15 habilidades adicionadas
          </p>
        </div>
      </div>

      {/* Certificações */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Award className="h-5 w-5" />
          Certificações Profissionais
        </h3>

        <div className="space-y-2">
          <Label>Certificações (opcional)</Label>
          <Textarea
            value={stepData.certifications.join('\n')}
            onChange={(e) => {
              const certs = e.target.value.split('\n').filter(c => c.trim());
              setStepData(prev => ({ ...prev, certifications: certs }));
            }}
            placeholder="Liste suas certificações, uma por linha&#10;Ex: Adobe Certified Expert - Photoshop&#10;Google Analytics Certified"
            rows={4}
          />
        </div>
      </div>
    </div>
  );
}