'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PlanCard } from "@/components/PlanCard";
import { toast } from "sonner";
import { 
  Star, 
  Zap, 
  Crown, 
  Shield, 
  Share2,
  Smartphone,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

const PLANS = [
  {
    id: "free",
    name: "Gratuito",
    price: 0,
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
      { name: "Analytics avançado", included: false },
    ],
  },
  {
    id: "professional",
    name: "Profissional",
    price: 49,
    commission: 12,
    icon: Zap,
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
  },
  {
    id: "business",
    name: "Business",
    price: 149,
    commission: 10,
    icon: Crown,
    popular: true,
    features: [
      { name: "Tudo do plano Profissional", included: true },
      { name: "KYC completo incluído", included: true },
      { name: "Destaque premium nas buscas", included: true },
      { name: "Analytics avançado", included: true, limit: "1 ano" },
      { name: "Gerente de conta", included: true },
      { name: "Suporte por telefone/chat", included: true },
    ],
  },
  {
    id: "elite",
    name: "Elite",
    price: 299,
    commission: 7,
    icon: Crown,
    features: [
      { name: "Tudo do plano Business", included: true },
      { name: "Badge dourado 'Elite'", included: true },
      { name: "Topo dos resultados", included: true },
      { name: "Analytics preditivo com IA", included: true },
      { name: "Suporte VIP 24/7", included: true },
    ],
  }
];

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>("free");

  const getAnnualPrice = (monthlyPrice: number) => {
    return Math.round(monthlyPrice * 12 * 0.84); // 16% discount
  };

  const displayPlans = PLANS.map(plan => ({
    ...plan,
    price: isAnnual && plan.price > 0 ? getAnnualPrice(plan.price) : plan.price,
    period: isAnnual ? "ano" as const : "mês" as const,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4 text-galaxia-text-primary">
            Escolha o Plano Ideal Para Você
          </h1>
          <p className="text-xl text-galaxia-text-muted mb-8 max-w-2xl mx-auto">
            Planos transparentes sem pegadinhas. Comece grátis e evolua conforme seu negócio cresce.
          </p>
          
          {/* Annual/Monthly Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <Label htmlFor="billing-toggle" className={!isAnnual ? "font-semibold text-galaxia-text-primary" : "text-galaxia-text-muted"}>
              Mensal
            </Label>
            <Switch
              id="billing-toggle"
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
            />
            <Label htmlFor="billing-toggle" className={isAnnual ? "font-semibold text-galaxia-text-primary" : "text-galaxia-text-muted"}>
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
              onSelect={() => {}}
              loading={false}
            />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
