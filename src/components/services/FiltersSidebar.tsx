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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tag, BarChart, DollarSign, Clock, Star, Users, Trash2 } from 'lucide-react';

// Mock data
const mockCategories = [
  { id: 'design', name: 'Design Gráfico', count: 450, sub: ['Logo', 'Web Design', 'Social Media'] },
  { id: 'dev', name: 'Desenvolvimento', count: 320, sub: ['Web', 'Mobile', 'E-commerce'] },
  { id: 'marketing', name: 'Marketing Digital', count: 280, sub: ['SEO', 'Content', 'Ads'] },
  { id: 'writing', name: 'Redação e Tradução', count: 150, sub: ['Copywriting', 'Blog Posts'] },
];

const professionalLevels = [
  { id: 'rising-talent', label: 'Rising Talent' },
  { id: 'top-rated', label: 'Top Rated' },
  { id: 'elite-pro', label: 'Elite Pro' },
];

export function FiltersSidebar({ filters, onFiltersChange }) {
  const handleResetFilters = () => {
    onFiltersChange({});
    // Reset local state if any
  };

  return (
    <Card className="sticky top-24">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
        <CardTitle className="text-lg">Filtros</CardTitle>
        <Button variant="ghost" size="sm" onClick={handleResetFilters} className="flex items-center gap-1 text-muted-foreground">
          <Trash2 className="h-3 w-3" />
          Limpar
        </Button>
      </CardHeader>
      <CardContent className="pt-4">
        <Accordion type="multiple" defaultValue={['category', 'price']} className="w-full">
          {/* Filtro de Categoria */}
          <AccordionItem value="category">
            <AccordionTrigger className="text-base font-semibold">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" /> Categoria
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-2">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as Categorias" />
                </SelectTrigger>
                <SelectContent>
                  {mockCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name} ({cat.count})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as Subcategorias" />
                </SelectTrigger>
                <SelectContent>
                  {/* Subcategorias dinâmicas baseadas na categoria selecionada */}
                </SelectContent>
              </Select>
            </AccordionContent>
          </AccordionItem>

          {/* Filtro de Preço */}
          <AccordionItem value="price">
            <AccordionTrigger className="text-base font-semibold">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" /> Preço
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <Slider
                defaultValue={[250, 750]}
                max={1000}
                step={10}
                aria-label="Price range slider"
              />
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="Min" defaultValue={250} className="w-1/2" />
                <Input type="number" placeholder="Max" defaultValue={750} className="w-1/2" />
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* Nível do Profissional */}
          <AccordionItem value="level">
            <AccordionTrigger className="text-base font-semibold">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" /> Nível do Profissional
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-2 pt-2">
              {professionalLevels.map((level) => (
                <div key={level.id} className="flex items-center space-x-2">
                  <Checkbox id={level.id} />
                  <Label htmlFor={level.id} className="font-normal">{level.label}</Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
          
          {/* Prazo de Entrega */}
          <AccordionItem value="delivery">
            <AccordionTrigger className="text-base font-semibold">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" /> Prazo de Entrega
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-2 pt-2">
              <RadioGroup defaultValue="any">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="24h" id="r1" />
                  <Label htmlFor="r1">Até 24 horas</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3d" id="r2" />
                  <Label htmlFor="r2">Até 3 dias</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="7d" id="r3" />
                  <Label htmlFor="r3">Até 7 dias</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="any" id="r4" />
                  <Label htmlFor="r4">Qualquer prazo</Label>
                </div>
              </RadioGroup>
            </AccordionContent>
          </AccordionItem>

          {/* Avaliação */}
          <AccordionItem value="rating">
            <AccordionTrigger className="text-base font-semibold">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4" /> Avaliação
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-2 pt-2">
              {/* Implementar seletor de estrelas */}
              <p className="text-sm text-muted-foreground">Seletor de estrelas aqui</p>
            </AccordionContent>
          </AccordionItem>

        </Accordion>
        <Button className="w-full mt-6 bg-gradient-to-r from-galaxia-magenta to-galaxia-neon text-white">
          Aplicar Filtros
        </Button>
      </CardContent>
    </Card>
  );
} 