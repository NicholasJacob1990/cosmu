'use client';

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ServiceCard } from "@/components/services/ServiceCard";
import { Footer } from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  CheckCircle,
  Award,
  Briefcase,
  Calendar,
  MessageSquare,
  Share2,
  MoreVertical,
  Globe,
  Zap,
  TrendingUp,
  DollarSign,
  Users,
  FileText,
  Play,
  ExternalLink
} from "lucide-react";

// Mock data - em um app real, isso viria de uma API
const mockFreelancer = {
  id: "1",
  name: "Carlos Santos",
  title: "Desenvolvedor Full Stack | React & Node.js Expert",
  avatar: "/placeholder.svg",
  coverImage: "/placeholder.svg",
  location: "São Paulo, SP",
  memberSince: "Janeiro 2022",
  lastActive: "Online agora",
  responseTime: "Responde em ~1 hora",
  languages: ["Português", "Inglês", "Espanhol"],
  timezone: "GMT-3",
  isVerified: true,
  isPro: true,
  bio: `Desenvolvedor Full Stack com mais de 8 anos de experiência criando soluções web escaláveis e modernas. 
  
Especializado em React, Node.js, TypeScript e cloud computing (AWS/GCP). Tenho paixão por transformar ideias em produtos digitais de sucesso.

Já trabalhei com startups e grandes empresas, sempre focado em entregar código limpo, bem documentado e seguindo as melhores práticas do mercado.`,
  
  stats: {
    completedProjects: 342,
    successRate: 98,
    repeatClients: 45,
    totalEarnings: 285000,
    avgRating: 4.9,
    totalReviews: 189,
    onTimeDelivery: 96
  },
  
  skills: [
    { name: "React", level: 95, verified: true },
    { name: "Node.js", level: 92, verified: true },
    { name: "TypeScript", level: 90, verified: true },
    { name: "MongoDB", level: 85, verified: false },
    { name: "AWS", level: 80, verified: true },
    { name: "Next.js", level: 88, verified: false },
    { name: "GraphQL", level: 75, verified: false },
    { name: "Docker", level: 70, verified: false }
  ],
  
  certifications: [
    {
      name: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      date: "2023",
      verified: true
    },
    {
      name: "React Advanced Patterns",
      issuer: "Epic React",
      date: "2022",
      verified: true
    }
  ],
  
  portfolio: [
    {
      id: "1",
      title: "E-commerce Platform",
      description: "Plataforma completa com React, Node.js e MongoDB",
      image: "/placeholder.svg",
      link: "https://example.com",
      tags: ["React", "Node.js", "E-commerce"]
    },
    {
      id: "2",
      title: "SaaS Dashboard",
      description: "Dashboard analytics com gráficos em tempo real",
      image: "/placeholder.svg",
      link: "https://example.com",
      tags: ["React", "TypeScript", "Charts"]
    }
  ],
  
  experience: [
    {
      title: "Senior Full Stack Developer",
      company: "Tech Startup XYZ",
      period: "2021 - Presente",
      description: "Liderando desenvolvimento de produtos SaaS"
    }
  ],
  
  education: [
    {
      degree: "Bacharelado em Ciência da Computação",
      institution: "USP - Universidade de São Paulo",
      year: "2018"
    }
  ],
  
  hourlyRate: 120,
  availability: "Disponível para novos projetos"
};

const mockServices = [
  {
    id: 'service-1',
    title: "Desenvolvimento de Site Responsivo",
    price: 2500,
    rating: 4.9,
    reviews: 45,
    image: "/placeholder.svg",
    professional: {
      name: mockFreelancer.name,
      avatarUrl: mockFreelancer.avatar,
      level: mockFreelancer.isPro ? "Elite Pro" : "Top Rated"
    }
  },
  {
    id: 'service-2',
    title: "API REST com Node.js",
    price: 3500,
    rating: 5.0,
    reviews: 23,
    image: "/placeholder.svg",
    professional: {
      name: mockFreelancer.name,
      avatarUrl: mockFreelancer.avatar,
      level: mockFreelancer.isPro ? "Elite Pro" : "Top Rated"
    }
  }
];

const mockReviews = [
  {
    id: "1",
    client: { name: "Maria Silva", avatar: "/placeholder.svg", country: "Brasil" },
    rating: 5,
    comment: "Carlos é um profissional excepcional! Entregou o projeto antes do prazo com qualidade impecável. Super recomendo!",
    project: "E-commerce completo",
    date: "há 1 semana"
  },
  {
    id: "2",
    client: { name: "João Pereira", avatar: "/placeholder.svg", country: "Portugal" },
    rating: 5,
    comment: "Excelente comunicação e código muito bem estruturado. Foi um prazer trabalhar com o Carlos.",
    project: "Dashboard Analytics",
    date: "há 2 semanas"
  }
];

