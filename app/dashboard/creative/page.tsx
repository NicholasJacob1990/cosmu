'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Camera,
  Image,
  Users,
  FileText,
  TrendingUp,
  Star,
  Clock,
  DollarSign,
  Palette,
  Eye,
  Download,
  Bell,
  MessageSquare,
  Video,
  Plus,
  Filter,
  Upload,
  Play,
  Bookmark
} from "lucide-react";

export default function CreativeDashboardPage() {
  const [selectedTab, setSelectedTab] = useState("overview");

  const stats = {
    activeProjects: 8,
    portfolioViews: 1250,
    rating: 4.8,
    revenue: 8750,
    completionRate: 94,
    responseTime: "2 horas"
  };

  const recentProjects = [
    {
      id: "1",
      title: "Logo & Identidade Visual - Tech Startup",
      client: "InnovaTech",
      type: "Branding",
      status: "in-progress",
      deadline: "2024-01-20",
      progress: 75,
      value: 2500
    },
    {
      id: "2",
      title: "Campanha Social Media - E-commerce",
      client: "Fashion Store",
      type: "Design Digital",
      status: "review",
      deadline: "2024-01-18",
      progress: 100,
      value: 1800
    },
    {
      id: "3",
      title: "Website Design - Restaurante",
      client: "Bella Vista",
      type: "Web Design",
      status: "completed",
      deadline: "2024-01-15",
      progress: 100,
      value: 3200
    }
  ];

  const portfolioItems = [
    {
      id: "1",
      title: "Modern Logo Design",
      category: "Branding",
      views: 234,
      likes: 42,
      image: "/placeholder.svg"
    },
    {
      id: "2",
      title: "Social Media Campaign",
      category: "Digital",
      views: 189,
      likes: 38,
      image: "/placeholder.svg"
    },
    {
      id: "3",
      title: "Website Interface",
      category: "Web Design",
      views: 312,
      likes: 67,
      image: "/placeholder.svg"
    },
    {
      id: "4",
      title: "Mobile App Design",
      category: "UI/UX",
      views: 156,
      likes: 29,
      image: "/placeholder.svg"
    }
  ];

  const skills = [
    { name: "Adobe Photoshop", level: 95, category: "Design" },
    { name: "Adobe Illustrator", level: 92, category: "Design" },
    { name: "Figma", level: 88, category: "UI/UX" },
    { name: "Adobe After Effects", level: 85, category: "Motion" },
    { name: "Sketch", level: 80, category: "UI/UX" },
    { name: "Blender", level: 75, category: "3D" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Palette className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Dashboard Criativo</h1>
                <p className="text-sm text-muted-foreground">Ana Silva - Designer Gráfica</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notificações
              </Button>
              <Avatar>
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>AS</AvatarFallback>
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
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="skills">Habilidades</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
                  <p className="text-xs text-muted-foreground">+25% em relação ao mês passado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.portfolioViews.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+18% em relação ao mês passado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avaliação</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.rating}★</div>
                  <p className="text-xs text-muted-foreground">Baseado em 47 projetos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ {stats.revenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+30% em relação ao mês passado</p>
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
                  <Upload className="h-5 w-5" />
                  <span className="text-xs">Upload Arte</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Image className="h-5 w-5" />
                  <span className="text-xs">Portfolio</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Camera className="h-5 w-5" />
                  <span className="text-xs">Galeria</span>
                </Button>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Projects */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Projetos Recentes</CardTitle>
                    <CardDescription>Seus projetos criativos em andamento</CardDescription>
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
                          {project.type}
                        </Badge>
                        <span className="font-medium">R$ {project.value.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Portfolio Highlights */}
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio em Destaque</CardTitle>
                  <CardDescription>Seus trabalhos mais visualizados</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {portfolioItems.map((item) => (
                      <div key={item.id} className="relative group">
                        <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                          <Image className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="mt-2">
                          <p className="text-xs font-medium truncate">{item.title}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{item.category}</span>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                <span>{item.views}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                <span>{item.likes}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar ao Portfolio
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Habilidades Criativas
                </CardTitle>
                <CardDescription>Suas ferramentas e nível de proficiência</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {skills.map((skill) => (
                  <div key={skill.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{skill.name}</span>
                        <Badge variant="outline" className="text-xs">{skill.category}</Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">{skill.level}%</span>
                    </div>
                    <Progress value={skill.level} className="h-2" />
                  </div>
                ))}
                
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Nova Habilidade
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Meu Portfolio</CardTitle>
                  <CardDescription>Seus trabalhos organizados por categoria</CardDescription>
                </div>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {portfolioItems.map((item) => (
                    <div key={item.id} className="group cursor-pointer">
                      <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center mb-2 group-hover:shadow-md transition-shadow">
                        <Image className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <h4 className="font-medium text-sm truncate">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{item.views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          <span>{item.likes}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add New Item */}
                  <div className="aspect-square border-2 border-dashed border-muted-foreground/20 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-muted-foreground/40 transition-colors">
                    <Plus className="h-8 w-8 text-muted-foreground/40 mb-2" />
                    <span className="text-xs text-muted-foreground">Adicionar</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Criativa</CardTitle>
                  <CardDescription>Indicadores de desempenho dos seus projetos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Taxa de Aprovação</span>
                      <span>{stats.completionRate}%</span>
                    </div>
                    <Progress value={stats.completionRate} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Engajamento Portfolio</span>
                      <span>8.7/10</span>
                    </div>
                    <Progress value={87} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Tempo de Resposta</span>
                      <span>{stats.responseTime}</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Relatórios Criativos</CardTitle>
                  <CardDescription>Baixe relatórios dos seus projetos e portfolio</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Portfolio Completo
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Relatório de Projetos
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Análise de Engajamento
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Certificados e Awards
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