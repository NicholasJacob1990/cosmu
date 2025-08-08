'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ExternalLink,
  Edit,
  RotateCcw
} from 'lucide-react';
import { format, parseISO, isToday, isTomorrow, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Booking {
  id: string;
  order: string;
  freelancer: string;
  client: string;
  client_name: string;
  freelancer_name: string;
  scheduled_start: string;
  scheduled_end: string;
  actual_start?: string;
  actual_end?: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  status_display: string;
  meeting_link?: string;
  notes?: string;
  freelancer_notes?: string;
  duration_hours: number;
  can_cancel: boolean;
  reminder_sent: boolean;
  confirmation_sent: boolean;
  created_at: string;
  confirmed_at?: string;
  cancelled_at?: string;
  updated_at: string;
}

interface BookingListProps {
  userType?: 'client' | 'freelancer';
  className?: string;
}

export function BookingList({ userType = 'client', className }: BookingListProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings/');
      if (!response.ok) throw new Error('Erro ao carregar agendamentos');
      
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Erro ao atualizar status');

      await fetchBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return;

    try {
      const response = await fetch(`/api/bookings/${bookingId}/`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao cancelar agendamento');

      await fetchBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { variant: 'secondary' as const, color: 'text-blue-600' },
      confirmed: { variant: 'default' as const, color: 'text-green-600' },
      in_progress: { variant: 'default' as const, color: 'text-yellow-600' },
      completed: { variant: 'default' as const, color: 'text-green-600' },
      cancelled: { variant: 'destructive' as const, color: 'text-red-600' },
      no_show: { variant: 'destructive' as const, color: 'text-red-600' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    
    return (
      <Badge variant={config.variant} className={config.color}>
        {getStatusDisplay(status)}
      </Badge>
    );
  };

  const getStatusDisplay = (status: string) => {
    const displays = {
      scheduled: 'Agendado',
      confirmed: 'Confirmado',
      in_progress: 'Em Andamento',
      completed: 'Concluído',
      cancelled: 'Cancelado',
      no_show: 'Não Compareceu',
    };
    return displays[status as keyof typeof displays] || status;
  };

  const getDateLabel = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Hoje';
    if (isTomorrow(date)) return 'Amanhã';
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  };

  const filterBookings = (filterType: string) => {
    const now = new Date();
    
    switch (filterType) {
      case 'upcoming':
        return bookings.filter(booking => 
          parseISO(booking.scheduled_start) > now && 
          !['cancelled', 'completed'].includes(booking.status)
        );
      case 'past':
        return bookings.filter(booking => 
          parseISO(booking.scheduled_start) < now || 
          ['completed', 'cancelled'].includes(booking.status)
        );
      case 'today':
        return bookings.filter(booking => 
          isToday(parseISO(booking.scheduled_start))
        );
      default:
        return bookings;
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Carregando agendamentos...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Meus Agendamentos
          </CardTitle>
          <CardDescription>
            Gerencie seus agendamentos e acompanhe o status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upcoming">Próximos ({filterBookings('upcoming').length})</TabsTrigger>
              <TabsTrigger value="today">Hoje ({filterBookings('today').length})</TabsTrigger>
              <TabsTrigger value="past">Histórico ({filterBookings('past').length})</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4 mt-4">
              <BookingCards 
                bookings={filterBookings('upcoming')} 
                userType={userType}
                onStatusUpdate={handleStatusUpdate}
                onCancel={handleCancel}
              />
            </TabsContent>

            <TabsContent value="today" className="space-y-4 mt-4">
              <BookingCards 
                bookings={filterBookings('today')} 
                userType={userType}
                onStatusUpdate={handleStatusUpdate}
                onCancel={handleCancel}
              />
            </TabsContent>

            <TabsContent value="past" className="space-y-4 mt-4">
              <BookingCards 
                bookings={filterBookings('past')} 
                userType={userType}
                onStatusUpdate={handleStatusUpdate}
                onCancel={handleCancel}
                readonly
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

interface BookingCardsProps {
  bookings: Booking[];
  userType: 'client' | 'freelancer';
  onStatusUpdate: (bookingId: string, status: string) => void;
  onCancel: (bookingId: string) => void;
  readonly?: boolean;
}

function BookingCards({ bookings, userType, onStatusUpdate, onCancel, readonly = false }: BookingCardsProps) {
  if (bookings.length === 0) {
    return (
      <Alert>
        <Calendar className="h-4 w-4" />
        <AlertDescription>
          Nenhum agendamento encontrado para este período.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Card key={booking.id} className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {userType === 'client' ? booking.freelancer_name : booking.client_name}
                    </span>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(parseISO(booking.scheduled_start), 'dd/MM/yyyy', { locale: ptBR })}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(parseISO(booking.scheduled_start), 'HH:mm')} - {format(parseISO(booking.scheduled_end), 'HH:mm')}
                      <span className="text-muted-foreground ml-1">({booking.duration_hours}h)</span>
                    </span>
                  </div>

                  {booking.meeting_link && (
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={booking.meeting_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Link da Reunião
                      </a>
                    </div>
                  )}

                  {booking.notes && (
                    <div className="flex items-start gap-2 md:col-span-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-muted-foreground">{booking.notes}</span>
                    </div>
                  )}
                </div>
              </div>

              {!readonly && (
                <div className="flex flex-col gap-2 ml-4">
                  {userType === 'freelancer' && booking.status === 'scheduled' && (
                    <Button
                      size="sm"
                      onClick={() => onStatusUpdate(booking.id, 'confirmed')}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Confirmar
                    </Button>
                  )}

                  {booking.status === 'confirmed' && (
                    <Button
                      size="sm"
                      onClick={() => onStatusUpdate(booking.id, 'in_progress')}
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      Iniciar
                    </Button>
                  )}

                  {booking.status === 'in_progress' && (
                    <Button
                      size="sm"
                      onClick={() => onStatusUpdate(booking.id, 'completed')}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Concluir
                    </Button>
                  )}

                  {booking.can_cancel && !['completed', 'cancelled'].includes(booking.status) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onCancel(booking.id)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Cancelar
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}