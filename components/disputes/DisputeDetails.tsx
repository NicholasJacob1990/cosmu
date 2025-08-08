'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  AlertCircle, 
  Clock, 
  Users, 
  CheckCircle, 
  MessageSquare, 
  Paperclip, 
  Upload,
  Send,
  Calendar,
  DollarSign
} from 'lucide-react';

interface DisputeDetails {
  id: string;
  dispute_number: string;
  title: string;
  description: string;
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
  resolution_notes?: string;
  evidence: Evidence[];
  messages: DisputeMessage[];
  resolution?: DisputeResolution;
}

interface Evidence {
  id: string;
  submitted_by_name: string;
  evidence_type: string;
  evidence_type_display: string;
  title: string;
  description: string;
  file?: string;
  file_url?: string;
  created_at: string;
}

interface DisputeMessage {
  id: string;
  sender_name: string;
  message_type: string;
  message_type_display: string;
  content: string;
  is_internal: boolean;
  created_at: string;
}

interface DisputeResolution {
  id: string;
  outcome: string;
  outcome_display: string;
  reasoning: string;
  refund_amount: number;
  freelancer_payment: number;
  platform_fee_waived: number;
  agreed_by_client: boolean;
  agreed_by_freelancer: boolean;
  is_agreed_by_both: boolean;
  executed: boolean;
  executed_at?: string;
  created_at: string;
}

interface DisputeDetailsProps {
  disputeId: string;
  userType: 'client' | 'freelancer' | 'admin';
}

