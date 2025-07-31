import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Bell, 
  BarChart3, 
  User, 
  Settings, 
  LogOut, 
  MessageSquare,
  DollarSign,
  Calendar,
  Sparkles,
  Menu
} from 'lucide-react';
import { GalaxiaLogo } from '@/components/GalaxiaLogo';
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
  userType: 'client' | 'professional';
  onMenuClick: () => void;
  user?: {
    name: string;
    email: string;
    avatar?: string;
    plan?: string;
  };
}

interface NotificationItem {
  id: string;
  type: 'message' | 'payment' | 'proposal' | 'system';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  urgent?: boolean;
}

interface SearchSuggestion {
  id: string;
  type: 'service' | 'professional' | 'project' | 'command';
  title: string;
  subtitle?: string;
  icon?: string;
}

export function DashboardHeader({ userType, onMenuClick, user }: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);

  // Mock notifications - em produção viria do WebSocket
  useEffect(() => {
    const mockNotifications: NotificationItem[] = [
      {
        id: '1',
        type: 'message',
        title: 'Nova mensagem de João Silva',
        description: 'Enviou proposta para seu projeto de design',
        timestamp: '2 min atrás',
        read: false,
        urgent: true
      },
      {
        id: '2',
        type: 'payment',
        title: 'Pagamento processado',
        description: 'R$ 2.500 foi depositado em sua conta',
        timestamp: '1h atrás',
        read: false
      },
      {
        id: '3',
        type: 'proposal',
        title: '3 novas propostas recebidas',
        description: 'Para seu projeto "App Mobile E-commerce"',
        timestamp: '3h atrás',
        read: true
      },
      {
        id: '4',
        type: 'system',
        title: 'Perfil destacado ativo',
        description: 'Seu perfil está sendo exibido em destaque por mais 2 dias',
        timestamp: '1 dia atrás',
        read: true
      }
    ];
    setNotifications(mockNotifications);
  }, []);

  // Mock search suggestions com IA
  useEffect(() => {
    if (searchQuery.length > 0) {
      const mockSuggestions: SearchSuggestion[] = [
        {
          id: '1',
          type: 'service',
          title: 'Desenvolvimento de App Mobile',
          subtitle: '142 profissionais disponíveis',
          icon: '📱'
        },
        {
          id: '2',
          type: 'professional',
          title: 'João Silva - Designer UI/UX',
          subtitle: '⭐ 4.9 • R$ 85/hora',
          icon: '👨‍💻'
        },
        {
          id: '3',
          type: 'command',
          title: 'Criar novo projeto',
          subtitle: 'Postar trabalho para freelancers',
          icon: '➕'
        },
        {
          id: '4',
          type: 'service',
          title: 'Marketing Digital',
          subtitle: '89 especialistas ativos',
          icon: '📈'
        }
      ];
      setSearchSuggestions(mockSuggestions);
    } else {
      setSearchSuggestions([]);
    }
  }, [searchQuery]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const urgentCount = notifications.filter(n => !n.read && n.urgent).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-4 w-4" />;
      case 'payment':
        return <DollarSign className="h-4 w-4" />;
      case 'proposal':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'command':
        return <Sparkles className="h-4 w-4 text-galaxia-neon" />;
      default:
        return null;
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-background/95 backdrop-blur border-b border-border/40">
      <div className="flex items-center justify-between h-full px-4 max-w-screen-2xl mx-auto">
        {/* Left Section - Logo + Menu */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <Link href="/" className="flex items-center gap-2">
            <GalaxiaLogo size="sm" />
            <div className="hidden sm:block">
              <div className="text-sm font-semibold">GalaxIA</div>
              <div className="text-xs text-muted-foreground">Cosmic Connections</div>
            </div>
          </Link>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-2xl mx-8 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={userType === 'client' 
                ? "🤖 Encontre serviços, profissionais ou digite comandos..."
                : "🤖 Busque projetos, clientes ou use comandos IA..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              className="pl-10 pr-4 h-10 bg-muted/50 border-muted-foreground/20 focus:bg-background transition-colors"
            />
            
            {/* AI-powered search suggestions */}
            {searchFocused && (searchQuery.length > 0 || searchSuggestions.length === 0) && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
                {searchQuery.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <Sparkles className="h-8 w-8 mx-auto mb-2 text-galaxia-neon" />
                    <p className="font-medium">Busca Inteligente com IA</p>
                    <p className="text-sm">Digite para encontrar serviços, profissionais ou usar comandos</p>
                  </div>
                ) : (
                  <>
                    <div className="p-2 text-xs text-muted-foreground border-b flex items-center gap-2">
                      <Sparkles className="h-3 w-3 text-galaxia-neon" />
                      Sugestões inteligentes para "{searchQuery}"
                    </div>
                    {searchSuggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <div className="text-lg">
                          {suggestion.icon}
                          {getSuggestionIcon(suggestion.type)}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{suggestion.title}</div>
                          {suggestion.subtitle && (
                            <div className="text-xs text-muted-foreground">{suggestion.subtitle}</div>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {suggestion.type === 'command' ? 'Ação' : 
                           suggestion.type === 'professional' ? 'Perfil' : 
                           'Serviço'}
                        </Badge>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2">
          {/* Mini Dashboard */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <BarChart3 className="h-5 w-5" />
                <Badge 
                  variant="secondary" 
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-galaxia-neon text-white"
                >
                  {userType === 'client' ? '3' : '7'}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Dashboard Rápido</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {userType === 'client' ? (
                <>
                  <DropdownMenuItem>
                    <div className="flex justify-between w-full">
                      <span>Projetos Ativos</span>
                      <Badge>3</Badge>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <div className="flex justify-between w-full">
                      <span>Propostas Recebidas</span>
                      <Badge variant="secondary">12</Badge>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <div className="flex justify-between w-full">
                      <span>Investimento Mensal</span>
                      <span className="text-sm font-medium">R$ 8.5k</span>
                    </div>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem>
                    <div className="flex justify-between w-full">
                      <span>Projetos Ativos</span>
                      <Badge>7</Badge>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <div className="flex justify-between w-full">
                      <span>Faturamento Mensal</span>
                      <span className="text-sm font-medium">R$ 15.2k</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <div className="flex justify-between w-full">
                      <span>Taxa de Sucesso</span>
                      <span className="text-sm font-medium">94%</span>
                    </div>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className={cn(
                      "absolute -top-1 -right-1 h-4 w-4 p-0 text-xs",
                      urgentCount > 0 && "animate-pulse bg-red-500"
                    )}
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                Notificações
                {unreadCount > 0 && (
                  <Badge variant="secondary">{unreadCount} novas</Badge>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2" />
                    <p>Nenhuma notificação</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className={cn(
                        "flex items-start gap-3 p-4 cursor-pointer",
                        !notification.read && "bg-muted/50",
                        notification.urgent && "border-l-2 border-l-red-500"
                      )}
                    >
                      <div className={cn(
                        "flex-shrink-0 p-1 rounded-full",
                        notification.type === 'message' && "bg-blue-100 text-blue-600",
                        notification.type === 'payment' && "bg-green-100 text-green-600",
                        notification.type === 'proposal' && "bg-purple-100 text-purple-600",
                        notification.type === 'system' && "bg-gray-100 text-gray-600"
                      )}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{notification.title}</div>
                        <div className="text-xs text-muted-foreground">{notification.description}</div>
                        <div className="text-xs text-muted-foreground mt-1">{notification.timestamp}</div>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                      )}
                    </DropdownMenuItem>
                  ))
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center justify-center">
                Ver todas as notificações
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback>
                    {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name || 'Usuário'}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email || 'email@exemplo.com'}</p>
                  {user?.plan && (
                    <Badge variant="outline" className="w-fit text-xs mt-1">{user.plan}</Badge>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}