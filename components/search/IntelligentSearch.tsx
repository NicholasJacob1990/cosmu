'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Clock, 
  DollarSign, 
  Sparkles, 
  TrendingUp,
  Brain,
  Zap
} from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { api } from '@/lib/api';

interface SearchResult {
  id: string;
  type: 'service_package' | 'freelancer_profile';
  title: string;
  description: string;
  price?: number;
  hourly_rate?: number;
  delivery_time?: number;
  freelancer: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
    reviews_count: number;
    location?: string;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  images?: string[];
  tags?: string[];
  ai_score?: number;
  traditional_score?: number;
  created_at: string;
}

interface SearchFilters {
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    description?: string;
  }>;
  price_ranges: Array<{
    label: string;
    min: number;
    max?: number;
  }>;
  delivery_times: Array<{
    label: string;
    days: number;
  }>;
  price_stats: {
    min: number;
    max: number;
    avg: number;
  };
}

interface SearchSuggestion {
  text: string;
  type: 'service' | 'category';
  popularity?: number;
  slug?: string;
}

export default function IntelligentSearch() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [filters, setFilters] = useState<SearchFilters | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchSource, setSearchSource] = useState<'ai' | 'traditional' | 'error'>('ai');
  
  // Filtros ativos
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [priceRange, setPriceRange] = useState<number[]>([0, 5000]);
  const [selectedDeliveryTime, setSelectedDeliveryTime] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  // Debounce para sugestões
  const debouncedQuery = useDebounce(query, 300);
  const debouncedSearchQuery = useDebounce(query, 500);

  useEffect(() => {
    loadFilters();
    
    // Carregar query da URL se presente
    const urlQuery = searchParams.get('q');
    if (urlQuery) {
      setQuery(urlQuery);
    }
  }, []);

  useEffect(() => {
    if (debouncedQuery && debouncedQuery.length > 2) {
      loadSuggestions(debouncedQuery);
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    if (debouncedSearchQuery && debouncedSearchQuery.trim()) {
      performSearch();
    }
  }, [debouncedSearchQuery, selectedCategory, priceRange, selectedDeliveryTime]);

  const loadFilters = async () => {
    try {
      const response = await api.search.filters();
      if (response.data) {
        setFilters(response.data);
        if (response.data.price_stats?.max) {
          setPriceRange([0, response.data.price_stats.max]);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar filtros:', error);
    }
  };

  const loadSuggestions = async (searchQuery: string) => {
    try {
      const response = await api.search.suggestions(searchQuery, 8);
      if (response.data) {
        setSuggestions(response.data.suggestions || response.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar sugestões:', error);
    }
  };

  const performSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const searchParams: Record<string, any> = {
        limit: '30'
      };

      if (selectedCategory) {
        searchParams.category = selectedCategory;
      }
      
      if (priceRange[1] < (filters?.price_stats?.max || 5000)) {
        searchParams.price_max = priceRange[1].toString();
      }

      if (selectedDeliveryTime) {
        searchParams.delivery_time = selectedDeliveryTime;
      }

      const response = await api.search.intelligent(query, searchParams);
      
      if (response.data) {
        setResults(response.data.results || response.data || []);
        setSearchSource(response.data.source || 'ai');
      } else {
        setResults([]);
        setSearchSource('error');
      }
    } catch (error) {
      console.error('Erro na busca:', error);
      setResults([]);
      setSearchSource('error');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    setSuggestions([]);
    
    if (suggestion.type === 'category' && suggestion.slug) {
      setSelectedCategory(suggestion.slug);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const getSearchSourceIcon = () => {
    switch (searchSource) {
      case 'ai':
        return <Brain className="h-4 w-4 text-purple-500" />;
      case 'traditional':
        return <Search className="h-4 w-4 text-blue-500" />;
      default:
        return <Zap className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSearchSourceText = () => {
    switch (searchSource) {
      case 'ai':
        return 'Busca Inteligente com IA';
      case 'traditional':
        return 'Busca Tradicional';
      default:
        return 'Busca';
    }
  };

  const filteredResults = results.filter(result => {
    if (activeTab === 'services') return result.type === 'service_package';
    if (activeTab === 'freelancers') return result.type === 'freelancer_profile';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Cabeçalho de Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Busca Inteligente GalaxIA
          </CardTitle>
          <CardDescription>
            Encontre profissionais e serviços usando inteligência artificial
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barra de Busca Principal */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Ex: 'Preciso de um design de logo para startup de tecnologia'"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg"
              />
            </div>
            
            {/* Sugestões */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                  >
                    {suggestion.type === 'category' ? (
                      <Filter className="h-4 w-4 text-blue-500" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    )}
                    <span>{suggestion.text}</span>
                    {suggestion.popularity && (
                      <Badge variant="outline" className="ml-auto text-xs">
                        {suggestion.popularity}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filtros Rápidos */}
          <div className="flex flex-wrap gap-2 items-center">
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>

            {filters && (
              <>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as categorias</SelectItem>
                    {filters.categories.map((category) => (
                      <SelectItem key={category.id} value={category.slug}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Até {formatCurrency(priceRange[1])}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Filtros Expandidos */}
          {showFilters && filters && (
            <div className="border-t pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Faixa de Preço: {formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])}
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={filters.price_stats?.max || 5000}
                    min={0}
                    step={50}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Prazo de Entrega</label>
                  <Select value={selectedDeliveryTime} onValueChange={setSelectedDeliveryTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Qualquer prazo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Qualquer prazo</SelectItem>
                      {filters.delivery_times.map((time) => (
                        <SelectItem key={time.days} value={time.days.toString()}>
                          {time.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultados */}
      {query && (
        <div className="space-y-4">
          {/* Header dos Resultados */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {getSearchSourceIcon()}
              <h3 className="text-lg font-semibold">
                {loading ? 'Buscando...' : `${filteredResults.length} resultados`}
              </h3>
              <Badge variant="outline" className="text-xs">
                {getSearchSourceText()}
              </Badge>
            </div>
          </div>

          {/* Tabs para Filtrar Tipos */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">
                Todos ({results.length})
              </TabsTrigger>
              <TabsTrigger value="services">
                Serviços ({results.filter(r => r.type === 'service_package').length})
              </TabsTrigger>
              <TabsTrigger value="freelancers">
                Freelancers ({results.filter(r => r.type === 'freelancer_profile').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded mb-4"></div>
                        <div className="flex justify-between">
                          <div className="h-3 bg-gray-200 rounded w-20"></div>
                          <div className="h-3 bg-gray-200 rounded w-16"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredResults.map((result) => (
                    <Card key={result.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg line-clamp-2">
                            {result.title}
                          </CardTitle>
                          {result.ai_score && (
                            <Badge variant="secondary" className="text-xs">
                              IA: {result.ai_score.toFixed(2)}
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="line-clamp-3">
                          {result.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {/* Freelancer Info */}
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              {result.freelancer.avatar ? (
                                <img 
                                  src={result.freelancer.avatar} 
                                  alt={result.freelancer.name}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-xs font-medium">
                                  {result.freelancer.name.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {result.freelancer.name}
                              </p>
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs text-muted-foreground">
                                  {result.freelancer.rating.toFixed(1)} ({result.freelancer.reviews_count})
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Price & Delivery */}
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <span className="font-semibold">
                                {result.price 
                                  ? formatCurrency(result.price)
                                  : result.hourly_rate 
                                    ? `${formatCurrency(result.hourly_rate)}/h`
                                    : 'Sob consulta'
                                }
                              </span>
                            </div>
                            {result.delivery_time && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  {result.delivery_time}d
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Category & Location */}
                          <div className="flex justify-between items-center">
                            {result.category && (
                              <Badge variant="outline" className="text-xs">
                                {result.category.name}
                              </Badge>
                            )}
                            {result.freelancer.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {result.freelancer.location}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Action Button */}
                          <Button 
                            className="w-full" 
                            onClick={() => {
                              if (result.type === 'service_package') {
                                window.location.href = `/services/${result.id}`;
                              } else {
                                window.location.href = `/freelancers/${result.freelancer.id}`;
                              }
                            }}
                          >
                            {result.type === 'service_package' ? 'Ver Serviço' : 'Ver Perfil'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Search className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum resultado encontrado</h3>
                    <p className="text-muted-foreground text-center">
                      Tente usar termos diferentes ou remover alguns filtros.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}