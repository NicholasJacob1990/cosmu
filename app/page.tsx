'use client';

import { useState } from "react";
import { SearchToggle } from "@/components/SearchToggle";
import { ServiceCard } from "@/components/ServiceCard";
import { FreelancerCard } from "@/components/FreelancerCard";
import { CategoryGrid } from "@/components/CategoryGrid";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Users, 
  CheckCircle, 
  TrendingUp,
  Star,
  Shield,
  Zap,
  UserPlus,
  Plus,
  Rocket,
  Globe,
  Target
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GalaxiaLogo } from "@/components/GalaxiaLogo";
const heroProfessionalsImage = "/hero-professionals-bg.jpg";

// Mock data for demonstration
const mockServices = [
  {
    title: "Criação de Logo + Identidade Visual Completa",
    description: "Logo profissional, cartão de visita, papel timbrado e manual da marca. Entrega em 5 dias com revisões incluídas.",
    price: 299,
    rating: 4.9,
    reviewCount: 127,
    provider: {
      name: "Ana Silva",
      avatar: "/placeholder.svg",
      level: "Pro"
    },
    image: "/placeholder.svg",
    tags: ["Logo", "Branding", "Design"],
    isFavorite: true
  },
  {
    title: "Desenvolvimento de Site Responsivo",
    description: "Site profissional responsivo com até 5 páginas, otimizado para SEO e com painel administrativo.",
    price: 1299,
    rating: 4.8,
    reviewCount: 89,
    provider: {
      name: "Carlos Santos",
      avatar: "/placeholder.svg",
      level: "Expert"
    },
    image: "/placeholder.svg",
    tags: ["Website", "React", "SEO"],
    isFavorite: false
  },
  {
    title: "Redação de Conteúdo para Blog",
    description: "Artigos otimizados para SEO, pesquisados e escritos por especialista. Mínimo 1000 palavras por artigo.",
    price: 149,
    rating: 4.7,
    reviewCount: 203,
    provider: {
      name: "Marina Costa",
      avatar: "/placeholder.svg",
      level: "Pro"
    },
    image: "/placeholder.svg",
    tags: ["SEO", "Conteúdo", "Blog"],
    isFavorite: false
  }
];

const mockFreelancers = [
  {
    name: "Bruno Oliveira",
    title: "Desenvolvedor Full Stack",
    description: "Especialista em React, Node.js e MongoDB. 5+ anos de experiência criando aplicações web robustas e escaláveis para startups e empresas consolidadas.",
    hourlyRate: 85,
    rating: 4.9,
    reviewCount: 156,
    completedJobs: 89,
    responseTime: "2 horas",
    location: "São Paulo, SP",
    avatar: "/placeholder.svg",
    skills: ["React", "Node.js", "MongoDB", "TypeScript", "AWS"],
    isOnline: true,
    isVerified: true
  },
  {
    name: "Lucia Fernandes",
    title: "UX/UI Designer",
    description: "Designer apaixonada por criar experiências digitais memoráveis. Especialista em design systems, prototipagem e pesquisa com usuários.",
    hourlyRate: 75,
    rating: 4.8,
    reviewCount: 92,
    completedJobs: 67,
    responseTime: "1 hora",
    location: "Rio de Janeiro, RJ",
    avatar: "/placeholder.svg",
    skills: ["Figma", "UX Research", "Prototyping", "Design Systems"],
    isOnline: false,
    isVerified: true
  }
];

