import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Users, MessageSquare, Check, Award, BarChart, DollarSign } from 'lucide-react';
import { ProposalCard } from '@/components/proposals/ProposalCard';

// Mock Data
const mockProject = {
    id: 'proj_123',
    title: 'Preciso de um logo para minha cafeteria',
    proposalsCount: 3,
    avgBid: 1450,
};

const mockProposals = [
    {
        id: 'prop_1',
        professional: { name: 'João Silva', title: 'Designer Gráfico Sênior', avatarUrl: 'https://i.pravatar.cc/80?u=prof1', level: 'Elite Pro', rating: 4.9, reviews: 120, country: 'Brasil' },
        value: 1600,
        deadline: 5,
        coverLetter: "Olá Carlos, tenho vasta experiência em branding para o setor de alimentos e bebidas. Analisei suas referências e acredito que posso criar um logo memorável que capture a essência rústica e aconchegante da sua cafeteria. Anexei alguns exemplos de trabalhos similares no meu portfólio. Vamos conversar?",
        isFeatured: true,
    },
    {
        id: 'prop_2',
        professional: { name: 'Maria Santos', title: 'Especialista em Identidade Visual', avatarUrl: 'https://i.pravatar.cc/80?u=prof2', level: 'Top Rated', rating: 4.8, reviews: 85, country: 'Portugal' },
        value: 1400,
        deadline: 7,
        coverLetter: "Com grande interesse no seu projeto, apresento minha proposta. Sou especialista em criar identidades visuais que contam uma história. Meu processo foca em colaboração para garantir que o resultado final seja exatamente o que você imaginou. Adoraria discutir mais detalhes.",
        isFeatured: false,
    },
    {
        id: 'prop_3',
        professional: { name: 'Pedro Lima', title: 'Designer e Ilustrador', avatarUrl: 'https://i.pravatar.cc/80?u=prof3', level: 'Rising Talent', rating: 5.0, reviews: 12, country: 'Brasil' },
        value: 1350,
        deadline: 6,
        coverLetter: "Seu projeto de cafeteria me chamou a atenção! Sou um novo talento na plataforma com muita paixão por design minimalista e rústico. Ofereço um preço competitivo e dedicação total para entregar um trabalho excepcional e construir minha reputação. Seria uma honra trabalhar com você.",
        isFeatured: false,
    }
];

export function ManageProposals() {
    const { id } = useParams();
    // Fetch project and proposals data based on ID
    const project = mockProject;
    const proposals = mockProposals;

    return (
        <div className="flex flex-col min-h-screen bg-muted/20">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="mb-6">
                    <Link to="/client-dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
                        <ArrowLeft className="h-4 w-4" />
                        Voltar para o Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">Propostas para: "{project.title}"</h1>
                    <p className="text-muted-foreground mt-1">
                        Analise, compare e contrate o profissional perfeito para o seu projeto.
                    </p>
                </div>

                {/* Resumo */}
                <Card className="mb-6">
                    <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div className="p-2">
                            <Users className="h-6 w-6 mx-auto text-galaxia-magenta mb-1" />
                            <p className="text-2xl font-bold">{project.proposalsCount}</p>
                            <p className="text-sm text-muted-foreground">Propostas Recebidas</p>
                        </div>
                        <div className="p-2">
                            <DollarSign className="h-6 w-6 mx-auto text-galaxia-magenta mb-1" />
                            <p className="text-2xl font-bold">R$ {project.avgBid.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">Média de Valor</p>
                        </div>
                        <div className="p-2">
                            <Award className="h-6 w-6 mx-auto text-galaxia-magenta mb-1" />
                            <p className="text-2xl font-bold">4.9 ★</p>
                            <p className="text-sm text-muted-foreground">Média de Rating</p>
                        </div>
                    </CardContent>
                </Card>
                
                {/* Lista de Propostas */}
                <div className="space-y-6">
                    {proposals.map(proposal => (
                        <ProposalCard key={proposal.id} proposal={proposal} />
                    ))}
                </div>

            </main>
            <Footer />
        </div>
    );
} 