import Link from "next/link";
import { useRouter } from "next/navigation";
import { GalaxiaLogo } from "@/components/GalaxiaLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function Header() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/">
            <GalaxiaLogo />
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
            <Link href="/services" className="text-muted-foreground hover:text-foreground">
              Buscar Serviços
            </Link>
            <Link href="/freelancers" className="text-muted-foreground hover:text-foreground">
              Encontrar Profissionais
            </Link>
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground">
              Nossos Planos
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Busca Rápida..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[300px]"
            />
          </div>
          <ThemeToggle />
          <div className="hidden sm:flex items-center gap-2">
            <Button variant="ghost" onClick={() => router.push('/login')}>
              Entrar
            </Button>
            <Button onClick={() => router.push('/register')} className="bg-gradient-to-r from-galaxia-magenta to-galaxia-neon text-white">
              Cadastre-se
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
} 