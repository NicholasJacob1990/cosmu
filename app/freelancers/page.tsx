'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

// Mock data
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

export default function FreelancersPage() {
  const router = useRouter();
  const [freelancers, setFreelancers] = useState(mockFreelancers);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");
  const [hourlyRange, setHourlyRange] = useState([0, 200]);
  const [filters, setFilters] = useState({
    verified: false,
    online: false,
    proLevel: false,
  });

  const handleSearch = (query: string, isAI: boolean) => {
    console.log(`Searching for: ${query} (AI: ${isAI})`);
    // Implement search logic
  };

  const handleSort = (value: string) => {
    setSortBy(value);
    // Implement sorting logic
  };

  const handleFilterChange = (filter: string, checked: boolean) => {
    setFilters(prev => ({ ...prev, [filter]: checked }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao início
            </Link>
            <h1 className="text-2xl font-bold">Todos os Profissionais</h1>
            <div className="w-20" /> {/* Spacer for centering */}
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
            <div className="lg:w-1/4">
              <div className="sticky top-20 space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="h-5 w-5" />
                  <h2 className="text-lg font-semibold">Filtros</h2>
                </div>

                {/* Skills Filter */}
                <div className="space-y-2">
                  <Label>Habilidades</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione habilidades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="react">React</SelectItem>
                      <SelectItem value="nodejs">Node.js</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Hourly Rate Range */}
                <div className="space-y-2">
                  <Label>Valor por Hora</Label>
                  <div className="px-2 py-4">
                    <Slider
                      value={hourlyRange}
                      onValueChange={setHourlyRange}
                      max={200}
                      step={5}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>R$ {hourlyRange[0]}/h</span>
                      <span>R$ {hourlyRange[1]}/h</span>
                    </div>
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="verified"
                      checked={filters.verified}
                      onCheckedChange={(checked) => handleFilterChange('verified', checked as boolean)}
                    />
                    <Label htmlFor="verified" className="cursor-pointer">
                      Apenas Verificados
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="online"
                      checked={filters.online}
                      onCheckedChange={(checked) => handleFilterChange('online', checked as boolean)}
                    />
                    <Label htmlFor="online" className="cursor-pointer">
                      Online Agora
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="proLevel"
                      checked={filters.proLevel}
                      onCheckedChange={(checked) => handleFilterChange('proLevel', checked as boolean)}
                    />
                    <Label htmlFor="proLevel" className="cursor-pointer">
                      Nível Pro ou Superior
                    </Label>
                  </div>
                </div>

                {/* Sort Options */}
                <div className="space-y-2">
                  <Label>Ordenar por</Label>
                  <Select value={sortBy} onValueChange={handleSort}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevância</SelectItem>
                      <SelectItem value="rate_low">Menor Valor/Hora</SelectItem>
                      <SelectItem value="rate_high">Maior Valor/Hora</SelectItem>
                      <SelectItem value="rating">Melhor Avaliação</SelectItem>
                      <SelectItem value="jobs">Mais Trabalhos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear Filters */}
                <Button variant="outline" className="w-full">
                  Limpar Filtros
                </Button>
              </div>
            </div>

            {/* Results */}
            <div className="lg:w-3/4">
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">
                  {freelancers.length} profissionais encontrados
                </p>
                <div className="flex gap-2">
                  <Badge variant="secondary">Elite</Badge>
                  <Badge variant="secondary">Resposta Rápida</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {freelancers.map((freelancer, index) => (
                  <FreelancerCard key={index} {...freelancer} />
                ))}
              </div>

              {/* Load More */}
              <div className="mt-8 text-center">
                <Button variant="outline" size="lg">
                  Carregar Mais Profissionais
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}