import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Star, Heart } from "lucide-react";

interface Service {
  id: string;
  title: string;
  category: string;
  professional: {
    name: string;
    level: string;
    avatarUrl: string;
  };
  rating: number;
  reviews: number;
  price: number;
  image: string;
  isFavorite?: boolean;
}

interface ServiceCardProps {
  service: Service;
  layout?: "grid" | "list";
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function ServiceCard({ service, layout = 'grid', isSelected, onSelect }: ServiceCardProps) {
  // Proteção contra service undefined e isFavorite undefined
  const [isFavorite, setIsFavorite] = React.useState(service?.isFavorite || false);

  // Early return se service for undefined
  if (!service) {
    return (
      <div className="bg-card rounded-lg p-6 animate-pulse">
        <div className="h-40 bg-muted rounded mb-4"></div>
        <div className="h-4 bg-muted rounded mb-2"></div>
        <div className="h-4 bg-muted rounded w-3/4"></div>
      </div>
    );
  }

  const levelBadgeClass: { [key: string]: string } = {
    'Top Rated': 'bg-green-100 text-green-700 border-green-200',
    'Rising Talent': 'bg-blue-100 text-blue-700 border-blue-200',
    'Elite Pro': 'bg-purple-100 text-purple-700 border-purple-200',
  };

  return (
    <Card className="group overflow-hidden transition-all duration-300 rounded-lg hover:shadow-lg bg-card border-border/20">
      <div className="relative aspect-video">
        <Link href={`/service/${service.id}`}>
          <Image
            src={service.image || "/placeholder.svg"}
            alt={service.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-black/30 hover:bg-black/50 text-white rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
        >
          <Heart className={`h-5 w-5 ${isFavorite ? 'text-red-500 fill-current' : ''}`} />
        </Button>
      </div>

      <CardContent className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <Link href={`/professional/${service.professional?.id || 'unknown'}`} className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={service.professional?.avatarUrl} />
              <AvatarFallback>{service.professional?.name?.charAt(0) || 'P'}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-galaxia-text-primary hover:underline">
              {service.professional?.name || 'Profissional'}
            </span>
          </Link>
          <Badge 
            variant="outline" 
            className={`text-xs ${levelBadgeClass[service.professional?.level || 'Rising Talent'] || 'bg-blue-100 text-blue-700 border-blue-200'}`}
          >
            {service.professional?.level || 'Rising Talent'}
          </Badge>
        </div>

        <Link href={`/service/${service.id}`} className="flex-grow">
          <h3 className="font-semibold text-base leading-snug text-galaxia-text-primary hover:text-galaxia-neon transition-colors">
            {service.title || 'Serviço'}
          </h3>
        </Link>
        
        <div className="flex items-center gap-1 text-sm my-2">
          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          <span className="font-bold text-yellow-500">
            {(service.rating || 0).toFixed(1)}
          </span>
          <span className="text-galaxia-text-muted ml-1">
            ({service.reviews || 0})
          </span>
        </div>

        <div className="border-t border-border/20 pt-3 mt-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Checkbox id={`compare-${service.id}`} checked={isSelected} onCheckedChange={() => onSelect(service.id)} />
              <label htmlFor={`compare-${service.id}`} className="text-sm font-medium text-galaxia-text-muted">Comparar</label>
            </div>
            <div className="text-right">
              <span className="text-xs text-galaxia-text-muted">A PARTIR DE</span>
              <p className="font-bold text-lg text-galaxia-text-primary">
                R$ {service.price || 0}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
