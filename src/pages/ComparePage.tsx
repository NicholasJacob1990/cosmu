import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Star, DollarSign, Clock, Users, ShieldCheck } from 'lucide-react';

// Mock Data (usado para encontrar os serviços selecionados)
const mockServices = Array.from({ length: 24 }, (_, i) => ({
    id: `service_${i + 1}`,
    title: `Logo Incrível para Startup de Tecnologia ${i + 1}`,
    category: i % 3 === 0 ? "Design Gráfico" : i % 3 === 1 ? "Desenvolvimento" : "Marketing",
    professional: {
      name: `Ana Creative ${i + 1}`,
      level: i % 4 === 0 ? "Top Rated" : i % 4 === 1 ? "Rising Talent" : "Elite Pro",
      avatarUrl: `https://i.pravatar.cc/40?u=prof${i}`,
      memberSince: `202${i % 4}`,
      country: 'Brasil'
    },
    rating: (Math.random() * (5 - 4.5) + 4.5).toFixed(1),
    reviews: Math.floor(Math.random() * 200) + 10,
    price: Math.floor(Math.random() * 500) + 50,
    imageUrl: `https://picsum.photos/400/300?random=${i}`,
    deliveryTime: `${Math.floor(Math.random() * 7) + 1} dias`,
    revisions: Math.floor(Math.random() * 3) + 1,
    features: [
        'Design Vetorial', 'Alta Resolução', 'Manual da Marca', 'Revisões Incluídas'
    ].slice(0, Math.floor(Math.random() * 4) + 1)
}));

const levelBadgeClass = {
    'Top Rated': 'bg-green-100 text-green-800 border-green-200',
    'Rising Talent': 'bg-blue-100 text-blue-800 border-blue-200',
    'Elite Pro': 'bg-purple-100 text-purple-800 border-purple-200',
};

const ComparisonRow = ({ label, values, highlight = false, icon }) => (
    <div className={`flex items-start p-4 ${highlight ? 'bg-muted/50' : ''}`}>
        <div className="w-1/4 font-semibold text-sm flex items-center gap-2">
            {icon}
            {label}
        </div>
        {values.map((value, index) => (
            <div key={index} className="w-1/4 text-sm px-2">
                {value}
            </div>
        ))}
    </div>
);

export function ComparePage() {
    const [searchParams] = useSearchParams();
    const serviceIds = searchParams.get('ids')?.split(',') || [];
    const selectedServices = mockServices.filter(s => serviceIds.includes(s.id));

    return (
        <div className="flex flex-col min-h-screen bg-muted/20">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight">Comparando Serviços</h1>
                    <p className="text-muted-foreground mt-1">
                        Analise os detalhes lado a lado para fazer a melhor escolha.
                    </p>
                </div>

                <Card>
                    <CardContent className="p-0">
                        {/* Header da Tabela */}
                        <div className="flex items-start p-4 border-b">
                            <div className="w-1/4 font-semibold">Serviço</div>
                            {selectedServices.map(service => (
                                <div key={service.id} className="w-1/4 px-2">
                                    <img src={service.imageUrl} alt={service.title} className="w-full h-32 object-cover rounded-lg mb-2" />
                                    <h3 className="font-bold text-base">{service.title}</h3>
                                    <p className="text-sm text-muted-foreground">{service.professional.name}</p>
                                </div>
                            ))}
                        </div>
                        
                        {/* Tabela de Comparação */}
                        <div className="divide-y">
                            <ComparisonRow 
                                label="Preço"
                                icon={<DollarSign className="h-4 w-4" />}
                                values={selectedServices.map(s => <span className="text-xl font-bold text-galaxia-magenta">R$ {s.price}</span>)}
                                highlight
                            />
                            <ComparisonRow 
                                label="Avaliação"
                                icon={<Star className="h-4 w-4" />}
                                values={selectedServices.map(s => (
                                    <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                        <span className="font-bold">{s.rating}</span>
                                        <span className="text-muted-foreground">({s.reviews} reviews)</span>
                                    </div>
                                ))}
                            />
                            <ComparisonRow 
                                label="Prazo de Entrega"
                                icon={<Clock className="h-4 w-4" />}
                                values={selectedServices.map(s => s.deliveryTime)}
                                highlight
                            />
                             <ComparisonRow 
                                label="Nível do Profissional"
                                icon={<Users className="h-4 w-4" />}
                                values={selectedServices.map(s => <Badge variant="outline" className={levelBadgeClass[s.professional.level]}>{s.professional.level}</Badge>)}
                            />
                            <ComparisonRow 
                                label="O que está incluído"
                                icon={<CheckCircle className="h-4 w-4" />}
                                values={selectedServices.map(s => (
                                    <ul className="space-y-1">
                                        {s.features.map(f => <li key={f} className="text-xs">{f}</li>)}
                                    </ul>
                                ))}
                                highlight
                            />
                            <ComparisonRow
                                label="Garantia"
                                icon={<ShieldCheck className="h-4 w-4" />}
                                values={selectedServices.map(s => <span className="text-green-600 font-medium">Escrow GalaxIA</span>)}
                            />
                        </div>

                        {/* Ações */}
                        <div className="flex items-start p-4 border-t">
                            <div className="w-1/4"></div>
                            {selectedServices.map(service => (
                                <div key={service.id} className="w-1/4 px-2">
                                    <Button className="w-full bg-gradient-to-r from-galaxia-magenta to-galaxia-neon text-white">
                                        Contratar
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </main>

            <Footer />
        </div>
    );
} 