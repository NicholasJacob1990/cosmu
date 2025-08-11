'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GalaxiaLogo } from '@/components/GalaxiaLogo';
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  Heart,
  DollarSign,
  BarChart,
  Settings,
  HelpCircle,
  LogOut,
  Stethoscope,
  Pill,
  ClipboardList,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  collapsed?: boolean;
  userType?: 'healthcare' | 'client' | 'professional';
}

const menuItems = {
  healthcare: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/healthcare-dashboard' },
    { icon: Calendar, label: 'Agenda', href: '/appointments' },
    { icon: Users, label: 'Pacientes', href: '/patients' },
    { icon: FileText, label: 'Prontuários', href: '/records' },
    { icon: Heart, label: 'Saúde', href: '/health' },
    { icon: Pill, label: 'Prescrições', href: '/prescriptions' },
    { icon: BarChart, label: 'Relatórios', href: '/reports' },
    { icon: DollarSign, label: 'Financeiro', href: '/finance' },
  ],
  client: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/client-dashboard' },
    { icon: FileText, label: 'Projetos', href: '/projects' },
    { icon: Users, label: 'Freelancers', href: '/freelancers' },
    { icon: DollarSign, label: 'Pagamentos', href: '/payments' },
    { icon: BarChart, label: 'Relatórios', href: '/reports' },
  ],
  professional: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: FileText, label: 'Projetos', href: '/projects' },
    { icon: Users, label: 'Clientes', href: '/clients' },
    { icon: DollarSign, label: 'Ganhos', href: '/earnings' },
    { icon: BarChart, label: 'Analytics', href: '/analytics' },
  ]
};

export function DashboardSidebar({ collapsed = false, userType = 'healthcare' }: SidebarProps) {
  const pathname = usePathname();
  const items = menuItems[userType] || menuItems.healthcare;

  return (
    <aside className={cn(
      "flex h-screen flex-col border-r bg-card transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="p-6">
        <GalaxiaLogo showText={!collapsed} />
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <Icon className={cn("h-5 w-5", !collapsed && "mr-2")} />
                  {!collapsed && item.label}
                </Button>
              </Link>
            );
          })}
        </div>
      </ScrollArea>

      <div className="border-t p-3">
        <div className="space-y-1">
          <Button variant="ghost" className={cn("w-full justify-start", collapsed && "justify-center px-2")}>
            <Settings className={cn("h-5 w-5", !collapsed && "mr-2")} />
            {!collapsed && "Configurações"}
          </Button>
          <Button variant="ghost" className={cn("w-full justify-start", collapsed && "justify-center px-2")}>
            <HelpCircle className={cn("h-5 w-5", !collapsed && "mr-2")} />
            {!collapsed && "Ajuda"}
          </Button>
          <Button variant="ghost" className={cn("w-full justify-start text-red-600", collapsed && "justify-center px-2")}>
            <LogOut className={cn("h-5 w-5", !collapsed && "mr-2")} />
            {!collapsed && "Sair"}
          </Button>
        </div>
      </div>
    </aside>
  );
}