import { Star, MapPin, Clock, CheckCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface FreelancerCardProps {
  name: string;
  title: string;
  description: string;
  hourlyRate?: number;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  responseTime: string;
  location: string;
  avatar: string;
  skills: string[];
  isOnline: boolean;
  isVerified: boolean;
}

export function FreelancerCard({ 
  name,
  title,
  description,
  hourlyRate,
  rating,
  reviewCount,
  completedJobs,
  responseTime,
  location,
  avatar,
  skills,
  isOnline,
  isVerified
}: FreelancerCardProps) {
  return (
    <Card className="group overflow-hidden hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-0">
      <CardHeader className="p-6 pb-4">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="w-16 h-16">
              <AvatarImage src={avatar} />
              <AvatarFallback className="text-lg font-semibold">{name[0]}</AvatarFallback>
            </Avatar>
            {isOnline && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full border-2 border-background" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg truncate">{name}</h3>
              {isVerified && (
                <CheckCircle className="w-5 h-5 text-primary fill-primary/20" />
              )}
            </div>
            <p className="text-sm font-medium text-primary mb-2">{title}</p>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{rating}</span>
                <span>({reviewCount})</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{location}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-4">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {skills.slice(0, 4).map((skill, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {skills.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{skills.length - 4} mais
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Projetos concluídos</span>
            <p className="font-semibold">{completedJobs}</p>
          </div>
          <div>
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Responde em
            </span>
            <p className="font-semibold">{responseTime}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <div className="flex items-center justify-between w-full">
          <div>
            {hourlyRate && (
              <>
                <span className="text-sm text-muted-foreground">A partir de</span>
                <p className="text-lg font-bold text-primary">
                  R$ {hourlyRate}/hora
                </p>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <MessageCircle className="w-4 h-4" />
            </Button>
            <Button variant="default" size="sm">
              Contratar
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}