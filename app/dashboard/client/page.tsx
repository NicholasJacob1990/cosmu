'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Search,
  FileText,
  MessageSquare,
  Star,
  Clock,
  DollarSign,
  CheckCircle,
  TrendingUp,
  Eye,
  Heart,
  Users,
  Calendar,
  Bell,
  Filter,
  Plus,
  Settings,
  Shield,
  Target
} from "lucide-react";

export default function ClientDashboardPage() {
  const [selectedTab, setSelectedTab] = useState("overview");

  const stats = {
    activeProjects: 5,
    completedProjects: 23,
    totalSpent: 42350,
    averageRating: 4.9,
    responseTime: "< 1 hora",
    savedFreelancers: 12
  };

  const activeProjects = [
    {
      id: "1",
      title: "Desenvolvimento de App Mobile",
      freelancer: "João Santos",
      category: "Desenvolvimento",
      status: "in-progress",
      deadline: "2024-02-10",
      progress: 75,
      budget: 8500,
      freelancerAvatar: "/placeholder.svg",
      rating: 4.9
    },
    {
      id: "2", 
      title: "Design de Logo e Identidade Visual",
      freelancer: "Maria Silva",
      category: "Design",
      status: "review",
      deadline: "2024-01-25",
      progress: 95,
      budget: 2200,
      freelancerAvatar: "/placeholder.svg",
      rating: 5.0
    },
    {
      id: "3",
      title: "Consultoria em Marketing Digital",
      freelancer: "Pedro Costa",
      category: "Marketing", 
      status: "in-progress",
      deadline: "2024-02-05",
      progress: 45,
      budget: 3800,
      freelancerAvatar: "/placeholder.svg",
      rating: 4.8
    }
  ];

  const recentMessages = [
    {
      id: "1",
      freelancer: "João Santos",
      message: "Acabei de enviar a primeira versão do protótipo para revisão.",
      time: "há 2 horas",
      unread: true,
      avatar: "/placeholder.svg"
    },
    {
      id: "2",
      freelancer: "Maria Silva", 
      message: "As alterações no logo foram feitas conforme solicitado.",
      time: "há 5 horas",
      unread: false,
      avatar: "/placeholder.svg"
    },
    {
      id: "3",
      freelancer: "Pedro Costa",
      message: "Relatório de análise de concorrência está pronto.",
      time: "ontem",
      unread: true,
      avatar: "/placeholder.svg"
    }
  ];

  const recommendations = [
    {
      id: "1",
      name: "Ana Costa",
      title: "Especialista em UX/UI Design",
      rating: 4.9,
      reviews: 127,
      rate: "R$ 95/hora",
      skills: ["Figma", "Adobe XD", "Prototyping"],
      avatar: "/placeholder.svg",
      matchScore: 95
    },
    {
      id: "2",
      name: "Carlos Mendes",
      title: "Desenvolvedor Full Stack",
      rating: 4.8,
      reviews: 89,
      rate: "R$ 120/hora", 
      skills: ["React", "Node.js", "MongoDB"],
      avatar: "/placeholder.svg",
      matchScore: 92
    },
    {
      id: "3",
      name: "Sofia Lima",
      title: "Copywriter & Content Marketing",
      rating: 5.0,
      reviews: 64,
      rate: "R$ 80/hora",
      skills: ["Copywriting", "SEO", "Content Strategy"],
      avatar: "/placeholder.svg",
      matchScore: 88
    }
  ];

  const completedProjects = [
    {
      id: "1",
      title: "Website Corporativo",
      freelancer: "Lucas Oliveira",
      completedDate: "2024-01-15",
      rating: 5,
      value: 4500,
      category: "Web Development"
    },
    {
      id: "2",
      title: "Campanha de Social Media",
      freelancer: "Beatriz Ferreira", 
      completedDate: "2024-01-08",
      rating: 4,
      value: 2800,
      category: "Marketing"
    },
    {
      id: "3",
      title: "Tradução Técnica",
      freelancer: "Ricardo Martins",
      completedDate: "2023-12-20",
      rating: 5,
      value: 1500,
      category: "Tradução"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Dashboard do Cliente</h1>
                <p className="text-sm text-muted-foreground">Rafael Mendes - Empresário</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notificações
              </Button>
              <Avatar>
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>RM</AvatarFallback>
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
            <TabsTrigger value="messages">Mensagens</TabsTrigger>
            <TabsTrigger value="discover">Descobrir</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeProjects}</div>
                  <p className="text-xs text-muted-foreground">+2 este mês</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Projetos Concluídos</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.completedProjects}</div>
                  <p className="text-xs text-muted-foreground">Taxa de sucesso: 100%</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Investido</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ {stats.totalSpent.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">ROI médio: 285%</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.averageRating}★</div>
                  <p className="text-xs text-muted-foreground">Dos profissionais contratados</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>Encontre profissionais e gerencie seus projetos</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button className="h-20 flex-col gap-2">
                  <Plus className="h-5 w-5" />
                  <span className="text-xs">Novo Projeto</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Search className="h-5 w-5" />
                  <span className="text-xs">Buscar Profissionais</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <MessageSquare className="h-5 w-5" />
                  <span className="text-xs">Mensagens</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Eye className="h-5 w-5" />
                  <span className="text-xs">Descobrir Talentos</span>
                </Button>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Active Projects */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Projetos Ativos</CardTitle>
                    <CardDescription>Acompanhe o progresso em tempo real</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrar
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activeProjects.map((project) => (
                    <div key={project.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{project.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Avatar className="w-5 h-5">
                              <AvatarImage src={project.freelancerAvatar} />
                              <AvatarFallback className="text-xs">{project.freelancer[0]}</AvatarFallback>
                            </Avatar>
                            <p className="text-xs text-muted-foreground">{project.freelancer}</p>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs">{project.rating}</span>
                            </div>
                          </div>
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
                        <span className="font-medium">R$ {project.budget.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Messages */}
              <Card>
                <CardHeader>
                  <CardTitle>Mensagens Recentes</CardTitle>
                  <CardDescription>Comunicação com seus profissionais</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentMessages.map((message) => (
                    <div key={message.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={message.avatar} />
                        <AvatarFallback className="text-xs">{message.freelancer[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{message.freelancer}</p>
                          <span className="text-xs text-muted-foreground">{message.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{message.message}</p>
                        {message.unread && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Ver Todas as Mensagens
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="discover" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Profissionais Recomendados Para Você
                </CardTitle>
                <CardDescription>Baseado no seu histórico e preferências</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendations.map((freelancer) => (
                    <div key={freelancer.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={freelancer.avatar} />
                          <AvatarFallback>{freelancer.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm">{freelancer.name}</h4>
                          <p className="text-xs text-muted-foreground truncate">{freelancer.title}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {freelancer.matchScore}% match
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{freelancer.rating}</span>
                          <span className="text-muted-foreground">({freelancer.reviews})</span>
                        </div>
                        <span className="font-medium">{freelancer.rate}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {freelancer.skills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs px-1 py-0">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">Contratar</Button>
                        <Button variant="outline" size="sm">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Projetos Concluídos</CardTitle>
                <CardDescription>Seu histórico de sucesso com profissionais</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {completedProjects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{project.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          por {project.freelancer} • {project.completedDate}
                        </p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {project.category}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3 h-3 ${i < project.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <p className="text-sm font-medium">R$ {project.value.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}