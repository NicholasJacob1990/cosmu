'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Clock, Users, CheckCircle, XCircle } from 'lucide-react';

interface Dispute {
  id: string;
  dispute_number: string;
  title: string;
  category: string;
  category_display: string;
  status: string;
  status_display: string;
  priority: string;
  priority_display: string;
  disputed_amount: number;
  original_amount: number;
  client_name: string;
  freelancer_name: string;
  opened_by_name: string;
  is_overdue: boolean;
  can_auto_resolve: boolean;
  created_at: string;
  auto_resolution_deadline: string;
  mediation_deadline?: string;
}

interface DisputeManagerProps {
  userType: 'client' | 'freelancer' | 'admin';
}

export default function DisputeManager({ userType }: DisputeManagerProps) {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchDisputes();
  }, [filter]);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('status', filter);
      }

      const response = await fetch(`/api/disputes/?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDisputes(data.results || []);
      }
    } catch (error) {
      console.error('Erro ao carregar disputas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'in_review':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'in_mediation':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'resolved_client':
      case 'resolved_freelancer':
      case 'resolved_partial':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'in_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_mediation':
        return 'bg-blue-100 text-blue-800';
      case 'resolved_client':
      case 'resolved_freelancer':
      case 'resolved_partial':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Central de Disputas</h2>
          <p className="text-muted-foreground">
            Gerencie disputas e resoluções de conflitos
          </p>
        </div>
        {userType !== 'admin' && (
          <Button 
            onClick={() => window.location.href = '/disputes/new'}
            className="bg-primary text-white"
          >
            Abrir Nova Disputa
          </Button>
        )}
      </div>

      <Tabs value={filter} onValueChange={setFilter} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="open">Abertas</TabsTrigger>
          <TabsTrigger value="in_review">Em Análise</TabsTrigger>
          <TabsTrigger value="in_mediation">Mediação</TabsTrigger>
          <TabsTrigger value="resolved_client">Resolvidas</TabsTrigger>
          <TabsTrigger value="cancelled">Canceladas</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          {disputes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma disputa encontrada</h3>
                <p className="text-muted-foreground text-center">
                  {filter === 'all' 
                    ? 'Você não possui disputas no momento.'
                    : `Nenhuma disputa com status "${filter}" encontrada.`
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {disputes.map((dispute) => (
                <Card key={dispute.id} className={`transition-all hover:shadow-md ${dispute.is_overdue ? 'border-red-200 bg-red-50' : ''}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          {getStatusIcon(dispute.status)}
                          <span className="text-lg">{dispute.title}</span>
                          {dispute.is_overdue && (
                            <Badge variant="destructive" className="text-xs">
                              ATRASADA
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>
                          Disputa #{dispute.dispute_number} • {dispute.category_display}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getStatusColor(dispute.status)}>
                          {dispute.status_display}
                        </Badge>
                        <Badge className={getPriorityColor(dispute.priority)}>
                          {dispute.priority_display}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Cliente</p>
                        <p className="text-sm">{dispute.client_name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Freelancer</p>
                        <p className="text-sm">{dispute.freelancer_name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Valor Disputado</p>
                        <p className="text-sm font-semibold">{formatCurrency(dispute.disputed_amount)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Aberta por</p>
                        <p className="text-sm">{dispute.opened_by_name}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Criada em</p>
                        <p className="text-sm">{formatDate(dispute.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {dispute.status === 'open' ? 'Prazo de resposta' : 'Prazo de mediação'}
                        </p>
                        <p className="text-sm">
                          {dispute.status === 'open' 
                            ? formatDate(dispute.auto_resolution_deadline)
                            : dispute.mediation_deadline 
                              ? formatDate(dispute.mediation_deadline)
                              : 'N/A'
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.location.href = `/disputes/${dispute.id}`}
                      >
                        Ver Detalhes
                      </Button>
                      {dispute.status === 'open' && (
                        <Button 
                          size="sm"
                          onClick={() => window.location.href = `/disputes/${dispute.id}/respond`}
                        >
                          Responder
                        </Button>
                      )}
                      {userType === 'admin' && dispute.status === 'in_mediation' && (
                        <Button 
                          size="sm"
                          variant="secondary"
                          onClick={() => window.location.href = `/disputes/${dispute.id}/resolve`}
                        >
                          Resolver
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}