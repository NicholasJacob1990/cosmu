import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Code,
  Server,
  Users,
  FileText,
  TrendingUp,
  Star,
  Clock,
  DollarSign,
  GitBranch,
  Database,
  Shield,
  Bell,
  MessageSquare,
  Video,
  Plus,
  Filter,
  Download,
  Monitor,
  Cpu,
  Globe,
  Zap
} from "lucide-react";

export function TechDashboard() {
  const [selectedTab, setSelectedTab] = useState("overview");

  const stats = {
    activeProjects: 12,
    codeCommits: 342,
    rating: 4.9,
    revenue: 15800,
    completionRate: 98,
    responseTime: "30 min"
  };

  const recentProjects = [
    {
      id: "1",
      title: "E-commerce Platform - React/Node.js",
      client: "TechStore Inc",
      type: "Full Stack",
      status: "in-progress",
      deadline: "2024-02-01",
      progress: 85,
      value: 8500,
      tech: ["React", "Node.js", "MongoDB"]
    },
    {
      id: "2",
      title: "Mobile App - React Native",
      client: "StartupXYZ",
      type: "Mobile Dev",
      status: "review",
      deadline: "2024-01-25",
      progress: 100,
      value: 4200,
      tech: ["React Native", "Firebase"]
    },
    {
      id: "3",
      title: "API REST - Python/Django",
      client: "DataCorp",
      type: "Backend",
      status: "completed",
      deadline: "2024-01-20",
      progress: 100,
      value: 3500,
      tech: ["Python", "Django", "PostgreSQL"]
    }
  ];

  const repositories = [
    {
      id: "1",
      name: "ecommerce-frontend",
      language: "TypeScript",
      stars: 28,
      commits: 156,
      lastCommit: "2 horas atrás"
    },
    {
      id: "2",
      name: "mobile-app-client",
      language: "JavaScript",
      stars: 15,
      commits: 89,
      lastCommit: "1 dia atrás"
    },
    {
      id: "3",
      name: "api-service",
      language: "Python",
      stars: 42,
      commits: 97,
      lastCommit: "3 dias atrás"
    }
  ];

  const technologies = [
    { name: "React", level: "Expert", years: 5, projects: 45 },
    { name: "Node.js", level: "Expert", years: 4, projects: 38 },
    { name: "Python", level: "Advanced", years: 6, projects: 32 },
    { name: "TypeScript", level: "Expert", years: 3, projects: 28 },
    { name: "MongoDB", level: "Advanced", years: 3, projects: 22 },
    { name: "AWS", level: "Intermediate", years: 2, projects: 15 }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <Code className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Dashboard Tech</h1>
                <p className="text-sm text-muted-foreground">Pedro Dev - Full Stack Developer</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notificações
              </Button>
              <Avatar>
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>PD</AvatarFallback>
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
            <TabsTrigger value="repositories">Repositórios</TabsTrigger>
            <TabsTrigger value="technologies">Tecnologias</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeProjects}</div>
                  <p className="text-xs text-muted-foreground">+4 novos esta semana</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Commits no Mês</CardTitle>
                  <GitBranch className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.codeCommits}</div>
                  <p className="text-xs text-muted-foreground">+28% em relação ao mês passado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avaliação</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.rating}★</div>
                  <p className="text-xs text-muted-foreground">Baseado em 167 projetos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ {stats.revenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+32% em relação ao mês passado</p>
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
                  <GitBranch className="h-5 w-5" />
                  <span className="text-xs">Git Repository</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <MessageSquare className="h-5 w-5" />
                  <span className="text-xs">Mensagens</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <TrendingUp className="h-5 w-5" />
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
                    <CardDescription>Seus projetos em desenvolvimento</CardDescription>
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
                          <div className="flex gap-1 mt-1">
                            {project.tech.map((tech, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Badge 
                          variant={project.status === 'completed' ? 'default' : 
                                   project.status === 'in-progress' ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {project.status === 'completed' ? 'Concluído' :
                           project.status === 'in-progress' ? 'Em Desenvolvimento' : 'Revisão'}
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

              {/* Recent Repositories */}
              <Card>
                <CardHeader>
                  <CardTitle>Repositórios Ativos</CardTitle>
                  <CardDescription>Seus repositórios mais ativos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {repositories.map((repo) => (
                    <div key={repo.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                        <GitBranch className="h-8 w-8 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{repo.name}</h4>
                        <p className="text-xs text-muted-foreground">{repo.language}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{repo.stars}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <GitBranch className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{repo.commits}</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{repo.lastCommit}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Globe className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Conectar Repositório
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="technologies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  Stack Tecnológico
                </CardTitle>
                <CardDescription>Suas habilidades técnicas e experiência com tecnologias</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {technologies.map((tech, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                        <Code className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{tech.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {tech.years} anos • {tech.projects} projetos
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={tech.level === 'Expert' ? 'default' : 
                                tech.level === 'Advanced' ? 'secondary' : 'outline'}
                      >
                        {tech.level}
                      </Badge>
                    </div>
                  </div>
                ))}

                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Nova Tecnologia
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="repositories" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Meus Repositórios</h2>
                <p className="text-muted-foreground">Gerencie seus projetos e código fonte</p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Conectar Repositório
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {repositories.map((repo) => (
                <Card key={repo.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{repo.name}</CardTitle>
                      <Badge variant="outline">{repo.language}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>{repo.stars} stars</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4 text-muted-foreground" />
                        <span>{repo.commits} commits</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Última atualização: {repo.lastCommit}
                    </div>
                    <Button variant="outline" className="w-full">
                      <Globe className="h-4 w-4 mr-2" />
                      Ver Repositório
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Técnica</CardTitle>
                  <CardDescription>Indicadores do seu trabalho técnico</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Taxa de Entrega</span>
                      <span>{stats.completionRate}%</span>
                    </div>
                    <Progress value={stats.completionRate} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Qualidade do Código</span>
                      <span>9.2/10</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Tempo de Resposta</span>
                      <span>30 min</span>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Relatórios Técnicos</CardTitle>
                  <CardDescription>Baixe relatórios do seu desenvolvimento</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Relatório de Commits
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Análise de Performance
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Portfolio de Projetos
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Certificados Técnicos
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