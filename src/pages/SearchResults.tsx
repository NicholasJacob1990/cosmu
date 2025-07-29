import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ServiceCard } from "@/components/ServiceCard";
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
  // Add more mock data as needed
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
  // Add more mock data as needed
];

export function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchType, setSearchType] = useState<'services' | 'freelancers'>(
    searchParams.get('mode') as 'services' | 'freelancers' || 'services'
  );
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const searchMode = searchParams.get('type') || 'traditional';
  const isAISearch = searchMode === 'ai';

  useEffect(() => {
    // Simulate API call
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  }, [searchParams]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    params.set('q', query);
    params.set('type', searchMode);
    params.set('mode', searchType);
    setSearchParams(params);
  };

  const categories = [
    "Desenvolvimento",
    "Design",
    "Marketing",
    "Redação",
    "Vídeo",
    "Tradução"
  ];

  const skills = [
    "React", "Node.js", "Python", "JavaScript", "TypeScript",
    "Figma", "Photoshop", "WordPress", "SEO", "Google Ads"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 z-40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-2xl">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Buscar serviços ou freelancers..."
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleSearch}>
                  Buscar
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={searchType === 'services' ? 'default' : 'outline'}
                onClick={() => setSearchType('services')}
                size="sm"
              >
                <Package className="h-4 w-4 mr-2" />
                Serviços
              </Button>
              <Button
                variant={searchType === 'freelancers' ? 'default' : 'outline'}
                onClick={() => setSearchType('freelancers')}
                size="sm"
              >
                <Users className="h-4 w-4 mr-2" />
                Freelancers
              </Button>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <aside className="w-80 shrink-0">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Filtros</CardTitle>
                  <Button variant="ghost" size="sm">
                    Limpar
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
                      className="mt-2"
                    />
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>R$ {priceRange[0]}</span>
                      <span>R$ {priceRange[1]}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Categories */}
                  <div className="space-y-3">
                    <Label>Categorias</Label>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={category}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedCategories([...selectedCategories, category]);
                              } else {
                                setSelectedCategories(selectedCategories.filter(c => c !== category));
                              }
                            }}
                          />
                          <label
                            htmlFor={category}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Skills */}
                  <div className="space-y-3">
                    <Label>Habilidades</Label>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant={selectedSkills.includes(skill) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            if (selectedSkills.includes(skill)) {
                              setSelectedSkills(selectedSkills.filter(s => s !== skill));
                            } else {
                              setSelectedSkills([...selectedSkills, skill]);
                            }
                          }}
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Sort */}
                  <div className="space-y-3">
                    <Label>Ordenar por</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevância</SelectItem>
                        <SelectItem value="price_low">Menor Preço</SelectItem>
                        <SelectItem value="price_high">Maior Preço</SelectItem>
                        <SelectItem value="rating">Melhor Avaliação</SelectItem>
                        <SelectItem value="newest">Mais Recente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </aside>
          )}

          {/* Results */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">
                    {isAISearch && (
                      <Badge variant="secondary" className="mr-2">
                        <Sparkles className="h-3 w-3 mr-1" />
                        IA
                      </Badge>
                    )}
                    Resultados para "{searchParams.get('q')}"
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    {searchType === 'services' ? '24 serviços encontrados' : '18 freelancers encontrados'}
                  </p>
                </div>
              </div>

              {isAISearch && (
                <Card className="mt-4 border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/20">
                  <CardContent className="pt-6">
                    <div className="flex gap-3">
                      <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Análise da IA:</p>
                        <p className="text-sm text-muted-foreground">
                          Com base na sua busca, identificamos profissionais especializados em desenvolvimento web 
                          com React e Node.js, com experiência comprovada em projetos similares. 
                          Os resultados foram ordenados por compatibilidade com suas necessidades.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Results Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-40 w-full mb-4" />
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-full mb-2" />
                      <Skeleton className="h-3 w-full mb-4" />
                      <Skeleton className="h-8 w-20" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchType === 'services' 
                    ? mockServices.map((service, index) => (
                        <ServiceCard key={index} {...service} />
                      ))
                    : mockFreelancers.map((freelancer, index) => (
                        <FreelancerCard key={index} {...freelancer} />
                      ))
                  }
                </div>

                {/* Pagination */}
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
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
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}