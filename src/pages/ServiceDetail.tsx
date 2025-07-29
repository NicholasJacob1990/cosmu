import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Footer } from "@/components/Footer";
import { 
  Star, 
  Clock, 
  CheckCircle, 
  Package,
  Shield,
  Heart,
  Share2,
  Flag,
  MessageSquare,
  Calendar,
  Award,
  Zap,
  Users,
  ArrowLeft
} from "lucide-react";

// Mock data - replace with API call
const mockService = {
  id: "1",
  title: "Desenvolvimento de Site Responsivo com React",
  slug: "desenvolvimento-site-responsivo-react",
  description: `Crio sites modernos e responsivos usando React, Next.js e as melhores práticas do mercado.

## O que está incluído:
- Design responsivo para todos os dispositivos
- Otimização para SEO
- Integração com APIs
- Deploy em servidor de sua escolha
- Código limpo e bem documentado

## Processo de trabalho:
1. Análise dos requisitos
2. Criação do protótipo
3. Desenvolvimento
4. Testes e ajustes
5. Entrega e deploy

Trabalho com metodologias ágeis e mantenho você atualizado durante todo o processo.`,
  price: 2500,
  deliveryTime: 14,
  revisions: 3,
  images: [
    "/placeholder.svg",
    "/placeholder.svg",
    "/placeholder.svg"
  ],
  features: [
    "Site com até 10 páginas",
    "Design responsivo",
    "SEO otimizado",
    "Integração com Analytics",
    "Formulário de contato",
    "1 mês de suporte"
  ],
  tags: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
  orderCount: 127,
  rating: 4.9,
  reviewCount: 89,
  freelancer: {
    id: "1",
    name: "Carlos Santos",
    avatar: "/placeholder.svg",
    title: "Desenvolvedor Full Stack Senior",
    level: "Pro",
    memberSince: "2022",
    responseTime: "1 hora",
    lastDelivery: "há 2 dias",
    completedOrders: 342,
    rating: 4.9,
    languages: ["Português", "Inglês"],
    skills: ["React", "Node.js", "TypeScript", "AWS"],
    isOnline: true,
    isVerified: true
  },
  tiers: [
    {
      name: "basic",
      title: "Básico",
      price: 1500,
      deliveryTime: 7,
      description: "Site simples com até 5 páginas",
      features: {
        pages: "Até 5 páginas",
        responsive: true,
        seo: false,
        analytics: false,
        forms: "1 formulário",
        support: "2 semanas",
        revisions: 2
      }
    },
    {
      name: "standard",
      title: "Padrão",
      price: 2500,
      deliveryTime: 14,
      description: "Site completo com até 10 páginas",
      features: {
        pages: "Até 10 páginas",
        responsive: true,
        seo: true,
        analytics: true,
        forms: "3 formulários",
        support: "1 mês",
        revisions: 3
      }
    },
    {
      name: "premium",
      title: "Premium",
      price: 5000,
      deliveryTime: 21,
      description: "Site avançado com funcionalidades customizadas",
      features: {
        pages: "Páginas ilimitadas",
        responsive: true,
        seo: true,
        analytics: true,
        forms: "Ilimitados",
        support: "3 meses",
        revisions: 5,
        custom: "Funcionalidades customizadas"
      }
    }
  ]
};

// Mock reviews
const mockReviews = [
  {
    id: "1",
    reviewer: {
      name: "Ana Silva",
      avatar: "/placeholder.svg",
      country: "Brasil"
    },
    rating: 5,
    comment: "Excelente profissional! Entregou o projeto antes do prazo e com qualidade excepcional. Super recomendo!",
    date: "há 1 semana",
    project: "Website corporativo"
  },
  {
    id: "2",
    reviewer: {
      name: "João Pereira",
      avatar: "/placeholder.svg",
      country: "Portugal"
    },
    rating: 4,
    comment: "Muito bom trabalho. Apenas alguns ajustes foram necessários após a entrega, mas o suporte foi excelente.",
    date: "há 2 semanas",
    project: "E-commerce"
  }
];

