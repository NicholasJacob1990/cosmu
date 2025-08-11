'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar,
  Clock,
  Users,
  DollarSign,
  FileText,
  Activity,
  AlertCircle,
  Phone,
  Mail,
  ChevronRight,
  Stethoscope,
  Star,
  TrendingUp,
  CheckCircle,
  UserPlus,
  Video,
  MessageSquare,
  Heart,
  CalendarDays,
  Pill,
  ClipboardList
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GalaxiaLogo } from "@/components/GalaxiaLogo";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

// Mock data for healthcare dashboard
const mockAppointments = [
  {
    id: 1,
    patientName: "Maria Silva",
    patientAvatar: "/placeholder.svg",
    time: "09:00",
    type: "Consulta Presencial",
    specialty: "Cardiologia",
    status: "confirmed",
    phone: "(11) 98765-4321"
  },
  {
    id: 2,
    patientName: "João Santos",
    patientAvatar: "/placeholder.svg",
    time: "10:30",
    type: "Teleconsulta",
    specialty: "Clínica Geral",
    status: "waiting",
    phone: "(11) 97654-3210"
  },
  {
    id: 3,
    patientName: "Ana Costa",
    patientAvatar: "/placeholder.svg",
    time: "14:00",
    type: "Retorno",
    specialty: "Pediatria",
    status: "confirmed",
    phone: "(11) 96543-2109"
  }
];

const mockPatientStats = {
  totalPatients: 1247,
  newThisMonth: 89,
  activePatients: 342,
  satisfactionRate: 4.8
};

const mockFinancialStats = {
  monthlyRevenue: 45780,
  pendingPayments: 12340,
  averageTicket: 250,
  growth: 12.5
};

const mockHealthMetrics = [
  { name: "Pressão Arterial", value: 75, status: "good" },
  { name: "Glicemia", value: 82, status: "good" },
  { name: "Colesterol", value: 65, status: "warning" },
  { name: "IMC", value: 71, status: "good" }
];

export function HealthcareDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState("today");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <div className="flex">
        <DashboardSidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          professionalType="health"
        />
        
        <main className={`flex-1 p-8 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Olá, Dr. Roberto! 👋
            </h1>
            <p className="text-muted-foreground">
              Você tem 6 consultas agendadas para hoje
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  Pacientes Totais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockPatientStats.totalPatients}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  +{mockPatientStats.newThisMonth} este mês
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  Receita Mensal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {mockFinancialStats.monthlyRevenue.toLocaleString('pt-BR')}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  {mockFinancialStats.growth}% vs mês anterior
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4 text-purple-600" />
                  Pacientes Ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockPatientStats.activePatients}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Últimos 30 dias
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border-yellow-200 dark:border-yellow-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-600" />
                  Satisfação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockPatientStats.satisfactionRate}/5.0</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Baseado em 342 avaliações
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="appointments" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
              <TabsTrigger value="appointments" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Agenda
              </TabsTrigger>
              <TabsTrigger value="patients" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Pacientes
              </TabsTrigger>
              <TabsTrigger value="health" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Saúde
              </TabsTrigger>
              <TabsTrigger value="records" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Prontuários
              </TabsTrigger>
            </TabsList>

            <TabsContent value="appointments" className="space-y-6">
              {/* Today's Appointments */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <CalendarDays className="h-5 w-5" />
                      Consultas de Hoje
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Ver Semana
                      </Button>
                      <Button size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                        Nova Consulta
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src={appointment.patientAvatar} />
                            <AvatarFallback>{appointment.patientName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{appointment.patientName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {appointment.time} - {appointment.type}
                            </p>
                            <Badge variant="outline" className="mt-1">
                              {appointment.specialty}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost">
                            <Phone className="h-4 w-4" />
                          </Button>
                          {appointment.type === "Teleconsulta" ? (
                            <Button size="sm" variant="ghost">
                              <Video className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button size="sm" variant="ghost">
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Stethoscope className="h-4 w-4" />
                      Iniciar Consulta
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      Comece uma nova consulta médica
                    </p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Pill className="h-4 w-4" />
                      Prescrever Medicamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      Crie uma nova prescrição médica
                    </p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <ClipboardList className="h-4 w-4" />
                      Solicitar Exames
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      Requisite exames laboratoriais
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="patients" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gestão de Pacientes</CardTitle>
                  <CardDescription>
                    Gerencie e acompanhe seus pacientes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <Input placeholder="Buscar paciente..." className="flex-1" />
                      <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Novo Paciente
                      </Button>
                    </div>
                    {/* Patient list would go here */}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="health" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Indicadores de Saúde</CardTitle>
                  <CardDescription>
                    Acompanhe métricas de saúde dos seus pacientes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {mockHealthMetrics.map((metric) => (
                      <div key={metric.name} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{metric.name}</span>
                          <span className="font-medium">{metric.value}%</span>
                        </div>
                        <Progress 
                          value={metric.value} 
                          className={`h-2 ${
                            metric.status === 'good' ? 'bg-green-100' : 'bg-yellow-100'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="records" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Prontuários Eletrônicos</CardTitle>
                  <CardDescription>
                    Acesse e gerencie prontuários médicos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Sistema de prontuários integrado
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}