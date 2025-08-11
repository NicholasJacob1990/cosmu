import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Code,
  Palette,
  PenTool,
  Camera,
  Video,
  Music,
  Megaphone,
  TrendingUp,
  Globe,
  Smartphone,
  Database,
  Shield,
  Calculator,
  BookOpen,
  Languages,
  Headphones,
} from 'lucide-react';

interface Category {
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  serviceCount: number;
  gradient: string;
  popular?: boolean;
}

const categories: Category[] = [
  {
    name: 'Desenvolvimento',
    description: 'Websites, apps e sistemas',
    icon: Code,
    href: '/services?category=desenvolvimento',
    serviceCount: 2847,
    gradient: 'from-blue-500 to-cyan-500',
    popular: true,
  },
  {
    name: 'Design & Arte',
    description: 'Logos, UI/UX e design gráfico',
    icon: Palette,
    href: '/services?category=design',
    serviceCount: 1923,
    gradient: 'from-purple-500 to-pink-500',
    popular: true,
  },
  {
    name: 'Redação',
    description: 'Conteúdo, copywriting e tradução',
    icon: PenTool,
    href: '/services?category=redacao',
    serviceCount: 1456,
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    name: 'Fotografia',
    description: 'Fotos profissionais e edição',
    icon: Camera,
    href: '/services?category=fotografia',
    serviceCount: 892,
    gradient: 'from-yellow-500 to-orange-500',
  },
  {
    name: 'Vídeo & Animação',
    description: 'Motion graphics e produção audiovisual',
    icon: Video,
    href: '/services?category=video',
    serviceCount: 743,
    gradient: 'from-red-500 to-rose-500',
  },
  {
    name: 'Música & Áudio',
    description: 'Produção musical e locução',
    icon: Music,
    href: '/services?category=musica',
    serviceCount: 534,
    gradient: 'from-indigo-500 to-purple-500',
  },
  {
    name: 'Marketing Digital',
    description: 'SEO, ads e redes sociais',
    icon: Megaphone,
    href: '/services?category=marketing',
    serviceCount: 1678,
    gradient: 'from-teal-500 to-green-500',
    popular: true,
  },
  {
    name: 'Negócios',
    description: 'Consultoria e estratégia empresarial',
    icon: TrendingUp,
    href: '/services?category=negocios',
    serviceCount: 967,
    gradient: 'from-slate-500 to-gray-500',
  },
  {
    name: 'Tradução',
    description: 'Tradução e interpretação',
    icon: Languages,
    href: '/services?category=traducao',
    serviceCount: 423,
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    name: 'Suporte Técnico',
    description: 'Manutenção e assistência',
    icon: Headphones,
    href: '/services?category=suporte',
    serviceCount: 654,
    gradient: 'from-cyan-500 to-blue-500',
  },
];

interface CategoryGridProps {
  className?: string;
  limit?: number;
  showServiceCount?: boolean;
}

export function CategoryGrid({ 
  className, 
  limit,
  showServiceCount = true 
}: CategoryGridProps) {
  const displayCategories = limit ? categories.slice(0, limit) : categories;

  return (
    <div 
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
        className
      )}
    >
      {displayCategories.map((category) => {
        const Icon = category.icon;
        
        return (
          <Link key={category.name} href={category.href}>
            <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="relative">
                  {/* Background Gradient */}
                  <div 
                    className={cn(
                      "absolute inset-0 bg-gradient-to-br opacity-10 rounded-lg transition-opacity group-hover:opacity-20",
                      category.gradient.replace('from-', 'from-').replace('to-', 'to-')
                    )}
                  />
                  
                  {/* Content */}
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <div 
                        className={cn(
                          "p-3 rounded-lg bg-gradient-to-br",
                          category.gradient
                        )}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      {category.popular && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                          Popular
                        </span>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {category.description}
                    </p>
                    
                    {showServiceCount && (
                      <p className="text-xs text-muted-foreground">
                        {category.serviceCount.toLocaleString()} serviços disponíveis
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}