export default function Index() {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchMode, setSearchMode] = useState<'services' | 'freelancers'>('services');

  const handleSearch = (query: string, isAI: boolean) => {
    console.log(`Searching for: ${query} (AI: ${isAI})`);
    // Here you would implement the actual search logic
  };

  return (
    <div className="min-h-screen bg-background font-galaxia">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <GalaxiaLogo />
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="/services" className="text-sm font-medium text-galaxia-text-primary hover:text-galaxia-neon transition-colors duration-300">
              Encontrar Serviços
            </a>
            <a href="/freelancers" className="text-sm font-medium text-galaxia-text-primary hover:text-galaxia-neon transition-colors duration-300">
              Contratar Profissionais  
            </a>
            <a href="/pricing" className="text-sm font-medium text-galaxia-text-primary hover:text-galaxia-neon transition-colors duration-300">
              Planos e Preços
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-galaxia-text-primary hover:text-galaxia-neon transition-colors duration-300">
              Como Funciona
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-galaxia-text-primary hover:text-galaxia-neon hover:bg-galaxia-surface"
              onClick={() => window.location.href = '/login'}
            >
              Entrar
            </Button>
            <Button 
              size="sm" 
              className="flex items-center gap-2 bg-gradient-to-r from-galaxia-magenta to-galaxia-neon text-white hover:from-galaxia-neon hover:to-galaxia-magenta shadow-galaxia-glow transition-all duration-300"
              onClick={() => window.location.href = '/register'}
            >
              <UserPlus className="h-4 w-4" />
              Oferecer Serviços
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2 border-galaxia-grad-b text-galaxia-grad-b hover:bg-galaxia-grad-b hover:text-white transition-all duration-300"
              onClick={() => window.location.href = '/register'}
            >
              <Plus className="h-4 w-4" />
              Cadastre-se
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-galaxia-grad-a/10 via-galaxia-grad-b/8 to-galaxia-grad-c/10 opacity-40"></div>
        {/* Cosmic Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-2 h-2 bg-galaxia-neon rounded-full animate-star-twinkle opacity-60"></div>
          <div className="absolute top-40 right-20 w-1 h-1 bg-galaxia-magenta rounded-full animate-star-twinkle opacity-40" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-40 left-1/4 w-1.5 h-1.5 bg-galaxia-grad-c rounded-full animate-star-twinkle opacity-50" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-galaxia-grad-a rounded-full animate-star-twinkle opacity-30" style={{ animationDelay: '3s' }}></div>
        </div>
        
        <div className="absolute inset-0 opacity-2">
          <div 
            className="absolute inset-0 bg-cover bg-center animate-slow-zoom"
            style={{ 
              backgroundImage: `url(${heroProfessionalsImage})`,
              filter: 'grayscale(100%) brightness(2) contrast(0.4)',
              opacity: '0.15',
              mixBlendMode: 'soft-light'
            }}
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-6 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-gradient-to-r from-galaxia-grad-a via-galaxia-grad-b to-galaxia-grad-c text-white shadow-galaxia-glow animate-cosmic-pulse">
              <Sparkles className="w-4 h-4 mr-2" />
              Powered by AI
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-galaxia-text-primary">
              Encontre o profissional ideal com{" "}
              <span className="bg-gradient-to-r from-galaxia-grad-a via-galaxia-grad-b to-galaxia-grad-c bg-clip-text text-transparent">
                Inteligência Artificial
              </span>
            </h1>
            
            <p className="text-xl text-galaxia-text-muted mb-12 max-w-2xl mx-auto leading-relaxed">
              A primeira plataforma que combina busca tradicional com IA para conectar você aos 
              melhores freelancers e serviços do Brasil
            </p>

            <SearchToggle onSearch={handleSearch} />

            <div className="mt-8 p-4 bg-galaxia-surface/50 rounded-lg border border-border/40">
              <p className="text-sm text-galaxia-text-muted text-center">
                🌙 Clique no botão de tema no header para alternar entre modo claro e escuro
              </p>
            </div>

            <div className="grid grid-cols-3 gap-8 mt-16 max-w-lg mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-galaxia-grad-a to-galaxia-grad-c bg-clip-text text-transparent">50K+</div>
                <div className="text-sm text-galaxia-text-muted">Freelancers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-galaxia-grad-a to-galaxia-grad-c bg-clip-text text-transparent">100K+</div>
                <div className="text-sm text-galaxia-text-muted">Projetos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-galaxia-grad-a to-galaxia-grad-c bg-clip-text text-transparent">4.9★</div>
                <div className="text-sm text-galaxia-text-muted">Avaliação</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 border-b border-border/40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant={searchMode === 'services' ? 'default' : 'ghost'}
              onClick={() => setSearchMode('services')}
              className={`gap-2 transition-all duration-300 ${
                searchMode === 'services' 
                  ? 'bg-gradient-to-r from-galaxia-magenta to-galaxia-neon text-white shadow-galaxia-glow' 
                  : 'text-galaxia-text-primary hover:text-galaxia-neon hover:bg-galaxia-surface'
              }`}
            >
              <Zap className="w-4 h-4" />
              Serviços em Pacotes
            </Button>
            <Button
              variant={searchMode === 'freelancers' ? 'default' : 'ghost'}
              onClick={() => setSearchMode('freelancers')}
              className={`gap-2 transition-all duration-300 ${
                searchMode === 'freelancers' 
                  ? 'bg-gradient-to-r from-galaxia-magenta to-galaxia-neon text-white shadow-galaxia-glow' 
                  : 'text-galaxia-text-primary hover:text-galaxia-neon hover:bg-galaxia-surface'
              }`}
            >
              <Users className="w-4 h-4" />
              Profissionais para Projetos
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-galaxia-surface/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-galaxia-text-primary">Explore por Categoria</h2>
            <p className="text-galaxia-text-muted text-lg">
              Descubra milhares de serviços organizados por área de expertise
            </p>
          </div>
          <CategoryGrid />
        </div>
      </section>

      <section className="py-16 bg-galaxia-surface/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-galaxia-text-primary">
              {searchMode === 'services' ? 'Serviços em Destaque' : 'Profissionais Recomendados'}
            </h2>
            <Button 
              variant="outline" 
              className="border-galaxia-grad-b text-galaxia-grad-b hover:bg-galaxia-grad-b hover:text-white transition-all duration-300"
              onClick={() => window.location.href = searchMode === 'services' ? '/services' : '/freelancers'}
            >
              Ver Todos
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchMode === 'services' 
              ? mockServices.map((service, index) => {
                  const { key, ...serviceProps } = service as any;
                  return <ServiceCard key={index} {...serviceProps} />;
                })
              : mockFreelancers.map((freelancer, index) => {
                  const { key, ...freelancerProps } = freelancer as any;
                  return <FreelancerCard key={index} {...freelancerProps} />;
                })
            }
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-galaxia-grad-a/5 via-galaxia-grad-b/5 to-galaxia-grad-c/5">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4 text-galaxia-text-primary">Pronto para começar?</h2>
            <p className="text-galaxia-text-muted text-lg mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de profissionais e clientes que já estão trabalhando juntos
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-galaxia-magenta to-galaxia-neon text-white hover:from-galaxia-neon hover:to-galaxia-magenta shadow-galaxia-glow transition-all duration-300"
                onClick={() => window.location.href = '/register'}
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Oferecer Serviços
              </Button>
              
              <Button 
                size="lg"
                variant="outline"
                className="border-galaxia-grad-b text-galaxia-grad-b hover:bg-galaxia-grad-b hover:text-white transition-all duration-300"
                onClick={() => window.location.href = '/services'}
              >
                <Users className="h-5 w-5 mr-2" />
                Encontrar Profissionais
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-galaxia-grad-a/10 via-galaxia-grad-b/10 to-galaxia-grad-c/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-galaxia-text-primary">Planos Transparentes, Sem Pegadinhas</h2>
            <p className="text-galaxia-text-muted text-lg">
              Comece grátis e evolua conforme seu negócio cresce
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-border/40 p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Star className="h-5 w-5 text-gray-500" />
                <h3 className="font-semibold">Gratuito</h3>
              </div>
              <div className="text-3xl font-bold mb-2">R$ 0</div>
              <div className="text-sm text-muted-foreground mb-4">Para começar</div>
              <div className="space-y-2 text-sm text-left">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>3 serviços ativos</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>5 propostas/mês</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Comissão 15%</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border-2 border-blue-300 p-6 text-center relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white">Popular</Badge>
              </div>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold">Profissional</h3>
              </div>
              <div className="text-3xl font-bold mb-2">R$ 49</div>
              <div className="text-sm text-muted-foreground mb-4">/mês</div>
              <div className="space-y-2 text-sm text-left">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>10 serviços ativos</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>30 propostas/mês</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Comissão 12%</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-border/40 p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Target className="h-5 w-5 text-purple-500" />
                <h3 className="font-semibold">Business</h3>
              </div>
              <div className="text-3xl font-bold mb-2">R$ 149</div>
              <div className="text-sm text-muted-foreground mb-4">/mês</div>
              <div className="space-y-2 text-sm text-left">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Serviços ilimitados</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>100 propostas/mês</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Comissão 10%</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-border/40 p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Rocket className="h-5 w-5 text-yellow-500" />
                <h3 className="font-semibold">Elite</h3>
              </div>
              <div className="text-3xl font-bold mb-2">R$ 299</div>
              <div className="text-sm text-muted-foreground mb-4">/mês</div>
              <div className="space-y-2 text-sm text-left">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Recursos ilimitados</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Propostas ilimitadas</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Comissão 7%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-galaxia-magenta to-galaxia-neon text-white hover:from-galaxia-neon hover:to-galaxia-magenta shadow-galaxia-glow transition-all duration-300"
              onClick={() => window.location.href = '/pricing'}
            >
              Ver Todos os Planos e Recursos
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-galaxia-surface/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-galaxia-text-primary">Por que escolher nossa plataforma?</h2>
            <p className="text-galaxia-text-muted text-lg">
              Tecnologia de ponta para conectar talentos com oportunidades
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-galaxia-grad-a via-galaxia-grad-b to-galaxia-grad-c rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-galaxia-glow">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-galaxia-text-primary">IA Avançada</h3>
              <p className="text-galaxia-text-muted">
                Algoritmos inteligentes que encontram o match perfeito baseado em suas necessidades específicas
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-galaxia-success to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-galaxia-glow">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-galaxia-text-primary">Pagamento Seguro</h3>
              <p className="text-galaxia-text-muted">
                Sistema de escrow que protege tanto clientes quanto prestadores de serviços em todas as transações
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-galaxia-warning to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-galaxia-glow">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-galaxia-text-primary">Qualidade Garantida</h3>
              <p className="text-galaxia-text-muted">
                Todos os profissionais são verificados e avaliados pela comunidade para garantir excelência
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-16 bg-gradient-to-br from-galaxia-grad-a/10 via-galaxia-grad-b/10 to-galaxia-grad-c/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-galaxia-text-primary">Como Funciona</h2>
            <p className="text-galaxia-text-muted text-lg max-w-2xl mx-auto">
              Conectamos clientes e profissionais de forma simples e segura
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="space-y-8">
              <h3 className="text-2xl font-semibold text-center text-galaxia-text-primary mb-8">Para Clientes</h3>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-galaxia-text-primary">Descreva seu projeto</h4>
                  <p className="text-galaxia-text-muted text-sm">
                    Conte-nos o que você precisa, defina seu orçamento e prazo desejado
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-galaxia-text-primary">Encontre profissionais</h4>
                  <p className="text-galaxia-text-muted text-sm">
                    Nossa IA conecta você aos melhores profissionais para seu projeto
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-galaxia-text-primary">Colabore com segurança</h4>
                  <p className="text-galaxia-text-muted text-sm">
                    Trabalhe junto, acompanhe o progresso e pague com total segurança
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="text-2xl font-semibold text-center text-galaxia-text-primary mb-8">Para Profissionais</h3>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-to-r from-galaxia-magenta to-galaxia-neon rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-galaxia-text-primary">Crie seu perfil</h4>
                  <p className="text-galaxia-text-muted text-sm">
                    Mostre suas habilidades, experiência e portfólio de trabalhos
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-to-r from-galaxia-magenta to-galaxia-neon rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-galaxia-text-primary">Receba convites</h4>
                  <p className="text-galaxia-text-muted text-sm">
                    Seja descoberto por clientes que procuram exatamente suas habilidades
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-to-r from-galaxia-magenta to-galaxia-neon rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-galaxia-text-primary">Entregue e receba</h4>
                  <p className="text-galaxia-text-muted text-sm">
                    Complete projetos de qualidade e receba seus pagamentos com segurança
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-galaxia-magenta to-galaxia-neon text-white hover:from-galaxia-neon hover:to-galaxia-magenta shadow-galaxia-glow transition-all duration-300"
              onClick={() => window.location.href = '/register'}
            >
              Comece Agora - É Grátis!
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}