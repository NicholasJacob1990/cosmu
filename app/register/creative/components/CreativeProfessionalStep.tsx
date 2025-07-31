'use client';

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  User, 
  Layers, 
  DollarSign, 
  Globe, 
  Building2,
  Camera,
  Palette,
  Video,
  Brush,
  Film,
  Layout,
  Box,
  Music,
  Headphones
} from "lucide-react";

export function CreativeProfessionalStep({ data, onDataChange, entityType = 'pf' }: any) {
  const [stepData, setStepData] = useState({
    // Informações básicas do perfil criativo
    professionalTitle: data.professionalTitle || "",
    profileUrl: data.profileUrl || "",
    bio: data.bio || "",
    
    // Categorias e especialidades
    primaryCategory: data.primaryCategory || "",
    categories: data.categories || [],
    specialties: data.specialties || [],
    skills: data.skills || [],
    
    // Experiência
    experienceLevel: data.experienceLevel || "",
    yearsOfExperience: data.yearsOfExperience || "",
    
    // Precificação
    pricingModel: data.pricingModel || "hourly",
    hourlyRate: data.hourlyRate || "",
    minimumProjectValue: data.minimumProjectValue || "",
    
    // Idiomas
    languages: data.languages || [{ language: "Português", proficiency: "native" }],
    
    // Para PJ
    companyName: data.companyName || "",
    fantasyName: data.fantasyName || "",
    cnpj: data.cnpj || "",
    mei: data.mei || false,
    businessType: data.businessType || "",
    
    // Links externos
    portfolio: data.portfolio || "",
    behance: data.behance || "",
    dribbble: data.dribbble || "",
    instagram: data.instagram || "",
    website: data.website || "",
    
    // Equipamentos
    equipment: data.equipment || []
  });

  useEffect(() => {
    onDataChange(stepData);
  }, [stepData, onDataChange]);

  const creativeCategories = [
    { value: "photography", label: "Fotografia", icon: Camera },
    { value: "graphic-design", label: "Design Gráfico", icon: Palette },
    { value: "video", label: "Videomaking", icon: Video },
    { value: "illustration", label: "Ilustração", icon: Brush },
    { value: "animation", label: "Animação", icon: Film },
    { value: "ui-ux", label: "UI/UX Design", icon: Layout },
    { value: "3d", label: "Modelagem 3D", icon: Box },
    { value: "music", label: "Produção Musical", icon: Music },
    { value: "audio", label: "Edição de Áudio", icon: Headphones }
  ];

  const photographySpecialties = [
    "Casamento", "Eventos", "Corporativo", "Moda", "Produto", 
    "Gastronomia", "Arquitetura", "Natureza", "Retratos", "Newborn"
  ];

  const designSpecialties = [
    "Identidade Visual", "Logo Design", "Material Impresso", "Social Media",
    "Packaging", "Editorial", "Infográficos", "Apresentações", "Web Design"
  ];

  const videoSpecialties = [
    "Institucional", "Publicitário", "Documentário", "Eventos", 
    "Motion Graphics", "Drone", "YouTube", "Reels/TikTok", "Educacional"
  ];

  return (
    <div className="space-y-6">
      {/* Informação contextual */}
      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">
          {entityType === 'pf' ? '🎨 Perfil Profissional Criativo' : '🏢 Empresa Criativa'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {entityType === 'pf' 
            ? 'Configure seu perfil para se destacar como profissional criativo independente.' 
            : 'Configure o perfil da sua agência ou estúdio criativo.'
          }
        </p>
      </div>

      {/* Título e URL do Perfil */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <User className="h-5 w-5" />
          Identidade Profissional
        </h3>

        <div>
          <Label htmlFor="professionalTitle">Título Profissional *</Label>
          <Input
            id="professionalTitle"
            value={stepData.professionalTitle}
            onChange={(e) => setStepData(prev => ({ ...prev, professionalTitle: e.target.value }))}
            placeholder="Ex: Fotógrafo Especialista em Casamentos"
            maxLength={80}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {stepData.professionalTitle.length}/80 caracteres - Seja específico e profissional
          </p>
        </div>

        {entityType === 'pf' && (
          <div>
            <Label htmlFor="profileUrl">URL do Perfil (opcional)</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">galaxia.com/</span>
              <Input
                id="profileUrl"
                value={stepData.profileUrl}
                onChange={(e) => setStepData(prev => ({ 
                  ...prev, 
                  profileUrl: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') 
                }))}
                placeholder="seu-nome-criativo"
                className="flex-1"
                maxLength={20}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Entre 4-20 caracteres. Use apenas letras, números e hífen.
            </p>
          </div>
        )}

        <div>
          <Label htmlFor="bio">Biografia Profissional *</Label>
          <Textarea
            id="bio"
            value={stepData.bio}
            onChange={(e) => setStepData(prev => ({ ...prev, bio: e.target.value }))}
            placeholder="Descreva sua experiência, estilo de trabalho e o que te diferencia..."
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {stepData.bio.length}/500 caracteres - Destaque seus diferenciais
          </p>
        </div>
      </div>

      {/* Categorias e Especialidades */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Área de Atuação
        </h3>

        <div>
          <Label htmlFor="primaryCategory">Categoria Principal *</Label>
          <Select 
            value={stepData.primaryCategory} 
            onValueChange={(value) => setStepData(prev => ({ ...prev, primaryCategory: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione sua categoria principal" />
            </SelectTrigger>
            <SelectContent>
              {creativeCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <SelectItem key={cat.value} value={cat.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {cat.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Especialidades baseadas na categoria */}
        {stepData.primaryCategory && (
          <div>
            <Label>Especialidades (até 4) *</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {(stepData.primaryCategory === 'photography' ? photographySpecialties :
                stepData.primaryCategory === 'graphic-design' ? designSpecialties :
                stepData.primaryCategory === 'video' ? videoSpecialties : []
              ).map((specialty) => (
                <div key={specialty} className="flex items-center space-x-2">
                  <Checkbox 
                    id={specialty}
                    checked={stepData.specialties.includes(specialty)}
                    onCheckedChange={(checked) => {
                      if (checked && stepData.specialties.length < 4) {
                        setStepData(prev => ({
                          ...prev,
                          specialties: [...prev.specialties, specialty]
                        }));
                      } else if (!checked) {
                        setStepData(prev => ({
                          ...prev,
                          specialties: prev.specialties.filter(s => s !== specialty)
                        }));
                      }
                    }}
                    disabled={!stepData.specialties.includes(specialty) && stepData.specialties.length >= 4}
                  />
                  <Label htmlFor={specialty} className="text-sm font-normal cursor-pointer">
                    {specialty}
                  </Label>
                </div>
              ))}
            </div>
            {stepData.specialties.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                Selecionadas: {stepData.specialties.length}/4
              </p>
            )}
          </div>
        )}
      </div>

      {/* Experiência e Precificação */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Experiência e Valores
        </h3>

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
                <SelectItem value="entry">
                  <div>
                    <div className="font-medium">Iniciante</div>
                    <div className="text-xs text-muted-foreground">0-2 anos de experiência</div>
                  </div>
                </SelectItem>
                <SelectItem value="intermediate">
                  <div>
                    <div className="font-medium">Intermediário</div>
                    <div className="text-xs text-muted-foreground">2-5 anos de experiência</div>
                  </div>
                </SelectItem>
                <SelectItem value="expert">
                  <div>
                    <div className="font-medium">Experiente</div>
                    <div className="text-xs text-muted-foreground">5+ anos de experiência</div>
                  </div>
                </SelectItem>
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
              min="25"
              max="1000"
              value={stepData.hourlyRate}
              onChange={(e) => setStepData(prev => ({ ...prev, hourlyRate: e.target.value }))}
              placeholder="Ex: 150"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Sugestão para {stepData.primaryCategory}: R$ 80-300/hora
            </p>
          </div>
        )}

        {(stepData.pricingModel === 'fixed' || stepData.pricingModel === 'both') && (
          <div>
            <Label htmlFor="minimumProjectValue">Valor Mínimo de Projeto (R$) *</Label>
            <Input
              id="minimumProjectValue"
              type="number"
              min="100"
              value={stepData.minimumProjectValue}
              onChange={(e) => setStepData(prev => ({ ...prev, minimumProjectValue: e.target.value }))}
              placeholder="Ex: 500"
            />
          </div>
        )}
      </div>

      {/* Links de Portfólio */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Portfólio e Redes
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="portfolio">Portfólio Principal</Label>
            <Input
              id="portfolio"
              type="url"
              value={stepData.portfolio}
              onChange={(e) => setStepData(prev => ({ ...prev, portfolio: e.target.value }))}
              placeholder="https://seuportfolio.com"
            />
          </div>
          <div>
            <Label htmlFor="behance">Behance</Label>
            <Input
              id="behance"
              value={stepData.behance}
              onChange={(e) => setStepData(prev => ({ ...prev, behance: e.target.value }))}
              placeholder="behance.net/seuperfil"
            />
          </div>
          <div>
            <Label htmlFor="instagram">Instagram Profissional</Label>
            <Input
              id="instagram"
              value={stepData.instagram}
              onChange={(e) => setStepData(prev => ({ ...prev, instagram: e.target.value }))}
              placeholder="@seuperfil"
            />
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={stepData.website}
              onChange={(e) => setStepData(prev => ({ ...prev, website: e.target.value }))}
              placeholder="https://seusite.com.br"
            />
          </div>
        </div>
      </div>

      {/* Informações PJ */}
      {entityType === 'pj' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Dados da Empresa
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName">Razão Social *</Label>
              <Input
                id="companyName"
                value={stepData.companyName}
                onChange={(e) => setStepData(prev => ({ ...prev, companyName: e.target.value }))}
                placeholder="Empresa Criativa LTDA"
              />
            </div>
            <div>
              <Label htmlFor="fantasyName">Nome Fantasia *</Label>
              <Input
                id="fantasyName"
                value={stepData.fantasyName}
                onChange={(e) => setStepData(prev => ({ ...prev, fantasyName: e.target.value }))}
                placeholder="Estúdio Criativo"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="businessType">Tipo de Empresa *</Label>
            <Select 
              value={stepData.businessType} 
              onValueChange={(value) => setStepData(prev => ({ ...prev, businessType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mei">MEI - Microempreendedor Individual</SelectItem>
                <SelectItem value="eireli">EIRELI</SelectItem>
                <SelectItem value="ltda">LTDA</SelectItem>
                <SelectItem value="sa">S.A.</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}