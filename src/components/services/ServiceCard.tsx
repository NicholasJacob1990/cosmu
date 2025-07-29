import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Star, Heart } from "lucide-react";

interface ServiceCardProps {
  service: any;
  layout: "grid" | "list";
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function ServiceCard({ service, layout, isSelected, onSelect }: ServiceCardProps) {
  const [isFavorite, setIsFavorite] = React.useState(service.isFavorite);

  const levelBadgeClass = {
    'Top Rated': 'bg-green-100 text-green-800 border-green-200',
    'Rising Talent': 'bg-blue-100 text-blue-800 border-blue-200',
    'Elite Pro': 'bg-purple-100 text-purple-800 border-purple-200',
  };

  if (layout === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow duration-300 w-full overflow-hidden">
        <div className="flex">
          <img src={service.imageUrl} alt={service.title} className="w-1/4 h-auto object-cover" />
          <div className="flex flex-col p-4 flex-1">
            <div className="flex justify-between items-start">
              <span className="text-sm text-muted-foreground">{service.category}</span>
              <Button variant="ghost" size="icon" onClick={() => setIsFavorite(!isFavorite)}>
                <Heart className={`h-5 w-5 ${isFavorite ? 'text-red-500 fill-current' : 'text-muted-foreground'}`} />
              </Button>
            </div>
            <Link to={`/service/${service.id}`} className="hover:underline">
              <h3 className="font-semibold text-lg my-1">{service.title}</h3>
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground my-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={service.professional.avatarUrl} />
                <AvatarFallback>{service.professional.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span>{service.professional.name}</span>
              <Badge variant="outline" className={levelBadgeClass[service.professional.level]}>{service.professional.level}</Badge>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="font-bold text-yellow-500">{service.rating}</span>
              <span className="text-muted-foreground">({service.reviews} reviews)</span>
            </div>
            <div className="flex-grow" />
            <div className="flex justify-between items-end mt-4">
              <div className="flex items-center space-x-2">
                <Checkbox id={`compare-${service.id}`} checked={isSelected} onCheckedChange={() => onSelect(service.id)} />
                <label htmlFor={`compare-${service.id}`} className="text-sm font-medium">Comparar</label>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground">A PARTIR DE</span>
                <p className="font-bold text-xl">R$ {service.price}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 flex flex-col overflow-hidden">
      <div className="relative">
        <img src={service.imageUrl} alt={service.title} className="w-full h-48 object-cover" />
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 bg-white/70 hover:bg-white rounded-full"
          onClick={() => setIsFavorite(!isFavorite)}
        >
          <Heart className={`h-5 w-5 ${isFavorite ? 'text-red-500 fill-current' : 'text-muted-foreground'}`} />
        </Button>
      </div>
      <CardContent className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={service.professional.avatarUrl} />
            <AvatarFallback>{service.professional.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">{service.professional.name}</p>
            <Badge variant="outline" className={`text-xs ${levelBadgeClass[service.professional.level]}`}>{service.professional.level}</Badge>
          </div>
        </div>
        <Link to={`/service/${service.id}`} className="hover:underline flex-grow">
          <h3 className="font-semibold text-base leading-snug">{service.title}</h3>
        </Link>
        <div className="flex items-center gap-1 text-sm my-2">
          <Star className="h-4 w-4 text-yellow-400 fill-current" />
          <span className="font-bold text-yellow-500">{service.rating}</span>
          <span className="text-muted-foreground">({service.reviews})</span>
        </div>
        <div className="border-t pt-3 mt-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Checkbox id={`compare-${service.id}-grid`} checked={isSelected} onCheckedChange={() => onSelect(service.id)} />
              <label htmlFor={`compare-${service.id}-grid`} className="text-sm font-medium">Comparar</label>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">A PARTIR DE</span>
              <p className="font-bold text-lg">R$ {service.price}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 