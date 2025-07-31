import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, PlusCircle } from 'lucide-react';

export function MilestoneManager({ initialMilestones }) {
    const [milestones, setMilestones] = useState(initialMilestones);

    const handleToggle = (id) => {
        setMilestones(milestones.map(m => 
            m.id === id ? { ...m, completed: !m.completed } : m
        ));
    };

    const completedCount = milestones.filter(m => m.completed).length;
    const progress = (completedCount / milestones.length) * 100;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Tarefas e Marcos do Projeto</CardTitle>
                <CardDescription>Acompanhe o progresso de cada etapa definida para a conclusão do projeto.</CardDescription>
                <div className="flex items-center gap-4 pt-4">
                    <Progress value={progress} className="h-2" />
                    <span className="text-sm font-bold text-muted-foreground whitespace-nowrap">
                        {completedCount} / {milestones.length} concluídas
                    </span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {milestones.map((milestone) => (
                        <div 
                            key={milestone.id} 
                            onClick={() => handleToggle(milestone.id)}
                            className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                                milestone.completed 
                                ? 'bg-green-50 border-l-4 border-green-500' 
                                : 'bg-muted/40 hover:bg-muted/80'
                            }`}
                        >
                            {milestone.completed ? 
                                <CheckCircle className="h-5 w-5 mr-3 text-green-600" /> :
                                <Circle className="h-5 w-5 mr-3 text-muted-foreground" />
                            }
                            <span className={`flex-1 ${milestone.completed ? 'line-through text-muted-foreground' : ''}`}>
                                {milestone.text}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="mt-6 border-t pt-4">
                    <Button variant="ghost" className="w-full text-muted-foreground">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Adicionar nova tarefa ou milestone
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
} 