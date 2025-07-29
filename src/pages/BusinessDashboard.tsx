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

export function BusinessDashboard() {
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
    { name: "Gestão de Projetos", level: "Expert", projects: 38, avgValue: "R$ 7.100" },
    { name: "Transformação Digital", level: "Advanced", projects: 22, avgValue: "R$ 9.200" }
  ];

  const certifications = [
    {
      name: "MBA em Gestão Estratégica",
      institution: "FGV",
      year: "2019",
      status: "active"
    },
    {
      name: "PMP - Project Management Professional",
      institution: "PMI",
      year: "2020",
      status: "active"
    },
    {
      name: "Certified Scrum Master",
      institution: "Scrum Alliance",
      year: "2021",
      status: "active"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Dashboard Business</h1>
                <p className="text-sm text-muted-foreground">Maria Business - Consultora Estratégica</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notificações
              </Button>
              <Avatar>
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>MB</AvatarFallback>
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
                  <p className="text-xs text-muted-foreground">+6 novos este mês</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ {stats.monthlyRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+{stats.growthRate}% crescimento</p>
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
                  <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">96%</div>
                  <p className="text-xs text-muted-foreground">Projetos entregues no prazo</p>
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
                  <span className="text-xs">Nova Proposta</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Calendar className="h-5 w-5" />
                  <span className="text-xs">Agendar Reunião</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <FileText className="h-5 w-5" />
                  <span className="text-xs">Relatórios</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <BarChart3 className="h-5 w-5" />
                  <span className="text-xs">Analytics</span>
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
                    <div key={project.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{project.title}</h4>
                          <p className="text-xs text-muted-foreground">Cliente: {project.client}</p>
                          <p className="text-xs text-muted-foreground">Deadline: {project.deadline}</p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {project.category}
                          </Badge>
                        </div>
                        <Badge 
                          variant={project.status === 'completed' ? 'default' : 
                                   project.status === 'in-progress' ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {project.status === 'completed' ? 'Concluído' :
                           project.status === 'in-progress' ? 'Em Andamento' : 'Revisão'}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Progresso</span>
                          <span>{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">R$ {project.value.toLocaleString()}</span>
                        <Badge variant="outline" className="text-xs">{project.type}</Badge>
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
                  <Building className="h-5 w-5" />
                  Serviços Oferecidos
                </CardTitle>
                <CardDescription>Suas especialidades e expertise em negócios</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {services.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                        <Briefcase className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {service.projects} projetos • Valor médio: {service.avgValue}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={service.level === 'Expert' ? 'default' : 'secondary'}
                      >
                        {service.level}
                      </Badge>
                    </div>
                  </div>
                ))}

                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Novo Serviço
                </Button>
              </CardContent>
            </Card>

            {/* Certifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Certificações e Formação
                </CardTitle>
                <CardDescription>Suas qualificações profissionais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {certifications.map((cert, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg flex items-center justify-center">
                        <Award className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{cert.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {cert.institution} • {cert.year}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700">
                      {cert.status === 'active' ? 'Ativo' : 'Expirado'}
                    </Badge>
                  </div>
                ))}

                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Certificação
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Empresarial</CardTitle>
                  <CardDescription>Indicadores do seu negócio</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Taxa de Conversão</span>
                      <span>78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Satisfação do Cliente</span>
                      <span>96%</span>
                    </div>
                    <Progress value={96} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Crescimento Mensal</span>
                      <span>{stats.growthRate}%</span>
                    </div>
                    <Progress value={stats.growthRate * 5} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Retenção de Clientes</span>
                      <span>84%</span>
                    </div>
                    <Progress value={84} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Relatórios Empresariais</CardTitle>
                  <CardDescription>Baixe relatórios detalhados do seu negócio</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Relatório Financeiro Mensal
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Análise de Performance
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Dashboard de Clientes
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Portfolio de Projetos
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Certificado de Consultoria
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