import { Link } from "react-router-dom";
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1a0033] text-gray-300 relative overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20" />
      
      <div className="relative">
        {/* Newsletter Section */}
        <div className="border-b border-gray-800">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <h3 className="text-2xl font-bold text-white">
                Fique por dentro das novidades
              </h3>
              <p className="text-gray-400">
                Receba as melhores oportunidades e dicas para expandir seus negócios
              </p>
              <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input 
                  type="email" 
                  placeholder="Seu e-mail"
                  className="bg-white/10 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500"
                />
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Inscrever
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Logo and Description */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-white">GalaxIA</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                A plataforma mais inteligente para conectar talentos e oportunidades. 
                Transformamos a forma como profissionais e empresas se encontram através 
                da inteligência artificial.
              </p>
              {/* Social Media */}
              <div className="flex gap-3">
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                  aria-label="YouTube"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Para Clientes */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Para Clientes</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                    Como Funciona
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                    Encontrar Freelancers
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                    Postar Projeto
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                    Categorias
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                    Planos Enterprise
                  </Link>
                </li>
              </ul>
            </div>

            {/* Para Freelancers */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Para Freelancers</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                    Criar Perfil
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                    Encontrar Projetos
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                    Dicas de Sucesso
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                    Planos Premium
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                    Certificações
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contato */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Contato</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-purple-400 mt-0.5" />
                  <div>
                    <p className="text-gray-400">contato@galaxia.ai</p>
                    <p className="text-gray-400">suporte@galaxia.ai</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-purple-400 mt-0.5" />
                  <div>
                    <p className="text-gray-400">+55 (11) 4000-1234</p>
                    <p className="text-gray-400">+55 (11) 94000-5678</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-purple-400 mt-0.5" />
                  <div>
                    <p className="text-gray-400">Av. Paulista, 1000</p>
                    <p className="text-gray-400">São Paulo, SP - Brasil</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
                <Link to="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                  Termos de Uso
                </Link>
                <Separator orientation="vertical" className="h-4 bg-gray-700" />
                <Link to="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                  Política de Privacidade
                </Link>
                <Separator orientation="vertical" className="h-4 bg-gray-700" />
                <Link to="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                  Central de Ajuda
                </Link>
                <Separator orientation="vertical" className="h-4 bg-gray-700" />
                <Link to="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                  Blog
                </Link>
              </div>
              <p className="text-sm text-gray-500">
                © {currentYear} GalaxIA. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}