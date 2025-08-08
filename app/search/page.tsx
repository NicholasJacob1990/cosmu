'use client';

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ServiceCard } from "@/components/services/ServiceCard";
import { FreelancerCard } from "@/components/FreelancerCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Filter, 
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Package,
  Users
} from "lucide-react";
import { Footer } from "@/components/Footer";

// Mock data - replace with API calls
const mockFreelancers = [
  {
    name: "Bruno Oliveira",
    title: "Desenvolvedor Full Stack",
    description: "Especialista em React, Node.js e MongoDB. 5+ anos de experiência criando aplicações web robustas.",
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
    name: "Carla Santos",
    title: "Designer UI/UX",
    description: "Criação de interfaces modernas e experiências digitais memoráveis. Portfolio com 100+ projetos.",
    hourlyRate: 65,
    rating: 4.8,
    reviewCount: 89,
    completedJobs: 67,
    responseTime: "1 hora",
    location: "Rio de Janeiro, RJ",
    avatar: "/placeholder.svg",
    skills: ["Figma", "Sketch", "Adobe XD", "Prototyping", "User Research"],
    isOnline: false,
    isVerified: true
  }
];

const mockServices = [
  {
    title: "Criação de Logo + Identidade Visual",
    description: "Logo profissional, cartão de visita, papel timbrado e manual da marca.",
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
    isFavorite: false
  },
  {
    title: "Desenvolvimento de Website Responsivo",
    description: "Site completo com design moderno, otimizado para SEO e totalmente responsivo.",
    price: 1299,
    rating: 4.7,
    reviewCount: 89,
    provider: {
      name: "Bruno Oliveira",
      avatar: "/placeholder.svg",
      level: "Expert"
    },
    image: "/placeholder.svg",
    tags: ["Website", "React", "Desenvolvimento"],
    isFavorite: false
  }
];

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const [searchType, setSearchType] = useState<'services' | 'freelancers'>(
    (searchParams?.get('mode') as 'services' | 'freelancers') || 'services'
  );
  const [query, setQuery] = useState(searchParams?.get('q') || '');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const searchMode = searchParams?.get('type') || 'traditional';
  const isAISearch = searchMode === 'ai';

  useEffect(() => {
    // Simulate API call
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  }, [searchParams]);

  const categories = [
    "Desenvolvimento",
    "Design",
    "Marketing",
    "Redação",
    "Consultoria",
    "Tradução",
    "Vídeo & Áudio",
    "Saúde"
  ];

  const skills = [
    "React",
    "Node.js",
    "Python",
    "Figma",
    "Photoshop",
    "SEO",
    "WordPress",
    "MongoDB"
  ];

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, category]);
    } else {
      setSelectedCategories(prev => prev.filter(c => c !== category));
    }
  };

  const handleSkillChange = (skill: string, checked: boolean) => {
    if (checked) {
      setSelectedSkills(prev => [...prev, skill]);
    } else {
      setSelectedSkills(prev => prev.filter(s => s !== skill));
    }
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedSkills([]);
    setPriceRange([0, 5000]);
    setSortBy('relevance');
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      if (isAISearch) {
        // Usar busca inteligente com IA
        const params = new URLSearchParams({
          q: query,
          limit: '30'
        });

        if (selectedCategories.length > 0) {
          params.append('category', selectedCategories[0]);
        }
        
        if (priceRange[1] < 5000) {
          params.append('price_max', priceRange[1].toString());
        }

        const response = await fetch(`/api/search/intelligent/?${params.toString()}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('AI Search Results:', data);
          // TODO: Atualizar estado com resultados reais da IA
        } else {
          console.error('Erro na busca IA:', response.status);
        }
      } else {
        // Busca tradicional com Elasticsearch
        await performElasticsearchSearch();
      }
    } catch (error) {
      console.error('Erro na busca:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const performElasticsearchSearch = async () => {
    const params = new URLSearchParams({
      q: query,
      limit: '30',
      offset: '0'
    });

    // Aplicar filtros
    if (selectedCategories.length > 0) {
      params.append('category', selectedCategories[0]);
    }
    
    if (priceRange[1] < 5000) {
      params.append('price_max', priceRange[1].toString());
    }

    if (priceRange[0] > 0) {
      params.append('price_min', priceRange[0].toString());
    }

    selectedSkills.forEach(skill => {
      params.append('skills', skill);
    });

    if (sortBy !== 'relevance') {
      params.append('sort_by', sortBy);
    }

    try {
      let endpoint;
      if (searchType === 'services') {
        endpoint = `/api/search/elasticsearch/services/?${params.toString()}`;
      } else {
        endpoint = `/api/search/elasticsearch/freelancers/?${params.toString()}`;
      }

      const response = await fetch(endpoint);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Elasticsearch Results:', data);
        
        if (data.success && data.results) {
          console.log(`✅ Elasticsearch: ${data.results.length} resultados encontrados em ${data.took}ms`);
          console.log(`📊 Fonte: ${data.source}`);
          console.log(`🔍 Query: "${data.query}"`);
          
          // Log de exemplo dos primeiros resultados
          if (data.results.length > 0) {
            console.log('🎯 Primeiros resultados:', data.results.slice(0, 3));
          }
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Erro na busca Elasticsearch:', response.status, errorData);
      }
    } catch (error) {
      console.error('Erro na busca Elasticsearch:', error);
    }
  };

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex space-x-4">
            <Skeleton className="h-16 w-16 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Search Header */}
      <div className="border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar serviços ou profissionais..."
                className="pl-10 h-12"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} size="lg">
              {isAISearch && <Sparkles className="mr-2 h-4 w-4" />}
              Buscar
            </Button>
          </div>

          {/* Search Type Toggle */}
          <div className="flex items-center gap-4">
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant={searchType === 'services' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSearchType('services')}
                className="flex items-center gap-2"
              >
                <Package className="h-4 w-4" />
                Serviços
              </Button>
              <Button
                variant={searchType === 'freelancers' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSearchType('freelancers')}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Freelancers
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtros
            </Button>

            {isAISearch && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Busca Inteligente
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-80 space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-lg">Filtros</CardTitle>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Price Range */}
                  <div className="space-y-3">
                    <Label>Faixa de Preço</Label>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={5000}
                      step={50}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>R$ {priceRange[0]}</span>
                      <span>R$ {priceRange[1]}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Categories */}
                  <div className="space-y-3">
                    <Label>Categorias</Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {categories.map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={category}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={(checked) => 
                              handleCategoryChange(category, checked as boolean)
                            }
                          />
                          <Label
                            htmlFor={category}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {category}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Skills */}
                  {searchType === 'freelancers' && (
                    <div className="space-y-3">
                      <Label>Habilidades</Label>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {skills.map((skill) => (
                          <div key={skill} className="flex items-center space-x-2">
                            <Checkbox
                              id={skill}
                              checked={selectedSkills.includes(skill)}
                              onCheckedChange={(checked) => 
                                handleSkillChange(skill, checked as boolean)
                              }
                            />
                            <Label
                              htmlFor={skill}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {skill}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Results */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  {query ? `Resultados para "${query}"` : 'Todos os resultados'}
                </h1>
                <p className="text-muted-foreground">
                  {searchType === 'services' ? mockServices.length : mockFreelancers.length} {searchType === 'services' ? 'serviços' : 'freelancers'} encontrados
                </p>
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Mais Relevantes</SelectItem>
                  <SelectItem value="rating">Melhor Avaliados</SelectItem>
                  <SelectItem value="price-low">Menor Preço</SelectItem>
                  <SelectItem value="price-high">Maior Preço</SelectItem>
                  <SelectItem value="newest">Mais Recentes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters */}
            {(selectedCategories.length > 0 || selectedSkills.length > 0) && (
              <div className="flex items-center gap-2 mb-6 flex-wrap">
                <span className="text-sm text-muted-foreground">Filtros ativos:</span>
                {selectedCategories.map((category) => (
                  <Badge key={category} variant="secondary" className="flex items-center gap-1">
                    {category}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleCategoryChange(category, false)}
                    />
                  </Badge>
                ))}
                {selectedSkills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleSkillChange(skill, false)}
                    />
                  </Badge>
                ))}
              </div>
            )}

            {/* Results Grid */}
            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              <div className="space-y-6">
                {searchType === 'services' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockServices.map((service, index) => (
                      <ServiceCard key={index} {...service} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mockFreelancers.map((freelancer, index) => (
                      <FreelancerCard key={index} {...freelancer} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button variant="outline" size="sm" disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              
              {[1, 2, 3, 4, 5].map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
              
              <Button variant="outline" size="sm">
                Próximo
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}