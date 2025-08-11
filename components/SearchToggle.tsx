'use client';

import { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

interface SearchToggleProps {
  onSearch: (query: string, isAI: boolean) => void;
  placeholder?: string;
  className?: string;
}

export function SearchToggle({ 
  onSearch, 
  placeholder = "O que você procura?",
  className 
}: SearchToggleProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'traditional' | 'ai'>('traditional');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery, searchMode === 'ai');
    }
  };

  return (
    <Card className={cn("p-6", className)}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Search Mode Toggle */}
        <RadioGroup
          value={searchMode}
          onValueChange={(value) => setSearchMode(value as 'traditional' | 'ai')}
          className="flex space-x-4 mb-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="traditional" id="traditional" />
            <Label htmlFor="traditional" className="flex items-center cursor-pointer">
              <Search className="w-4 h-4 mr-2" />
              Busca Tradicional
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ai" id="ai" />
            <Label htmlFor="ai" className="flex items-center cursor-pointer">
              <Sparkles className="w-4 h-4 mr-2 text-purple-600" />
              Busca com IA
            </Label>
          </div>
        </RadioGroup>

        {/* Search Input */}
        <div className="relative">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              searchMode === 'ai' 
                ? "Descreva o que você precisa em detalhes..." 
                : placeholder
            }
            className="pr-24"
          />
          <Button
            type="submit"
            size="sm"
            className="absolute right-1 top-1 bottom-1"
            disabled={!searchQuery.trim()}
          >
            {searchMode === 'ai' ? (
              <>
                <Sparkles className="w-4 h-4 mr-1" />
                IA
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-1" />
                Buscar
              </>
            )}
          </Button>
        </div>

        {/* AI Mode Description */}
        {searchMode === 'ai' && (
          <p className="text-sm text-muted-foreground">
            Nossa IA analisa sua descrição e encontra os melhores profissionais e serviços para sua necessidade específica.
          </p>
        )}
      </form>
    </Card>
  );
}