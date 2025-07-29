import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PlanCard } from "@/components/PlanCard";
import { subscriptionApi } from "@/lib/api";
import { toast } from "sonner";
import { 
  Star, 
  Zap, 
  Crown, 
  Heart, 
  Shield, 
  Headphones, 
  BarChart3,
  Share2,
  Smartphone,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

const PLANS = [
  {
    id: "free",
    name: "Gratuito",
    price: 0,
    period: "month" as const,
    commission: 15,
    icon: Star,
    features: [
      { name: "Cadastro básico completo", included: true },
      { name: "Chat básico com clientes", included: true },
      { name: "Dashboard simples", included: true },
      { name: "Suporte por email", included: true, limit: "48h" },
      { name: "Badge 'Novo no GalaxIA'", included: true },
      { name: "Destaque nas buscas", included: false },
      { name: "Selo de verificação", included: false },
      { name: "Integração redes sociais", included: false },
      { name: "Analytics avançado", included: false },
    ],
    limits: {
      services: 3,
      proposals: 5,
      projectValue: 1000
    }
  },
  {
    id: "professional",
    name: "Profissional",
    price: 49,
    originalPrice: 69,
    period: "month" as const,
    commission: 12,
    icon: Zap,
    badge: "Verificado",
    badgeColor: "bg-blue-100 text-blue-700",
    features: [
      { name: "Tudo do plano Gratuito", included: true },
      { name: "Verificação de identidade", included: true },
      { name: "Destaque moderado nas buscas", included: true },
      { name: "Analytics básico", included: true, limit: "30 dias" },
      { name: "Templates de propostas", included: true },
      { name: "Suporte prioritário", included: true, limit: "24h" },
      { name: "Notificações push/SMS", included: true },
      { name: "KYC completo", included: false, limit: "+R$ 29" },
    ],
    limits: {
      services: 10,
      proposals: 30,
      projectValue: 5000
    }
  },
  {
    id: "business",
    name: "Business",
    price: 149,
    originalPrice: 199,
    period: "month" as const,
    commission: 10,
    icon: Crown,
    badge: "Business Partner",
    badgeColor: "bg-purple-100 text-purple-700",
    popular: true,
    features: [
      { name: "Tudo do plano Profissional", included: true },
      { name: "KYC completo incluído", included: true },
      { name: "Destaque premium nas buscas", included: true },
      { name: "Analytics avançado", included: true, limit: "1 ano" },
      { name: "Integração redes sociais básica", included: true },
      { name: "API básica para integração", included: true },
      { name: "Gerente de conta", included: true },
      { name: "Suporte por telefone/chat", included: true },
      { name: "Projetos corporativos", included: true },
      { name: "Certificado digital GalaxIA", included: true },
    ],
    limits: {
      services: "unlimited" as const,
      proposals: 100,
      projectValue: 25000
    }
  },
  {
    id: "elite",
    name: "Elite",
    price: 299,
    originalPrice: 399,
    period: "month" as const,
    commission: 7,
    icon: Crown,
    badge: "GalaxIA Elite",
    badgeColor: "bg-yellow-100 text-yellow-700",
    features: [
      { name: "Tudo do plano Business", included: true },
      { name: "Badge dourado 'Elite'", included: true },
      { name: "Topo dos resultados", included: true },
      { name: "Analytics preditivo com IA", included: true },
      { name: "Redes sociais COMPLETA", included: true },
      { name: "Inbox unificado", included: true },
      { name: "Publicação automática", included: true, limit: "50/mês" },
      { name: "API completa + webhooks", included: true },
      { name: "White-label options", included: true },
      { name: "Suporte VIP 24/7", included: true },
      { name: "Co-marketing opportunities", included: true },
    ],
    limits: {
      services: "unlimited" as const,
      proposals: "unlimited" as const,
      projectValue: "unlimited" as const
    }
  }
];

const ADDONS = [
  {
    id: "social_messaging",
    name: "Mensageria Unificada",
    description: "Inbox unificado para Instagram DM, WhatsApp, LinkedIn",
    price: 49,
    period: "month",
    icon: Smartphone,
    includedIn: ["elite"]
  },
  {
    id: "social_posting_starter",
    name: "Publicação Automática - Starter",
    description: "10 posts por mês com agendamento",
    price: 29,
    period: "month",
    icon: Share2,
    includedIn: []
  },
  {
    id: "social_posting_pro",
    name: "Publicação Automática - Pro",
    description: "50 posts por mês com analytics",
    price: 79,
    period: "month",
    icon: Share2,
    includedIn: ["elite"]
  },
  {
    id: "kyc_basic",
    name: "KYC Básico",
    description: "Verificação de identidade uma vez",
    price: 29,
    period: "once",
    icon: Shield,
    includedIn: ["business", "elite"]
  }
];

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>("free");
  const [loading, setLoading] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  useEffect(() => {
    loadCurrentPlan();
  }, []);

  const loadCurrentPlan = async () => {
    try {
      const response = await subscriptionApi.getCurrentPlan();
      setCurrentPlan(response.data.plan || "free");
    } catch (error) {
      console.error("Error loading current plan:", error);
    }
  };

  const handlePlanSelect = async (planId: string) => {
    if (planId === currentPlan) return;
    
    setLoading(true);
    try {
      if (planId === "free") {
        await subscriptionApi.cancelSubscription("downgrade");
        toast.success("Plano alterado para Gratuito");
      } else {
        await subscriptionApi.upgradePlan(planId, { 
          billing_cycle: isAnnual ? "annual" : "monthly" 
        });
        toast.success("Plano alterado com sucesso!");
      }
      setCurrentPlan(planId);
    } catch (error) {
      console.error("Error changing plan:", error);
      toast.error("Erro ao alterar plano. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const getAnnualPrice = (monthlyPrice: number) => {
    return Math.round(monthlyPrice * 12 * 0.84); // 16% discount
  };

  const displayPlans = PLANS.map(plan => ({
    ...plan,
    price: isAnnual && plan.price > 0 ? getAnnualPrice(plan.price) : plan.price,
    period: isAnnual ? "year" as const : "month" as const,
    originalPrice: isAnnual && plan.originalPrice ? getAnnualPrice(plan.originalPrice) : plan.originalPrice
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">
            Escolha o Plano Ideal Para Você
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Planos transparentes sem pegadinhas. Comece grátis e evolua conforme seu negócio cresce.
          </p>
          
          {/* Annual/Monthly Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <Label htmlFor="billing-toggle" className={!isAnnual ? "font-semibold" : ""}>
              Mensal
            </Label>
            <Switch
              id="billing-toggle"
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
            />
            <Label htmlFor="billing-toggle" className={isAnnual ? "font-semibold" : ""}>
              Anual
            </Label>
            {isAnnual && (
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                16% OFF
              </Badge>
            )}
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 mb-16">
          {displayPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              currentPlan={currentPlan}
              onSelect={handlePlanSelect}
              loading={loading}
              discount={isAnnual && plan.price > 0 ? 16 : undefined}
            />
          ))}
        </div>

        {/* Add-ons Section */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Funcionalidades Extras</h2>
            <p className="text-muted-foreground">
              Adicione recursos específicos conforme sua necessidade
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {ADDONS.map((addon) => (
              <Card key={addon.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <addon.icon className="h-6 w-6 text-primary" />
                      <div>
                        <CardTitle className="text-lg">{addon.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {addon.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold">
                        R$ {addon.price}
                      </span>
                      <span className="text-muted-foreground">
                        /{addon.period === "once" ? "única vez" : "mês"}
                      </span>
                      {addon.includedIn.length > 0 && (
                        <div className="mt-2">
                          <Badge variant="secondary" className="text-xs">
                            Incluído em: {addon.includedIn.join(", ")}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      Contratar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Comparação Detalhada</h2>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-semibold">Funcionalidades</th>
                      {PLANS.map(plan => (
                        <th key={plan.id} className="text-center p-4 font-semibold min-w-[120px]">
                          {plan.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Serviços Ativos</td>
                      {PLANS.map(plan => (
                        <td key={plan.id} className="text-center p-4">
                          {plan.limits.services === "unlimited" ? "Ilimitado" : plan.limits.services}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Propostas por Mês</td>
                      {PLANS.map(plan => (
                        <td key={plan.id} className="text-center p-4">
                          {plan.limits.proposals === "unlimited" ? "Ilimitadas" : plan.limits.proposals}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Comissão</td>
                      {PLANS.map(plan => (
                        <td key={plan.id} className="text-center p-4 font-semibold text-primary">
                          {plan.commission}%
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Verificação KYC</td>
                      {PLANS.map(plan => (
                        <td key={plan.id} className="text-center p-4">
                          {plan.id === "free" ? "❌" : 
                           plan.id === "professional" ? "📋 +R$29" :
                           "✅ Incluído"}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Redes Sociais</td>
                      {PLANS.map(plan => (
                        <td key={plan.id} className="text-center p-4">
                          {plan.id === "free" || plan.id === "professional" ? "❌" : 
                           plan.id === "business" ? "📱 Básico" :
                           "🚀 Completo"}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">Suporte</td>
                      {PLANS.map(plan => (
                        <td key={plan.id} className="text-center p-4">
                          {plan.id === "free" ? "📧 48h" : 
                           plan.id === "professional" ? "⚡ 24h" :
                           plan.id === "business" ? "📞 Chat" :
                           "👑 VIP 24/7"}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Perguntas Frequentes</h2>
          </div>
          
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Posso mudar de plano a qualquer momento?</h3>
                <p className="text-muted-foreground">
                  Sim! Você pode fazer upgrade ou downgrade a qualquer momento. 
                  Upgrades são aplicados imediatamente, downgrades entram em vigor no próximo ciclo.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Como funciona a comissão?</h3>
                <p className="text-muted-foreground">
                  A comissão é descontada automaticamente de cada transação concluída. 
                  Planos pagos têm comissões menores, gerando economia significativa.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Há taxa de setup ou outros custos?</h3>
                <p className="text-muted-foreground">
                  Não! Sem taxas ocultas. Você paga apenas a mensalidade do plano escolhido 
                  e a comissão sobre vendas realizadas.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <Card className="max-w-2xl mx-auto border-primary">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">
                Pronto para impulsionar seu negócio?
              </h3>
              <p className="text-muted-foreground mb-6">
                Comece gratuitamente e evolua conforme cresce. 
                Sem compromisso, sem risco.
              </p>
              <Button size="lg" className="gap-2">
                Começar Agora
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}