export default function DisputeDetails({ disputeId, userType }: DisputeDetailsProps) {
  const [dispute, setDispute] = useState<DisputeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Estados para resposta
  const [responseMessage, setResponseMessage] = useState('');
  const [respondingLoading, setRespondingLoading] = useState(false);
  
  // Estados para nova mensagem
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  
  // Estados para evidência
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceDescription, setEvidenceDescription] = useState('');
  const [evidenceType, setEvidenceType] = useState('file');
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);

  useEffect(() => {
    fetchDisputeDetails();
  }, [disputeId]);

  const fetchDisputeDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/disputes/${disputeId}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDispute(data);
      } else {
        setError('Disputa não encontrada');
      }
    } catch (error) {
      setError('Erro ao carregar detalhes da disputa');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async () => {
    if (!responseMessage.trim()) return;

    setRespondingLoading(true);
    try {
      const response = await fetch(`/api/disputes/${disputeId}/respond/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          response_message: responseMessage,
          accept_resolution: false
        }),
      });

      if (response.ok) {
        setResponseMessage('');
        fetchDisputeDetails(); // Recarregar dados
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao enviar resposta');
      }
    } catch (error) {
      setError('Erro de conexão');
    } finally {
      setRespondingLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setSendingMessage(true);
    try {
      const response = await fetch(`/api/disputes/${disputeId}/messages/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          content: newMessage
        }),
      });

      if (response.ok) {
        setNewMessage('');
        fetchDisputeDetails(); // Recarregar dados
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao enviar mensagem');
      }
    } catch (error) {
      setError('Erro de conexão');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleUploadEvidence = async () => {
    if (!evidenceTitle.trim()) return;

    setUploadingEvidence(true);
    try {
      const formData = new FormData();
      formData.append('title', evidenceTitle);
      formData.append('description', evidenceDescription);
      formData.append('evidence_type', evidenceType);
      
      if (evidenceFile) {
        formData.append('file', evidenceFile);
      }

      const response = await fetch(`/api/disputes/${disputeId}/evidence/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (response.ok) {
        setEvidenceTitle('');
        setEvidenceDescription('');
        setEvidenceFile(null);
        fetchDisputeDetails(); // Recarregar dados
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao enviar evidência');
      }
    } catch (error) {
      setError('Erro de conexão');
    } finally {
      setUploadingEvidence(false);
    }
  };

  const handleAgreeResolution = async () => {
    try {
      const response = await fetch(`/api/disputes/${disputeId}/agreement/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        fetchDisputeDetails(); // Recarregar dados
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao concordar com resolução');
      }
    } catch (error) {
      setError('Erro de conexão');
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'in_review':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'in_mediation':
        return <Users className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
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
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !dispute) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error || 'Disputa não encontrada'}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(dispute.status)}
                <span>{dispute.title}</span>
                {dispute.is_overdue && (
                  <Badge variant="destructive">ATRASADA</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Disputa #{dispute.dispute_number} • {dispute.category_display}
              </CardDescription>
            </div>
            <Badge className={getStatusColor(dispute.status)}>
              {dispute.status_display}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Partes Envolvidas</p>
                <p className="text-sm text-muted-foreground">
                  {dispute.client_name} vs {dispute.freelancer_name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Valor Disputado</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(dispute.disputed_amount)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Data de Abertura</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(dispute.created_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Prazo</p>
                <p className="text-sm text-muted-foreground">
                  {dispute.status === 'open' 
                    ? formatDate(dispute.auto_resolution_deadline)
                    : dispute.mediation_deadline 
                      ? formatDate(dispute.mediation_deadline)
                      : 'N/A'
                  }
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="messages">
            Mensagens ({dispute.messages.length})
          </TabsTrigger>
          <TabsTrigger value="evidence">
            Evidências ({dispute.evidence.length})
          </TabsTrigger>
          <TabsTrigger value="resolution">Resolução</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Descrição da Disputa</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{dispute.description}</p>
            </CardContent>
          </Card>

          {/* Resposta rápida para disputas abertas */}
          {dispute.status === 'open' && userType !== 'admin' && (
            <Card>
              <CardHeader>
                <CardTitle>Responder à Disputa</CardTitle>
                <CardDescription>
                  Você tem até {formatDate(dispute.auto_resolution_deadline)} para responder
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  placeholder="Digite sua resposta à disputa..."
                  rows={4}
                />
                <Button 
                  onClick={handleRespond}
                  disabled={respondingLoading || !responseMessage.trim()}
                >
                  {respondingLoading ? 'Enviando...' : 'Enviar Resposta'}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          {/* Lista de mensagens */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Mensagens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dispute.messages.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhuma mensagem ainda
                </p>
              ) : (
                <div className="space-y-3">
                  {dispute.messages.map((message) => (
                    <div key={message.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {message.sender_name || 'Sistema'}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {message.message_type_display}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(message.created_at)}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Nova mensagem */}
          {dispute.status !== 'cancelled' && (
            <Card>
              <CardHeader>
                <CardTitle>Enviar Mensagem</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  rows={3}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={sendingMessage || !newMessage.trim()}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {sendingMessage ? 'Enviando...' : 'Enviar Mensagem'}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="evidence" className="space-y-4">
          {/* Lista de evidências */}
          <Card>
            <CardHeader>
              <CardTitle>Evidências Enviadas</CardTitle>
            </CardHeader>
            <CardContent>
              {dispute.evidence.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhuma evidência ainda
                </p>
              ) : (
                <div className="space-y-3">
                  {dispute.evidence.map((evidence) => (
                    <div key={evidence.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-sm">{evidence.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            Por {evidence.submitted_by_name} • {evidence.evidence_type_display}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(evidence.created_at)}
                        </span>
                      </div>
                      {evidence.description && (
                        <p className="text-sm mb-2">{evidence.description}</p>
                      )}
                      {evidence.file && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={evidence.file} target="_blank" rel="noopener noreferrer">
                            <Paperclip className="h-4 w-4 mr-2" />
                            Ver Arquivo
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upload de nova evidência */}
          {dispute.status !== 'cancelled' && (
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Evidência</CardTitle>
                <CardDescription>
                  Envie documentos, imagens ou outros arquivos que comprovem sua posição
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="evidence-title">Título da Evidência</Label>
                  <Input
                    id="evidence-title"
                    value={evidenceTitle}
                    onChange={(e) => setEvidenceTitle(e.target.value)}
                    placeholder="Ex: Prints da conversa no WhatsApp"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="evidence-description">Descrição (opcional)</Label>
                  <Textarea
                    id="evidence-description"
                    value={evidenceDescription}
                    onChange={(e) => setEvidenceDescription(e.target.value)}
                    placeholder="Descreva o que este arquivo comprova..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="evidence-file">Arquivo</Label>
                  <Input
                    id="evidence-file"
                    type="file"
                    onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                  />
                </div>

                <Button 
                  onClick={handleUploadEvidence}
                  disabled={uploadingEvidence || !evidenceTitle.trim()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadingEvidence ? 'Enviando...' : 'Adicionar Evidência'}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="resolution" className="space-y-4">
          {dispute.resolution ? (
            <Card>
              <CardHeader>
                <CardTitle>Resolução da Disputa</CardTitle>
                <CardDescription>
                  Resolução proposta em {formatDate(dispute.resolution.created_at)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium">Resultado</p>
                    <Badge className="mt-1">{dispute.resolution.outcome_display}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Reembolso ao Cliente</p>
                    <p className="text-sm">{formatCurrency(dispute.resolution.refund_amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Pagamento ao Freelancer</p>
                    <p className="text-sm">{formatCurrency(dispute.resolution.freelancer_payment)}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium mb-2">Justificativa</p>
                  <p className="text-sm leading-relaxed">{dispute.resolution.reasoning}</p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <p className="text-sm font-medium">Status de Acordo</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      {dispute.resolution.agreed_by_client ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-500" />
                      )}
                      <span className="text-sm">
                        Cliente {dispute.resolution.agreed_by_client ? 'concordou' : 'pendente'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {dispute.resolution.agreed_by_freelancer ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-500" />
                      )}
                      <span className="text-sm">
                        Freelancer {dispute.resolution.agreed_by_freelancer ? 'concordou' : 'pendente'}
                      </span>
                    </div>
                  </div>
                </div>

                {!dispute.resolution.is_agreed_by_both && userType !== 'admin' && (
                  <div className="pt-4">
                    <Button onClick={handleAgreeResolution} className="w-full">
                      Concordar com a Resolução
                    </Button>
                  </div>
                )}

                {dispute.resolution.executed && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Resolução executada em {formatDate(dispute.resolution.executed_at!)}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aguardando Resolução</h3>
                <p className="text-muted-foreground text-center">
                  Esta disputa ainda está sendo analisada. Uma resolução será proposta em breve.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}