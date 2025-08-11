'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, UserCheck, Star, Zap, Globe, CheckCircle2 } from "lucide-react";
import { GalaxiaLogo } from "@/components/GalaxiaLogo";

export default function RegisterChoicePage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'client' | 'freelancer' | null>(null);

  const handleContinue = () => {
    if (selectedRole) {
      if (selectedRole === 'client') {
        router.push(`/register/client`);
      } else {
        router.push(`/register/professional-type`);
      }
    }
  };

  const handleSocialLogin = (provider: 'google' | 'github') => {
    // TODO: Implement social login
    console.log(`Login with ${provider}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-galaxia-grad-a/5 via-galaxia-grad-b/5 to-galaxia-grad-c/5 opacity-40"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/40 bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Voltar ao início
              </Link>
              <GalaxiaLogo />
              <Link href="/login" className="text-primary hover:underline">
                Já tem uma conta? Entre
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              Junte-se ao{" "}
              <span className="bg-gradient-to-r from-galaxia-grad-a via-galaxia-grad-b to-galaxia-grad-c bg-clip-text text-transparent">
                GalaxIA
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Como você deseja usar nossa plataforma?
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
            {/* Client Card */}
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedRole === 'client' 
                  ? 'ring-2 ring-galaxia-neon shadow-galaxia-glow bg-galaxia-surface/20' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedRole('client')}
            >
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  Sou Cliente
                  {selectedRole === 'client' && (
                    <CheckCircle2 className="h-5 w-5 text-galaxia-neon" />
                  )}
                </CardTitle>
                <p className="text-muted-foreground">
                  Quero contratar profissionais e serviços
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Poste projetos e receba propostas</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Acesso a milhares de profissionais</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Pagamento seguro com garantia</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Suporte dedicado 24/7</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/40">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Taxa por transação:</span>
                    <Badge variant="secondary">3% + taxas</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Freelancer Card */}
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedRole === 'freelancer' 
                  ? 'ring-2 ring-galaxia-magenta shadow-galaxia-glow bg-galaxia-surface/20' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedRole('freelancer')}
            >
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-galaxia-magenta to-galaxia-neon rounded-2xl flex items-center justify-center">
                  <UserCheck className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  Sou Profissional
                  {selectedRole === 'freelancer' && (
                    <CheckCircle2 className="h-5 w-5 text-galaxia-magenta" />
                  )}
                </CardTitle>
                <p className="text-muted-foreground">
                  Quero oferecer meus serviços e habilidades
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-galaxia-magenta rounded-full"></div>
                    <span className="text-sm">Crie serviços e receba pedidos</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-galaxia-magenta rounded-full"></div>
                    <span className="text-sm">Seja encontrado por clientes globais</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-galaxia-magenta rounded-full"></div>
                    <span className="text-sm">Ferramentas profissionais gratuitas</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-galaxia-magenta rounded-full"></div>
                    <span className="text-sm">Comunidade de profissionais</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/40">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Comissão inicial:</span>
                    <Badge variant="secondary">15% (reduz até 7%)</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="max-w-md mx-auto space-y-4">
            <Button 
              size="lg" 
              className="w-full bg-gradient-to-r from-galaxia-magenta to-galaxia-neon text-white hover:from-galaxia-neon hover:to-galaxia-magenta shadow-galaxia-glow"
              disabled={!selectedRole}
              onClick={handleContinue}
            >
              {selectedRole 
                ? `Continuar como ${selectedRole === 'client' ? 'Cliente' : 'Profissional'}`
                : 'Selecione uma opção acima'
              }
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/40" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Ou continue com
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                onClick={() => handleSocialLogin('google')}
                className="flex items-center gap-2"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleSocialLogin('github')}
                className="flex items-center gap-2"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </Button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-16 pt-12 border-t border-border/40">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Globe className="h-5 w-5 text-galaxia-neon" />
                  <span className="text-2xl font-bold bg-gradient-to-r from-galaxia-grad-a to-galaxia-grad-c bg-clip-text text-transparent">
                    50K+
                  </span>
                </div>
                <p className="text-muted-foreground">Profissionais ativos</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Zap className="h-5 w-5 text-galaxia-magenta" />
                  <span className="text-2xl font-bold bg-gradient-to-r from-galaxia-grad-a to-galaxia-grad-c bg-clip-text text-transparent">
                    100K+
                  </span>
                </div>
                <p className="text-muted-foreground">Projetos concluídos</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="text-2xl font-bold bg-gradient-to-r from-galaxia-grad-a to-galaxia-grad-c bg-clip-text text-transparent">
                    4.9★
                  </span>
                </div>
                <p className="text-muted-foreground">Avaliação média</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}