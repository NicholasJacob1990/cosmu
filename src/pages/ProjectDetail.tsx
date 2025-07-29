import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
    FileText, 
    DollarSign, 
    Clock, 
    Calendar, 
    Tag, 
    User, 
    MapPin, 
    CheckCircle, 
    MessageSquare,
    Send
} from 'lucide-react';
import { SubmitProposalSheet } from '@/components/proposals/SubmitProposalSheet';

// Mock data para um projeto específico
const mockProject = {
    id: 'proj_123',
    title: 'Preciso de um logo para minha cafeteria',
    description: 'Estou abrindo uma nova cafeteria com um tema rústico e aconchegante e preciso de um logo que capture essa essência. O logo deve ser versátil para ser usado em copos, uniformes, fachada e redes sociais. Gostaria de ver algumas opções de paleta de cores, preferencialmente tons terrosos. O público-alvo são jovens adultos e famílias. Anexei algumas referências de estilo que gosto.',
    category: 'Design Gráfico',
    subcategory: 'Logo e Identidade Visual',
    skills: ['Branding', 'Adobe Illustrator', 'Design de Logo', 'Identidade Visual'],
    budget: { type: 'fixed', amount: 1500, currency: 'BRL' },
    deadline: '2025-08-15',
    urgency: 'medium',
    postedAt: '2025-07-20',
    client: {
        name: 'Carlos Pereira',
        avatarUrl: 'https://i.pravatar.cc/80?u=client123',
        location: 'São Paulo, Brasil',
        rating: 4.9,
        reviews: 23,
        paymentVerified: true,
    },
    proposalsCount: 5
};


export function ProjectDetail() {
    const { id } = useParams();
    const [isProposalSheetOpen, setIsProposalSheetOpen] = useState(false);
    // No futuro, aqui seria uma chamada de API: useQuery(['project', id], () => fetchProject(id))
    const project = mockProject;

    return (
        <>
            <div className="flex flex-col min-h-screen bg-muted/20">
                <Header />

                <main className="flex-1 container mx-auto px-4 py-8">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Coluna Principal */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <Badge variant="secondary" className="w-fit mb-2">{project.category} &gt; {project.subcategory}</Badge>
                                    <CardTitle className="text-3xl">{project.title}</CardTitle>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                                        <div className="flex items-center gap-1"><Clock className="h-4 w-4" /> Postado há 5 dias</div>
                                        <div className="flex items-center gap-1"><Send className="h-4 w-4" /> {project.proposalsCount} propostas</div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="prose dark:prose-invert max-w-none">
                                        <p>{project.description}</p>
                                    </div>

                                    <div className="mt-6">
                                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                                            <Tag className="h-4 w-4" />
                                            Skills e Expertise
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {project.skills.map(skill => (
                                                <Badge key={skill} variant="outline">{skill}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Coluna Lateral */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Enviar Proposta</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between text-lg">
                                        <span className="font-semibold flex items-center gap-2"><DollarSign className="h-5 w-5" /> Orçamento:</span>
                                        <span className="font-bold text-galaxia-magenta">R$ {project.budget.amount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-semibold flex items-center gap-2"><Calendar className="h-4 w-4" /> Prazo:</span>
                                        <span className="font-medium">{new Date(project.deadline).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                    <Button 
                                        className="w-full bg-gradient-to-r from-galaxia-magenta to-galaxia-neon text-white text-lg py-6"
                                        onClick={() => setIsProposalSheetOpen(true)}
                                    >
                                        <Send className="h-5 w-5 mr-2" />
                                        Enviar Minha Proposta
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Sobre o Cliente</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-14 w-14">
                                            <AvatarImage src={project.client.avatarUrl} />
                                            <AvatarFallback>{project.client.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h4 className="font-semibold">{project.client.name}</h4>
                                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                <MapPin className="h-3 w-3" /> {project.client.location}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex justify-around text-center text-sm">
                                        <div>
                                            <p className="font-bold">{project.client.rating} ★</p>
                                            <p className="text-muted-foreground">({project.client.reviews} reviews)</p>
                                        </div>
                                        <div>
                                            <p className="font-bold">95%</p>
                                            <p className="text-muted-foreground">Projetos Concluídos</p>
                                        </div>
                                    </div>
                                    {project.client.paymentVerified && (
                                        <Badge variant="secondary" className="w-fit bg-green-100 text-green-800 border-green-200">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Pagamento Verificado
                                        </Badge>
                                    )}
                                    <Button variant="outline" className="w-full">
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        Enviar Mensagem
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>

            <SubmitProposalSheet 
                open={isProposalSheetOpen}
                onOpenChange={setIsProposalSheetOpen}
                projectBudget={project.budget.amount}
            />
        </>
    );
}