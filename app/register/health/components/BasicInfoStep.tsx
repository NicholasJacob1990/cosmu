'use client';

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ValidatedInput } from "@/components/ui/validated-input";
import { User, Building2, UserCheck, Globe, Phone, Shield } from "lucide-react";

export function BasicInfoStep({ data, onDataChange, entityType = 'pf' }: any) {
  const [stepData, setStepData] = useState({
    // Campos comuns
    firstName: data.firstName || "",
    lastName: data.lastName || "",
    fullName: data.fullName || "",
    email: data.email || "",
    phone: data.phone || "",
    password: data.password || "",
    confirmPassword: data.confirmPassword || "",
    profileUrl: data.profileUrl || "",
    
    // Campos PF (Pessoa Física)
    cpf: data.cpf || "",
    rg: data.rg || "",
    cns: data.cns || "", // Cartão Nacional de Saúde
    birthDate: data.birthDate || "",
    nationality: data.nationality || "Brasileira",
    gender: data.gender || "",
    
    // Campos PJ (Pessoa Jurídica)
    cnpj: data.cnpj || "",
    companyName: data.companyName || "",
    fantasyName: data.fantasyName || "",
    cnesNumber: data.cnesNumber || "",
    establishmentType: data.establishmentType || "",
    
    // Endereço (comum mas com labels diferentes)
    address: data.address || "",
    number: data.number || "",
    complement: data.complement || "",
    neighborhood: data.neighborhood || "",
    city: data.city || "",
    cep: data.cep || "",
    state: data.state || "",
    
    // Responsável técnico (apenas PJ)
    technicalDirector: data.technicalDirector || "",
    technicalDirectorRegistry: data.technicalDirectorRegistry || ""
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onDataChange(stepData);
    }, 300); // Debounce de 300ms
    
    return () => clearTimeout(timeoutId);
  }, [stepData]);

  return (
    <div className="space-y-6 text-galaxia-text-primary">
      {/* Identificação */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 galaxia-text-gradient">
          {entityType === 'pf' ? <User className="h-5 w-5 text-primary" /> : <Building2 className="h-5 w-5 text-primary" />}
          {entityType === 'pf' ? '1.1 Identificação Civil' : '1.1 Dados da Empresa'}
        </h3>
        
        {entityType === 'pf' ? (
          /* Campos para Pessoa Física */
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">Nome Completo (conforme documento oficial) *</Label>
              <Input
                id="fullName"
                value={stepData.fullName}
                onChange={(e) => setStepData(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Nome completo conforme RG/CNH"
              />
            </div>
          </div>
        ) : (
          /* Campos para Pessoa Jurídica */
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Razão Social *</Label>
                <Input
                  id="companyName"
                  value={stepData.companyName || ""}
                  onChange={(e) => setStepData(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Nome oficial da empresa"
                />
              </div>
              <div>
                <Label htmlFor="fantasyName">Nome Fantasia</Label>
                <Input
                  id="fantasyName"
                  value={stepData.fantasyName || ""}
                  onChange={(e) => setStepData(prev => ({ ...prev, fantasyName: e.target.value }))}
                  placeholder="Nome comercial (se diferente)"
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cnpj">CNPJ *</Label>
                <Input
                  id="cnpj"
                  value={stepData.cnpj || ""}
                  onChange={(e) => setStepData(prev => ({ ...prev, cnpj: e.target.value }))}
                  placeholder="00.000.000/0001-00"
                />
              </div>
              <div>
                <Label htmlFor="cnesNumber">Número CNES *</Label>
                <Input
                  id="cnesNumber"
                  value={stepData.cnesNumber || ""}
                  onChange={(e) => setStepData(prev => ({ ...prev, cnesNumber: e.target.value }))}
                  placeholder="Cadastro Nacional de Estabelecimentos de Saúde"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Campos Pessoais (apenas PF) */}
      {entityType === 'pf' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <User className="h-5 w-5" />
            Dados Pessoais
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Nome *</Label>
              <Input
                id="firstName"
                value={stepData.firstName}
                onChange={(e) => setStepData(prev => ({ ...prev, firstName: e.target.value }))}
                placeholder="Seu primeiro nome"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Sobrenome *</Label>
              <Input
                id="lastName"
                value={stepData.lastName}
                onChange={(e) => setStepData(prev => ({ ...prev, lastName: e.target.value }))}
                placeholder="Seu sobrenome"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                value={stepData.cpf}
                onChange={(e) => setStepData(prev => ({ ...prev, cpf: e.target.value }))}
                placeholder="000.000.000-00"
              />
            </div>
            <div>
              <Label htmlFor="rg">RG/CNH *</Label>
              <Input
                id="rg"
                value={stepData.rg}
                onChange={(e) => setStepData(prev => ({ ...prev, rg: e.target.value }))}
                placeholder="12.345.678-9"
              />
            </div>
            <div>
              <Label htmlFor="birthDate">Data de Nascimento *</Label>
              <Input
                id="birthDate"
                type="date"
                value={stepData.birthDate}
                onChange={(e) => setStepData(prev => ({ ...prev, birthDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gender">Gênero</Label>
              <Select 
                value={stepData.gender} 
                onValueChange={(value) => setStepData(prev => ({ ...prev, gender: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="feminino">Feminino</SelectItem>
                  <SelectItem value="nao-binario">Não-binário</SelectItem>
                  <SelectItem value="nao-informar">Prefiro não informar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="nationality">Nacionalidade</Label>
              <Input
                id="nationality"
                value={stepData.nationality}
                onChange={(e) => setStepData(prev => ({ ...prev, nationality: e.target.value }))}
                placeholder="Brasileira"
              />
            </div>
          </div>
        </div>
      )}

      {/* Responsável Técnico (apenas PJ) */}
      {entityType === 'pj' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Responsável Técnico
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="technicalDirector">Nome do Responsável Técnico *</Label>
              <Input
                id="technicalDirector"
                value={stepData.technicalDirector}
                onChange={(e) => setStepData(prev => ({ ...prev, technicalDirector: e.target.value }))}
                placeholder="Nome completo do profissional responsável"
              />
            </div>
            <div>
              <Label htmlFor="technicalDirectorRegistry">Registro Profissional *</Label>
              <Input
                id="technicalDirectorRegistry"
                value={stepData.technicalDirectorRegistry}
                onChange={(e) => setStepData(prev => ({ ...prev, technicalDirectorRegistry: e.target.value }))}
                placeholder="CRM/CRO/CRP do responsável"
              />
            </div>
          </div>
        </div>
      )}

      {/* URL do Perfil Personalizada */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 galaxia-text-gradient">
          <Globe className="h-5 w-5 text-primary" />
          1.3 URL do Perfil Profissional
        </h3>
        
        <div className="space-y-3">
          <div>
            <Label htmlFor="profileUrl">URL Personalizada *</Label>
            <div className="flex">
              <div className="flex items-center px-3 bg-muted border border-r-0 rounded-l-md text-sm text-muted-foreground">
                galaxia.com/
              </div>
              <Input
                id="profileUrl"
                value={stepData.profileUrl || ""}
                onChange={(e) => {
                  const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                  setStepData(prev => ({ ...prev, profileUrl: value }));
                }}
                placeholder="seu-nome-profissional"
                className="rounded-l-none"
                maxLength={30}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Apenas letras, números e hífens. Será seu link público: galaxia.com/{stepData.profileUrl || 'seu-nome'}
            </p>
            {stepData.profileUrl && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                <strong>Seu perfil ficará em:</strong> 
                <span className="text-green-600 ml-1">
                  galaxia.com/{stepData.profileUrl}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contato e Endereço */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 galaxia-text-gradient">
          <Phone className="h-5 w-5 text-primary" />
          1.4 Contato e Localização
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              value={stepData.email}
              onChange={(e) => setStepData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <Label htmlFor="phone">Telefone *</Label>
            <Input
              id="phone"
              value={stepData.phone}
              onChange={(e) => setStepData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="(11) 99999-9999"
            />
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-muted-foreground">
            {entityType === 'pf' ? 'Endereço Residencial *' : 'Endereço do Estabelecimento *'}
          </h4>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="address">Logradouro *</Label>
              <Input
                id="address"
                value={stepData.address}
                onChange={(e) => setStepData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Rua, Avenida, etc"
              />
            </div>
            <div>
              <Label htmlFor="number">Número *</Label>
              <Input
                id="number"
                value={stepData.number}
                onChange={(e) => setStepData(prev => ({ ...prev, number: e.target.value }))}
                placeholder="123"
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="complement">Complemento</Label>
              <Input
                id="complement"
                value={stepData.complement}
                onChange={(e) => setStepData(prev => ({ ...prev, complement: e.target.value }))}
                placeholder={entityType === 'pf' ? 'Apto, Casa' : 'Sala, Andar'}
              />
            </div>
            <div>
              <Label htmlFor="neighborhood">Bairro *</Label>
              <Input
                id="neighborhood"
                value={stepData.neighborhood}
                onChange={(e) => setStepData(prev => ({ ...prev, neighborhood: e.target.value }))}
                placeholder="Nome do bairro"
              />
            </div>
            <div>
              <Label htmlFor="cep">CEP *</Label>
              <Input
                id="cep"
                value={stepData.cep}
                onChange={(e) => setStepData(prev => ({ ...prev, cep: e.target.value }))}
                placeholder="00000-000"
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">Cidade *</Label>
              <Input
                id="city"
                value={stepData.city}
                onChange={(e) => setStepData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Nome da cidade"
              />
            </div>
            <div>
              <Label htmlFor="state">Estado *</Label>
              <Select value={stepData.state} onValueChange={(value) => setStepData(prev => ({ ...prev, state: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
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
          </div>
        </div>
      </div>

      {/* Credenciais */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 galaxia-text-gradient">
          <Shield className="h-5 w-5 text-primary" />
          1.5 Credenciais de Acesso
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="password">Senha *</Label>
            <Input
              id="password"
              type="password"
              value={stepData.password}
              onChange={(e) => setStepData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Mínimo 8 caracteres"
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={stepData.confirmPassword}
              onChange={(e) => setStepData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              placeholder="Repita sua senha"
              className={stepData.password && stepData.confirmPassword && stepData.password !== stepData.confirmPassword ? 'border-red-500' : ''}
            />
            {stepData.password && stepData.confirmPassword && stepData.password !== stepData.confirmPassword && (
              <p className="text-sm text-red-600 mt-1">As senhas não coincidem</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}