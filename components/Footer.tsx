import Link from 'next/link';
import { GalaxiaLogo } from '@/components/GalaxiaLogo';
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Para Clientes',
      links: [
        { label: 'Como Funciona', href: '/how-it-works' },
        { label: 'Encontrar Serviços', href: '/services' },
        { label: 'Encontrar Profissionais', href: '/freelancers' },
        { label: 'Publicar Projeto', href: '/create-project' },
        { label: 'Central de Ajuda', href: '/help' },
      ],
    },
    {
      title: 'Para Profissionais',
      links: [
        { label: 'Começar a Vender', href: '/register/freelancer' },
        { label: 'Como Vender', href: '/selling-guide' },
        { label: 'Planos e Preços', href: '/pricing' },
        { label: 'Academia GalaxIA', href: '/academy' },
        { label: 'Recursos', href: '/resources' },
      ],
    },
    {
      title: 'Empresa',
      links: [
        { label: 'Sobre Nós', href: '/about' },
        { label: 'Carreiras', href: '/careers' },
        { label: 'Blog', href: '/blog' },
        { label: 'Imprensa', href: '/press' },
        { label: 'Contato', href: '/contact' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Termos de Uso', href: '/terms' },
        { label: 'Política de Privacidade', href: '/privacy' },
        { label: 'Cookies', href: '/cookies' },
        { label: 'Propriedade Intelectual', href: '/ip-policy' },
      ],
    },
  ];

  const socialLinks = [
    { Icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { Icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { Icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { Icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { Icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
  ];

  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <GalaxiaLogo className="mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              Conectando talentos extraordinários com oportunidades ilimitadas.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-3">
              {socialLinks.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={label}
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold mb-3">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <div className="border-t pt-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>contato@galaxia.com.br</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>0800 123 4567</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>São Paulo, Brasil</span>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} GalaxIA. Todos os direitos reservados.</p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Link href="/terms" className="hover:text-primary transition-colors">
              Termos
            </Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacidade
            </Link>
            <Link href="/sitemap" className="hover:text-primary transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}