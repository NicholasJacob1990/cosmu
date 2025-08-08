'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  ExternalLink,
  DollarSign,
  Wallet,
  Settings,
  Clock,
  Download
} from 'lucide-react';

interface StripeAccount {
  has_account: boolean;
  account_id?: string;
  can_receive_payments: boolean;
  onboarding_completed: boolean;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  requirements?: {
    currently_due: string[];
    eventually_due: string[];
    past_due: string[];
    pending_verification: string[];
  };
}

interface Balance {
  available: number;
  pending: number;
  has_account: boolean;
}

export function PaymentManager() {
  const [account, setAccount] = useState<StripeAccount | null>(null);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchAccountStatus();
    fetchBalance();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchAccountStatus = async () => {
    try {
      const response = await fetch('/api/stripe/account-status/');
      if (!response.ok) throw new Error('Erro ao carregar status da conta');
      
      const data = await response.json();
      setAccount(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async () => {
    try {
      const response = await fetch('/api/stripe/balance/');
      if (!response.ok) throw new Error('Erro ao carregar saldo');
      
      const data = await response.json();
      setBalance(data);
    } catch (err) {
      console.error('Erro ao carregar saldo:', err);
    }
  };

  const createAccount = async () => {
    setCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/create-account/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar conta');
      }

      setSuccess('Conta Stripe criada com sucesso!');
      await fetchAccountStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setCreating(false);
    }
  };

  const startOnboarding = async () => {
    try {
      const response = await fetch('/api/stripe/onboarding-link/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          return_url: `${window.location.origin}/dashboard/payments/success`,
          refresh_url: `${window.location.origin}/dashboard/payments/setup`
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao gerar link de configuração');
      }

      const data = await response.json();
      window.location.href = data.onboarding_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  };

  const requestPayout = async () => {
    if (!balance?.available || balance.available <= 0) {
      setError('Não há saldo disponível para saque');
      return;
    }

    const amount = prompt(`Valor para saque (disponível: R$ ${balance.available.toFixed(2)}):`);
    if (!amount) return;

    const payoutAmount = parseFloat(amount);
    if (isNaN(payoutAmount) || payoutAmount <= 0 || payoutAmount > balance.available) {
      setError('Valor de saque inválido');
      return;
    }

    try {
      const response = await fetch('/api/stripe/payout/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: payoutAmount }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao solicitar saque');
      }

      setSuccess(`Saque de R$ ${payoutAmount.toFixed(2)} solicitado com sucesso!`);
      await fetchBalance();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  };

  const getAccountStatus = () => {
    if (!account?.has_account) {
      return { text: 'Não Configurada', color: 'text-red-600', variant: 'destructive' as const };
    }
    
    if (account.can_receive_payments) {
      return { text: 'Ativa', color: 'text-green-600', variant: 'default' as const };
    }
    
    if (!account.onboarding_completed) {
      return { text: 'Configuração Pendente', color: 'text-yellow-600', variant: 'secondary' as const };
    }
    
    return { text: 'Verificação Pendente', color: 'text-yellow-600', variant: 'secondary' as const };
  };

  const getRequirementsSummary = () => {
    if (!account?.requirements) return null;

    const { currently_due, past_due, pending_verification } = account.requirements;
    const totalRequirements = [...currently_due, ...past_due, ...pending_verification].length;

    if (totalRequirements === 0) return null;

    return (
      <Alert variant="destructive" className="mt-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {totalRequirements} item{totalRequirements !== 1 ? 's' : ''} pendente
          {totalRequirements !== 1 ? 's' : ''} de verificação. 
          <Button variant="link" className="p-0 ml-1" onClick={startOnboarding}>
            Complete a configuração
          </Button>
        </AlertDescription>
      </Alert>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Carregando informações de pagamento...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const accountStatus = getAccountStatus();

  return (
    <div className="space-y-6">
      {/* Status da Conta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Conta de Pagamentos
          </CardTitle>
          <CardDescription>
            Gerencie sua conta Stripe para receber pagamentos
          </CardDescription>
        </CardHeader>
        <CardContent>
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

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Status da Conta</h3>
                <p className="text-sm text-muted-foreground">
                  {account?.has_account ? 'Conta Stripe Connect configurada' : 'Nenhuma conta configurada'}
                </p>
              </div>
              <Badge variant={accountStatus.variant} className={accountStatus.color}>
                {accountStatus.text}
              </Badge>
            </div>

            {account?.account_id && (
              <div className="text-sm">
                <span className="text-muted-foreground">ID da Conta: </span>
                <code className="text-xs bg-muted px-1 py-0.5 rounded">{account.account_id}</code>
              </div>
            )}

            <Separator />

            {!account?.has_account ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">
                  Para receber pagamentos, você precisa configurar uma conta Stripe Connect.
                </p>
                <Button onClick={createAccount} disabled={creating}>
                  <Settings className="h-4 w-4 mr-2" />
                  {creating ? 'Criando...' : 'Criar Conta Stripe'}
                </Button>
              </div>
            ) : !account.onboarding_completed ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">
                  Complete a configuração da sua conta para começar a receber pagamentos.
                </p>
                <Button onClick={startOnboarding}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Completar Configuração
                </Button>
              </div>
            ) : !account.can_receive_payments ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">
                  Sua conta está em verificação. Complete os itens pendentes.
                </p>
                <Button onClick={startOnboarding} variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Verificar Pendências
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                  <Shield className="h-5 w-5" />
                  <span className="font-medium">Conta Verificada</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Sua conta está configurada e pode receber pagamentos.
                </p>
              </div>
            )}

            {getRequirementsSummary()}
          </div>
        </CardContent>
      </Card>

      {/* Saldo e Saques */}
      {account?.can_receive_payments && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Saldo e Saques
            </CardTitle>
            <CardDescription>
              Visualize seu saldo e solicite saques
            </CardDescription>
          </CardHeader>
          <CardContent>
            {balance ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm text-green-600">Disponível</p>
                          <p className="text-xl font-bold text-green-800">
                            R$ {balance.available.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="text-sm text-yellow-600">Pendente</p>
                          <p className="text-xl font-bold text-yellow-800">
                            R$ {balance.pending.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                <div className="flex justify-center">
                  <Button 
                    onClick={requestPayout}
                    disabled={!balance.available || balance.available <= 0}
                    className="w-full md:w-auto"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Solicitar Saque
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Os saques são processados em até 2 dias úteis.
                </p>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Não foi possível carregar o saldo.</p>
                <Button variant="outline" onClick={fetchBalance} className="mt-2">
                  Tentar Novamente
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Informações de Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Segurança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Todos os pagamentos são processados de forma segura pelo Stripe</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Seus dados bancários são criptografados e protegidos</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Sistema de escrow protege compradores e vendedores</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}