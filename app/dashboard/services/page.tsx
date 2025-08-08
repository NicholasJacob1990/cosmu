'use client';

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Package,
  Clock,
  DollarSign,
  Star,
  Eye,
  Edit3,
  Trash2,
  Copy,
  MoreHorizontal,
  TrendingUp,
  Users,
  MessageSquare,
  Settings,
  Heart,
  Share2,
  Calendar
} from "lucide-react";
import { toast } from "sonner";

// Types para ServicePackage
interface PricingTier {
  price: number;
  delivery_days: number;
  revisions: number;
  features: string[];
  description?: string;
}

interface ServicePackage {
  id: string;
  title: string;
  description: string;
  category?: {
    id: string;
    name: string;
  };
  pricing_tiers: {
    basic: PricingTier;
    standard?: PricingTier;
    premium?: PricingTier;
  };
  tags: string[];
  gallery: Array<{
    type: 'image' | 'video';
    url: string;
    description?: string;
  }>;
  faq: Array<{
    question: string;
    answer: string;
  }>;
  status: 'draft' | 'active' | 'paused' | 'inactive';
  view_count: number;
  order_count: number;
  average_rating: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export default function ServicesManagementPage() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [servicePackages, setServicePackages] = useState<ServicePackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Hook para buscar serviços do usuário logado
  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ['my-services'],
    queryFn: async () => {
      try {
        return await api.services.list({ my_services: 'true' });
      } catch (error) {
        console.error('Erro ao buscar meus serviços:', error);
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  // Mock data como fallback
  useEffect(() => {
    if (servicesData?.data) {
      setServicePackages(servicesData.data.results || servicesData.data);
      setIsLoading(false);
    } else if (!servicesLoading) {
      // Fallback para mock data se API falhar
      setTimeout(() => {
        setServicePackages([
          {
            id: '1',
            title: 'Criação de Logo Profissional',
          description: 'Desenvolvo logotipos únicos e memoráveis para sua marca, incluindo variações e manual de uso.',
          category: { id: '1', name: 'Design Gráfico' },
          pricing_tiers: {
            basic: {
              price: 150,
              delivery_days: 3,
              revisions: 2,
              features: ['Logo principal', 'Versão em preto e branco', 'Arquivos PNG/JPG']
            },
            standard: {
              price: 300,
              delivery_days: 5,
              revisions: 4,
              features: ['Logo principal', 'Variações', 'Manual básico', 'Arquivos vetoriais']
            },
            premium: {
              price: 500,
              delivery_days: 7,
              revisions: 6,
              features: ['Logo completo', 'Manual de marca', 'Cartão de visita', 'Papelaria']
            }
          },
          tags: ['logo', 'design', 'branding', 'identidade visual'],
          gallery: [],
          faq: [
            {
              question: 'Quantas revisões estão incluídas?',
              answer: 'Dependendo do pacote, de 2 a 6 revisões estão incluídas.'
            }
          ],
          status: 'active',
          view_count: 245,
          order_count: 12,
          average_rating: 4.8,
          is_featured: true,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-20T14:30:00Z'
        },
        {
          id: '2', 
          title: 'Desenvolvimento de Landing Page',
          description: 'Criação de landing pages responsivas e otimizadas para conversão.',
          category: { id: '2', name: 'Desenvolvimento Web' },
          pricing_tiers: {
            basic: {
              price: 400,
              delivery_days: 5,
              revisions: 2,
              features: ['Design responsivo', 'Formulário de contato', 'SEO básico']
            },
            standard: {
              price: 700,
              delivery_days: 7,
              revisions: 3,
              features: ['Design personalizado', 'Integrações', 'Analytics', 'Otimização']
            },
            premium: {
              price: 1200,
              delivery_days: 10,
              revisions: 5,
              features: ['Funcionalidades avançadas', 'CMS', 'Treinamento', 'Suporte 30 dias']
            }
          },
          tags: ['landing page', 'web development', 'responsive', 'conversion'],
          gallery: [],
          faq: [],
          status: 'active',
          view_count: 189,
          order_count: 8,
          average_rating: 4.9,
          is_featured: false,
          created_at: '2024-01-10T09:00:00Z',
          updated_at: '2024-01-18T16:45:00Z'
        }
      ]);
      setIsLoading(false);
    }, 1000);
    }
  }, [servicesData, servicesLoading]);

  const stats = {
    totalServices: servicePackages.length,
    activeServices: servicePackages.filter(s => s.status === 'active').length,
    totalOrders: servicePackages.reduce((sum, s) => sum + s.order_count, 0),
    totalRevenue: servicePackages.reduce((sum, s) => {
      const basicPrice = s.pricing_tiers.basic.price;
      return sum + (basicPrice * s.order_count);
    }, 0),
    averageRating: servicePackages.length > 0 
      ? servicePackages.reduce((sum, s) => sum + s.average_rating, 0) / servicePackages.length 
      : 0,
    totalViews: servicePackages.reduce((sum, s) => sum + s.view_count, 0)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500 text-white';
      case 'draft': return 'bg-gray-500 text-white';
      case 'paused': return 'bg-yellow-500 text-white';
      case 'inactive': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'draft': return 'Rascunho';
      case 'paused': return 'Pausado';
      case 'inactive': return 'Inativo';
      default: return status;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Serviços</h1>
          <p className="text-muted-foreground">
            Gerencie seus pacotes de serviços e acompanhe performance
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Criar Novo Serviço
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Serviço</DialogTitle>
              <DialogDescription>
                Configure seu pacote de serviços com diferentes níveis de preço
              </DialogDescription>
            </DialogHeader>
            <CreateServiceForm onClose={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="services">Meus Serviços</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Serviços</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalServices}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeServices} ativos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pedidos Totais</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  Todos os serviços
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  Estimativa baseada em pedidos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalViews} visualizações
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
              <CardDescription>
                Últimas interações com seus serviços
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium">Novo pedido recebido</p>
                    <p className="text-sm text-muted-foreground">
                      "Criação de Logo Profissional" - Pacote Premium
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">2h atrás</span>
                </div>
                
                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium">Serviço visualizado</p>
                    <p className="text-sm text-muted-foreground">
                      "Desenvolvimento de Landing Page" - 5 visualizações
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">4h atrás</span>
                </div>

                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium">Avaliação recebida</p>
                    <p className="text-sm text-muted-foreground">
                      ⭐⭐⭐⭐⭐ - "Excelente trabalho, muito profissional!"
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">1 dia atrás</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid gap-6">
              {servicePackages.map((service) => (
                <ServicePackageCard key={service.id} service={service} />
              ))}
              
              {servicePackages.length === 0 && (
                <Card className="p-12 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum serviço criado</h3>
                  <p className="text-muted-foreground mb-4">
                    Comece criando seu primeiro pacote de serviços
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Serviço
                  </Button>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              Analytics detalhados serão implementados na próxima versão.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              Configurações de serviços em desenvolvimento.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Componente para cada card de serviço
function ServicePackageCard({ service }: { service: ServicePackage }) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500 text-white';
      case 'draft': return 'bg-gray-500 text-white';
      case 'paused': return 'bg-yellow-500 text-white';
      case 'inactive': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'draft': return 'Rascunho';
      case 'paused': return 'Pausado';
      case 'inactive': return 'Inativo';
      default: return status;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg">{service.title}</CardTitle>
              {service.is_featured && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  ⭐ Featured
                </Badge>
              )}
              <Badge className={getStatusColor(service.status)}>
                {getStatusLabel(service.status)}
              </Badge>
            </div>
            <CardDescription className="line-clamp-2">
              {service.description}
            </CardDescription>
            {service.category && (
              <p className="text-sm text-muted-foreground mt-1">
                📂 {service.category.name}
              </p>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Pricing Tiers */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {Object.entries(service.pricing_tiers).map(([tier, data]) => (
            <div key={tier} className="border rounded-lg p-4">
              <div className="text-center">
                <h4 className="font-medium capitalize mb-2">{tier}</h4>
                <div className="text-2xl font-bold text-primary mb-1">
                  {formatCurrency(data.price)}
                </div>
                <div className="text-sm text-muted-foreground mb-3">
                  📅 {data.delivery_days} dias • 🔄 {data.revisions} revisões
                </div>
                <div className="space-y-1">
                  {data.features.slice(0, 2).map((feature, idx) => (
                    <div key={idx} className="text-xs text-muted-foreground">
                      ✓ {feature}
                    </div>
                  ))}
                  {data.features.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{data.features.length - 2} mais...
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold">{service.view_count}</div>
            <div className="text-xs text-muted-foreground">👁️ Visualizações</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{service.order_count}</div>
            <div className="text-xs text-muted-foreground">📦 Pedidos</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{service.average_rating.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">⭐ Avaliação</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">
              {service.order_count > 0 ? ((service.order_count / service.view_count) * 100).toFixed(1) : 0}%
            </div>
            <div className="text-xs text-muted-foreground">📈 Conversão</div>
          </div>
        </div>

        {/* Tags */}
        {service.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {service.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {service.tags.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{service.tags.length - 4}
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" size="sm" className="flex-1">
            <Eye className="h-4 w-4 mr-2" />
            Visualizar
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <MessageSquare className="h-4 w-4 mr-2" />
            Mensagens
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente de formulário para criar serviço
function CreateServiceForm({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: [] as string[],
    pricing_tiers: {
      basic: {
        price: 0,
        delivery_days: 3,
        revisions: 1,
        features: ['']
      }
    }
  });

  const createServiceMutation = useMutation({
    mutationFn: async (serviceData: any) => {
      return await api.services.create(serviceData);
    },
    onSuccess: () => {
      toast.success("Serviço criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['my-services'] });
      onClose();
    },
    onError: (error) => {
      console.error('Erro ao criar serviço:', error);
      toast.error("Erro ao criar serviço. Tente novamente.");
    }
  });

  const handleSave = () => {
    // Validação básica
    if (!formData.title || !formData.description || !formData.pricing_tiers.basic.price) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    // Preparar dados para envio
    const serviceData = {
      ...formData,
      tags: typeof formData.tags === 'string' ? formData.tags.split(',').map(tag => tag.trim()) : formData.tags,
      status: 'draft' // Criar sempre como rascunho inicialmente
    };

    createServiceMutation.mutate(serviceData);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Título do Serviço</Label>
          <Input
            id="title"
            placeholder="Ex: Criação de Logo Profissional"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          />
        </div>

        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            placeholder="Descreva detalhadamente o que está incluído no seu serviço..."
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />
        </div>

        <div>
          <Label htmlFor="category">Categoria</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="design">Design Gráfico</SelectItem>
              <SelectItem value="web">Desenvolvimento Web</SelectItem>
              <SelectItem value="marketing">Marketing Digital</SelectItem>
              <SelectItem value="writing">Redação</SelectItem>
              <SelectItem value="video">Vídeo & Animação</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-medium mb-4">Pacote Básico</h3>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="basic-price">Preço (R$)</Label>
              <Input
                id="basic-price"
                type="number"
                placeholder="150"
                value={formData.pricing_tiers.basic.price || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  pricing_tiers: {
                    ...prev.pricing_tiers,
                    basic: {
                      ...prev.pricing_tiers.basic,
                      price: Number(e.target.value)
                    }
                  }
                }))}
              />
            </div>

            <div>
              <Label htmlFor="basic-delivery">Prazo de Entrega (dias)</Label>
              <Input
                id="basic-delivery"
                type="number"
                placeholder="3"
                value={formData.pricing_tiers.basic.delivery_days || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  pricing_tiers: {
                    ...prev.pricing_tiers,
                    basic: {
                      ...prev.pricing_tiers.basic,
                      delivery_days: Number(e.target.value)
                    }
                  }
                }))}
              />
            </div>

            <div>
              <Label htmlFor="basic-revisions">Revisões Incluídas</Label>
              <Input
                id="basic-revisions"
                type="number"
                placeholder="1"
                value={formData.pricing_tiers.basic.revisions || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  pricing_tiers: {
                    ...prev.pricing_tiers,
                    basic: {
                      ...prev.pricing_tiers.basic,
                      revisions: Number(e.target.value)
                    }
                  }
                }))}
              />
            </div>
          </div>

          <div className="mt-4">
            <Label>O que está incluído</Label>
            <Input
              placeholder="Ex: Logo principal"
              value={formData.pricing_tiers.basic.features[0] || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                pricing_tiers: {
                  ...prev.pricing_tiers,
                  basic: {
                    ...prev.pricing_tiers.basic,
                    features: [e.target.value]
                  }
                }
              }))}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={onClose} disabled={createServiceMutation.isPending}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={createServiceMutation.isPending}>
          {createServiceMutation.isPending ? 'Criando...' : 'Criar Serviço'}
        </Button>
      </div>
    </div>
  );
}