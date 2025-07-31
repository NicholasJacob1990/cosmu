'use client';

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

export default function TechDashboardPage() {
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
      commits: 234,
      lastCommit: "3 dias atrás"
    }
  ];

  const skills = [
    { name: "React/Next.js", level: 95, category: "Frontend" },
    { name: "Node.js/Express", level: 90, category: "Backend" },
    { name: "Python/Django", level: 88, category: "Backend" },
    { name: "MongoDB/PostgreSQL", level: 85, category: "Database" },
    { name: "AWS/Docker", level: 82, category: "DevOps" },
    { name: "React Native", level: 78, category: "Mobile" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Code className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Dashboard Desenvolvedor</h1>
                <p className="text-sm text-muted-foreground">Alex Santos - Full Stack Developer</p>
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
            <TabsTrigger value="repositories">Repositórios</TabsTrigger>
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
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeProjects}</div>
                  <p className="text-xs text-muted-foreground">+20% em relação ao mês passado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Commits do Mês</CardTitle>
                  <GitBranch className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.codeCommits}</div>
                  <p className="text-xs text-muted-foreground">+15% em relação ao mês passado</p>
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
                  <GitBranch className="h-5 w-5" />
                  <span className="text-xs">Git Repos</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <FileText className="h-5 w-5" />
                  <span className="text-xs">Documentação</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Server className="h-5 w-5" />
                  <span className="text-xs">Deploy</span>
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
                        <div className="flex gap-1">
                          {project.tech.slice(0, 2).map((tech) => (
                            <Badge key={tech} variant="outline" className="text-xs px-2 py-0">
                              {tech}
                            </Badge>
                          ))}
                          {project.tech.length > 2 && (
                            <Badge variant="outline" className="text-xs px-2 py-0">
                              +{project.tech.length - 2}
                            </Badge>
                          )}
                        </div>
                        <span className="font-medium">R$ {project.value.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Top Repositories */}
              <Card>
                <CardHeader>
                  <CardTitle>Repositórios em Destaque</CardTitle>
                  <CardDescription>Seus repositórios mais ativos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {repositories.map((repo) => (
                    <div key={repo.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <GitBranch className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{repo.name}</p>
                          <p className="text-xs text-muted-foreground">{repo.language}</p>
                        </div>
                      </div>
                      <div className="text-right text-xs">
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="h-3 w-3" />
                          <span>{repo.stars}</span>
                          <GitBranch className="h-3 w-3" />
                          <span>{repo.commits}</span>
                        </div>
                        <p className="text-muted-foreground">{repo.lastCommit}</p>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Repositório
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Stack Tecnológico
                </CardTitle>
                <CardDescription>Suas habilidades e nível de proficiência</CardDescription>
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

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance do Mês</CardTitle>
                  <CardDescription>Indicadores de desempenho técnico</CardDescription>
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
                    <Progress value={90} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Relatórios Técnicos</CardTitle>
                  <CardDescription>Baixe relatórios detalhados do seu desenvolvimento</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Relatório de Commits
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Análise de Código
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Performance de Projetos
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Relatório de Horas
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