import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sparkles, Filter, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchToggleProps {
  onSearch: (query: string, isAI: boolean) => void;
}

export function SearchToggle({ onSearch }: SearchToggleProps) {
  const [searchMode, setSearchMode] = useState<'traditional' | 'ai' | 'auto'>('auto');
  const [query, setQuery] = useState('');
  const [suggestedMode, setSuggestedMode] = useState<'traditional' | 'ai' | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  
  const debouncedQuery = useDebounce(query, 800);

  // Classificar query automaticamente
  useEffect(() => {
    if (debouncedQuery && debouncedQuery.length > 10 && searchMode === 'auto') {
      classifyQuery(debouncedQuery);
    } else {
      setSuggestedMode(null);
    }
  }, [debouncedQuery, searchMode]);

  const classifyQuery = async (searchQuery: string) => {
    setIsClassifying(true);
    try {
      const response = await api.search.classify(searchQuery);
      if (response.data) {
        setSuggestedMode(response.data.suggested_mode || 'traditional');
      }
    } catch (error) {
      console.error('Erro ao classificar query:', error);
      setSuggestedMode('traditional');
    } finally {
      setIsClassifying(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    // Determinar modo final de busca
    let finalMode = searchMode;
    if (searchMode === 'auto') {
      finalMode = suggestedMode || 'traditional';
    }
    
    // Redirecionar para página apropriada baseado no modo de busca
    if (finalMode === 'ai') {
      window.location.href = `/search/intelligent?q=${encodeURIComponent(query)}`;
    } else {
      window.location.href = `/search?q=${encodeURIComponent(query)}&type=traditional`;
    }
    
    // Também chamar a função callback se fornecida
    onSearch(query, finalMode === 'ai');
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Search Mode Toggle */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <Button
          variant={searchMode === 'traditional' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSearchMode('traditional')}
          className="gap-2"
        >
          <Search className="w-4 h-4" />
          Busca Tradicional
        </Button>
        <div className="w-px h-6 bg-border" />
        <Button
          variant={searchMode === 'ai' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSearchMode('ai')}
          className="gap-2 bg-gradient-to-r from-galaxia-magenta to-galaxia-neon text-white"
        >
          <Sparkles className="w-4 h-4" />
          Busca Inteligente (IA)
        </Button>
        <div className="w-px h-6 bg-border" />
        <Button
          variant={searchMode === 'auto' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSearchMode('auto')}
          className="gap-2"
        >
          <Zap className="w-4 h-4" />
          Automático
          {isClassifying && <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse ml-1" />}
        </Button>
      </div>

      {/* AI Suggestion */}
      {searchMode === 'auto' && suggestedMode && query.length > 10 && (
        <div className="text-center mb-4">
          <div className={cn(
            "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm",
            suggestedMode === 'ai' 
              ? "bg-purple-100 text-purple-800 border border-purple-200" 
              : "bg-blue-100 text-blue-800 border border-blue-200"
          )}>
            {suggestedMode === 'ai' ? <Sparkles className="w-3 h-3" /> : <Search className="w-3 h-3" />}
            IA sugere: {suggestedMode === 'ai' ? 'Busca Inteligente' : 'Busca Tradicional'}
          </div>
        </div>
      )}

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className={cn(
          "relative rounded-xl border-2 transition-all duration-300",
          searchMode === 'ai' || (searchMode === 'auto' && suggestedMode === 'ai')
            ? "border-galaxia-neon/50 bg-gradient-to-r from-galaxia-grad-a/5 to-galaxia-grad-b/5 shadow-galaxia-glow" 
            : "border-border bg-background shadow-card"
        )}>
          <Input
            type="text"
            placeholder={
              searchMode === 'ai' || (searchMode === 'auto' && suggestedMode === 'ai')
                ? "Descreva o que você precisa: 'Preciso de um designer para criar identidade visual completa...'"
                : searchMode === 'auto'
                  ? "Digite sua busca... Nossa IA analisará automaticamente"
                  : "Buscar serviços: designer gráfico, programador web..."
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-14 pl-6 pr-32 text-lg border-0 bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground"
          />
          
          <div className="absolute right-2 top-2 flex items-center gap-2">
            {(searchMode === 'traditional' || (searchMode === 'auto' && suggestedMode === 'traditional')) && (
              <Button variant="ghost" size="icon" type="button">
                <Filter className="w-4 h-4" />
              </Button>
            )}
            <Button 
              type="submit"
              variant="default"
              className="gap-2 bg-gradient-to-r from-galaxia-magenta to-galaxia-neon text-white"
              disabled={isClassifying}
            >
              {isClassifying ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : searchMode === 'ai' || (searchMode === 'auto' && suggestedMode === 'ai') ? (
                <Sparkles className="w-4 h-4" />
              ) : searchMode === 'auto' ? (
                <Zap className="w-4 h-4" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              {isClassifying ? 'Analisando...' : 
               searchMode === 'ai' || (searchMode === 'auto' && suggestedMode === 'ai') ? 'Encontrar' : 
               searchMode === 'auto' ? 'Buscar Inteligente' : 'Buscar'}
            </Button>
          </div>
        </div>

        {/* Helper Text */}
        <p className="text-sm text-muted-foreground mt-3 text-center">
          {searchMode === 'ai' 
            ? "💡 Nossa IA analisará sua necessidade e encontrará os profissionais mais adequados"
            : searchMode === 'auto'
              ? "🤖 Nossa IA escolherá automaticamente o melhor tipo de busca para você"
              : "🔍 Use filtros e palavras-chave para encontrar exatamente o que procura"
          }
        </p>
      </form>
    </div>
  );
}
