import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Lightbulb, 
  TrendingUp, 
  Target, 
  BookOpen,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { aiService, Recommendation, AIInsight } from "@/lib/ai/aiService";
import { useDashboardStore } from "@/store/dashboardStore";
import { Skeleton } from "@/components/ui/skeleton";

const getRecommendationIcon = (type: Recommendation['type']) => {
  switch (type) {
    case 'price_optimization':
      return <DollarSign className="h-4 w-4" />;
    case 'project_match':
      return <Target className="h-4 w-4" />;
    case 'skill_development':
      return <BookOpen className="h-4 w-4" />;
    case 'market_trend':
      return <TrendingUp className="h-4 w-4" />;
    default:
      return <Lightbulb className="h-4 w-4" />;
  }
};

const getPriorityColor = (priority: Recommendation['priority']) => {
  switch (priority) {
    case 'high':
      return 'bg-red-500/10 text-red-500 border-red-200';
    case 'medium':
      return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
    case 'low':
      return 'bg-blue-500/10 text-blue-500 border-blue-200';
    default:
      return 'bg-gray-500/10 text-gray-500 border-gray-200';
  }
};

const getInsightTypeIcon = (type: AIInsight['type']) => {
  switch (type) {
    case 'warning':
      return <AlertCircle className="h-4 w-4 text-orange-500" />;
    case 'opportunity':
      return <Target className="h-4 w-4 text-blue-500" />;
    case 'trend':
      return <TrendingUp className="h-4 w-4 text-purple-500" />;
    case 'achievement':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    default:
      return <Lightbulb className="h-4 w-4" />;
  }
};

interface AIRecommendationsProps {
  maxItems?: number;
  showInsights?: boolean;
}

export function AIRecommendations({ 
  maxItems = 3, 
  showInsights = true 
}: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const user = useDashboardStore((state) => state.user);
  const metrics = useDashboardStore((state) => state.metrics);
  const projects = useDashboardStore((state) => state.projects);
  
  const fetchAIData = async () => {
    if (!user || !metrics) return;
    
    try {
      setLoading(true);
      
      const [recommendationsData, insightsData] = await Promise.all([
        aiService.generateRecommendations(user, metrics, projects),
        showInsights ? aiService.generateInsights(metrics, projects) : Promise.resolve([])
      ]);
      
      setRecommendations(recommendationsData.slice(0, maxItems));
      setInsights(insightsData);
    } catch (error) {
      console.error('Failed to fetch AI data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const refreshRecommendations = async () => {
    setRefreshing(true);
    await fetchAIData();
  };
  
  useEffect(() => {
    fetchAIData();
  }, [user, metrics, projects, maxItems, showInsights]);
  
  if (loading && recommendations.length === 0) {
    return <AIRecommendationsSkeleton />;
  }
  
  return (
    <div className="space-y-6">
      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-galaxia-magenta" />
              <div>
                <CardTitle>Recomendações IA</CardTitle>
                <CardDescription>
                  Insights personalizados baseados na sua performance
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshRecommendations}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendations.length > 0 ? (
            recommendations.map((rec) => (
              <div
                key={rec.id}
                className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-galaxia-magenta/10">
                      {getRecommendationIcon(rec.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {rec.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={getPriorityColor(rec.priority)}
                    >
                      {rec.priority}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {Math.round(rec.confidence * 100)}% confiança
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>📊 {rec.estimatedImpact}</span>
                    <span>🏷️ {rec.category}</span>
                  </div>
                  {rec.actionable && (
                    <Button size="sm" variant="ghost" className="text-xs">
                      Implementar
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma recomendação disponível no momento.</p>
              <p className="text-sm mt-1">Continue trabalhando para receber insights personalizados!</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* AI Insights */}
      {showInsights && insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Insights IA
            </CardTitle>
            <CardDescription>
              Análises automáticas da sua performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start gap-3">
                  {getInsightTypeIcon(insight.type)}
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {insight.description}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(insight.relevanceScore * 100)}% relevante
                  </Badge>
                </div>
                
                {insight.actionItems.length > 0 && (
                  <div className="ml-7">
                    <p className="text-xs font-medium mb-2">Ações sugeridas:</p>
                    <ul className="space-y-1">
                      {insight.actionItems.map((item, index) => (
                        <li key={index} className="text-xs text-muted-foreground flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-galaxia-magenta" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AIRecommendationsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <div>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48 mt-2" />
            </div>
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-64 mt-2" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}