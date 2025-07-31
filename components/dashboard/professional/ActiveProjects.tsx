import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const projects = [
  {
    status: 'urgent',
    title: 'Logo Tech Startup',
    client: 'Maria CEO',
    deadline: 'Em 18 horas',
    progress: 90,
    lastMessage: 'Adorei as opções!',
  },
  {
    status: 'on-time',
    title: 'E-commerce Design',
    client: 'João Loja',
    deadline: '3 dias',
    progress: 60,
    milestone: 'Homepage aprovada ✅',
  },
  {
    status: 'calm',
    title: 'Manual de Marca',
    client: 'Ana Marketing',
    deadline: '1 semana',
    progress: 35,
    nextStep: 'Definir tipografia e paleta',
  },
];

const statusConfig = {
    urgent: { label: 'URGENTE', color: 'text-red-500', icon: '🔴' },
    'on-time': { label: 'EM PRAZO', color: 'text-yellow-500', icon: '🟡' },
    calm: { label: 'TRANQUILO', color: 'text-green-500', icon: '🟢' },
}

export function ActiveProjects() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>⚡ Projetos em Execução</CardTitle>
        <CardDescription>Gestão operacional dos seus projetos ativos</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {projects.map(project => (
            <div key={project.title} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h4 className={`font-bold ${statusConfig[project.status].color}`}>{statusConfig[project.status].icon} {statusConfig[project.status].label}</h4>
                        <p className="font-semibold">{project.title} <span className="font-normal text-muted-foreground">• Cliente: {project.client}</span></p>
                    </div>
                    <Badge variant="destructive">Entrega: {project.deadline}</Badge>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-sm">Progresso:</span>
                        <Progress value={project.progress} className="w-[60%]" />
                        <span className="text-sm font-medium">{project.progress}%</span>
                    </div>
                    {project.milestone && <p className="text-xs text-muted-foreground">📋 Milestone: {project.milestone}</p>}
                    {project.lastMessage && <p className="text-xs text-muted-foreground">💬 Última msg: "{project.lastMessage}"</p>}
                    {project.nextStep && <p className="text-xs text-muted-foreground">📋 Próximo: {project.nextStep}</p>}
                </div>
                <div className="flex gap-2 mt-4">
                    <Button size="sm">Enviar Entrega</Button>
                    <Button size="sm" variant="secondary">Atualizar Status</Button>
                    <Button size="sm" variant="outline">Chat</Button>
                </div>
            </div>
        ))}
      </CardContent>
    </Card>
  );
} 