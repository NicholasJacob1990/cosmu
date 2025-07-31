'use client';

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Briefcase, TrendingUp, Building2 } from "lucide-react";

export function BusinessProfessionalStep({ data, onDataChange, entityType = 'pf' }: any) {
  const [stepData, setStepData] = useState({
    // Área de atuação
    businessArea: data.businessArea || "",
    specializations: data.specializations || [],
    experienceLevel: data.experienceLevel || "",
    yearsOfExperience: data.yearsOfExperience || "",
    
    // Formação
    education: data.education || "",
    certifications: data.certifications || [],
    
    // Biografia profissional
    bio: data.bio || "",
    
    // Para PJ
    companyType: data.companyType || "",
    teamSize: data.teamSize || "",
    companyFocus: data.companyFocus || []
  });

  useEffect(() => {
    onDataChange(stepData);
  }, [stepData, onDataChange]);

  const businessAreas = [
    "Consultoria Empresarial", "Consultoria Financeira", "Consultoria de RH",
    "Marketing e Vendas", "Gestão de Projetos", "Estratégia Empresarial",
    "Transformação Digital", "Análise de Negócios", "Fusões e Aquisições",
    "Contabilidade", "Auditoria", "Jurídico Empresarial"
  ];

  const specializations = {
    "consultoria-empresarial": [
      "Gestão Estratégica", "Otimização de Processos", "Reestruturação",
      "Governança Corporativa", "Compliance", "Gestão de Riscos"
    ],
    "marketing-vendas": [
      "Marketing Digital", "Branding", "Vendas B2B", "CRM",
      "Growth Hacking", "Marketing de Conteúdo"
    ],
    "financeira": [
      "Planejamento Financeiro", "Controladoria", "Valuation",
      "Investment Banking", "Private Equity", "Análise de Crédito"
    ]
  };

  const handleSpecializationToggle = (spec: string) => {
    setStepData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Informação contextual */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">
          {entityType === 'pf' ? '💼 Perfil Profissional de Negócios' : '🏢 Empresa de Consultoria'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {entityType === 'pf' 
            ? 'Configure seu perfil para atrair clientes na área de negócios.' 
            : 'Configure o perfil da sua empresa de consultoria empresarial.'
          }
        </p>
      </div>

      {/* Área de Atuação */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Área de Atuação
        </h3>

        <div>
          <Label htmlFor="businessArea">Área Principal *</Label>
          <Select 
            value={stepData.businessArea} 
            onValueChange={(value) => setStepData(prev => ({ ...prev, businessArea: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione sua área principal" />
            </SelectTrigger>
            <SelectContent>
              {businessAreas.map((area) => (
                <SelectItem key={area} value={area.toLowerCase().replace(/\s+/g, '-')}>
                  {area}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Especializações (até 6)</Label>
          <div className="grid md:grid-cols-2 gap-3 mt-2">
            {Object.values(specializations).flat().map((spec) => (
              <div key={spec} className="flex items-center space-x-2">
                <Checkbox 
                  id={spec}
                  checked={stepData.specializations.includes(spec)}
                  onCheckedChange={() => handleSpecializationToggle(spec)}
                  disabled={!stepData.specializations.includes(spec) && stepData.specializations.length >= 6}
                />
                <Label htmlFor={spec} className="text-sm font-normal cursor-pointer">
                  {spec}
                </Label>
              </div>
            ))}
          </div>
          {stepData.specializations.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              Selecionadas: {stepData.specializations.length}/6
            </p>
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
                <SelectItem value="junior">Junior Consultant (0-3 anos)</SelectItem>
                <SelectItem value="consultant">Consultant (3-6 anos)</SelectItem>
                <SelectItem value="senior">Senior Consultant (6-10 anos)</SelectItem>
                <SelectItem value="manager">Manager (10-15 anos)</SelectItem>
                <SelectItem value="director">Director (15+ anos)</SelectItem>
                <SelectItem value="partner">Partner/Principal (20+ anos)</SelectItem>
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
              placeholder="Ex: 8"
            />
          </div>
        </div>
      </div>

      {/* Biografia Profissional */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Perfil Profissional
        </h3>

        <div>
          <Label htmlFor="bio">Biografia e Experiência *</Label>
          <Textarea
            id="bio"
            value={stepData.bio}
            onChange={(e) => setStepData(prev => ({ ...prev, bio: e.target.value }))}
            placeholder="Descreva sua experiência, principais conquistas e resultados entregues aos clientes..."
            rows={5}
            maxLength={800}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {stepData.bio.length}/800 caracteres - Destaque resultados quantificáveis
          </p>
        </div>

        <div>
          <Label htmlFor="education">Formação Acadêmica *</Label>
          <Input
            id="education"
            value={stepData.education}
            onChange={(e) => setStepData(prev => ({ ...prev, education: e.target.value }))}
            placeholder="Ex: MBA em Gestão Empresarial - FGV"
          />
        </div>

        <div>
          <Label htmlFor="certifications">Certificações Profissionais</Label>
          <Textarea
            id="certifications"
            value={stepData.certifications.join('\n')}
            onChange={(e) => {
              const certs = e.target.value.split('\n').filter(c => c.trim());
              setStepData(prev => ({ ...prev, certifications: certs }));
            }}
            placeholder="Liste suas certificações, uma por linha&#10;Ex: PMP - Project Management Professional&#10;CPA - Certified Public Accountant"
            rows={3}
          />
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
              <Label htmlFor="companyType">Tipo de Empresa *</Label>
              <Select 
                value={stepData.companyType} 
                onValueChange={(value) => setStepData(prev => ({ ...prev, companyType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultoria">Consultoria</SelectItem>
                  <SelectItem value="contabilidade">Escritório Contábil</SelectItem>
                  <SelectItem value="juridico">Escritório Jurídico</SelectItem>
                  <SelectItem value="auditoria">Auditoria</SelectItem>
                  <SelectItem value="rh">Consultoria de RH</SelectItem>
                  <SelectItem value="marketing">Agência de Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="teamSize">Tamanho da Equipe *</Label>
              <Select 
                value={stepData.teamSize} 
                onValueChange={(value) => setStepData(prev => ({ ...prev, teamSize: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tamanho" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual (1 pessoa)</SelectItem>
                  <SelectItem value="small">Pequena (2-5 pessoas)</SelectItem>
                  <SelectItem value="medium">Média (6-20 pessoas)</SelectItem>
                  <SelectItem value="large">Grande (20+ pessoas)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}