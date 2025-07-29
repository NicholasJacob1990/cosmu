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
  period: "month" | "year";
  commission: number;
  badge?: string;
  badgeColor?: string;
  icon?: React.ComponentType<any>;
  popular?: boolean;
  features: PlanFeature[];
  limits: {
    services: number | "unlimited";
    proposals: number | "unlimited";
    projectValue: number | "unlimited";
  };
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

export function PlanCard({ plan, currentPlan, onSelect, loading, discount }: PlanCardProps) {
  const isCurrentPlan = currentPlan === plan.id;
  const PlanIcon = plan.icon || PLAN_ICONS[plan.id as keyof typeof PLAN_ICONS] || Star;
  const iconColor = PLAN_COLORS[plan.id as keyof typeof PLAN_COLORS] || "text-gray-500";
  
  const finalPrice = discount ? plan.price * (1 - discount / 100) : plan.price;
  
  return (
    <Card className={`relative transition-all duration-300 ${
      plan.popular 
        ? "border-primary shadow-lg scale-105" 
        : "border-border hover:border-primary/50"
    } ${isCurrentPlan ? "ring-2 ring-primary" : ""}`}>
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground px-3 py-1">
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
          {plan.badge && (
            <Badge variant="outline" className={plan.badgeColor}>
              {plan.badge}
            </Badge>
          )}
        </div>
        
        <div className="space-y-1">
          <div className="flex items-baseline justify-center gap-1">
            {discount && plan.originalPrice ? (
              <>
                <span className="text-2xl line-through text-muted-foreground">
                  R$ {plan.originalPrice}
                </span>
                <span className="text-4xl font-bold text-primary">
                  R$ {finalPrice.toFixed(0)}
                </span>
              </>
            ) : (
              <span className="text-4xl font-bold">
                {plan.price === 0 ? "Grátis" : `R$ ${finalPrice.toFixed(0)}`}
              </span>
            )}
            {plan.price > 0 && (
              <span className="text-muted-foreground">/{plan.period === "month" ? "mês" : "ano"}</span>
            )}
          </div>
          
          {discount && (
            <Badge variant="destructive" className="text-xs">
              {discount}% OFF
            </Badge>
          )}
          
          <p className="text-sm text-muted-foreground">
            Comissão: {plan.commission}% por transação
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Limits */}
        <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
          <h4 className="font-medium text-sm">Limites Incluídos</h4>
          <div className="grid grid-cols-1 gap-1 text-xs">
            <div className="flex justify-between">
              <span>Serviços ativos:</span>
              <span className="font-medium">
                {plan.limits.services === "unlimited" ? "Ilimitado" : plan.limits.services}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Propostas/mês:</span>
              <span className="font-medium">
                {plan.limits.proposals === "unlimited" ? "Ilimitadas" : plan.limits.proposals}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Valor máximo projeto:</span>
              <span className="font-medium">
                {plan.limits.projectValue === "unlimited" 
                  ? "Sem limite" 
                  : `R$ ${plan.limits.projectValue.toLocaleString()}`
                }
              </span>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Funcionalidades</h4>
          <div className="space-y-1">
            {plan.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-2">
                <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                  feature.included ? "text-green-500" : "text-muted-foreground"
                }`} />
                <span className={`text-sm ${
                  feature.included ? "" : "text-muted-foreground line-through"
                }`}>
                  {feature.name}
                  {feature.limit && (
                    <span className="text-muted-foreground ml-1">({feature.limit})</span>
                  )}
                </span>
              </div>
            ))}
          </div>
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