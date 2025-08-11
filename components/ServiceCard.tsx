import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Star, 
  Heart, 
  Clock, 
  DollarSign,
  Shield,
  Award,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceCardProps {
  service: {
    title: string;
    description: string;
    price: number;
    rating: number;
    reviewCount: number;
    provider: {
      name: string;
      avatar: string;
      level?: string;
    };
    image: string;
    tags: string[];
    isFavorite?: boolean;
    deliveryTime?: string;
    isVerified?: boolean;
  };
  className?: string;
  layout?: 'grid' | 'list';
}

export function ServiceCard({ service, className, layout = 'grid' }: ServiceCardProps) {
  const [isFavorite, setIsFavorite] = useState(service.isFavorite || false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFavorite(!isFavorite);
  };

  if (layout === 'list') {
    return (
      <Card className={cn("overflow-hidden hover:shadow-lg transition-shadow", className)}>
        <Link href={`/service/${service.title.toLowerCase().replace(/\s+/g, '-')}`}>
          <CardContent className="p-0">
            <div className="flex">
              {/* Image */}
              <div className="relative w-48 h-36">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                  onClick={handleFavoriteClick}
                >
                  <Heart 
                    className={cn(
                      "h-4 w-4",
                      isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
                    )} 
                  />
                </Button>
              </div>

              {/* Content */}
              <div className="flex-1 p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg line-clamp-1 mb-1">
                      {service.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {service.description}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm text-muted-foreground">A partir de</p>
                    <p className="text-2xl font-bold">R$ {service.price}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={service.provider.avatar} />
                        <AvatarFallback>{service.provider.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{service.provider.name}</p>
                        {service.provider.level && (
                          <Badge variant="secondary" className="text-xs">
                            {service.provider.level}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{service.rating}</span>
                      <span className="text-sm text-muted-foreground">
                        ({service.reviewCount})
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {service.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Link>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden hover:shadow-lg transition-shadow", className)}>
      <Link href={`/service/${service.title.toLowerCase().replace(/\s+/g, '-')}`}>
        <CardContent className="p-0">
          {/* Image */}
          <div className="relative aspect-[4/3]">
            <Image
              src={service.image}
              alt={service.title}
              fill
              className="object-cover"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-white/80 hover:bg-white"
              onClick={handleFavoriteClick}
            >
              <Heart 
                className={cn(
                  "h-4 w-4",
                  isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
                )} 
              />
            </Button>
            {service.isVerified && (
              <div className="absolute top-2 left-2">
                <Badge className="bg-green-500">
                  <Shield className="h-3 w-3 mr-1" />
                  Verificado
                </Badge>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Provider */}
            <div className="flex items-center space-x-2 mb-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={service.provider.avatar} />
                <AvatarFallback>{service.provider.name[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{service.provider.name}</span>
              {service.provider.level && (
                <Badge variant="secondary" className="text-xs">
                  {service.provider.level}
                </Badge>
              )}
            </div>

            {/* Title */}
            <h3 className="font-semibold line-clamp-2 mb-2">
              {service.title}
            </h3>

            {/* Rating */}
            <div className="flex items-center space-x-1 mb-3">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{service.rating}</span>
              <span className="text-sm text-muted-foreground">
                ({service.reviewCount})
              </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-3">
              {service.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {service.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{service.tags.length - 2}
                </Badge>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t">
              <div>
                <p className="text-xs text-muted-foreground">A partir de</p>
                <p className="text-lg font-bold">R$ {service.price}</p>
              </div>
              {service.deliveryTime && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  {service.deliveryTime}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}