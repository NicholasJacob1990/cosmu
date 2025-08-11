import { cn } from '@/lib/utils';

interface GalaxiaLogoProps {
  className?: string;
  showText?: boolean;
}

export function GalaxiaLogo({ className, showText = true }: GalaxiaLogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg rotate-45"></div>
        <div className="absolute inset-2 bg-white dark:bg-gray-900 rounded rotate-45"></div>
        <div className="absolute inset-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded rotate-45"></div>
      </div>
      {showText && (
        <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          GalaxIA
        </span>
      )}
    </div>
  );
}