import { Star, Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ServiceCardProps {
  title: string;
  description: string;
  price: number;
  rating: number;
  reviewCount: number;
  provider: {
    name: string;
    avatar: string;
    level: string;
  };
  image: string;
  tags: string[];
  isFavorite?: boolean;
}

export function ServiceCard({ 
  title, 
  description, 
  price, 
  rating, 
  reviewCount, 
  provider, 
  image, 
  tags,
  isFavorite = false 
}: ServiceCardProps) {
  return (
    <Card className="group overflow-hidden hover:shadow-galaxia-glow transition-all duration-300 hover:-translate-y-1 bg-card border-border/20">
      <CardHeader className="p-0 relative">
        <div className="aspect-video overflow-hidden bg-muted">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm hover:bg-background"
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
        </Button>
      </CardHeader>

      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={provider.avatar} />
            <AvatarFallback>{provider.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate text-galaxia-text-primary">{title}</h3>
            <p className="text-xs text-galaxia-text-muted">{provider.name}</p>
          </div>
          <Badge variant="secondary" className="text-xs">
            {provider.level}
          </Badge>
        </div>

        <p className="text-sm text-galaxia-text-muted line-clamp-2 mb-3">
          {description}
        </p>

        <div className="flex flex-wrap gap-1 mb-3">
          {tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{tags.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{rating}</span>
          </div>
          <span className="text-sm text-galaxia-text-muted">
            ({reviewCount} avaliações)
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex items-center justify-between w-full">
          <div>
            <span className="text-sm text-galaxia-text-muted">A partir de</span>
            <p className="text-lg font-bold text-galaxia-text-primary">
              R$ {price.toLocaleString('pt-BR')}
            </p>
          </div>
          <Button variant="default" size="sm" className="gap-2 bg-gradient-to-r from-galaxia-magenta to-galaxia-neon text-white hover:from-galaxia-neon hover:to-galaxia-magenta shadow-galaxia-glow">
            <ShoppingCart className="w-4 h-4" />
            Contratar
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}