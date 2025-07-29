import React from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Star, MessageSquare, Check, User, MapPin, Award, Zap } from 'lucide-react';
import { useNavigate } from "react-router-dom";

const levelBadgeClass = {
    'Top Rated': 'bg-green-100 text-green-800 border-green-200',
    'Rising Talent': 'bg-blue-100 text-blue-800 border-blue-200',
    'Elite Pro': 'bg-purple-100 text-purple-800 border-purple-200',
};

export function ProposalCard({ proposal }) {
    const navigate = useNavigate();

    const handleAcceptProposal = () => {
        // Lógica para aceitar a proposta (chamada de API)
        // Após sucesso, redirecionar para o workspace
        navigate('/workspace/project/proj_123'); // Usando ID mockado
    };

    return (
        <Card className={`transition-all duration-300 ${proposal.isFeatured ? 'border-2 border-galaxia-magenta shadow-lg' : ''}`}>
            {proposal.isFeatured && (
                <div className="bg-galaxia-magenta text-white text-xs font-bold uppercase tracking-wider text-center py-1">
                    <Zap className="h-4 w-4 inline mr-1" />
                    Proposta em Destaque
                </div>
            )}
            <div className="grid md:grid-cols-12 gap-6 p-6">
                {/* Perfil do Profissional */}
                <div className="md:col-span-3 text-center md:text-left md:border-r md:pr-6">
                    <Avatar className="h-20 w-20 mx-auto md:mx-0">
                        <AvatarImage src={proposal.professional.avatarUrl} />
                        <AvatarFallback>{proposal.professional.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold text-lg mt-3">{proposal.professional.name}</h3>
                    <p className="text-sm text-muted-foreground">{proposal.professional.title}</p>
                    <Badge variant="outline" className={`mt-2 ${levelBadgeClass[proposal.professional.level]}`}>{proposal.professional.level}</Badge>
                    
                    <Separator className="my-4" />

                    <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center justify-center md:justify-start gap-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="font-bold text-foreground">{proposal.professional.rating}</span>
                            <span>({proposal.professional.reviews} reviews)</span>
                        </div>
                        <div className="flex items-center justify-center md:justify-start gap-1">
                            <Award className="h-4 w-4" />
                            <span>98% de Sucesso</span>
                        </div>
                        <div className="flex items-center justify-center md:justify-start gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{proposal.professional.country}</span>
                        </div>
                    </div>

                    <Button variant="outline" className="w-full mt-4">
                        <User className="h-4 w-4 mr-2" />
                        Ver Perfil Completo
                    </Button>
                </div>

                {/* Detalhes da Proposta */}
                <div className="md:col-span-9">
                    <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
                        <div className="text-center md:text-left">
                            <p className="text-sm text-muted-foreground">Valor da Proposta</p>
                            <p className="text-3xl font-bold text-galaxia-magenta">R$ {proposal.value.toLocaleString()}</p>
                        </div>
                        <div className="text-center md:text-left mt-2 md:mt-0">
                            <p className="text-sm text-muted-foreground">Prazo de Entrega</p>
                            <p className="text-xl font-semibold">{proposal.deadline} dias</p>
                        </div>
                    </div>

                    <Separator />

                    <div className="mt-4 prose prose-sm dark:prose-invert max-w-none">
                        <p>{proposal.coverLetter}</p>
                    </div>

                    <div className="mt-6 flex flex-col md:flex-row gap-3">
                        <Button 
                            className="flex-1 bg-gradient-to-r from-galaxia-magenta to-galaxia-neon text-white"
                            onClick={handleAcceptProposal}
                        >
                            <Check className="h-4 w-4 mr-2" />
                            Aceitar Proposta e Contratar
                        </Button>
                        <Button variant="outline" className="flex-1">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Enviar Mensagem
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
} 