export function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedTier, setSelectedTier] = useState("standard");
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const currentTier = mockService.tiers.find(t => t.name === selectedTier);

  const ratingBreakdown = {
    5: 78,
    4: 15,
    3: 5,
    2: 1,
    1: 1
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 z-40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title and Actions */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{mockService.title}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{mockService.rating}</span>
                    <span>({mockService.reviewCount})</span>
                  </div>
                  <Separator orientation="vertical" className="h-4" />
                  <span>{mockService.orderCount} pedidos</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsFavorite(!isFavorite)}
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <img
                  src={mockService.images[selectedImage]}
                  alt={mockService.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {mockService.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${mockService.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Description Tabs */}
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="about">Sobre</TabsTrigger>
                <TabsTrigger value="seller">Vendedor</TabsTrigger>
                <TabsTrigger value="reviews">Avaliações</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="space-y-6 mt-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Descrição do Serviço</h3>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {mockService.description.split('\n').map((paragraph, index) => (
                      paragraph.startsWith('##') ? (
                        <h4 key={index} className="text-base font-semibold mt-4 mb-2">
                          {paragraph.replace('## ', '')}
                        </h4>
                      ) : paragraph.startsWith('-') ? (
                        <li key={index} className="ml-4">
                          {paragraph.replace('- ', '')}
                        </li>
                      ) : paragraph.match(/^\d\./) ? (
                        <li key={index} className="ml-4">
                          {paragraph}
                        </li>
                      ) : paragraph ? (
                        <p key={index}>{paragraph}</p>
                      ) : null
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {mockService.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="seller" className="space-y-6 mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={mockService.freelancer.avatar} />
                        <AvatarFallback>
                          {mockService.freelancer.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{mockService.freelancer.name}</h3>
                          {mockService.freelancer.isVerified && (
                            <CheckCircle className="h-4 w-4 text-blue-500" />
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {mockService.freelancer.level}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          {mockService.freelancer.title}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Membro desde</p>
                            <p className="font-medium">{mockService.freelancer.memberSince}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Tempo de resposta</p>
                            <p className="font-medium">{mockService.freelancer.responseTime}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Última entrega</p>
                            <p className="font-medium">{mockService.freelancer.lastDelivery}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Pedidos completos</p>
                            <p className="font-medium">{mockService.freelancer.completedOrders}</p>
                          </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Idiomas</p>
                            <div className="flex gap-2">
                              {mockService.freelancer.languages.map((lang) => (
                                <Badge key={lang} variant="outline">
                                  {lang}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Habilidades</p>
                            <div className="flex flex-wrap gap-2">
                              {mockService.freelancer.skills.map((skill) => (
                                <Badge key={skill} variant="secondary">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <Button className="w-full mt-6" variant="outline">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Enviar Mensagem
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reviews" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      Avaliações ({mockService.reviewCount})
                    </h3>
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-2xl font-bold">{mockService.rating}</span>
                    </div>
                  </div>

                  {/* Rating Breakdown */}
                  <Card>
                    <CardContent className="pt-6 space-y-2">
                      {Object.entries(ratingBreakdown).reverse().map(([stars, percentage]) => (
                        <div key={stars} className="flex items-center gap-3">
                          <span className="text-sm w-4">{stars}</span>
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Progress value={percentage} className="flex-1 h-2" />
                          <span className="text-sm text-muted-foreground w-12 text-right">
                            {percentage}%
                          </span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Reviews List */}
                  <div className="space-y-4">
                    {mockReviews.map((review) => (
                      <Card key={review.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <Avatar>
                              <AvatarImage src={review.reviewer.avatar} />
                              <AvatarFallback>
                                {review.reviewer.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <p className="font-medium">{review.reviewer.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {review.reviewer.country} • {review.date}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < review.rating
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-muted-foreground'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-sm">{review.comment}</p>
                              <p className="text-sm text-muted-foreground mt-2">
                                Projeto: {review.project}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Button variant="outline" className="w-full">
                    Ver mais avaliações
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Pricing */}
          <div className="lg:sticky lg:top-24 h-fit space-y-6">
            {/* Package Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Selecione um Pacote</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={selectedTier} onValueChange={setSelectedTier}>
                  <TabsList className="grid w-full grid-cols-3">
                    {mockService.tiers.map((tier) => (
                      <TabsTrigger key={tier.name} value={tier.name}>
                        {tier.title}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {mockService.tiers.map((tier) => (
                    <TabsContent key={tier.name} value={tier.name} className="space-y-4 mt-6">
                      <div>
                        <div className="flex items-baseline justify-between mb-2">
                          <h3 className="text-2xl font-bold">R$ {tier.price}</h3>
                          <Badge variant="secondary">{tier.title}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{tier.description}</p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>Entrega em {tier.deliveryTime} dias</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-muted-foreground" />
                          <span>{tier.features.revisions} revisões</span>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        {Object.entries(tier.features).map(([key, value]) => {
                          if (key === 'revisions') return null;
                          return (
                            <div key={key} className="flex items-center gap-2 text-sm">
                              <CheckCircle className={`h-4 w-4 ${
                                value === true || value ? 'text-green-500' : 'text-muted-foreground'
                              }`} />
                              <span className={value === false ? 'line-through text-muted-foreground' : ''}>
                                {key === 'pages' && value}
                                {key === 'responsive' && 'Design responsivo'}
                                {key === 'seo' && 'Otimização SEO'}
                                {key === 'analytics' && 'Google Analytics'}
                                {key === 'forms' && value}
                                {key === 'support' && `Suporte por ${value}`}
                                {key === 'custom' && value}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <Button className="w-full" size="lg">
                        Continuar (R$ {tier.price})
                      </Button>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>

            {/* Trust Badges */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium text-sm">Pagamento Seguro</p>
                      <p className="text-xs text-muted-foreground">
                        Seu pagamento fica protegido até a entrega
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-sm">Entrega Garantida</p>
                      <p className="text-xs text-muted-foreground">
                        Ou seu dinheiro de volta
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="font-medium text-sm">Qualidade Verificada</p>
                      <p className="text-xs text-muted-foreground">
                        Freelancer com histórico comprovado
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Report */}
            <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
              <Flag className="h-4 w-4 mr-2" />
              Denunciar este serviço
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}