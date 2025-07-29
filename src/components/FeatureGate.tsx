import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Zap, Star } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

interface FeatureGateProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
  requiredPlan?: 'professional' | 'business' | 'elite';
  showUpgrade?: boolean;
  upgradeMessage?: string;
}

const PLAN_INFO = {
  professional: {
    name: 'Profissional',
    icon: Zap,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  business: {
    name: 'Business',
    icon: Crown,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  elite: {
    name: 'Elite',
    icon: Crown,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  }
};

export function FeatureGate({ 
  feature, 
  children, 
  fallback, 
  requiredPlan,
  showUpgrade = true,
  upgradeMessage 
}: FeatureGateProps) {
  const { hasFeature, subscription, upgradePlan, loading } = useSubscription();

  // If loading, show children (optimistic)
  if (loading) {
    return <>{children}</>;
  }

  // If user has the feature, show content
  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  // If custom fallback provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }

  // If showUpgrade is false, don't show anything
  if (!showUpgrade) {
    return null;
  }

  // Default upgrade prompt
  const planInfo = requiredPlan ? PLAN_INFO[requiredPlan] : PLAN_INFO.professional;
  const PlanIcon = planInfo.icon;

  return (
    <Card className={`${planInfo.bgColor} ${planInfo.borderColor} border-2`}>
      <CardContent className="p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Lock className="h-5 w-5 text-muted-foreground" />
          <PlanIcon className={`h-5 w-5 ${planInfo.color}`} />
        </div>
        
        <h3 className="text-lg font-semibold mb-2">
          Recurso Exclusivo
        </h3>
        
        <p className="text-muted-foreground mb-4">
          {upgradeMessage || `Este recurso está disponível no plano ${planInfo.name} ou superior.`}
        </p>
        
        <div className="flex items-center justify-center gap-2 mb-4">
          <Badge variant="outline" className={planInfo.color}>
            Plano {planInfo.name}
          </Badge>
          {subscription?.plan === 'free' && (
            <Badge variant="secondary">
              Você tem: Gratuito
            </Badge>
          )}
        </div>
        
        <div className="space-y-2">
          <Button 
            onClick={() => requiredPlan && upgradePlan(requiredPlan)}
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Processando...' : `Fazer Upgrade para ${planInfo.name}`}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = '/pricing'}
            className="w-full"
          >
            Ver Todos os Planos
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Higher-order component for route protection
export function withFeatureGate<T extends object>(
  Component: React.ComponentType<T>,
  feature: string,
  requiredPlan?: 'professional' | 'business' | 'elite'
) {
  return function FeatureGatedComponent(props: T) {
    return (
      <FeatureGate feature={feature} requiredPlan={requiredPlan}>
        <Component {...props} />
      </FeatureGate>
    );
  };
}

// Usage limit component
interface UsageLimitProps {
  feature: string;
  children: ReactNode;
  warningThreshold?: number; // Show warning when usage is above this percentage
  upgradePrompt?: boolean;
}

export function UsageLimit({ 
  feature, 
  children, 
  warningThreshold = 80,
  upgradePrompt = true 
}: UsageLimitProps) {
  const { canUseFeature, getUsage, subscription } = useSubscription();

  const usage = getUsage(feature);
  const canUse = canUseFeature(feature);
  const showWarning = usage.percentage >= warningThreshold;

  if (!canUse) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="h-4 w-4 text-red-500" />
            <span className="font-medium text-red-700">Limite Atingido</span>
          </div>
          <p className="text-sm text-red-600 mb-3">
            Você atingiu o limite de {usage.limit} {feature} para o seu plano.
          </p>
          {upgradePrompt && (
            <Button size="sm" variant="outline">
              Fazer Upgrade
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {showWarning && (
        <Card className="border-yellow-200 bg-yellow-50 mb-4">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-700">
                  {usage.used} de {usage.limit} {feature} utilizados
                </span>
              </div>
              <Badge variant="outline" className="text-yellow-600">
                {Math.round(usage.percentage)}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
      {children}
    </div>
  );
}