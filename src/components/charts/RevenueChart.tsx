"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp } from "lucide-react";
import { useState } from "react";

interface RevenueData {
  date: string;
  revenue: number;
  projects: number;
  avgTicket: number;
}

interface RevenueChartProps {
  data?: RevenueData[];
  timeRange?: '7d' | '30d' | '90d' | '1y';
  onTimeRangeChange?: (range: '7d' | '30d' | '90d' | '1y') => void;
}

// Mock data for demonstration
const generateMockData = (days: number): RevenueData[] => {
  const data: RevenueData[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      revenue: Math.floor(Math.random() * 3000) + 1500,
      projects: Math.floor(Math.random() * 5) + 1,
      avgTicket: Math.floor(Math.random() * 1000) + 500
    });
  }
  
  return data;
};

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-semibold mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">
              {entry.name}:
            </span>
            <span className="font-medium">
              {entry.name === 'Receita' 
                ? `R$ ${entry.value?.toLocaleString('pt-BR')}`
                : entry.value
              }
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function RevenueChart({ 
  data, 
  timeRange = '30d',
  onTimeRangeChange 
}: RevenueChartProps) {
  const [chartType, setChartType] = useState<'line' | 'area'>('area');
  
  const timeRanges = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '1y': 365
  };
  
  const chartData = data || generateMockData(timeRanges[timeRange]);
  
  // Calculate summary metrics
  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
  const avgDailyRevenue = totalRevenue / chartData.length;
  const growth = chartData.length > 1 
    ? ((chartData[chartData.length - 1].revenue - chartData[0].revenue) / chartData[0].revenue * 100).toFixed(1)
    : 0;
  
  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Receita ao Longo do Tempo</CardTitle>
          <CardDescription>
            Acompanhe sua receita e performance financeira
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border bg-background">
            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onTimeRangeChange?.(range)}
                className="rounded-none first:rounded-l-md last:rounded-r-md"
              >
                {range === '7d' && '7 dias'}
                {range === '30d' && '30 dias'}
                {range === '90d' && '90 dias'}
                {range === '1y' && '1 ano'}
              </Button>
            ))}
          </div>
          <div className="flex items-center rounded-lg border bg-background">
            <Button
              variant={chartType === 'area' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setChartType('area')}
              className="rounded-none rounded-l-md"
            >
              Área
            </Button>
            <Button
              variant={chartType === 'line' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setChartType('line')}
              className="rounded-none rounded-r-md"
            >
              Linha
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold">
                  R$ {totalRevenue.toLocaleString('pt-BR')}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Média Diária</p>
                <p className="text-2xl font-bold">
                  R$ {Math.round(avgDailyRevenue).toLocaleString('pt-BR')}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Crescimento</p>
                <p className={`text-2xl font-bold ${Number(growth) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {Number(growth) >= 0 ? '+' : ''}{growth}%
                </p>
              </div>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                Number(growth) >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>
                <TrendingUp className={`h-4 w-4 ${
                  Number(growth) >= 0 ? 'text-green-500' : 'text-red-500 rotate-180'
                }`} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Chart */}
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                  tickFormatter={(value) => `R$ ${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  name="Receita"
                  stroke="#8b5cf6" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  strokeWidth={2}
                />
              </AreaChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                  tickFormatter={(value) => `R$ ${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  name="Receita"
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}