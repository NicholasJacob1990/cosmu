import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowUpDown } from 'lucide-react';

export function SortOptions() {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-select" className="text-sm font-medium text-galaxia-text-muted hidden sm:block">
        <ArrowUpDown className="h-4 w-4 inline-block mr-1" />
        Ordenar por:
      </label>
      <Select defaultValue="recommended">
        <SelectTrigger id="sort-select" className="w-[180px]">
          <SelectValue placeholder="Ordenar por..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recommended">Recomendados</SelectItem>
          <SelectItem value="best-selling">Mais Vendidos</SelectItem>
          <SelectItem value="newest">Mais Recentes</SelectItem>
          <SelectItem value="price-asc">Preço: Baixo para Alto</SelectItem>
          <SelectItem value="price-desc">Preço: Alto para Baixo</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
