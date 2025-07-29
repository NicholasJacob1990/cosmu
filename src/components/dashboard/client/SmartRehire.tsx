import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const recommendedFreelancers = [
  {
    name: 'João Silva',
    title: 'Designer Gráfico',
    specialty: 'Logos e Identidade Visual',
    projects: 5,
    lastProject: 'há 2 meses',
    rating: 5,
  },
  {
    name: 'Maria Santos',
    title: 'Desenvolvedora',
    specialty: 'WordPress e E-commerce',
    projects: 3,
    lastProject: 'há 1 mês',
    rating: 5,
  },
];

export function SmartRehire() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>🔄 Recontratação Inteligente</CardTitle>
        <CardDescription>Prestadores recomendados para você</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendedFreelancers.map(freelancer => (
            <div key={freelancer.name} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={`https://api.dicebear.com/8.x/lorelei/svg?seed=${freelancer.name}`} />
                    <AvatarFallback>{freelancer.name.substring(0,2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <p className="font-semibold">{freelancer.name}</p>
                        <div className="flex text-yellow-500">
                            {[...Array(freelancer.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{freelancer.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        {freelancer.projects} projetos concluídos • Último: {freelancer.lastProject}
                    </p>
                </div>
                <div className="flex gap-2 self-end sm:self-center">
                    <Button>Contratar Novamente</Button>
                    <Button variant="outline">Ver Portfólio</Button>
                </div>
            </div>
        ))}
        <Button variant="link" className="w-full">Ver mais recomendações</Button>
      </CardContent>
    </Card>
  );
} 