import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Tag, DollarSign, Clock, Star, Users, Trash2 } from 'lucide-react';

const mockCategories = [
  { id: 'design', name: 'Design Gráfico' },
  { id: 'dev', name: 'Desenvolvimento' },
  { id: 'marketing', name: 'Marketing Digital' },
];

const professionalLevels = [
  { id: 'rising-talent', label: 'Rising Talent' },
  { id: 'top-rated', label: 'Top Rated' },
  { id: 'elite-pro', label: 'Elite Pro' },
];

export function FiltersSidebar() {
  const [priceRange, setPriceRange] = React.useState([250, 750]);

  return (
    <Card className="sticky top-24 border-none bg-card text-card-foreground shadow-none">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-bold text-galaxia-text-primary">Filtros</CardTitle>
        <Button variant="ghost" size="sm" className="flex items-center gap-1 text-galaxia-text-muted hover:text-galaxia-neon">
          <Trash2 className="h-3 w-3" />
          Limpar
        </Button>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={['category', 'price', 'level', 'delivery', 'rating']} className="w-full">
          
          <AccordionItem value="category">
            <AccordionTrigger className="text-base font-semibold text-galaxia-text-primary hover:text-galaxia-neon no-underline">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" /> Categoria
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pt-3">
              <Select>
                <SelectTrigger><SelectValue placeholder="Todas as Categorias" /></SelectTrigger>
                <SelectContent>
                  {mockCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger><SelectValue placeholder="Todas as Subcategorias" /></SelectTrigger>
                <SelectContent></SelectContent>
              </Select>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="price">
            <AccordionTrigger className="text-base font-semibold text-galaxia-text-primary hover:text-galaxia-neon no-underline">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" /> Preço
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={1000}
                step={10}
                className="[&_.rc-slider-track]:bg-gradient-to-r [&_.rc-slider-track]:from-galaxia-magenta [&_.rc-slider-track]:to-galaxia-neon"
              />
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="Min" value={priceRange[0]} onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])} />
                <Input type="number" placeholder="Max" value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], +e.target.value])} />
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="level">
            <AccordionTrigger className="text-base font-semibold text-galaxia-text-primary hover:text-galaxia-neon no-underline">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" /> Nível do Profissional
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-2 pt-3">
              {professionalLevels.map((level) => (
                <div key={level.id} className="flex items-center space-x-2">
                  <Checkbox id={level.id} />
                  <Label htmlFor={level.id} className="font-normal text-galaxia-text-muted">{level.label}</Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="delivery">
            <AccordionTrigger className="text-base font-semibold text-galaxia-text-primary hover:text-galaxia-neon no-underline">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" /> Prazo de Entrega
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2"></AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="rating">
            <AccordionTrigger className="text-base font-semibold text-galaxia-text-primary hover:text-galaxia-neon no-underline">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4" /> Avaliação
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2"></AccordionContent>
          </AccordionItem>

        </Accordion>
        <Button className="w-full mt-6 text-white text-base font-bold bg-gradient-to-r from-galaxia-magenta to-cyan-400 hover:from-galaxia-neon hover:to-cyan-500 shadow-lg">
          Aplicar Filtros
        </Button>
      </CardContent>
    </Card>
  );
}
