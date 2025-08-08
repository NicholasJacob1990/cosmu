'use client';

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header"; 
import { FiltersSidebar } from "@/components/services/FiltersSidebar";
import { ServiceCard } from "@/components/services/ServiceCard";
import { ServiceCardSkeleton } from "@/components/services/ServiceCardSkeleton";
import { SortOptions } from "@/components/services/SortOptions";
import { Pagination } from "@/components/ui/pagination";
import { ComparisonBar } from "@/components/services/ComparisonBar";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

// Mock Data (simula uma chamada de API)
const mockServices = Array.from({ length: 24 }, (_, i) => ({
  id: `service_${i + 1}`,
  title: `Logo Incrível para Startup de Tecnologia ${i + 1}`,
  category: i % 3 === 0 ? "Design Gráfico" : i % 3 === 1 ? "Desenvolvimento" : "Marketing",
  professional: {
    name: `Ana Creative ${i + 1}`,
    level: i % 4 === 0 ? "Top Rated" : i % 4 === 1 ? "Rising Talent" : "Elite Pro",
    avatarUrl: `https://i.pravatar.cc/40?u=prof${i}`,
  },
  rating: parseFloat((Math.random() * (5 - 4.5) + 4.5).toFixed(1)),
  reviews: Math.floor(Math.random() * 200) + 10,
  price: Math.floor(Math.random() * 500) + 50,
  image: `https://picsum.photos/400/300?random=${i}`,
  isFavorite: i % 5 === 0,
}));


export default function Services() {
  const router = useRouter();
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    priceRange: [0, 1000],
    rating: 0,
  });

  // Hook para buscar serviços da API real
  const { data: servicesData, isLoading, error, isFetching } = useQuery({
    queryKey: ['services', searchQuery, filters],
    queryFn: async () => {
      try {
        if (searchQuery?.trim()) {
          return await api.services.search(searchQuery, filters);
        } else {
          return await api.services.list(filters);
        }
      } catch (error) {
        console.error('Erro ao buscar serviços:', error);
        // Retornar mock data em caso de erro para desenvolvimento
        return { data: mockServices };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    enabled: true, // Sempre habilitado
    placeholderData: { data: mockServices }, // Dados enquanto carrega
    retry: (failureCount, error: any) => {
      // Não retry para erros de client (4xx)
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 2;
    }
  });

  // Usar dados da API ou fallback para mock com validação
  const services = (servicesData?.data?.results || servicesData?.data || mockServices || [])
    .filter((service: any) => service && service.id); // Filtrar objetos inválidos

  const handleSelectService = (serviceId: string) => {
    setSelectedIds(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };
  
  const handleCompare = () => {
    router.push(`/compare?ids=${selectedIds.join(',')}`);
  };

  const selectedServicesData = services.filter((s: any) => selectedIds.includes(s.id));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Encontrar Serviços</h1>
          <p className="text-muted-foreground">
            Descubra os melhores profissionais para seu projeto
          </p>
        </div>

        {/* Filters and Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Mobile Filter Button */}
            <div className="lg:hidden">
              <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filtros
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filtros</SheetTitle>
                    <SheetDescription>
                      Refine sua busca por serviços
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <FiltersSidebar 
                      filters={filters} 
                      onFiltersChange={setFilters} 
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <SortOptions />
          </div>

          {/* Layout Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={layout === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setLayout("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={layout === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setLayout("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-6">
              <FiltersSidebar 
                filters={filters} 
                onFiltersChange={setFilters} 
              />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Count */}
            <div className="mb-6 text-sm text-muted-foreground">
              {isLoading ? (
                <div className="h-4 bg-muted rounded w-32 animate-pulse"></div>
              ) : (
                `Mostrando ${services.length} serviços`
              )}
            </div>

            {/* Services Grid/List */}
            {isLoading ? (
              <div className={
                layout === "grid" 
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" 
                  : "space-y-4"
              }>
                {[...Array(6)].map((_, i) => (
                  <ServiceCardSkeleton key={i} layout={layout} />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Erro ao carregar serviços</p>
                <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
              </div>
            ) : (
              <div className={
                layout === "grid" 
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" 
                  : "space-y-4"
              }>
                {services.map((service: any) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    layout={layout}
                    isSelected={selectedIds.includes(service.id)}
                    onSelect={handleSelectService}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="mt-12 flex justify-center">
              <Pagination />
            </div>
          </div>
        </div>
      </main>

      {/* Comparison Bar */}
      {selectedIds.length > 0 && (
        <ComparisonBar
          selectedServices={selectedServicesData}
          onClear={() => setSelectedIds([])}
          onCompare={handleCompare}
        />
      )}

      <Footer />
    </div>
  );
}