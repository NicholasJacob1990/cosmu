// GalaxIA Brand Assets - Imports
// Este arquivo demonstra como importar e usar os assets da marca

// 📁 Logos da Marca
import galaxiaLogoLight from './logos/galaxia-logo-light.png';
import galaxiaLogoDark from './logos/galaxia-logo-dark.png';
import galaxiaIcon from './logos/galaxia-icon.png';
// import galaxiaWatermark from './logos/galaxia-watermark.png';

// Exportações diretas dos logos
export { galaxiaLogoLight, galaxiaLogoDark, galaxiaIcon };

// 🎨 Ícones da Marca
// import rocketIcon from './icons/rocket.svg';
// import starIcon from './icons/star.svg';
// import planetIcon from './icons/planet.svg';
// import galaxyIcon from './icons/galaxy.svg';

// 🖼️ Imagens da Marca
// import heroBackground from './images/hero-bg.jpg';
// import teamPhoto from './images/team-photo.jpg';
// import officeSpace from './images/office-space.jpg';

// 📋 Exemplo de uso em componentes:
/*
import { galaxiaLogoHorizontal, rocketIcon } from '@/assets/brand/imports';

export function BrandHeader() {
  return (
    <header className="flex items-center gap-3">
      <img 
        src={galaxiaLogoHorizontal} 
        alt="GalaxIA Logo" 
        className="h-8 w-auto"
      />
      <img 
        src={rocketIcon} 
        alt="Rocket Icon" 
        className="h-6 w-6"
      />
    </header>
  );
}
*/

// 🎯 Tipos TypeScript para assets
export interface BrandAsset {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

// 📦 Exportações organizadas
export const brandAssets = {
  logos: {
    light: galaxiaLogoLight,
    dark: galaxiaLogoDark,
    icon: galaxiaIcon,
    // watermark: galaxiaWatermark,
  },
  icons: {
    // rocket: rocketIcon,
    // star: starIcon,
    // planet: planetIcon,
    // galaxy: galaxyIcon,
  },
  images: {
    // hero: heroBackground,
    // team: teamPhoto,
    // office: officeSpace,
  },
};

// 🚀 Função helper para usar assets
export function useBrandAsset(type: 'logos' | 'icons' | 'images', name: string): string {
  const assets = brandAssets[type] as Record<string, string>;
  return assets[name] || '';
}

// 📝 Exemplo de uso:
// const logoUrl = useBrandAsset('logos', 'horizontal');
// const iconUrl = useBrandAsset('icons', 'rocket'); 