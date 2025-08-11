"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { Info } from "lucide-react";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface PerformanceMetric {
  metric: string;
  value: number;
  benchmark: number;
  description: string;
}

interface PerformanceRadarProps {
  data?: PerformanceMetric[];
  title?: string;
  description?: string;
}

const defaultData: PerformanceMetric[] = [
  {
    metric: 'Taxa de Conversão',
    value: 85,
    benchmark: 70,
    description: 'Porcentagem de propostas aceitas'
  },
  {
    metric: 'Tempo de Resposta',
    value: 92,
    benchmark: 80,
    description: 'Velocidade média de resposta a mensagens'
  },
  {
    metric: 'Qualidade',
    value: 95,
    benchmark: 85,
    description: 'Avaliação média dos clientes'
  },
  {
    metric: 'Entrega no Prazo',
    value: 88,
    benchmark: 75,
    description: 'Projetos entregues dentro do prazo'
  },
  {
    metric: 'Comunicação',
    value: 90,
    benchmark: 80,
    description: 'Clareza e frequência de comunicação'
  },
  {
    metric: 'Satisfação',
    value: 93,
    benchmark: 82,
    description: 'Net Promoter Score (NPS)'
  }
];

export function PerformanceRadar({ 
  data = defaultData,
  title = "Análise de Performance",
  description = "Compare sua performance com a média do mercado"
}: PerformanceRadarProps) {
  
  // Calculate overall score
  const overallScore = Math.round(
    data.reduce((sum, item) => sum + item.value, 0) / data.length
  );
  
  const benchmarkScore = Math.round(
    data.reduce((sum, item) => sum + item.benchmark, 0) / data.length
  );
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <HoverCard>
            <HoverCardTrigger>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Como interpretar o gráfico</h4>
                <p className="text-xs text-muted-foreground">
                  Quanto mais próximo da borda externa, melhor é sua performance. 
                  A linha roxa mostra seus resultados, enquanto a linha cinza 
                  representa a média do mercado.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Score Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-galaxia-magenta/10 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Sua Performance</p>
              <p className="text-3xl font-bold text-galaxia-magenta">{overallScore}%</p>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Média do Mercado</p>
              <p className="text-3xl font-bold text-muted-foreground">{benchmarkScore}%</p>
            </div>
          </div>
          
          {/* Radar Chart */}
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data}>
                <PolarGrid 
                  gridType="polygon"
                  radialLines={true}
                  className="stroke-muted"
                />
                <PolarAngleAxis 
                  dataKey="metric" 
                  className="text-xs"
                  tick={{ fill: 'currentColor', fontSize: 11 }}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]}
                  className="text-xs"
                  tick={{ fill: 'currentColor', fontSize: 10 }}
                />
                <Radar
                  name="Sua Performance"
                  dataKey="value"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Radar
                  name="Média do Mercado"
                  dataKey="benchmark"
                  stroke="#6b7280"
                  fill="#6b7280"
                  fillOpacity={0.1}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as PerformanceMetric;
                      return (
                        <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
                          <p className="text-sm font-semibold mb-2">{data.metric}</p>
                          <p className="text-xs text-muted-foreground mb-2">{data.description}</p>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-3 h-3 rounded-full bg-galaxia-magenta" />
                              <span>Você: {data.value}%</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                              <span>Mercado: {data.benchmark}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Performance Breakdown */}
          <div className="space-y-2">
            {data.map((item) => {
              const diff = item.value - item.benchmark;
              const isAbove = diff > 0;
              
              return (
                <div key={item.metric} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.metric}</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${isAbove ? 'text-green-500' : 'text-orange-500'}`}>
                      {isAbove ? '+' : ''}{diff}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      vs mercado
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}