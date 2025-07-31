import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

const projects = [
  {
    id: 'proj_123', // Add ID for routing
    status: 'proposals',
    title: 'Landing Page Responsiva',
    freelancer: 'Aguardando seleção',
    update: 'Postado há 1 dia',
    proposalsCount: 3, 
    progress: 5,
  },
  {
    status: 'review',
    title: 'Logo Empresa XYZ',
    freelancer: 'João Silva',
    update: 'Há 2 horas',
    files: 3,
    progress: 100,
  },
  {
    status: 'development',
    title: 'Website Responsivo',
    freelancer: 'Maria Santos',
    update: 'Atualizado há 4h',
    deadline: 'Prazo em 2 dias',
    progress: 70,
  },
  {
    status: 'payment',
    title: 'Copywriting Blog',
    freelancer: 'Pedro Lima',
    update: 'Concluído ontem',
    rating: true,
    progress: 100,
  }
];

const statusConfig = {
    review: { label: 'Revisão Pendente', color: 'bg-orange-500', icon: '🔄' },
    development: { label: 'Em Desenvolvimento', color: 'bg-yellow-500', icon: '🟡' },
    payment: { label: 'Pagamento Pendente', color: 'bg-green-500', icon: '🟢' },
}

const ActionButton = ({ project }) => {
    switch (project.status) {
        case 'review':
            return (
                <div className="flex items-center gap-2">
                    <Button size="sm" className="flex-1 bg-orange-500 hover:bg-orange-600">Revisar Entrega</Button>
                    <Button size="sm" variant="outline" className="flex-1">Mensagem</Button>
                </div>
            );
        case 'development':
            return <Button size="sm" variant="outline" className="w-full">Ver Progresso</Button>;
        case 'payment':
            return <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">Liberar Pagamento</Button>;
        case 'proposals':
            return (
                <Link href={`/project/${project.id}/proposals`} className="w-full">
                    <Button size="sm" className="w-full bg-gradient-to-r from-galaxia-magenta to-galaxia-neon text-white">
                        Ver Propostas ({project.proposalsCount})
                    </Button>
                </Link>
            )
        default:
            return null;
    }
};

export function ProjectsCommandPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>⚡ Painel de Comando de Projetos</CardTitle>
        <CardDescription>Projetos que precisam da sua atenção</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {projects.map(project => (
            <div key={project.title} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg">
                <div className="flex items-center gap-4 flex-1">
                    <div className={`w-3 h-3 rounded-full ${statusConfig[project.status].color} animate-pulse`}></div>
                    <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/8.x/lorelei/svg?seed=${project.freelancer}`} />
                        <AvatarFallback>{project.freelancer.substring(0,2)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <p className="font-semibold">{project.title} <span className="font-normal text-muted-foreground">• {project.freelancer}</span></p>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <span>{statusConfig[project.status].icon} {statusConfig[project.status].label}</span>
                            {project.deadline && <Badge variant="destructive">{project.deadline}</Badge>}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 self-end sm:self-center">
                    <ActionButton project={project} />
                    <Button variant="outline">Chat</Button>
                </div>
            </div>
        ))}
        <Button variant="link" className="w-full">Ver todos os projetos (12 ativos)</Button>
      </CardContent>
    </Card>
  );
} 