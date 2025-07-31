import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Crown, Zap } from "lucide-react";

interface PlanFeature {
  name: string;
  included: boolean;
  limit?: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  period: "mês" | "ano";
  commission: number;
  badge?: string;
  badgeColor?: string;
  icon?: React.ComponentType<any>;
  popular?: boolean;
  features: PlanFeature[];
}

interface PlanCardProps {
  plan: Plan;
  currentPlan?: string;
  onSelect: (planId: string) => void;
  loading?: boolean;
  discount?: number;
}

const PLAN_ICONS = {
  free: Star,
  professional: Zap,
  business: Crown,
  elite: Crown
};

const PLAN_COLORS = {
  free: "text-gray-500",
  professional: "text-blue-500", 
  business: "text-purple-500",
  elite: "text-yellow-500"
};

export function PlanCard({ plan, currentPlan, onSelect, loading }: PlanCardProps) {
  const isCurrentPlan = currentPlan === plan.id;
  const PlanIcon = plan.icon || PLAN_ICONS[plan.id as keyof typeof PLAN_ICONS] || Star;
  const iconColor = PLAN_COLORS[plan.id as keyof typeof PLAN_COLORS] || "text-gray-500";
  
  return (
    <Card className={`relative transition-all duration-300 ${
      plan.popular 
        ? "border-galaxia-neon shadow-lg scale-105" 
        : "border-border hover:border-galaxia-neon/50"
    } ${isCurrentPlan ? "ring-2 ring-galaxia-neon" : ""}`}>
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-gradient-to-r from-galaxia-magenta to-galaxia-neon text-white px-3 py-1">
            Mais Popular
          </Badge>
        </div>
      )}
      
      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            Plano Atual
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <PlanIcon className={`h-6 w-6 ${iconColor}`} />
          <CardTitle className="text-xl">{plan.name}</CardTitle>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold text-galaxia-text-primary">
              {plan.price === 0 ? "Grátis" : `R$ ${plan.price}`}
            </span>
            {plan.price > 0 && (
              <span className="text-galaxia-text-muted">/{plan.period}</span>
            )}
          </div>
          
          <p className="text-sm text-galaxia-text-muted">
            Comissão: {plan.commission}% por transação
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                feature.included ? "text-green-500" : "text-muted-foreground"
              }`} />
              <span className={`text-sm ${
                feature.included ? "text-galaxia-text-primary" : "text-muted-foreground line-through"
              }`}>
                {feature.name}
                {feature.limit && (
                  <span className="text-muted-foreground ml-1">({feature.limit})</span>
                )}
              </span>
            </div>
          ))}
        </div>

        <Button 
          className="w-full" 
          variant={isCurrentPlan ? "secondary" : "default"}
          disabled={isCurrentPlan || loading}
          onClick={() => onSelect(plan.id)}
        >
          {loading ? "Processando..." : 
           isCurrentPlan ? "Plano Atual" : 
           plan.price === 0 ? "Usar Grátis" : 
           "Selecionar Plano"}
        </Button>
      </CardContent>
    </Card>
  );
}
