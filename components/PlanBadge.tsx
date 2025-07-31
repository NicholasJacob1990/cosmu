import { Badge } from "@/components/ui/badge";
import { Star, Zap, Crown } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

interface PlanBadgeProps {
  plan?: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

const PLAN_CONFIG = {
  free: {
    label: "Gratuito",
    icon: Star,
    className: "bg-gray-100 text-gray-700 border-gray-200",
    iconColor: "text-gray-500"
  },
  professional: {
    label: "Profissional",
    icon: Zap,
    className: "bg-blue-100 text-blue-700 border-blue-200",
    iconColor: "text-blue-500"
  },
  business: {
    label: "Business",
    icon: Crown,
    className: "bg-purple-100 text-purple-700 border-purple-200",
    iconColor: "text-purple-500"
  },
  elite: {
    label: "Elite",
    icon: Crown,
    className: "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-300",
    iconColor: "text-yellow-600"
  }
};

export function PlanBadge({ plan, size = "md", showIcon = true }: PlanBadgeProps) {
  const { subscription } = useSubscription();
  
  const currentPlan = plan || subscription?.plan || "free";
  const config = PLAN_CONFIG[currentPlan as keyof typeof PLAN_CONFIG] || PLAN_CONFIG.free;
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5"
  };
  
  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  };

  return (
    <Badge 
      variant="outline" 
      className={`${config.className} ${sizeClasses[size]} flex items-center gap-1.5 font-medium`}
    >
      {showIcon && <Icon className={`${iconSizes[size]} ${config.iconColor}`} />}
      {config.label}
    </Badge>
  );
}

// Component to show upgrade prompts
export function PlanUpgradePrompt({ 
  requiredPlan, 
  feature,
  onUpgrade 
}: { 
  requiredPlan: string;
  feature?: string;
  onUpgrade?: () => void;
}) {
  const config = PLAN_CONFIG[requiredPlan as keyof typeof PLAN_CONFIG];
  const Icon = config.icon;
  
  return (
    <div className={`p-4 rounded-lg border-2 ${config.className.replace('bg-', 'bg-opacity-20 border-')}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-5 w-5 ${config.iconColor}`} />
        <span className="font-semibold">
          Upgrade para {config.label}
        </span>
      </div>
      {feature && (
        <p className="text-sm text-muted-foreground mb-3">
          {feature} está disponível no plano {config.label} ou superior.
        </p>
      )}
      <button 
        onClick={onUpgrade || (() => window.location.href = '/pricing')}
        className="text-sm font-medium underline hover:no-underline"
      >
        Ver Planos →
      </button>
    </div>
  );
}