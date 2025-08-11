'use client';

import { useState } from "react";
import {
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

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
import { SortOptions } from "@/components/services/SortOptions";
import { Pagination } from "@/components/ui/pagination";
import { ComparisonBar } from "@/components/services/ComparisonBar";

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
  rating: (Math.random() * (5 - 4.5) + 4.5).toFixed(1),
  reviews: Math.floor(Math.random() * 200) + 10,
  price: Math.floor(Math.random() * 500) + 50,
  imageUrl: `https://picsum.photos/400/300?random=${i}`,
  isFavorite: i % 5 === 0,
}));


export default function ServicesPage() {
  const router = useRouter();
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Simulação de filtros (estado seria mais complexo com dados reais)
  const [filters, setFilters] = useState({});

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

  const selectedServicesData = mockServices.filter(s => selectedIds.includes(s.id));

  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Encontre os Melhores Serviços</h1>
          <p className="text-muted-foreground mt-1">
            Navegue por milhares de serviços em diversas categorias para impulsionar seu negócio.
          </p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar de Filtros (Desktop) */}
          <aside className="hidden lg:block w-1/4 xl:w-1/5">
            <FiltersSidebar 
              filters={filters}
              onFiltersChange={setFilters}
            />
          </aside>

          {/* Conteúdo Principal */}
          <div className="flex-1">
            {/* Header dos Resultados */}
            <div className="flex items-center justify-between mb-4 p-3 bg-background rounded-lg border">
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">1,234</span> resultados encontrados para "<span className="font-semibold text-foreground">Logo Design</span>"
              </div>

              <div className="flex items-center gap-4">
                {/* Botão de Filtros (Mobile) */}
                <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden flex items-center gap-2">
                      <SlidersHorizontal className="h-4 w-4" />
                      Filtros
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                    <SheetHeader>
                      <SheetTitle>Filtros Avançados</SheetTitle>
                      <SheetDescription>
                        Refine sua busca para encontrar o serviço perfeito.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="py-4">
                      <FiltersSidebar 
                        filters={filters}
                        onFiltersChange={(newFilters) => {
                          setFilters(newFilters);
                          setIsFiltersOpen(false); // Fecha o sheet ao aplicar
                        }}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
                
                <SortOptions />

                <div className="hidden md:flex items-center gap-2">
                  <Button
                    variant={layout === "grid" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setLayout("grid")}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={layout === "list" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setLayout("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Grade de Resultados */}
            <div
              className={`transition-all duration-300 ${
                layout === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                  : "flex flex-col gap-4"
              }`}
            >
              {mockServices.map(service => (
                <ServiceCard 
                  key={service.id}
                  service={service}
                  layout={layout}
                  isSelected={selectedIds.includes(service.id)}
                  onSelect={handleSelectService}
                />
              ))}
            </div>

            {/* Paginação */}
            <div className="mt-8">
              <Pagination
                totalPages={10}
                page={1}
                onPageChange={(page) => console.log(page)}
              />
            </div>
          </div>
        </div>
      </main>

      <ComparisonBar 
        selectedServices={selectedServicesData}
        onClear={() => setSelectedIds([])}
        onCompare={handleCompare}
      />

      <Footer />
    </div>
  );
}