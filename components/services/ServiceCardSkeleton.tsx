import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface ServiceCardSkeletonProps {
  layout?: "grid" | "list";
}

export function ServiceCardSkeleton({ layout = 'grid' }: ServiceCardSkeletonProps) {
  if (layout === 'list') {
    return (
      <Card className="overflow-hidden">
        <div className="flex">
          <div className="w-48 h-32 bg-muted animate-pulse" />
          <CardContent className="flex-1 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-muted rounded-full animate-pulse" />
              <div className="w-24 h-4 bg-muted rounded animate-pulse" />
              <div className="w-16 h-5 bg-muted rounded animate-pulse" />
            </div>
            <div className="w-3/4 h-5 bg-muted rounded animate-pulse mb-2" />
            <div className="w-1/2 h-4 bg-muted rounded animate-pulse mb-4" />
            <div className="flex justify-between items-center">
              <div className="w-16 h-4 bg-muted rounded animate-pulse" />
              <div className="w-20 h-6 bg-muted rounded animate-pulse" />
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="aspect-video bg-muted animate-pulse" />
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-muted rounded-full animate-pulse" />
          <div className="w-24 h-4 bg-muted rounded animate-pulse" />
          <div className="w-16 h-5 bg-muted rounded animate-pulse" />
        </div>
        <div className="w-full h-5 bg-muted rounded animate-pulse mb-2" />
        <div className="w-3/4 h-4 bg-muted rounded animate-pulse mb-4" />
        <div className="flex justify-between items-center pt-3 border-t">
          <div className="w-16 h-4 bg-muted rounded animate-pulse" />
          <div className="w-20 h-6 bg-muted rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}