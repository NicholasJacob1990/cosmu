'use client';

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Code, Layers, Building2 } from "lucide-react";

export function TechProfessionalStep({ data, onDataChange, entityType = 'pf' }: any) {
  const [stepData, setStepData] = useState({
    // Stack tecnológico
    primaryStack: data.primaryStack || "",
    skills: data.skills || [],
    experienceLevel: data.experienceLevel || "",
    yearsOfExperience: data.yearsOfExperience || "",
    
    // Especialização
    specialization: data.specialization || "",
    industries: data.industries || [],
    
    // Formação
    education: data.education || "",
    certifications: data.certifications || [],
    
    // Para PJ
    companySize: data.companySize || "",
    businessType: data.businessType || "",
    
    // Bio profissional
    bio: data.bio || ""
  });

  useEffect(() => {
    onDataChange(stepData);
  }, [stepData, onDataChange]);

  const techSkills = [
    // Frontend
    "JavaScript", "TypeScript", "React", "Vue.js", "Angular", "Next.js", "Svelte",
    // Backend
    "Node.js", "Python", "Java", "C#", "PHP", "Go", "Rust", "Ruby",
    // Mobile
    "React Native", "Flutter", "Swift", "Kotlin", "Ionic",
    // Frameworks
    "Express", "Django", "Laravel", "Spring", "ASP.NET", "FastAPI",
    // Databases
    "MongoDB", "PostgreSQL", "MySQL", "Redis", "Elasticsearch",
    // DevOps
    "Docker", "Kubernetes", "AWS", "Azure", "Google Cloud", "CI/CD", "DevOps",
    // Other
    "Git", "GraphQL", "REST API", "Microservices", "Machine Learning", "AI"
  ];

  const specializations = [
    "Frontend Development", "Backend Development", "Full Stack Development",
    "Mobile Development", "DevOps", "Data Science", "Machine Learning",
    "Cybersecurity", "Cloud Architecture", "UI/UX Design", "Game Development",
    "Blockchain", "IoT", "System Architecture"
  ];

  const industries = [
    "E-commerce", "Fintech", "Healthtech", "Edtech", "SaaS", "Startup",
    "Enterprise", "Government", "Gaming", "Media", "Manufacturing", "Real Estate"
  ];

  const handleSkillToggle = (skill: string) => {
    setStepData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Informação contextual */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">
          {entityType === 'pf' ? '💻 Perfil Tecnológico' : '🏢 Empresa de Tecnologia'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {entityType === 'pf' 
            ? 'Configure seu perfil técnico para atrair os projetos ideais.' 
            : 'Configure o perfil técnico da sua empresa de tecnologia.'
          }
        </p>
      </div>

      {/* Stack Tecnológico */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Code className="h-5 w-5" />
          Stack Tecnológico
        </h3>

        <div>
          <Label htmlFor="primaryStack">Stack Principal *</Label>
          <Select 
            value={stepData.primaryStack} 
            onValueChange={(value) => setStepData(prev => ({ ...prev, primaryStack: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione sua stack principal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="frontend">Frontend (React, Vue, Angular)</SelectItem>
              <SelectItem value="backend">Backend (Node.js, Python, Java)</SelectItem>
              <SelectItem value="fullstack">Full Stack</SelectItem>
              <SelectItem value="mobile">Mobile (React Native, Flutter)</SelectItem>
              <SelectItem value="devops">DevOps/Cloud</SelectItem>
              <SelectItem value="data">Data Science/ML</SelectItem>
              <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Tecnologias e Ferramentas (selecione até 10)</Label>
          <div className="grid grid-cols-3 gap-2 mt-2 max-h-48 overflow-y-auto">
            {techSkills.map((skill) => (
              <div key={skill} className="flex items-center space-x-2">
                <Checkbox 
                  id={skill}
                  checked={stepData.skills.includes(skill)}
                  onCheckedChange={() => handleSkillToggle(skill)}
                  disabled={!stepData.skills.includes(skill) && stepData.skills.length >= 10}
                />
                <Label htmlFor={skill} className="text-sm font-normal cursor-pointer">
                  {skill}
                </Label>
              </div>
            ))}
          </div>
          {stepData.skills.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-2">
                Selecionadas: {stepData.skills.length}/10
              </p>
              <div className="flex flex-wrap gap-1">
                {stepData.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="experienceLevel">Nível de Experiência *</Label>
            <Select 
              value={stepData.experienceLevel} 
              onValueChange={(value) => setStepData(prev => ({ ...prev, experienceLevel: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione seu nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="junior">Junior (0-2 anos)</SelectItem>
                <SelectItem value="pleno">Pleno (2-5 anos)</SelectItem>
                <SelectItem value="senior">Senior (5-8 anos)</SelectItem>
                <SelectItem value="specialist">Especialista (8+ anos)</SelectItem>
                <SelectItem value="architect">Arquiteto/Lead (10+ anos)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="yearsOfExperience">Anos de Experiência *</Label>
            <Input
              id="yearsOfExperience"
              type="number"
              min="0"
              max="50"
              value={stepData.yearsOfExperience}
              onChange={(e) => setStepData(prev => ({ ...prev, yearsOfExperience: e.target.value }))}
              placeholder="Ex: 5"
            />
          </div>
        </div>
      </div>

      {/* Especialização */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Especialização
        </h3>

        <div>
          <Label htmlFor="specialization">Área de Especialização *</Label>
          <Select 
            value={stepData.specialization} 
            onValueChange={(value) => setStepData(prev => ({ ...prev, specialization: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione sua especialização" />
            </SelectTrigger>
            <SelectContent>
              {specializations.map((spec) => (
                <SelectItem key={spec} value={spec.toLowerCase().replace(/\s+/g, '-')}>
                  {spec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="bio">Descrição Profissional *</Label>
          <Textarea
            id="bio"
            value={stepData.bio}
            onChange={(e) => setStepData(prev => ({ ...prev, bio: e.target.value }))}
            placeholder="Descreva sua experiência, especialidades e diferencial como desenvolvedor..."
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {stepData.bio.length}/500 caracteres
          </p>
        </div>
      </div>

      {/* Para PJ */}
      {entityType === 'pj' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Dados da Empresa
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companySize">Tamanho da Empresa *</Label>
              <Select 
                value={stepData.companySize} 
                onValueChange={(value) => setStepData(prev => ({ ...prev, companySize: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tamanho" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="freelancer">Freelancer (1 pessoa)</SelectItem>
                  <SelectItem value="small">Pequena (2-10 pessoas)</SelectItem>
                  <SelectItem value="medium">Média (11-50 pessoas)</SelectItem>
                  <SelectItem value="large">Grande (50+ pessoas)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="businessType">Tipo de Negócio *</Label>
              <Select 
                value={stepData.businessType} 
                onValueChange={(value) => setStepData(prev => ({ ...prev, businessType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="software-house">Software House</SelectItem>
                  <SelectItem value="startup">Startup</SelectItem>
                  <SelectItem value="consultoria">Consultoria</SelectItem>
                  <SelectItem value="product-company">Empresa de Produto</SelectItem>
                  <SelectItem value="agency">Agência Digital</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}