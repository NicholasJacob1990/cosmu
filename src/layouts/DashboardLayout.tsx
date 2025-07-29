import React from 'react';
import {
  Bell,
  BarChart3,
  User,
  PanelLeft,
  Search,
  LayoutGrid,
  ClipboardList,
  MessageSquare,
  Star,
  CreditCard,
  PlusCircle,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar';

import { GalaxiaLogo } from '@/components/GalaxiaLogo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userType: 'client' | 'professional';
}

const clientNavItems = [
  { icon: <LayoutGrid size={20} />, label: 'Dashboard', href: '/client-dashboard' },
  { icon: <ClipboardList size={20} />, label: 'Meus Projetos', href: '/client/projects', badge: '12' },
  { icon: <MessageSquare size={20} />, label: 'Mensagens', href: '/client/messages', badge: '3' },
  { icon: <Star size={20} />, label: 'Listas Salvas', href: '/client/saved-lists' },
  { icon: <CreditCard size={20} />, label: 'Pagamentos', href: '/client/payments' },
  { icon: <Search size={20} />, label: 'Buscar Serviços', href: '/services' },
];

const professionalNavItems = [
  { icon: <LayoutGrid size={20} />, label: 'Dashboard', href: '/dashboard' },
  { icon: <BarChart3 size={20} />, label: 'Pipeline de Vendas', href: '/professional/pipeline', badge: '23' },
  { icon: <ClipboardList size={20} />, label: 'Projetos Ativos', href: '/professional/projects', badge: '8' },
  { icon: <CreditCard size={20} />, label: 'Financeiro', href: '/professional/finance' },
  { icon: <Star size={20} />, label: 'Performance', href: '/professional/performance' },
  { icon: <Search size={20} />, label: 'Oportunidades', href: '/professional/opportunities', badge: '12' },
];

export function DashboardLayout({ children, userType }: DashboardLayoutProps) {
  const navItems = userType === 'client' ? clientNavItems : professionalNavItems;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar>
        <SidebarHeader>
          <GalaxiaLogo />
        </SidebarHeader>
        <SidebarContent>
          {navItems.map((item) => (
            <SidebarMenuButton
              key={item.label}
              icon={item.icon}
              href={item.href}
              className="w-full"
              isActive={window.location.pathname === item.href}
              badge={item.badge}
            >
              {item.label}
            </SidebarMenuButton>
          ))}
          <SidebarSeparator />
                           {userType === 'client' ? (
                     <Button 
                       className="w-full justify-start gap-2 bg-gradient-to-r from-galaxia-magenta to-galaxia-neon text-white"
                       onClick={() => window.location.href = '/create-project'}
                     >
                     <PlusCircle size={20} /> Postar Novo Projeto
                   </Button>
                 ) : (
            <>
               <Button className="w-full justify-start gap-2 bg-gradient-to-r from-galaxia-magenta to-galaxia-neon text-white">
                <Search size={20} /> Buscar Projetos
              </Button>
               <Button variant="outline" className="w-full justify-start gap-2">
                <PlusCircle size={20} /> Criar Proposta Rápida
              </Button>
            </>
          )}
        </SidebarContent>
        <SidebarFooter>
            <ThemeToggle />
            <SidebarMenuButton icon={<User />} href="/profile">
                Meu Perfil
            </SidebarMenuButton>
        </SidebarFooter>
      </Sidebar>

      <div className="flex flex-col flex-1">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur px-4 md:px-6">
          <div className="flex items-center gap-4">
            <SidebarMenuButton
                variant="ghost"
                icon={<PanelLeft className="h-6 w-6" />}
                className="md:hidden"
            />
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Busca Global com IA..."
              className="w-full rounded-lg bg-background pl-8 md:w-[300px] lg:w-[400px]"
            />
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <BarChart3 className="h-5 w-5" />
               <span className="sr-only">Mini Dashboard</span>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
              <span className="sr-only">User menu</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">
            {children}
        </main>
      </div>
    </div>
  );
} 