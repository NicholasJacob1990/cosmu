'use client';

import { useState, useEffect } from "react";
import { SearchToggle } from "@/components/SearchToggle";
import { FreelancerCard } from "@/components/FreelancerCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Footer } from "@/components/Footer";
import { ArrowLeft, Filter } from "lucide-react";
import Link from "next/link";

export default function Freelancers() {
  const [searchResults, setSearchResults] = useState(() => [
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
    },
    {
      name: "Carlos Mendes",
      title: "Designer Gráfico",
      description: "Criativo experiente em branding, design editorial e identidade visual. Trabalho com marcas de todos os tamanhos, desde startups até grandes corporações.",
      hourlyRate: 60,
      rating: 4.7,
      reviewCount: 78,
      completedJobs: 45,
      responseTime: "4 horas",
      location: "Belo Horizonte, MG",
      avatar: "/placeholder.svg",
      skills: ["Adobe Creative Suite", "Branding", "Print Design", "Logo Design"],
      isOnline: true,
      isVerified: true
    }
  ]);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const handleSearch = (query: string, isAI: boolean) => {
    console.log(`Searching for: ${query} (AI: ${isAI})`);
    // Here you would implement the actual search logic
  };

  const handleSort = (value: string) => {
    console.log(`Sorting by: ${value}`);
    // Implement sorting logic
  };

  const handleFilterChange = (filter: string, checked: boolean) => {
    console.log(`Filter ${filter}: ${checked}`);
    // Implement filter logic
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao início
            </Link>
            <h1 className="text-2xl font-bold galaxia-text-gradient">Encontre Profissionais</h1>
            <div className="w-40" /> {/* Spacer */}
          </div>
        </div>
      </header>

      {/* Search Section */}
      <section className="py-8 bg-gradient-to-br from-galaxia-grad-a/5 via-galaxia-grad-b/5 to-galaxia-grad-c/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <SearchToggle onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* Filters and Results */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className={`lg:w-1/4 ${filtersVisible ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-card rounded-xl p-6 sticky top-28 border border-border/40">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros
                </h3>
                <Button variant="ghost" size="sm" className="text-sm">
                  Limpar
                </Button>
              </div>
              
              {/* Sort Options */}
              <div className="mb-6 space-y-2">
                <Label>Ordenar por</Label>
                <Select onValueChange={handleSort} defaultValue="rating">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Melhor avaliação</SelectItem>
                    <SelectItem value="price-asc">Menor preço</SelectItem>
                    <SelectItem value="price-desc">Maior preço</SelectItem>
                    <SelectItem value="recent">Mais recentes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="mb-6 space-y-4">
                <Label className="text-sm font-medium">
                  Preço por hora
                </Label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={500}
                  step={10}
                />
                <div className="text-sm text-muted-foreground text-center">
                  R$ {priceRange[0]} - R$ {priceRange[1]}
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6 space-y-3">
                <Label className="text-sm font-medium">Categorias</Label>
                {["Desenvolvimento", "Design", "Marketing", "Escrita", "Consultoria"].map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox 
                      id={category}
                      onCheckedChange={(checked) => handleFilterChange(category, !!checked)}
                    />
                    <Label htmlFor={category} className="text-sm font-normal">{category}</Label>
                  </div>
                ))}
              </div>

              {/* Location */}
              <div className="mb-6 space-y-3">
                <Label className="text-sm font-medium">Localização</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a cidade..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sp">São Paulo, SP</SelectItem>
                    <SelectItem value="rj">Rio de Janeiro, RJ</SelectItem>
                    <SelectItem value="mg">Belo Horizonte, MG</SelectItem>
                    <SelectItem value="remote">Remoto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Verification Status */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Status</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox id="verified" />
                  <Label htmlFor="verified" className="text-sm font-normal">Verificado</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="online" />
                  <Label htmlFor="online" className="text-sm font-normal">Online agora</Label>
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <main className="flex-1">
             <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">
                  {searchResults.length} profissionais encontrados
                </p>
                <Button
                  variant="outline"
                  onClick={() => setFiltersVisible(!filtersVisible)}
                  className="lg:hidden"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
              </Button>
              </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {searchResults.map((freelancer, index) => (
                <FreelancerCard
                  key={index}
                  {...freelancer}
                />
              ))}
            </div>

            {/* Load More Button */}
            <div className="mt-12 flex justify-center">
               <Button variant="outline" size="lg">
                  Carregar Mais Profissionais
                </Button>
            </div>
          </main>
        </div>
      </div>
      </section>
      <Footer />
    </div>
  );
}