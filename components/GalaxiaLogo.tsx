import Image from 'next/image';
import { useTheme } from '@/hooks/useTheme';

interface GalaxiaLogoProps {
  className?: string;
  width?: number;
  height?: number;
  showText?: boolean;
}

export function GalaxiaLogo({
  className = "",
  showText = true
}: GalaxiaLogoProps) {
  const { theme } = useTheme();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/brand/logos/galaxia-icon.png"
        alt="Galaxia Icon"
        width={40}
        height={40}
        className="transition-all duration-300"
      />
      {showText && (
        <span className="text-2xl font-bold">
          Galax<span className="text-primary">IA</span>
        </span>
      )}
    </div>
  );
}

export function GalaxiaIcon({
  className = "",
  size = 32
}: {
  className?: string;
  size?: number;
}) {
  return (
    <Image
      src="/brand/logos/galaxia-icon.png"
      alt="Galaxia Icon"
      width={size}
      height={size}
      className={`transition-all duration-300 ${className}`}
    />
  );
}
