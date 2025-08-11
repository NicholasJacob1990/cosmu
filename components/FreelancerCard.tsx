import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Star, 
  Heart, 
  Clock, 
  MapPin,
  Shield,
  Award,
  Briefcase,
  Circle,
  MessageSquare,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FreelancerCardProps {
  freelancer: {
    name: string;
    title: string;
    description: string;
    hourlyRate: number;
    rating: number;
    reviewCount: number;
    completedJobs: number;
    responseTime: string;
    location: string;
    avatar: string;
    skills: string[];
    isOnline?: boolean;
    isVerified?: boolean;
    successRate?: number;
    level?: string;
  };
  className?: string;
  layout?: 'grid' | 'list';
}

export function FreelancerCard({ freelancer, className, layout = 'grid' }: FreelancerCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFavorite(!isFavorite);
  };

  if (layout === 'list') {
    return (
      <Card className={cn("overflow-hidden hover:shadow-lg transition-shadow", className)}>
        <Link href={`/freelancer/${freelancer.name.toLowerCase().replace(/\s+/g, '-')}`}>
          <CardContent className="p-6">
            <div className="flex gap-4">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={freelancer.avatar} alt={freelancer.name} />
                  <AvatarFallback>{freelancer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                {freelancer.isOnline && (
                  <Circle className="absolute bottom-0 right-0 h-5 w-5 fill-green-500 text-green-500 bg-white rounded-full" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{freelancer.name}</h3>
                      {freelancer.isVerified && (
                        <Shield className="h-4 w-4 text-blue-500" />
                      )}
                      {freelancer.level && (
                        <Badge variant="secondary">{freelancer.level}</Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-2">{freelancer.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {freelancer.description}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleFavoriteClick}
                  >
                    <Heart 
                      className={cn(
                        "h-5 w-5",
                        isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
                      )} 
                    />
                  </Button>
                </div>

                <div className="flex items-center gap-6 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{freelancer.rating}</span>
                    <span className="text-sm text-muted-foreground">({freelancer.reviewCount})</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    {freelancer.completedJobs} trabalhos
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {freelancer.responseTime}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {freelancer.location}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {freelancer.skills.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                    {freelancer.skills.length > 3 && (
                      <Badge variant="outline">+{freelancer.skills.length - 3}</Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">R$ {freelancer.hourlyRate}/h</p>
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
      <Link href={`/freelancer/${freelancer.name.toLowerCase().replace(/\s+/g, '-')}`}>
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={freelancer.avatar} alt={freelancer.name} />
                  <AvatarFallback>{freelancer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                {freelancer.isOnline && (
                  <Circle className="absolute -bottom-1 -right-1 h-4 w-4 fill-green-500 text-green-500 bg-white rounded-full" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{freelancer.name}</h3>
                  {freelancer.isVerified && (
                    <Shield className="h-4 w-4 text-blue-500" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{freelancer.title}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
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

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
            {freelancer.description}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{freelancer.rating}</span>
              <span className="text-muted-foreground">({freelancer.reviewCount})</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              {freelancer.completedJobs} trabalhos
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {freelancer.responseTime}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {freelancer.location}
            </div>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-1 mb-4">
            {freelancer.skills.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {freelancer.skills.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{freelancer.skills.length - 3}
              </Badge>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <p className="text-xs text-muted-foreground">Por hora</p>
              <p className="text-lg font-bold">R$ {freelancer.hourlyRate}</p>
            </div>
            <Button size="sm">
              <MessageSquare className="h-4 w-4 mr-1" />
              Contatar
            </Button>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}