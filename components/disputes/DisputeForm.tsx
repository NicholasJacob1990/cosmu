'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Order {
  id: string;
  order_number: string;
  amount: number;
  freelancer_name: string;
  service_title?: string;
  status: string;
}

interface Booking {
  id: string;
  freelancer_name: string;
  scheduled_start: string;
  scheduled_end: string;
  status: string;
}

export default function DisputeForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    order: '',
    booking: '',
    category: '',
    title: '',
    description: '',
    disputed_amount: '',
    original_amount: '',
    priority: 'medium'
  });

  const disputeCategories = [
    { value: 'quality', label: 'Qualidade do Trabalho' },
    { value: 'delivery', label: 'Prazo de Entrega' },
    { value: 'scope', label: 'Escopo do Projeto' },
    { value: 'communication', label: 'Comunicação' },
    { value: 'payment', label: 'Problemas de Pagamento' },
    { value: 'other', label: 'Outros' }
  ];

  const priorities = [
    { value: 'low', label: 'Baixa' },
    { value: 'medium', label: 'Média' },
    { value: 'high', label: 'Alta' }
  ];

  useEffect(() => {
    fetchUserOrders();
    fetchUserBookings();
  }, []);

  const fetchUserOrders = async () => {
    try {
      const response = await fetch('/api/orders/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.results || []);
      }
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    }
  };

  const fetchUserBookings = async () => {
    try {
      const response = await fetch('/api/bookings/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data.results || []);
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOrderSelect = (orderId: string) => {
    const selectedOrder = orders.find(order => order.id === orderId);
    if (selectedOrder) {
      setFormData(prev => ({
        ...prev,
        order: orderId,
        booking: '', // Limpar booking se order foi selecionado
        original_amount: selectedOrder.amount.toString(),
        disputed_amount: selectedOrder.amount.toString()
      }));
    }
  };

  const handleBookingSelect = (bookingId: string) => {
    const selectedBooking = bookings.find(booking => booking.id === bookingId);
    if (selectedBooking) {
      setFormData(prev => ({
        ...prev,
        booking: bookingId,
        order: '', // Limpar order se booking foi selecionado
        original_amount: '0', // Bookings podem não ter valor definido
        disputed_amount: '0'
      }));
    }
  };

  const validateForm = () => {
    if (!formData.order && !formData.booking) {
      setError('Selecione um pedido ou agendamento para disputar');
      return false;
    }

    if (!formData.category) {
      setError('Selecione uma categoria para a disputa');
      return false;
    }

    if (!formData.title.trim()) {
      setError('Digite um título para a disputa');
      return false;
    }

    if (!formData.description.trim()) {
      setError('Digite uma descrição detalhada da disputa');
      return false;
    }

    if (formData.disputed_amount && parseFloat(formData.disputed_amount) < 0) {
      setError('O valor disputado deve ser positivo');
      return false;
    }

    if (formData.disputed_amount && formData.original_amount && 
        parseFloat(formData.disputed_amount) > parseFloat(formData.original_amount)) {
      setError('O valor disputado não pode ser maior que o valor original');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Determinar cliente e freelancer baseado no order/booking selecionado
      let clientId, freelancerId;
      
      if (formData.order) {
        const selectedOrder = orders.find(order => order.id === formData.order);
        // Assumir que o usuário atual é o cliente se for um order
        clientId = 'current_user'; // Será definido pelo backend baseado no token
      } else if (formData.booking) {
        const selectedBooking = bookings.find(booking => booking.id === formData.booking);
        // Assumir que o usuário atual é o cliente se for um booking
        clientId = 'current_user'; // Será definido pelo backend baseado no token
      }

      const disputeData = {
        order: formData.order || null,
        booking: formData.booking || null,
        category: formData.category,
        title: formData.title,
        description: formData.description,
        disputed_amount: parseFloat(formData.disputed_amount) || 0,
        original_amount: parseFloat(formData.original_amount) || 0,
        priority: formData.priority
      };

      const response = await fetch('/api/disputes/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(disputeData),
      });

      if (response.ok) {
        const dispute = await response.json();
        setSuccess('Disputa criada com sucesso! Você será redirecionado...');
        
        setTimeout(() => {
          router.push(`/disputes/${dispute.id}`);
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Erro ao criar disputa');
      }
    } catch (error) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Abrir Nova Disputa
          </CardTitle>
          <CardDescription>
            Descreva detalhadamente o problema para que possamos ajudar na resolução
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            {/* Seleção de Pedido */}
            <div className="space-y-2">
              <Label htmlFor="order">Pedido Relacionado (opcional)</Label>
              <Select value={formData.order} onValueChange={handleOrderSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um pedido" />
                </SelectTrigger>
                <SelectContent>
                  {orders.map((order) => (
                    <SelectItem key={order.id} value={order.id}>
                      #{order.order_number} - {order.service_title || 'Serviço'} - {formatCurrency(order.amount)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Seleção de Agendamento */}
            <div className="space-y-2">
              <Label htmlFor="booking">Agendamento Relacionado (opcional)</Label>
              <Select value={formData.booking} onValueChange={handleBookingSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um agendamento" />
                </SelectTrigger>
                <SelectContent>
                  {bookings.map((booking) => (
                    <SelectItem key={booking.id} value={booking.id}>
                      {booking.freelancer_name} - {new Date(booking.scheduled_start).toLocaleDateString('pt-BR')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <Label htmlFor="category">Categoria da Disputa *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {disputeCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="title">Título da Disputa *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Ex: Trabalho entregue fora do prazo"
                maxLength={200}
              />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição Detalhada *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descreva detalhadamente o problema, incluindo datas, comunicações e evidências relevantes..."
                rows={6}
              />
            </div>

            {/* Valores */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="original_amount">Valor Original (R$)</Label>
                <Input
                  id="original_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.original_amount}
                  onChange={(e) => handleInputChange('original_amount', e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="disputed_amount">Valor Disputado (R$)</Label>
                <Input
                  id="disputed_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.disputed_amount}
                  onChange={(e) => handleInputChange('disputed_amount', e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Prioridade */}
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Botões */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Criando Disputa...' : 'Abrir Disputa'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}