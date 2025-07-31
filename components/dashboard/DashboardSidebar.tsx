import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BarChart3, 
  FolderOpen, 
  MessageSquare, 
  Heart, 
  CreditCard,
  Search,
  Plus,
  User,
  Settings,
  Star,
  TrendingUp,
  Calendar,
  Briefcase,
  Users,
  Award,
  PlusCircle,
  Target,
  Zap,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardSidebarProps {
  userType: 'client' | 'professional';
  isOpen: boolean;
  onClose: () => void;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  href: string;
  badge?: string | number;
  isActive?: boolean;
  color?: string;
}

interface SidebarSection {
  title?: string;
  items: SidebarItem[];
}

export function DashboardSidebar({ userType, isOpen, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  
  // Mock data - em produção viria do estado global
  const clientStats = {
    activeProjects: 12,
    unreadMessages: 3,
    savedItems: 47,
    pendingPayments: 2
  };

  const professionalStats = {
    activeProjects: 7,
    unreadMessages: 5,
    activeServices: 12,
    pendingProposals: 8,
    earnings: 'R$ 15.2k'
  };

  const getClientSections = (): SidebarSection[] => [
    {
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: BarChart3,
          href: '/client-dashboard',
          isActive: pathname === '/client-dashboard'
        },
        {
          id: 'projects',
          label: 'Meus Projetos',
          icon: FolderOpen,
          href: '/client-dashboard?tab=projetos',
          badge: clientStats.activeProjects,
          color: 'text-blue-600'
        },
        {
          id: 'messages',
          label: 'Mensagens',
          icon: MessageSquare,
          href: '/messages',
          badge: clientStats.unreadMessages,
          color: 'text-green-600'
        },
        {
          id: 'saved',
          label: 'Listas Salvas',
          icon: Heart,
          href: '/saved',
          badge: clientStats.savedItems,
          color: 'text-red-600'
        },
        {
          id: 'payments',
          label: 'Pagamentos',
          icon: CreditCard,
          href: '/client-dashboard?tab=pagamentos',
          badge: clientStats.pendingPayments > 0 ? clientStats.pendingPayments : undefined,
          color: 'text-purple-600'
        },
        {
          id: 'search',
          label: 'Buscar Serviços',
          icon: Search,
          href: '/search',
          color: 'text-galaxia-neon'
        }
      ]
    }
  ];

  const getProfessionalSections = (): SidebarSection[] => [
    {
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: BarChart3,
          href: '/dashboard',
          isActive: pathname === '/dashboard'
        },
        {
          id: 'projects',
          label: 'Projetos Ativos',
          icon: Briefcase,
          href: '/dashboard?tab=projetos',
          badge: professionalStats.activeProjects,
          color: 'text-blue-600'
        },
        {
          id: 'proposals',
          label: 'Propostas',
          icon: Target,
          href: '/proposals',
          badge: professionalStats.pendingProposals,
          color: 'text-orange-600'
        },
        {
          id: 'messages',
          label: 'Mensagens',
          icon: MessageSquare,
          href: '/messages',
          badge: professionalStats.unreadMessages,
          color: 'text-green-600'
        },
        {
          id: 'services',
          label: 'Meus Serviços',
          icon: Star,
          href: '/dashboard?tab=servicos',
          badge: professionalStats.activeServices,
          color: 'text-yellow-600'
        },
        {
          id: 'earnings',
          label: 'Ganhos',
          icon: TrendingUp,
          href: '/dashboard?tab=ganhos',
          color: 'text-green-600'
        },
        {
          id: 'calendar',
          label: 'Agenda',
          icon: Calendar,
          href: '/calendar',
          color: 'text-indigo-600'
        },
        {
          id: 'clients',
          label: 'Meus Clientes',
          icon: Users,
          href: '/clients',
          color: 'text-purple-600'
        }
      ]
    },
    {
      title: 'Crescimento',
      items: [
        {
          id: 'analytics',
          label: 'Analytics',
          icon: BarChart3,
          href: '/dashboard?tab=analytics',
          color: 'text-blue-600'
        },
        {
          id: 'reputation',
          label: 'Reputação',
          icon: Award,
          href: '/reputation',
          color: 'text-gold-600'
        },
        {
          id: 'marketing',
          label: 'Marketing',
          icon: Globe,
          href: '/marketing',
          color: 'text-pink-600'
        }
      ]
    }
  ];

  const sections = userType === 'client' ? getClientSections() : getProfessionalSections();

  const primaryAction = userType === 'client' 
    ? { label: 'POSTAR NOVO PROJETO', href: '/post-project', icon: Plus }
    : { label: 'CRIAR NOVO SERVIÇO', href: '/create-service', icon: PlusCircle };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] w-60 bg-background border-r border-border/40 z-50 transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0 lg:static lg:h-[calc(100vh-4rem)]"
      )}>
        <ScrollArea className="h-full">
          <div className="p-4 space-y-6">
            {/* Primary Action Button */}
            <Button 
              asChild
              className={cn(
                "w-full h-12 text-white font-semibold shadow-lg",
                userType === 'client' 
                  ? "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  : "bg-gradient-to-r from-galaxia-magenta to-galaxia-neon hover:from-galaxia-neon hover:to-galaxia-magenta"
              )}
            >
              <Link href={primaryAction.href} className="flex items-center gap-2">
                <primaryAction.icon className="h-5 w-5" />
                {primaryAction.label}
              </Link>
            </Button>

            {/* Navigation Sections */}
            {sections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                {section.title && (
                  <>
                    <Separator />
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-2">
                      {section.title}
                    </h3>
                  </>
                )}
                
                <nav className="space-y-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.id}
                      to={item.href}
                      onClick={() => onClose()}
                      className={cn(
                        "flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group",
                        item.isActive
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={cn(
                          "h-5 w-5 transition-colors",
                          item.isActive ? "text-primary" : item.color || "text-muted-foreground"
                        )} />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      
                      {item.badge && (
                        <Badge 
                          variant={item.isActive ? "default" : "secondary"}
                          className={cn(
                            "h-5 px-2 text-xs font-semibold",
                            !item.isActive && typeof item.badge === 'number' && item.badge > 0 && "bg-red-500 text-white"
                          )}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  ))}
                </nav>
              </div>
            ))}

            {/* Quick Stats */}
            <div className="space-y-3">
              <Separator />
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-2">
                Resumo Rápido
              </h3>
              
              {userType === 'client' ? (
                <div className="space-y-2 px-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Investimento Mensal</span>
                    <span className="font-semibold">R$ 8.5k</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Projetos Concluídos</span>
                    <span className="font-semibold">24</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Taxa de Sucesso</span>
                    <span className="font-semibold text-green-600">96%</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 px-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Faturamento Mensal</span>
                    <span className="font-semibold text-green-600">{professionalStats.earnings}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Clientes Ativos</span>
                    <span className="font-semibold">18</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Rating Médio</span>
                    <span className="font-semibold text-yellow-600">⭐ 4.9</span>
                  </div>
                </div>
              )}
            </div>

            {/* Settings Section */}
            <div className="space-y-3">
              <Separator />
              <nav className="space-y-1">
                <Link
                  to="/profile"
                  onClick={() => onClose()}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all duration-200"
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">Meu Perfil</span>
                </Link>
                <Link
                  to="/settings"
                  onClick={() => onClose()}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all duration-200"
                >
                  <Settings className="h-5 w-5" />
                  <span className="font-medium">Configurações</span>
                </Link>
              </nav>
            </div>

            {/* Pro Badge (for professionals) */}
            {userType === 'professional' && (
              <div className="p-3 bg-gradient-to-r from-galaxia-magenta/10 to-galaxia-neon/10 border border-galaxia-magenta/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-galaxia-neon" />
                  <span className="text-sm font-semibold">GalaxIA Pro</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Aumente sua visibilidade e ganhe mais projetos
                </p>
                <Button size="sm" className="w-full bg-galaxia-magenta hover:bg-galaxia-neon text-white">
                  Fazer Upgrade
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </aside>
    </>
  );
}