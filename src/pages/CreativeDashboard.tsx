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

export function CreativeDashboard() {
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
      likes: 45,
      image: "/placeholder.svg"
    },
    {
      id: "2",
      title: "Mobile App UI/UX",
      category: "App Design",
      views: 189,
      likes: 38,
      image: "/placeholder.svg"
    },
    {
      id: "3",
      title: "Brand Identity Package",
      category: "Branding",
      views: 412,
      likes: 72,
      image: "/placeholder.svg"
    }
  ];

  const tools = [
    { name: "Adobe Photoshop", level: "Expert", years: 8 },
    { name: "Adobe Illustrator", level: "Expert", years: 7 },
    { name: "Figma", level: "Advanced", years: 4 },
    { name: "Adobe After Effects", level: "Intermediate", years: 3 },
    { name: "Sketch", level: "Advanced", years: 5 }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <Palette className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Dashboard Criativo</h1>
                <p className="text-sm text-muted-foreground">Ana Design - Designer Gráfica</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notificações
              </Button>
              <Avatar>
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>AD</AvatarFallback>
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
            <TabsTrigger value="tools">Ferramentas</TabsTrigger>
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
                  <p className="text-xs text-muted-foreground">+3 novos esta semana</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Visualizações Portfolio</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.portfolioViews}</div>
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
                  <p className="text-xs text-muted-foreground">Baseado em 89 projetos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ {stats.revenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+25% em relação ao mês passado</p>
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
                  <span className="text-xs">Upload Portfolio</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <MessageSquare className="h-5 w-5" />
                  <span className="text-xs">Mensagens</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <TrendingUp className="h-5 w-5" />
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
                    <div key={project.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{project.title}</h4>
                          <p className="text-xs text-muted-foreground">Cliente: {project.client}</p>
                          <p className="text-xs text-muted-foreground">Deadline: {project.deadline}</p>
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

              {/* Portfolio Highlights */}
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio em Destaque</CardTitle>
                  <CardDescription>Seus trabalhos mais visualizados</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {portfolioItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg flex items-center justify-center">
                        <Image className="h-8 w-8 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.title}</h4>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{item.views}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{item.likes}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar ao Portfolio
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tools" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Ferramentas e Software
                </CardTitle>
                <CardDescription>Suas habilidades técnicas e experiência com ferramentas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {tools.map((tool, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg flex items-center justify-center">
                        <Palette className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{tool.name}</h3>
                        <p className="text-sm text-muted-foreground">{tool.years} anos de experiência</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={tool.level === 'Expert' ? 'default' : 
                                tool.level === 'Advanced' ? 'secondary' : 'outline'}
                      >
                        {tool.level}
                      </Badge>
                    </div>
                  </div>
                ))}

                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Nova Ferramenta
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Meu Portfolio</h2>
                <p className="text-muted-foreground">Mostre seus melhores trabalhos</p>
              </div>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Novo Trabalho
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolioItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                    <Image className="h-16 w-16 text-purple-600" />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{item.category}</span>
                      <div className="flex items-center gap-3">
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
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Criativa</CardTitle>
                  <CardDescription>Indicadores do seu trabalho criativo</CardDescription>
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
                      <span>Satisfação do Cliente</span>
                      <span>4.8/5.0</span>
                    </div>
                    <Progress value={96} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Tempo de Resposta</span>
                      <span>2 horas</span>
                    </div>
                    <Progress value={90} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Relatórios Criativos</CardTitle>
                  <CardDescription>Baixe relatórios do seu trabalho</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Portfolio Completo (PDF)
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Relatório de Projetos
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Análise de Performance
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Certificado de Trabalhos
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