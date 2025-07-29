import React from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
    LayoutDashboard, 
    CheckSquare, 
    FileUp, 
    MessageCircle, 
    DollarSign, 
    Calendar, 
    Award, 
    Clock,
    Flag,
    AlertTriangle,
    ShieldCheck
} from 'lucide-react';
import { MilestoneManager } from '@/components/workspace/MilestoneManager';
import { DeliveryManager } from '@/components/workspace/DeliveryManager';
import { ChatManager } from '@/components/workspace/ChatManager';

// Mock Data
const mockProject = {
    id: 'proj_123',
    title: 'Preciso de um logo para minha cafeteria',
    status: 'Em Andamento',
    progress: 40,
    budget: 1600,
    deadline: '2025-08-15',
    client: { name: 'Carlos Pereira', avatarUrl: 'https://i.pravatar.cc/80?u=client123' },
    professional: { name: 'João Silva', avatarUrl: 'https://i.pravatar.cc/80?u=prof1' },
    milestones: [
        { id: 1, text: 'Briefing e pesquisa de referências', completed: true },
        { id: 2, text: 'Criação dos 3 conceitos iniciais do logo', completed: true },
        { id: 3, text: 'Apresentação e rodada de feedback', completed: false },
        { id: 4, text: 'Revisão e ajustes finos no conceito escolhido', completed: false },
        { id: 5, text: 'Entrega final dos arquivos (AI, PNG, SVG)', completed: false },
    ]
};


export function ProjectWorkspace() {
    const { id } = useParams();
    // Fetch project data based on ID
    const project = mockProject;

    return (
        <div className="flex flex-col min-h-screen bg-muted/20">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8">
                {/* Cabeçalho do Projeto */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
                    <div className="flex items-center gap-4 mt-2">
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">{project.status}</Badge>
                        <div className="flex items-center gap-2 w-full max-w-sm">
                           <Progress value={project.progress} className="h-2" />
                           <span className="text-sm font-medium">{project.progress}%</span>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Conteúdo Principal com Abas */}
                    <div className="lg:col-span-8">
                        <Tabs defaultValue="tasks" className="w-full">
                            <TabsList className="grid w-full grid-cols-4 mb-4">
                                <TabsTrigger value="overview"><LayoutDashboard className="h-4 w-4 mr-2" />Visão Geral</TabsTrigger>
                                <TabsTrigger value="tasks"><CheckSquare className="h-4 w-4 mr-2" />Tarefas</TabsTrigger>
                                <TabsTrigger value="deliveries"><FileUp className="h-4 w-4 mr-2" />Entregas</TabsTrigger>
                                <TabsTrigger value="chat"><MessageCircle className="h-4 w-4 mr-2" />Chat</TabsTrigger>
                            </TabsList>
                            <TabsContent value="overview">
                                <Card><CardContent className="p-6">Visão geral do projeto aqui.</CardContent></Card>
                            </TabsContent>
                            <TabsContent value="tasks">
                                <MilestoneManager initialMilestones={project.milestones} />
                            </TabsContent>
                            <TabsContent value="deliveries">
                                <DeliveryManager />
                            </TabsContent>
                            <TabsContent value="chat">
                                <ChatManager />
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Sidebar de Informações */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card>
                            <CardHeader><CardTitle>Informações do Projeto</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold flex items-center gap-2"><DollarSign className="h-4 w-4" /> Orçamento</span>
                                    <span className="font-bold text-lg">R$ {project.budget.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold flex items-center gap-2"><Calendar className="h-4 w-4" /> Prazo Final</span>
                                    <Badge variant="outline">{new Date(project.deadline).toLocaleDateString('pt-BR')}</Badge>
                                </div>
                                <Separator />
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar><AvatarImage src={project.client.avatarUrl} /><AvatarFallback>C</AvatarFallback></Avatar>
                                        <div><p className="font-semibold">{project.client.name}</p><p className="text-xs text-muted-foreground">Cliente</p></div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Avatar><AvatarImage src={project.professional.avatarUrl} /><AvatarFallback>P</AvatarFallback></Avatar>
                                        <div><p className="font-semibold">{project.professional.name}</p><p className="text-xs text-muted-foreground">Profissional</p></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Ações Rápidas</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                <Button className="w-full" variant="outline"><Flag className="h-4 w-4 mr-2" />Adicionar Milestone</Button>
                                <Button className="w-full" variant="outline"><Clock className="h-4 w-4 mr-2" />Ajustar Prazo</Button>
                                <Button className="w-full" variant="destructive"><AlertTriangle className="h-4 w-4 mr-2" />Abrir Disputa</Button>
                            </CardContent>
                        </Card>
                         <Card className="bg-green-50 border-green-200">
                            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                                <ShieldCheck className="h-6 w-6 text-green-700" />
                                <CardTitle className="text-green-800">Pagamento Protegido</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-green-700">
                                O valor de R$ {project.budget.toLocaleString()} está seguro com o Escrow da GalaxIA. O profissional só receberá após a sua aprovação final do projeto.
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
} 