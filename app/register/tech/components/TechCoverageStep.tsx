'use client';

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MapPin, Clock, Globe } from "lucide-react";

export function TechCoverageStep({ data, onDataChange, entityType = 'pf' }: any) {
  const [stepData, setStepData] = useState({
    // Localização
    country: data.country || "Brasil",
    state: data.state || "",
    city: data.city || "",
    timezone: data.timezone || "America/Sao_Paulo",
    
    // Preferências de trabalho
    workPreferences: data.workPreferences || [],
    clientTypes: data.clientTypes || [],
    projectSizes: data.projectSizes || [],
    
    // Horários
    workingHours: data.workingHours || "",
    weekendWork: data.weekendWork || false,
    
    // Comunicação
    languages: data.languages || ["Português"],
    communicationTools: data.communicationTools || [],
    
    // Outros
    travel: data.travel || false,
    travelRadius: data.travelRadius || ""
  });

  useEffect(() => {
    onDataChange(stepData);
  }, [stepData, onDataChange]);

  const workPreferences = [
    "Startup", "Empresa Estabelecida", "Agência", "Consultoria",
    "Produto Próprio", "E-commerce", "SaaS", "Fintech", "Healthtech", "Edtech"
  ];

  const clientTypes = [
    "Pequenas Empresas", "Médias Empresas", "Grandes Corporações",
    "Startups", "ONGs", "Governo", "Internacional"
  ];

  const projectSizes = [
    "Projetos Pequenos (até 1 mês)",
    "Projetos Médios (1-3 meses)", 
    "Projetos Grandes (3-6 meses)",
    "Projetos Longos (6+ meses)",
    "Manutenção Contínua"
  ];

  const communicationTools = [
    "Slack", "Discord", "Microsoft Teams", "Zoom", "Google Meet",
    "WhatsApp", "Telegram", "Email", "Jira", "Trello", "Asana"
  ];

  const handlePreferenceToggle = (pref: string, type: string) => {
    setStepData(prev => ({
      ...prev,
      [type]: prev[type].includes(pref)
        ? prev[type].filter(p => p !== pref)
        : [...prev[type], pref]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Informação contextual */}
      <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">
          {entityType === 'pf' ? '⚙️ Preferências de Trabalho' : '🌐 Configurações da Empresa'}
        </h3>
        <p className="text-sm text-muted-foreground">
          Configure suas preferências de trabalho e disponibilidade.
        </p>
      </div>

      {/* Localização */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Localização
        </h3>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="state">Estado *</Label>
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
                <SelectItem value="PE">Pernambuco</SelectItem>
                <SelectItem value="CE">Ceará</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="city">Cidade *</Label>
            <Input
              id="city"
              value={stepData.city}
              onChange={(e) => setStepData(prev => ({ ...prev, city: e.target.value }))}
              placeholder="Ex: São Paulo"
            />
          </div>
          <div>
            <Label htmlFor="timezone">Fuso Horário</Label>
            <Select 
              value={stepData.timezone}
              onValueChange={(value) => setStepData(prev => ({ ...prev, timezone: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/Sao_Paulo">Brasília (GMT-3)</SelectItem>
                <SelectItem value="America/Manaus">Manaus (GMT-4)</SelectItem>
                <SelectItem value="America/Rio_Branco">Acre (GMT-5)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Horários de Trabalho */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Horários de Trabalho
        </h3>

        <div>
          <Label htmlFor="workingHours">Horário Preferencial</Label>
          <Select
            value={stepData.workingHours}
            onValueChange={(value) => setStepData(prev => ({ ...prev, workingHours: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione seu horário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="commercial">Comercial (9h-18h)</SelectItem>
              <SelectItem value="morning">Manhã (6h-14h)</SelectItem>
              <SelectItem value="afternoon">Tarde (14h-22h)</SelectItem>
              <SelectItem value="night">Noite (22h-6h)</SelectItem>
              <SelectItem value="flexible">Flexível</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="weekendWork"
            checked={stepData.weekendWork}
            onCheckedChange={(checked) => setStepData(prev => ({ ...prev, weekendWork: checked }))}
          />
          <Label htmlFor="weekendWork" className="font-normal">
            Disponível para trabalhar fins de semana
          </Label>
        </div>
      </div>

      {/* Preferências de Cliente */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Preferências de Projeto</h3>
        
        <div>
          <Label>Tipos de Cliente</Label>
          <div className="grid md:grid-cols-2 gap-3 mt-2">
            {clientTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox 
                  id={type}
                  checked={stepData.clientTypes.includes(type)}
                  onCheckedChange={() => handlePreferenceToggle(type, 'clientTypes')}
                />
                <Label htmlFor={type} className="font-normal cursor-pointer">
                  {type}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>Tamanho de Projeto</Label>
          <div className="space-y-2 mt-2">
            {projectSizes.map((size) => (
              <div key={size} className="flex items-center space-x-2">
                <Checkbox 
                  id={size}
                  checked={stepData.projectSizes.includes(size)}
                  onCheckedChange={() => handlePreferenceToggle(size, 'projectSizes')}
                />
                <Label htmlFor={size} className="font-normal cursor-pointer">
                  {size}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>Setores de Interesse</Label>
          <div className="grid md:grid-cols-2 gap-3 mt-2">
            {workPreferences.map((pref) => (
              <div key={pref} className="flex items-center space-x-2">
                <Checkbox 
                  id={pref}
                  checked={stepData.workPreferences.includes(pref)}
                  onCheckedChange={() => handlePreferenceToggle(pref, 'workPreferences')}
                />
                <Label htmlFor={pref} className="font-normal cursor-pointer">
                  {pref}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comunicação */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Comunicação
        </h3>

        <div>
          <Label>Idiomas</Label>
          <div className="grid md:grid-cols-3 gap-3 mt-2">
            {["Português", "Inglês", "Espanhol", "Francês"].map((lang) => (
              <div key={lang} className="flex items-center space-x-2">
                <Checkbox 
                  id={lang}
                  checked={stepData.languages.includes(lang)}
                  onCheckedChange={() => handlePreferenceToggle(lang, 'languages')}
                />
                <Label htmlFor={lang} className="font-normal cursor-pointer">
                  {lang}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>Ferramentas de Comunicação</Label>
          <div className="grid md:grid-cols-3 gap-3 mt-2">
            {communicationTools.map((tool) => (
              <div key={tool} className="flex items-center space-x-2">
                <Checkbox 
                  id={tool}
                  checked={stepData.communicationTools.includes(tool)}
                  onCheckedChange={() => handlePreferenceToggle(tool, 'communicationTools')}
                />
                <Label htmlFor={tool} className="font-normal cursor-pointer">
                  {tool}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Disponibilidade para Viagem */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Disponibilidade para Viagem</h3>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="travel"
            checked={stepData.travel}
            onCheckedChange={(checked) => setStepData(prev => ({ ...prev, travel: checked }))}
          />
          <Label htmlFor="travel" className="font-normal">
            Disponível para viajar a trabalho
          </Label>
        </div>

        {stepData.travel && (
          <div>
            <Label htmlFor="travelRadius">Raio de Viagem (km)</Label>
            <Input
              id="travelRadius"
              type="number"
              value={stepData.travelRadius}
              onChange={(e) => setStepData(prev => ({ ...prev, travelRadius: e.target.value }))}
              placeholder="Ex: 500"
            />
          </div>
        )}
      </div>
    </div>
  );
}