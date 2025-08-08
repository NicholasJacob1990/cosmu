'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, 
  Plus, 
  Trash2, 
  Calendar, 
  CheckCircle, 
  AlertTriangle,
  Settings,
  Save,
  Edit
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface Availability {
  id: string;
  day_of_week: number;
  day_of_week_display: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  buffer_time: number;
  created_at: string;
  updated_at: string;
}

interface AvailabilityForm {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  buffer_time: number;
}

export function AvailabilityManager() {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<AvailabilityForm>({
    day_of_week: 0,
    start_time: '09:00',
    end_time: '17:00',
    is_available: true,
    buffer_time: 15
  });

  const weekDays = [
    { value: 0, label: 'Segunda-feira' },
    { value: 1, label: 'Terça-feira' },
    { value: 2, label: 'Quarta-feira' },
    { value: 3, label: 'Quinta-feira' },
    { value: 4, label: 'Sexta-feira' },
    { value: 5, label: 'Sábado' },
    { value: 6, label: 'Domingo' },
  ];

  useEffect(() => {
    fetchAvailabilities();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchAvailabilities = async () => {
    try {
      const response = await fetch('/api/availability/');
      if (!response.ok) throw new Error('Erro ao carregar disponibilidades');
      
      const data = await response.json();
      setAvailabilities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const url = editingId ? `/api/availability/${editingId}/` : '/api/availability/';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao salvar disponibilidade');
      }

      setSuccess(editingId ? 'Disponibilidade atualizada!' : 'Disponibilidade criada!');
      setShowForm(false);
      setEditingId(null);
      resetForm();
      await fetchAvailabilities();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta disponibilidade?')) return;

    try {
      const response = await fetch(`/api/availability/${id}/`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao excluir disponibilidade');

      setSuccess('Disponibilidade excluída!');
      await fetchAvailabilities();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  };

  const handleEdit = (availability: Availability) => {
    setFormData({
      day_of_week: availability.day_of_week,
      start_time: availability.start_time,
      end_time: availability.end_time,
      is_available: availability.is_available,
      buffer_time: availability.buffer_time,
    });
    setEditingId(availability.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      day_of_week: 0,
      start_time: '09:00',
      end_time: '17:00',
      is_available: true,
      buffer_time: 15
    });
    setEditingId(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    resetForm();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Carregando disponibilidades...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Gerenciar Disponibilidade
          </CardTitle>
          <CardDescription>
            Configure os dias e horários em que você está disponível para atendimento
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showForm ? (
            <Button onClick={() => setShowForm(true)} className="mb-4">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Disponibilidade
            </Button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="day_of_week">Dia da Semana</Label>
                  <select
                    id="day_of_week"
                    value={formData.day_of_week}
                    onChange={(e) => setFormData({ ...formData, day_of_week: parseInt(e.target.value) })}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    {weekDays.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_available"
                    checked={formData.is_available}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
                  />
                  <Label htmlFor="is_available">Disponível</Label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="start_time">Horário de Início</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="end_time">Horário de Fim</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="buffer_time">Intervalo (minutos)</Label>
                  <Input
                    id="buffer_time"
                    type="number"
                    min="0"
                    max="120"
                    value={formData.buffer_time}
                    onChange={(e) => setFormData({ ...formData, buffer_time: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Salvando...' : editingId ? 'Atualizar' : 'Salvar'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
              </div>
            </form>
          )}

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <Separator className="my-4" />

          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Disponibilidades Configuradas
            </h3>

            {availabilities.length === 0 ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Nenhuma disponibilidade configurada. Adicione seus horários de atendimento.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid gap-3">
                {availabilities.map((availability) => (
                  <Card key={availability.id} className={!availability.is_available ? 'opacity-50' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div>
                            <h4 className="font-medium">{availability.day_of_week_display}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {availability.start_time} - {availability.end_time}
                              <span>• {availability.buffer_time}min intervalo</span>
                            </div>
                          </div>
                          <Badge variant={availability.is_available ? 'default' : 'secondary'}>
                            {availability.is_available ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(availability)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(availability.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}