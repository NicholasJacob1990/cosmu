import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User, Users, UserCheck, AlertCircle, CheckCircle, Building2, Phone, MapPin, Briefcase, GraduationCap, Award, FileText } from "lucide-react";
import { GalaxiaLogo } from "@/components/GalaxiaLogo";
import { ValidatedInput } from "@/components/ui/validated-input";

export function SimpleRegistration() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determinar o tipo baseado na URL atual
  const type = location.pathname.includes('/client') ? 'client' : 'freelancer';
  const [entityType, setEntityType] = useState<'pf' | 'pj'>('pf');
  const [formData, setFormData] = useState({
    // Dados básicos
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    bio: "",
    agreeToTerms: false,
    agreeToMarketing: false,
    
    // Dados pessoais PF
    cpf: "",
    rg: "",
    birthDate: "",
    phone: "",
    cep: "",
    address: "",
    city: "",
    state: "",
    
    // Dados PJ
    companyName: "",
    cnpj: "",
    tradeName: "",
    companyPhone: "",
    companyCep: "",
    companyAddress: "",
    companyCity: "",
    companyState: "",
    
    // Dados profissionais
    profession: "",
    cbo: "",
    experience: "",
    serviceCategories: [] as string[],
    coverage: "",
    availability: "",
    priceRange: "",
    
    // Qualificações
    education: "",
    certifications: "",
    professionalRegistry: "",
    
    // Portfólio
    portfolio: "",
    specialties: "",
    tools: "",
  });
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isClient = type === 'client';
  const userTypeConfig = {
    client: {
      title: "Cadastro de Cliente",
      subtitle: "Encontre os melhores profissionais para seus projetos",
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      buttonText: "Criar Conta de Cliente"
    },
    freelancer: {
      title: "Cadastro de Profissional",
      subtitle: "Comece a oferecer seus serviços hoje mesmo",
      icon: UserCheck,
      color: "from-galaxia-magenta to-galaxia-neon",
      buttonText: "Criar Conta de Profissional"
    }
  };

  const config = userTypeConfig[type || 'client'];
  const IconComponent = config.icon;

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const validateForm = () => {
    // Validações básicas
    if (!formData.firstName.trim()) return "Nome é obrigatório";
    if (!formData.lastName.trim()) return "Sobrenome é obrigatório";
    if (!formData.email.trim()) return "Email é obrigatório";
    if (!formData.email.includes('@')) return "Email inválido";
    if (formData.password.length < 6) return "Senha deve ter no mínimo 6 caracteres";
    if (formData.password !== formData.confirmPassword) return "Senhas não coincidem";
    if (!formData.agreeToTerms) return "Você deve aceitar os termos de uso";
    
    // Validações para profissionais
    if (!isClient) {
      if (!formData.bio.trim()) return "Descrição profissional é obrigatória";
      if (!formData.phone.trim()) return "Telefone é obrigatório";
      if (!formData.profession.trim()) return "Profissão é obrigatória";
      
      // Validações específicas para PF
      if (entityType === 'pf') {
        if (!formData.cpf.trim()) return "CPF é obrigatório";
        if (!formData.rg.trim()) return "RG é obrigatório";
        if (!formData.birthDate.trim()) return "Data de nascimento é obrigatória";
      }
      
      // Validações específicas para PJ
      if (entityType === 'pj') {
        if (!formData.companyName.trim()) return "Razão social é obrigatória";
        if (!formData.cnpj.trim()) return "CNPJ é obrigatório";
        if (!formData.tradeName.trim()) return "Nome fantasia é obrigatório";
        if (!formData.companyPhone.trim()) return "Telefone da empresa é obrigatório";
      }
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          userType: isClient ? 'client' : 'professional',
          professionalType: isClient ? undefined : 'general',
          entityType: isClient ? undefined : entityType,
          bio: formData.bio || undefined,
          plan: 'free'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar conta");
      }

      // Store auth data
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      toast.success("Conta criada com sucesso!");

      // Redirect based on user type
      if (isClient) {
        navigate("/client-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'github') => {
    // TODO: Implement social login
    console.log(`Login with ${provider}`);
    toast.info(`Login com ${provider} será implementado em breve`);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-galaxia-grad-a/5 via-galaxia-grad-b/5 to-galaxia-grad-c/5 opacity-40"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-8">
          <Link to="/register" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>

        <Card className="border-border/40 bg-background/95 backdrop-blur">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <GalaxiaLogo />
            </div>
            <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${config.color} rounded-2xl flex items-center justify-center`}>
              <IconComponent className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">{config.title}</CardTitle>
            <p className="text-muted-foreground text-sm">
              {config.subtitle}
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Seletor de Entidade (apenas para profissionais) */}
              {!isClient && (
                <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                  <Label className="text-sm font-semibold">Tipo de Cadastro</Label>
                  <RadioGroup 
                    value={entityType} 
                    onValueChange={(value: 'pf' | 'pj') => setEntityType(value)}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pf" id="simple-pf" />
                      <Label htmlFor="simple-pf" className="font-normal cursor-pointer text-sm">
                        <User className="h-4 w-4 inline mr-1" />
                        Pessoa Física
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pj" id="simple-pj" />
                      <Label htmlFor="simple-pj" className="font-normal cursor-pointer text-sm">
                        <Building2 className="h-4 w-4 inline mr-1" />
                        Pessoa Jurídica
                      </Label>
                    </div>
                  </RadioGroup>
                  <p className="text-xs text-muted-foreground">
                    {entityType === 'pf' 
                      ? 'Cadastro como profissional autônomo' 
                      : 'Cadastro como empresa/clínica/estúdio'
                    }
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nome</Label>
                  <Input
                    id="firstName"
                    placeholder="Seu nome"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Sobrenome</Label>
                  <Input
                    id="lastName"
                    placeholder="Seu sobrenome"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                  />
                </div>
              </div>

              <ValidatedInput
                label="Email"
                fieldName="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />

              <ValidatedInput
                label="Senha"
                fieldName="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                showPasswordStrength={true}
                required
              />

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    required
                    className={`pl-10 pr-10 ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword 
                        ? 'border-red-500 focus:border-red-500' 
                        : formData.confirmPassword && formData.password === formData.confirmPassword 
                        ? 'border-green-500 focus:border-green-500' 
                        : ''
                    }`}
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Senhas não coincidem
                  </p>
                )}
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Senhas coincidem
                  </p>
                )}
              </div>

              {!isClient && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Descrição Profissional</Label>
                    <Textarea
                      id="bio"
                      placeholder="Conte um pouco sobre sua experiência e especialidades..."
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>

                  {/* Informações Profissionais Básicas */}
                  <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm font-semibold">Informações Profissionais</Label>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="profession">Profissão *</Label>
                        <Input
                          id="profession"
                          placeholder="Ex: Designer Gráfico"
                          value={formData.profession}
                          onChange={(e) => handleInputChange('profession', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="experience">Experiência</Label>
                        <Select value={formData.experience} onValueChange={(value) => handleInputChange('experience', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0-1">Menos de 1 ano</SelectItem>
                            <SelectItem value="1-3">1 a 3 anos</SelectItem>
                            <SelectItem value="3-5">3 a 5 anos</SelectItem>
                            <SelectItem value="5-10">5 a 10 anos</SelectItem>
                            <SelectItem value="10+">Mais de 10 anos</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <ValidatedInput
                      label="Telefone"
                      fieldName="phone"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      entityType="pf"
                      required
                    />
                  </div>

                  {/* Campos específicos para Pessoa Física */}
                  {entityType === 'pf' && (
                    <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-3">
                        <User className="h-4 w-4 text-blue-600" />
                        <Label className="text-sm font-semibold text-blue-800">Dados Pessoais (Pessoa Física)</Label>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <ValidatedInput
                          label="CPF"
                          fieldName="cpf"
                          placeholder="000.000.000-00"
                          value={formData.cpf}
                          onChange={(e) => handleInputChange('cpf', e.target.value)}
                          entityType="pf"
                          required
                        />
                        <div className="space-y-2">
                          <Label htmlFor="rg">RG *</Label>
                          <Input
                            id="rg"
                            placeholder="12.345.678-9"
                            value={formData.rg}
                            onChange={(e) => handleInputChange('rg', e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="birthDate">Data de Nascimento *</Label>
                          <Input
                            id="birthDate"
                            type="date"
                            value={formData.birthDate}
                            onChange={(e) => handleInputChange('birthDate', e.target.value)}
                            required
                          />
                        </div>
                        <ValidatedInput
                          label="CEP"
                          fieldName="cep"
                          placeholder="00000-000"
                          value={formData.cep}
                          onChange={(e) => handleInputChange('cep', e.target.value)}
                          entityType="pf"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Endereço</Label>
                        <Input
                          id="address"
                          placeholder="Rua, número, complemento"
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">Cidade</Label>
                          <Input
                            id="city"
                            placeholder="Sua cidade"
                            value={formData.city}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">Estado</Label>
                          <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="UF" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SP">São Paulo</SelectItem>
                              <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                              <SelectItem value="MG">Minas Gerais</SelectItem>
                              <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                              <SelectItem value="PR">Paraná</SelectItem>
                              <SelectItem value="SC">Santa Catarina</SelectItem>
                              <SelectItem value="BA">Bahia</SelectItem>
                              <SelectItem value="GO">Goiás</SelectItem>
                              <SelectItem value="DF">Distrito Federal</SelectItem>
                              <SelectItem value="PE">Pernambuco</SelectItem>
                              <SelectItem value="CE">Ceará</SelectItem>
                              <SelectItem value="PA">Pará</SelectItem>
                              <SelectItem value="MA">Maranhão</SelectItem>
                              <SelectItem value="PB">Paraíba</SelectItem>
                              <SelectItem value="ES">Espírito Santo</SelectItem>
                              <SelectItem value="PI">Piauí</SelectItem>
                              <SelectItem value="AL">Alagoas</SelectItem>
                              <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                              <SelectItem value="MT">Mato Grosso</SelectItem>
                              <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                              <SelectItem value="RO">Rondônia</SelectItem>
                              <SelectItem value="AC">Acre</SelectItem>
                              <SelectItem value="AM">Amazonas</SelectItem>
                              <SelectItem value="RR">Roraima</SelectItem>
                              <SelectItem value="AP">Amapá</SelectItem>
                              <SelectItem value="TO">Tocantins</SelectItem>
                              <SelectItem value="SE">Sergipe</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Campos específicos para Pessoa Jurídica */}
                  {entityType === 'pj' && (
                    <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Building2 className="h-4 w-4 text-green-600" />
                        <Label className="text-sm font-semibold text-green-800">Dados da Empresa (Pessoa Jurídica)</Label>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="companyName">Razão Social *</Label>
                          <Input
                            id="companyName"
                            placeholder="Nome oficial da empresa"
                            value={formData.companyName}
                            onChange={(e) => handleInputChange('companyName', e.target.value)}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <ValidatedInput
                            label="CNPJ"
                            fieldName="cnpj"
                            placeholder="00.000.000/0000-00"
                            value={formData.cnpj}
                            onChange={(e) => handleInputChange('cnpj', e.target.value)}
                            entityType="pj"
                            required
                          />
                          <div className="space-y-2">
                            <Label htmlFor="tradeName">Nome Fantasia *</Label>
                            <Input
                              id="tradeName"
                              placeholder="Nome comercial"
                              value={formData.tradeName}
                              onChange={(e) => handleInputChange('tradeName', e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <ValidatedInput
                            label="Telefone da Empresa"
                            fieldName="companyPhone"
                            type="tel"
                            placeholder="(11) 3333-3333"
                            value={formData.companyPhone}
                            onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                            entityType="pj"
                            required
                          />
                          <ValidatedInput
                            label="CEP da Empresa"
                            fieldName="companyCep"
                            placeholder="00000-000"
                            value={formData.companyCep}
                            onChange={(e) => handleInputChange('companyCep', e.target.value)}
                            entityType="pj"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="companyAddress">Endereço da Empresa</Label>
                          <Input
                            id="companyAddress"
                            placeholder="Rua, número, complemento"
                            value={formData.companyAddress}
                            onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="companyCity">Cidade</Label>
                            <Input
                              id="companyCity"
                              placeholder="Cidade da empresa"
                              value={formData.companyCity}
                              onChange={(e) => handleInputChange('companyCity', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="companyState">Estado</Label>
                            <Select value={formData.companyState} onValueChange={(value) => handleInputChange('companyState', value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="UF" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="SP">São Paulo</SelectItem>
                                <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                                <SelectItem value="MG">Minas Gerais</SelectItem>
                                <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                                <SelectItem value="PR">Paraná</SelectItem>
                                <SelectItem value="SC">Santa Catarina</SelectItem>
                                <SelectItem value="BA">Bahia</SelectItem>
                                <SelectItem value="GO">Goiás</SelectItem>
                                <SelectItem value="DF">Distrito Federal</SelectItem>
                                <SelectItem value="PE">Pernambuco</SelectItem>
                                <SelectItem value="CE">Ceará</SelectItem>
                                <SelectItem value="PA">Pará</SelectItem>
                                <SelectItem value="MA">Maranhão</SelectItem>
                                <SelectItem value="PB">Paraíba</SelectItem>
                                <SelectItem value="ES">Espírito Santo</SelectItem>
                                <SelectItem value="PI">Piauí</SelectItem>
                                <SelectItem value="AL">Alagoas</SelectItem>
                                <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                                <SelectItem value="MT">Mato Grosso</SelectItem>
                                <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                                <SelectItem value="RO">Rondônia</SelectItem>
                                <SelectItem value="AC">Acre</SelectItem>
                                <SelectItem value="AM">Amazonas</SelectItem>
                                <SelectItem value="RR">Roraima</SelectItem>
                                <SelectItem value="AP">Amapá</SelectItem>
                                <SelectItem value="TO">Tocantins</SelectItem>
                                <SelectItem value="SE">Sergipe</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Qualificações e Documentação */}
                  <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-3">
                      <GraduationCap className="h-4 w-4 text-purple-600" />
                      <Label className="text-sm font-semibold text-purple-800">Qualificações</Label>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="education">Formação Acadêmica</Label>
                        <Textarea
                          id="education"
                          placeholder="Ex: Bacharel em Design pela UNESP (2020)"
                          value={formData.education}
                          onChange={(e) => handleInputChange('education', e.target.value)}
                          className="min-h-[60px]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="certifications">Certificações e Cursos</Label>
                        <Textarea
                          id="certifications"
                          placeholder="Ex: Adobe Certified Expert, Google Ads, etc."
                          value={formData.certifications}
                          onChange={(e) => handleInputChange('certifications', e.target.value)}
                          className="min-h-[60px]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="professionalRegistry">Registro Profissional</Label>
                        <Input
                          id="professionalRegistry"
                          placeholder="Ex: CREA 12345/SP, CRP 06/12345, etc."
                          value={formData.professionalRegistry}
                          onChange={(e) => handleInputChange('professionalRegistry', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Informações de Serviço */}
                  <div className="space-y-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="h-4 w-4 text-yellow-600" />
                      <Label className="text-sm font-semibold text-yellow-800">Informações de Serviço</Label>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="specialties">Especialidades</Label>
                        <Textarea
                          id="specialties"
                          placeholder="Ex: Design de logos, identidade visual, embalagens..."
                          value={formData.specialties}
                          onChange={(e) => handleInputChange('specialties', e.target.value)}
                          className="min-h-[60px]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="coverage">Área de Cobertura</Label>
                          <Select value={formData.coverage} onValueChange={(value) => handleInputChange('coverage', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="local">Local (mesma cidade)</SelectItem>
                              <SelectItem value="regional">Regional (mesmo estado)</SelectItem>
                              <SelectItem value="national">Nacional</SelectItem>
                              <SelectItem value="remote">Remoto</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="priceRange">Faixa de Preço</Label>
                          <Select value={formData.priceRange} onValueChange={(value) => handleInputChange('priceRange', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0-500">R$ 0 - 500</SelectItem>
                              <SelectItem value="500-1000">R$ 500 - 1.000</SelectItem>
                              <SelectItem value="1000-2500">R$ 1.000 - 2.500</SelectItem>
                              <SelectItem value="2500-5000">R$ 2.500 - 5.000</SelectItem>
                              <SelectItem value="5000+">R$ 5.000+</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tools">Ferramentas e Software</Label>
                        <Textarea
                          id="tools"
                          placeholder="Ex: Adobe Creative Suite, Figma, Sketch, AutoCAD..."
                          value={formData.tools}
                          onChange={(e) => handleInputChange('tools', e.target.value)}
                          className="min-h-[60px]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="portfolio">Link do Portfólio</Label>
                        <Input
                          id="portfolio"
                          type="url"
                          placeholder="https://meuportfolio.com"
                          value={formData.portfolio}
                          onChange={(e) => handleInputChange('portfolio', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm leading-5 cursor-pointer">
                    Eu aceito os{" "}
                    <Link to="/terms" className="text-primary hover:underline">
                      termos de uso
                    </Link>{" "}
                    e{" "}
                    <Link to="/privacy" className="text-primary hover:underline">
                      política de privacidade
                    </Link>
                  </Label>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="marketing"
                    checked={formData.agreeToMarketing}
                    onCheckedChange={(checked) => handleInputChange('agreeToMarketing', checked as boolean)}
                  />
                  <Label htmlFor="marketing" className="text-sm leading-5 cursor-pointer">
                    Quero receber atualizações sobre novos recursos e oportunidades
                  </Label>
                </div>
              </div>

              <Button 
                type="submit" 
                className={`w-full bg-gradient-to-r ${config.color} text-white hover:opacity-90`}
                disabled={loading}
              >
                {loading ? "Criando conta..." : config.buttonText}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/40" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Ou continue com
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <Button 
                  variant="outline" 
                  type="button" 
                  disabled={loading}
                  onClick={() => handleSocialLogin('google')}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </Button>
                <Button 
                  variant="outline" 
                  type="button" 
                  disabled={loading}
                  onClick={() => handleSocialLogin('github')}
                >
                  <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </Button>
              </div>

              <div className="text-center text-sm mt-4">
                Já tem uma conta?{" "}
                <Link to="/login" className="text-primary hover:underline">
                  Entre aqui
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}