import { useTheme } from "@/hooks/useTheme";
import { galaxiaIcon } from "@/assets/brand/imports";

interface GalaxiaLogoProps {
  className?: string;
  width?: number;
  height?: number;
  showText?: boolean;
}

export function GalaxiaLogo({ 
  className = "", 
  width = 200, 
  height = 60,
  showText = true 
}: GalaxiaLogoProps) {
  const { theme } = useTheme();
  
  return (
    <div className={`flex items-center -space-x-1 ${className}`}>
      {/* Ícone GalaxIA */}
      <img
        src={galaxiaIcon}
        alt="GalaxIA Icon"
        width={96}
        height={96}
        className="transition-all duration-300"
      />
      
      {/* Texto GalaxIA */}
      <div className="flex flex-col justify-center">
        <h1 className={`text-3xl font-bold leading-tight ${theme === 'dark' ? 'logo-dark' : 'logo-light'}`}>
          Galax<span className="bg-gradient-to-r from-galaxia-grad-a to-galaxia-grad-c bg-clip-text text-transparent">IA</span>
        </h1>
      </div>
    </div>
  );
}

// Componente apenas para o ícone
export function GalaxiaIcon({ 
  className = "", 
  size = 32 
}: { 
  className?: string;
  size?: number;
}) {
  return (
    <img
      src={galaxiaIcon}
      alt="GalaxIA Icon"
      width={size}
      height={size}
      className={`transition-all duration-300 ${className}`}
    />
  );
} 