import { useState } from "react";
import { SearchToggle } from "@/components/SearchToggle";
import { ServiceCard } from "@/components/ServiceCard";
import { FreelancerCard } from "@/components/FreelancerCard";
import { CategoryGrid } from "@/components/CategoryGrid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Users, 
  CheckCircle, 
  TrendingUp,
  Star,
  Shield,
  Zap
} from "lucide-react";
import heroImage from "@/assets/hero-marketplace.jpg";

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold">ServiçosIA</h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
              Encontrar Serviços
            </a>
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
              Contratar Freelancers
            </a>
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
              Como Funciona
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">
              Entrar
            </Button>
            <Button variant="default" size="sm">
              Cadastrar
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10" />
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-5"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-gradient-primary border-0 text-primary-foreground">
              <Sparkles className="w-4 h-4 mr-2" />
              Powered by AI
            </Badge>
            
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Encontre o profissional ideal com{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Inteligência Artificial
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              A primeira plataforma que combina busca tradicional com IA para conectar você aos 
              melhores freelancers e serviços do Brasil
            </p>

            <SearchToggle onSearch={handleSearch} />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-lg mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">50K+</div>
                <div className="text-sm text-muted-foreground">Freelancers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">100K+</div>
                <div className="text-sm text-muted-foreground">Projetos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">4.9★</div>
                <div className="text-sm text-muted-foreground">Avaliação</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Mode Toggle */}
      <section className="py-12 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant={searchMode === 'services' ? 'default' : 'ghost'}
              onClick={() => setSearchMode('services')}
              className="gap-2"
            >
              <Zap className="w-4 h-4" />
              Serviços em Pacotes
            </Button>
            <Button
              variant={searchMode === 'freelancers' ? 'default' : 'ghost'}
              onClick={() => setSearchMode('freelancers')}
              className="gap-2"
            >
              <Users className="w-4 h-4" />
              Freelancers para Projetos
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Explore por Categoria</h2>
            <p className="text-muted-foreground text-lg">
              Descubra milhares de serviços organizados por área de expertise
            </p>
          </div>
          <CategoryGrid />
        </div>
      </section>

      {/* Results Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">
              {searchMode === 'services' ? 'Serviços em Destaque' : 'Freelancers Recomendados'}
            </h2>
            <Button variant="outline">Ver Todos</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchMode === 'services' 
              ? mockServices.map((service, index) => (
                  <ServiceCard key={index} {...service} />
                ))
              : mockFreelancers.map((freelancer, index) => (
                  <FreelancerCard key={index} {...freelancer} />
                ))
            }
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Por que escolher nossa plataforma?</h2>
            <p className="text-muted-foreground text-lg">
              Tecnologia de ponta para conectar talentos com oportunidades
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">IA Avançada</h3>
              <p className="text-muted-foreground">
                Algoritmos inteligentes que encontram o match perfeito baseado em suas necessidades específicas
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-success to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Pagamento Seguro</h3>
              <p className="text-muted-foreground">
                Sistema de escrow que protege tanto clientes quanto freelancers em todas as transações
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Qualidade Garantida</h3>
              <p className="text-muted-foreground">
                Todos os freelancers são verificados e avaliados pela comunidade para garantir excelência
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 py-12 border-t">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">ServiçosIA</span>
          </div>
          <p className="text-center text-muted-foreground">
            © 2024 ServiçosIA. Conectando talentos com tecnologia.
          </p>
        </div>
      </footer>
    </div>
  );
}