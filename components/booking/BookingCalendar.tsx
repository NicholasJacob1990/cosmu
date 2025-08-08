'use client';

import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, CheckCircle, AlertTriangle, User, CalendarDays } from 'lucide-react';
import { format, parse, isToday, isTomorrow, isThisWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TimeSlot {
  start_time: string;
  end_time: string;
  start_datetime: string;
  end_datetime: string;
}

interface AvailableSlots {
  date: string;
  freelancer_id: string;
  duration_hours: number;
  available_slots: TimeSlot[];
}

interface BookingCalendarProps {
  freelancerId: string;
  durationHours?: number;
  onTimeSlotSelect?: (slot: TimeSlot, date: Date) => void;
  className?: string;
}

export function BookingCalendar({
  freelancerId,
  durationHours = 1.0,
  onTimeSlotSelect,
  className
}: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [availableSlots, setAvailableSlots] = useState<AvailableSlots | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Fetch available time slots when date changes
  useEffect(() => {
    if (selectedDate && freelancerId) {
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate, freelancerId, durationHours]);

  const fetchAvailableSlots = async (date: Date) => {
    setLoading(true);
    setError(null);
    
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const response = await fetch(
        `/api/time-slots/available/?freelancer_id=${freelancerId}&date=${formattedDate}&duration_hours=${durationHours}`
      );
      
      if (!response.ok) {
        throw new Error('Erro ao buscar horários disponíveis');
      }
      
      const data = await response.json();
      setAvailableSlots(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setAvailableSlots(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    if (onTimeSlotSelect && selectedDate) {
      onTimeSlotSelect(slot, selectedDate);
    }
  };

  const formatTimeSlot = (slot: TimeSlot) => {
    const start = parse(slot.start_time, 'HH:mm:ss', new Date());
    const end = parse(slot.end_time, 'HH:mm:ss', new Date());
    return `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`;
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Hoje';
    if (isTomorrow(date)) return 'Amanhã';
    if (isThisWeek(date)) return format(date, 'EEEE', { locale: ptBR });
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  };

  const disabledDays = {
    before: new Date(), // Não permitir datas passadas
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Selecionar Data
          </CardTitle>
          <CardDescription>
            Escolha a data desejada para ver os horários disponíveis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={disabledDays}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horários Disponíveis
            </CardTitle>
            <CardDescription>
              {getDateLabel(selectedDate)} • Duração: {durationHours}h
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">Carregando horários...</span>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {availableSlots && !loading && !error && (
              <>
                {availableSlots.available_slots.length === 0 ? (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Nenhum horário disponível para esta data. Tente selecionar outra data.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      {availableSlots.available_slots.length} horário
                      {availableSlots.available_slots.length !== 1 ? 's' : ''} disponível
                      {availableSlots.available_slots.length !== 1 ? 'is' : ''}
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {availableSlots.available_slots.map((slot, index) => (
                        <Button
                          key={index}
                          variant={selectedSlot === slot ? "default" : "outline"}
                          className="h-auto p-3 flex flex-col items-center gap-1"
                          onClick={() => handleSlotSelect(slot)}
                        >
                          <Clock className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {formatTimeSlot(slot)}
                          </span>
                          {selectedSlot === slot && (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          )}
                        </Button>
                      ))}
                    </div>

                    {selectedSlot && (
                      <Card className="border-green-200 bg-green-50">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="font-medium text-green-800">
                                Horário Selecionado
                              </p>
                              <p className="text-sm text-green-600">
                                {getDateLabel(selectedDate)} às {formatTimeSlot(selectedSlot)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}