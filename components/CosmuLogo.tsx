import { useTheme } from "@/hooks/useTheme";
import { galaxiaIcon } from "@/assets/brand/imports";

interface CosmuLogoProps {
  className?: string;
  width?: number;
  height?: number;
  showText?: boolean;
}

export function CosmuLogo({ 
  className = "", 
  width = 200, 
  height = 60,
  showText = true 
}: CosmuLogoProps) {
  const { theme } = useTheme();
  
  return (
    <div className={`flex items-center -space-x-1 ${className}`}>
      {/* Ícone COSMU */}
      <img
        src={galaxiaIcon}
        alt="COSMU Icon"
        width={96}
        height={96}
        className="transition-all duration-300"
      />
      
      {/* Texto COSMU */}
      <div className="flex flex-col justify-center">
        <h1 className={`text-3xl font-bold leading-tight ${theme === 'dark' ? 'logo-dark' : 'logo-light'}`}>
          COSMU
        </h1>
      </div>
    </div>
  );
}

// Componente apenas para o ícone
export function CosmuIcon({ 
  className = "", 
  size = 32 
}: { 
  className?: string;
  size?: number;
}) {
  return (
    <img
      src={galaxiaIcon}
      alt="COSMU Icon"
      width={size}
      height={size}
      className={`transition-all duration-300 ${className}`}
    />
  );
} 