'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ServiceCard } from "@/components/services/ServiceCard";
import { Footer } from "@/components/Footer";
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

// Mock data
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
    },
    {
      id: "3",
      title: "Mobile App Backend",
      description: "API REST para aplicativo mobile com 100k+ usuários",
      image: "/placeholder.svg",
      link: null,
      tags: ["Node.js", "PostgreSQL", "AWS"]
    }
  ],
  
  experience: [
    {
      title: "Senior Full Stack Developer",
      company: "Tech Startup XYZ",
      period: "2021 - Presente",
      description: "Liderando desenvolvimento de produtos SaaS"
    },
    {
      title: "Full Stack Developer",
      company: "Digital Agency ABC",
      period: "2019 - 2021",
      description: "Desenvolvimento de aplicações web para clientes diversos"
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

// Mock services
const mockServices = [
  {
    title: "Desenvolvimento de Site Responsivo",
    description: "Site profissional responsivo com React e Next.js",
    price: 2500,
    rating: 4.9,
    reviewCount: 45,
    image: "/placeholder.svg",
    tags: ["React", "Next.js", "Responsivo"],
    deliveryTime: 14
  },
  {
    title: "API REST com Node.js",
    description: "API escalável com autenticação e documentação",
    price: 3500,
    rating: 5.0,
    reviewCount: 23,
    image: "/placeholder.svg",
    tags: ["Node.js", "MongoDB", "API"],
    deliveryTime: 21
  }
];

// Mock reviews
const mockReviews = [
  {
    id: "1",
    client: {
      name: "Maria Silva",
      avatar: "/placeholder.svg",
      country: "Brasil"
    },
    rating: 5,
    comment: "Carlos é um profissional excepcional! Entregou o projeto antes do prazo com qualidade impecável. Super recomendo!",
    project: "E-commerce completo",
    date: "há 1 semana"
  },
  {
    id: "2",
    client: {
      name: "João Pereira",
      avatar: "/placeholder.svg",
      country: "Portugal"
    },
    rating: 5,
    comment: "Excelente comunicação e código muito bem estruturado. Foi um prazer trabalhar com o Carlos.",
    project: "Dashboard Analytics",
    date: "há 2 semanas"
  }
];

interface FreelancerProfileProps {
  params: {
    id: string;
  };
}

export default function FreelancerProfile({ params }: FreelancerProfileProps) {
  const { id } = params;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("about");
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 z-40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </header>

      {/* Cover Image */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-primary/20 to-primary/10">
        {mockFreelancer.coverImage && (
          <img
            src={mockFreelancer.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      </div>

      <div className="container mx-auto px-4 -mt-24 relative z-10">
        {/* Profile Header */}
        <div className="bg-card rounded-lg p-6 mb-8 shadow-lg">
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
                    <h1 className="text-2xl font-bold">{mockFreelancer.name}</h1>
                    {mockFreelancer.isVerified && (
                      <CheckCircle className="h-5 w-5 text-blue-500" />
                    )}
                    {mockFreelancer.isPro && (
                      <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">
                        PRO
                      </Badge>
                    )}
                  </div>
                  <p className="text-lg text-muted-foreground mb-3">
                    {mockFreelancer.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
                <Button size="lg">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Enviar Mensagem
                </Button>
                <Button size="lg" variant="outline">
                  Ver Serviços
                </Button>
                {showVideo && (
                  <Button size="lg" variant="outline">
                    <Play className="h-4 w-4 mr-2" />
                    Ver Vídeo
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold">{mockFreelancer.stats.completedProjects}</p>
              <p className="text-sm text-muted-foreground">Projetos Completos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{mockFreelancer.stats.successRate}%</p>
              <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{mockFreelancer.stats.onTimeDelivery}%</p>
              <p className="text-sm text-muted-foreground">Entregas no Prazo</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{mockFreelancer.stats.repeatClients}%</p>
              <p className="text-sm text-muted-foreground">Clientes Recorrentes</p>
            </div>
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
                {/* Bio */}
                <Card>
                  <CardHeader>
                    <CardTitle>Sobre Mim</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {mockFreelancer.bio.split('\n').map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle>Habilidades</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mockFreelancer.skills.map((skill) => (
                      <div key={skill.name}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{skill.name}</span>
                            {skill.verified && (
                              <CheckCircle className="h-4 w-4 text-blue-500" />
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">{skill.level}%</span>
                        </div>
                        <Progress value={skill.level} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Experience */}
                <Card>
                  <CardHeader>
                    <CardTitle>Experiência</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mockFreelancer.experience.map((exp, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                        <div className="flex-1">
                          <h4 className="font-semibold">{exp.title}</h4>
                          <p className="text-sm text-muted-foreground">{exp.company}</p>
                          <p className="text-sm text-muted-foreground">{exp.period}</p>
                          <p className="text-sm mt-1">{exp.description}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Education */}
                <Card>
                  <CardHeader>
                    <CardTitle>Educação</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mockFreelancer.education.map((edu, index) => (
                      <div key={index}>
                        <h4 className="font-semibold">{edu.degree}</h4>
                        <p className="text-sm text-muted-foreground">
                          {edu.institution} • {edu.year}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Certifications */}
                {mockFreelancer.certifications.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Certificações</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {mockFreelancer.certifications.map((cert, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <Award className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{cert.name}</h4>
                                {cert.verified && (
                                  <CheckCircle className="h-4 w-4 text-blue-500" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {cert.issuer} • {cert.date}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="portfolio" className="space-y-6 mt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {mockFreelancer.portfolio.map((project) => (
                    <Card key={project.id} className="overflow-hidden">
                      <div className="aspect-video bg-muted">
                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="pt-4">
                        <h3 className="font-semibold mb-2">{project.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {project.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {project.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          {project.link && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={project.link} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="services" className="space-y-6 mt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {mockServices.map((service, index) => (
                    <ServiceCard
                      key={index}
                      {...service}
                      provider={{
                        name: mockFreelancer.name,
                        avatar: mockFreelancer.avatar,
                        level: mockFreelancer.isPro ? "Pro" : "Standard"
                      }}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Avaliações ({mockFreelancer.stats.totalReviews})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="text-center">
                        <p className="text-4xl font-bold">{mockFreelancer.stats.avgRating}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${
                                i < Math.floor(mockFreelancer.stats.avgRating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <Separator orientation="vertical" className="h-16" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">5 estrelas</span>
                          <Progress value={85} className="flex-1 h-2" />
                          <span className="text-sm text-muted-foreground">85%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">4 estrelas</span>
                          <Progress value={10} className="flex-1 h-2" />
                          <span className="text-sm text-muted-foreground">10%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">3 estrelas</span>
                          <Progress value={3} className="flex-1 h-2" />
                          <span className="text-sm text-muted-foreground">3%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">2 estrelas</span>
                          <Progress value={1} className="flex-1 h-2" />
                          <span className="text-sm text-muted-foreground">1%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">1 estrela</span>
                          <Progress value={1} className="flex-1 h-2" />
                          <span className="text-sm text-muted-foreground">1%</span>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="space-y-4">
                      {mockReviews.map((review) => (
                        <div key={review.id} className="space-y-3">
                          <div className="flex items-start gap-4">
                            <Avatar>
                              <AvatarImage src={review.client.avatar} />
                              <AvatarFallback>
                                {review.client.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <div>
                                  <p className="font-medium">{review.client.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {review.client.country} • {review.date}
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
                              <p className="text-sm text-muted-foreground mt-1">
                                Projeto: {review.project}
                              </p>
                            </div>
                          </div>
                          <Separator />
                        </div>
                      ))}
                    </div>

                    <Button variant="outline" className="w-full mt-6">
                      Ver mais avaliações
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Availability Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Disponibilidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">{mockFreelancer.lastActive}</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {mockFreelancer.availability}
                    </p>
                    <p className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      R$ {mockFreelancer.hourlyRate}/hora
                    </p>
                    <p className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      {mockFreelancer.timezone}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-2">Idiomas</p>
                    <div className="flex flex-wrap gap-2">
                      {mockFreelancer.languages.map((lang) => (
                        <Badge key={lang} variant="secondary">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card>
              <CardContent className="pt-6">
                <Button className="w-full mb-3">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Enviar Mensagem
                </Button>
                <Button variant="outline" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Solicitar Orçamento
                </Button>
              </CardContent>
            </Card>

            {/* Trust Badges */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium text-sm">Identidade Verificada</p>
                      <p className="text-xs text-muted-foreground">
                        Documento confirmado
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-sm">Resposta Rápida</p>
                      <p className="text-xs text-muted-foreground">
                        {mockFreelancer.responseTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="font-medium text-sm">Top Performer</p>
                      <p className="text-xs text-muted-foreground">
                        {mockFreelancer.stats.successRate}% taxa de sucesso
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Member Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informações do Membro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Membro desde</span>
                    <span>{mockFreelancer.memberSince}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total ganho</span>
                    <span>R$ {mockFreelancer.stats.totalEarnings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Projetos completos</span>
                    <span>{mockFreelancer.stats.completedProjects}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}