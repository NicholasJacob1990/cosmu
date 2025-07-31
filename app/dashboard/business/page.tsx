'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Briefcase,
  TrendingUp,
  Users,
  FileText,
  PieChart,
  Star,
  Clock,
  DollarSign,
  Target,
  BarChart3,
  Building,
  Bell,
  MessageSquare,
  Video,
  Plus,
  Filter,
  Download,
  Calendar,
  UserCheck,
  Award,
  Globe
} from "lucide-react";

export default function BusinessDashboardPage() {
  const [selectedTab, setSelectedTab] = useState("overview");

  const stats = {
    activeClients: 34,
    monthlyRevenue: 28500,
    rating: 4.8,
    projectsCompleted: 89,
    responseTime: "1 hora",
    growthRate: 18
  };

  const recentProjects = [
    {
      id: "1",
      title: "Consultoria Estratégica - Expansão Digital",
      client: "TechCorp Brasil",
      type: "Consultoria",
      status: "in-progress",
      deadline: "2024-02-15",
      progress: 65,
      value: 12000,
      category: "Estratégia Digital"
    },
    {
      id: "2",
      title: "Plano de Negócios - Startup FinTech",
      client: "FinStart Innovation",
      type: "Business Plan",
      status: "review",
      deadline: "2024-01-28",
      progress: 95,
      value: 5500,
      category: "Planejamento"
    },
    {
      id: "3",
      title: "Análise de Mercado - E-commerce",
      client: "ShopOnline",
      type: "Market Research",
      status: "completed",
      deadline: "2024-01-22",
      progress: 100,
      value: 8200,
      category: "Pesquisa de Mercado"
    }
  ];

  const upcomingMeetings = [
    {
      id: "1",
      client: "TechCorp Brasil",
      time: "14:00",
      type: "Reunião de Alinhamento",
      duration: "90 min"
    },
    {
      id: "2",
      client: "FinStart Innovation", 
      time: "16:30",
      type: "Apresentação Final",
      duration: "60 min"
    }
  ];

  const services = [
    { name: "Consultoria Estratégica", level: "Expert", projects: 45, avgValue: "R$ 8.500" },
    { name: "Planos de Negócio", level: "Expert", projects: 32, avgValue: "R$ 6.200" },
    { name: "Análise de Mercado", level: "Advanced", projects: 28, avgValue: "R$ 4.800" },
    { name: "Gestão de Processos", level: "Advanced", projects: 21, avgValue: "R$ 5.200" },
    { name: "Planejamento Financeiro", level: "Intermediate", projects: 15, avgValue: "R$ 3.800" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Dashboard Consultor</h1>
                <p className="text-sm text-muted-foreground">Maria Oliveira - Consultora Empresarial</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notificações
              </Button>
              <Avatar>
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>MO</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="projects">Projetos</TabsTrigger>
            <TabsTrigger value="clients">Clientes</TabsTrigger>
            <TabsTrigger value="services">Serviços</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeClients}</div>
                  <p className="text-xs text-muted-foreground">+{stats.growthRate}% em relação ao mês passado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ {stats.monthlyRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+22% em relação ao mês passado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avaliação</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.rating}★</div>
                  <p className="text-xs text-muted-foreground">Baseado em {stats.projectsCompleted} projetos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Crescimento</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+{stats.growthRate}%</div>
                  <p className="text-xs text-muted-foreground">Crescimento mensal</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>Acesse rapidamente as funcionalidades mais utilizadas</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button className="h-20 flex-col gap-2">
                  <Plus className="h-5 w-5" />
                  <span className="text-xs">Novo Projeto</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Calendar className="h-5 w-5" />
                  <span className="text-xs">Agendar Reunião</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <FileText className="h-5 w-5" />
                  <span className="text-xs">Proposta</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <BarChart3 className="h-5 w-5" />
                  <span className="text-xs">Relatórios</span>
                </Button>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Projects */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Projetos Recentes</CardTitle>
                    <CardDescription>Seus projetos em andamento</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrar
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentProjects.map((project) => (
                    <div key={project.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-sm">{project.title}</h4>
                          <p className="text-xs text-muted-foreground">{project.client}</p>
                        </div>
                        <Badge 
                          variant={project.status === 'completed' ? 'default' : 
                                   project.status === 'in-progress' ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {project.status === 'completed' ? 'Concluído' :
                           project.status === 'in-progress' ? 'Em andamento' : 'Em revisão'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Progresso</span>
                          <span>{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-1" />
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <Badge variant="outline" className="text-xs px-2 py-0">
                          {project.category}
                        </Badge>
                        <span className="font-medium">R$ {project.value.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Today's Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle>Agenda de Hoje</CardTitle>
                  <CardDescription>Suas próximas reuniões</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingMeetings.map((meeting) => (
                    <div key={meeting.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="font-medium text-sm">{meeting.client}</p>
                          <p className="text-xs text-muted-foreground">{meeting.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{meeting.time}</p>
                        <p className="text-xs text-muted-foreground">{meeting.duration}</p>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Agendar Reunião
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Portfólio de Serviços
                </CardTitle>
                <CardDescription>Seus serviços especializados e performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {services.map((service) => (
                  <div key={service.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                        <Briefcase className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">{service.projects} projetos realizados</p>
                        <p className="text-xs text-muted-foreground">Valor médio: {service.avgValue}</p>
                      </div>
                    </div>
                    <Badge 
                      className={
                        service.level === 'Expert' ? 'bg-gold-100 text-gold-700' :
                        service.level === 'Advanced' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }
                    >
                      {service.level}
                    </Badge>
                  </div>
                ))}
                
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Novo Serviço
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance do Mês</CardTitle>
                  <CardDescription>Indicadores de desempenho consultivo</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Taxa de Satisfação</span>
                      <span>96%</span>
                    </div>
                    <Progress value={96} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Taxa de Retenção</span>
                      <span>88%</span>
                    </div>
                    <Progress value={88} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Tempo de Resposta</span>
                      <span>{stats.responseTime}</span>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Relatórios Gerenciais</CardTitle>
                  <CardDescription>Baixe relatórios detalhados dos seus negócios</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Relatório de Performance
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Análise de Clientes
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Receitas e Projetos
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Relatório Estratégico
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}