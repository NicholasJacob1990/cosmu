'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Heart,
  Calendar,
  Users,
  FileText,
  TrendingUp,
  Star,
  Clock,
  DollarSign,
  Activity,
  UserCheck,
  Shield,
  Bell,
  MessageSquare,
  Video,
  Plus,
  Filter,
  Download
} from "lucide-react";

export default function HealthcareDashboardPage() {
  const [selectedTab, setSelectedTab] = useState("overview");

  const stats = {
    activePatients: 45,
    consultationsThisMonth: 128,
    rating: 4.9,
    revenue: 12450,
    completionRate: 96,
    responseTime: "15 min"
  };

  const recentConsultations = [
    {
      id: "1",
      patient: "Maria Silva",
      type: "Teleconsulta",
      date: "2024-01-15",
      time: "14:30",
      status: "completed",
      specialty: "Cardiologia"
    },
    {
      id: "2", 
      patient: "João Santos",
      type: "Presencial",
      date: "2024-01-15",
      time: "16:00",
      status: "scheduled",
      specialty: "Cardiologia"
    },
    {
      id: "3",
      patient: "Ana Costa",
      type: "Teleconsulta",
      date: "2024-01-16",
      time: "09:00",
      status: "pending",
      specialty: "Cardiologia"
    }
  ];

  const upcomingAppointments = [
    {
      id: "1",
      patient: "Carlos Lima",
      time: "10:00",
      type: "Primeira consulta",
      duration: "60 min"
    },
    {
      id: "2",
      patient: "Lucia Ferreira", 
      time: "11:30",
      type: "Retorno",
      duration: "30 min"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Dashboard Médico</h1>
                <p className="text-sm text-muted-foreground">Dr. João Silva - CRM 12345</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notificações
              </Button>
              <Avatar>
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>JS</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="appointments">Consultas</TabsTrigger>
            <TabsTrigger value="patients">Pacientes</TabsTrigger>
            <TabsTrigger value="credentials">Credenciais</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pacientes Ativos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activePatients}</div>
                  <p className="text-xs text-muted-foreground">+12% em relação ao mês passado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Consultas do Mês</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.consultationsThisMonth}</div>
                  <p className="text-xs text-muted-foreground">+8% em relação ao mês passado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avaliação</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.rating}★</div>
                  <p className="text-xs text-muted-foreground">Baseado em 247 avaliações</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ {stats.revenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+15% em relação ao mês passado</p>
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
                  <span className="text-xs">Nova Consulta</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Calendar className="h-5 w-5" />
                  <span className="text-xs">Agenda</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <FileText className="h-5 w-5" />
                  <span className="text-xs">Prescrições</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Activity className="h-5 w-5" />
                  <span className="text-xs">Relatórios</span>
                </Button>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Consultations */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Consultas Recentes</CardTitle>
                    <CardDescription>Suas últimas consultas realizadas</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrar
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentConsultations.map((consultation) => (
                    <div key={consultation.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{consultation.patient.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{consultation.patient}</p>
                          <p className="text-xs text-muted-foreground">{consultation.specialty}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{consultation.time}</p>
                        <Badge 
                          variant={consultation.status === 'completed' ? 'default' : 
                                   consultation.status === 'scheduled' ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {consultation.status === 'completed' ? 'Concluída' :
                           consultation.status === 'scheduled' ? 'Agendada' : 'Pendente'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Today's Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle>Agenda de Hoje</CardTitle>
                  <CardDescription>Seus próximos compromissos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="font-medium text-sm">{appointment.patient}</p>
                          <p className="text-xs text-muted-foreground">{appointment.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{appointment.time}</p>
                        <p className="text-xs text-muted-foreground">{appointment.duration}</p>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Horário
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="credentials" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Credenciais Profissionais
                </CardTitle>
                <CardDescription>Mantenha suas credenciais atualizadas para garantir confiança dos pacientes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* CRM Registration */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <UserCheck className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">CRM - Conselho Regional de Medicina</h3>
                      <p className="text-sm text-muted-foreground">CRM/SP 123456 - Ativo</p>
                      <p className="text-xs text-muted-foreground">Válido até: 31/12/2024</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Verificado</Badge>
                </div>

                {/* Specialties */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Heart className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Especialização em Cardiologia</h3>
                      <p className="text-sm text-muted-foreground">Certificado pelo CFM</p>
                      <p className="text-xs text-muted-foreground">Obtido em: 15/03/2018</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">Ativo</Badge>
                </div>

                {/* Medical Education */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Diploma de Medicina</h3>
                      <p className="text-sm text-muted-foreground">Universidade de São Paulo - USP</p>
                      <p className="text-xs text-muted-foreground">Graduação: 2012</p>
                    </div>
                  </div>
                  <Badge className="bg-purple-100 text-purple-700">Válido</Badge>
                </div>

                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Nova Credencial
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance do Mês</CardTitle>
                  <CardDescription>Indicadores de desempenho profissional</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Taxa de Conclusão</span>
                      <span>{stats.completionRate}%</span>
                    </div>
                    <Progress value={stats.completionRate} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Satisfação do Paciente</span>
                      <span>4.9/5.0</span>
                    </div>
                    <Progress value={98} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Tempo de Resposta</span>
                      <span>15 min</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Relatórios</CardTitle>
                  <CardDescription>Baixe relatórios detalhados da sua prática</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Relatório Mensal de Consultas
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Análise de Satisfação dos Pacientes
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Relatório Financeiro
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Comprovante de Atividades (CFM)
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