export default function FreelancerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("about");
  const [showVideo, setShowVideo] = useState(false);

  // Em um app real, você usaria o `params.id` para buscar os dados do freelancer
  const id = params.id;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 z-40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-galaxia-text-muted hover:text-galaxia-neon"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </header>

      {/* Cover Image */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-galaxia-grad-a/20 to-galaxia-grad-b/10">
        <Image
          src={mockFreelancer.coverImage}
          alt="Cover"
          fill
          style={{ objectFit: 'cover' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      </div>

      <div className="container mx-auto px-4 -mt-24 relative z-10">
        {/* Profile Header */}
        <div className="bg-card rounded-lg p-6 mb-8 shadow-lg border-border/20">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-32 w-32 border-4 border-background">
              <AvatarImage src={mockFreelancer.avatar} />
              <AvatarFallback>
                {mockFreelancer.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-galaxia-text-primary">{mockFreelancer.name}</h1>
                    {mockFreelancer.isVerified && (
                      <CheckCircle className="h-5 w-5 text-galaxia-neon fill-galaxia-neon/20" />
                    )}
                    {mockFreelancer.isPro && (
                      <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                        PRO
                      </Badge>
                    )}
                  </div>
                  <p className="text-lg text-galaxia-text-muted mb-3">
                    {mockFreelancer.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-galaxia-text-muted">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {mockFreelancer.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {mockFreelancer.responseTime}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{mockFreelancer.stats.avgRating}</span>
                      <span>({mockFreelancer.stats.totalReviews} avaliações)</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button size="lg" className="bg-gradient-to-r from-galaxia-magenta to-galaxia-neon text-white shadow-galaxia-glow">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Enviar Mensagem
                </Button>
                <Button size="lg" variant="outline">
                  Ver Serviços
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-border/20">
            {Object.entries({
              "Projetos Completos": mockFreelancer.stats.completedProjects,
              "Taxa de Sucesso": `${mockFreelancer.stats.successRate}%`,
              "Entregas no Prazo": `${mockFreelancer.stats.onTimeDelivery}%`,
              "Clientes Recorrentes": `${mockFreelancer.stats.repeatClients}%`
            }).map(([label, value]) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-bold text-galaxia-text-primary">{value}</p>
                <p className="text-sm text-galaxia-text-muted">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="about">Sobre</TabsTrigger>
                <TabsTrigger value="portfolio">Portfólio</TabsTrigger>
                <TabsTrigger value="services">Serviços</TabsTrigger>
                <TabsTrigger value="reviews">Avaliações</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-6 mt-6">
                <Card>
                  <CardHeader><CardTitle>Sobre Mim</CardTitle></CardHeader>
                  <CardContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none text-galaxia-text-muted">
                      {mockFreelancer.bio.split('\n').map((p, i) => <p key={i}>{p}</p>)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Habilidades</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {mockFreelancer.skills.map(s => (
                      <div key={s.name}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-galaxia-text-primary">{s.name}</span>
                            {s.verified && <CheckCircle className="h-4 w-4 text-galaxia-neon" />}
                          </div>
                          <span className="text-sm text-galaxia-text-muted">{s.level}%</span>
                        </div>
                        <Progress value={s.level} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="portfolio" className="mt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {mockFreelancer.portfolio.map(p => (
                    <Card key={p.id} className="overflow-hidden">
                      <div className="relative aspect-video">
                        <Image src={p.image} alt={p.title} fill style={{ objectFit: 'cover' }} />
                      </div>
                      <CardContent className="pt-4">
                        <h3 className="font-semibold mb-2 text-galaxia-text-primary">{p.title}</h3>
                        <p className="text-sm text-galaxia-text-muted mb-3">{p.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {p.tags.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}
                          </div>
                          {p.link && <Button variant="ghost" size="sm" asChild>
                            <a href={p.link} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /></a>
                          </Button>}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="services" className="mt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {mockServices.map((s, i) => <ServiceCard key={i} service={s} layout="grid" isSelected={false} onSelect={() => {}} />)}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <Card>
                  <CardHeader><CardTitle>Avaliações ({mockFreelancer.stats.totalReviews})</CardTitle></CardHeader>
                  <CardContent>
                    {mockReviews.map(r => (
                      <div key={r.id} className="py-4 border-b border-border/20 last:border-b-0">
                        <div className="flex items-start gap-4">
                          <Avatar>
                            <AvatarImage src={r.client.avatar} />
                            <AvatarFallback>{r.client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <div>
                                <p className="font-medium text-galaxia-text-primary">{r.client.name}</p>
                                <p className="text-sm text-galaxia-text-muted">{r.client.country} • {r.date}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />)}
                              </div>
                            </div>
                            <p className="text-sm text-galaxia-text-muted">{r.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Disponibilidade</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-galaxia-text-primary">{mockFreelancer.lastActive}</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-galaxia-text-muted" />{mockFreelancer.availability}</p>
                    <p className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-galaxia-text-muted" />R$ {mockFreelancer.hourlyRate}/hora</p>
                    <p className="flex items-center gap-2"><Globe className="h-4 w-4 text-galaxia-text-muted" />{mockFreelancer.timezone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Button className="w-full mb-3 bg-gradient-to-r from-galaxia-magenta to-galaxia-neon text-white shadow-galaxia-glow">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Enviar Mensagem
                </Button>
                <Button variant="outline" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Solicitar Orçamento
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
