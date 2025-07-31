import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sparkles, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchToggleProps {
  onSearch: (query: string, isAI: boolean) => void;
}

export function SearchToggle({ onSearch }: SearchToggleProps) {
  const [searchMode, setSearchMode] = useState<'traditional' | 'ai'>('traditional');
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, searchMode === 'ai');
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
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className={cn(
          "relative rounded-xl border-2 transition-all duration-300",
          searchMode === 'ai' 
            ? "border-galaxia-neon/50 bg-gradient-to-r from-galaxia-grad-a/5 to-galaxia-grad-b/5 shadow-galaxia-glow" 
            : "border-border bg-background shadow-card"
        )}>
          <Input
            type="text"
            placeholder={
              searchMode === 'ai' 
                ? "Descreva o que você precisa: 'Preciso de um designer para criar identidade visual completa...'"
                : "Buscar serviços: designer gráfico, programador web..."
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-14 pl-6 pr-32 text-lg border-0 bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground"
          />
          
          <div className="absolute right-2 top-2 flex items-center gap-2">
            {searchMode === 'traditional' && (
              <Button variant="ghost" size="icon" type="button">
                <Filter className="w-4 h-4" />
              </Button>
            )}
            <Button 
              type="submit"
              variant={searchMode === 'ai' ? 'default' : 'default'}
              className="gap-2 bg-gradient-to-r from-galaxia-magenta to-galaxia-neon text-white"
            >
              {searchMode === 'ai' ? <Sparkles className="w-4 h-4" /> : <Search className="w-4 h-4" />}
              {searchMode === 'ai' ? 'Encontrar' : 'Buscar'}
            </Button>
          </div>
        </div>

        {/* Helper Text */}
        <p className="text-sm text-muted-foreground mt-3 text-center">
          {searchMode === 'ai' 
            ? "💡 Nossa IA analisará sua necessidade e encontrará os profissionais mais adequados"
            : "🔍 Use filtros e palavras-chave para encontrar exatamente o que procura"
          }
        </p>
      </form>
    </div>
  );
}
