'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Lock,
  DollarSign,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PaymentDetails {
  orderId: string;
  amount: number;
  freelancerName: string;
  serviceName: string;
  description?: string;
}

interface PaymentCheckoutProps {
  orderDetails: PaymentDetails;
  onPaymentSuccess?: (paymentResult: any) => void;
  onPaymentError?: (error: string) => void;
  className?: string;
}

export function PaymentCheckout({
  orderDetails,
  onPaymentSuccess,
  onPaymentError,
  className
}: PaymentCheckoutProps) {
  const [paymentType, setPaymentType] = useState<'escrow' | 'direct'>('escrow');
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const platformFee = orderDetails.amount * 0.1; // 10% de taxa
  const processingFee = orderDetails.amount * 0.029 + 0.30; // Taxa do Stripe
  const totalAmount = orderDetails.amount + processingFee;

  const createPaymentIntent = async () => {
    setProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/create-intent/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: orderDetails.orderId,
          type: paymentType
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar pagamento');
      }

      const data = await response.json();
      setClientSecret(data.client_secret);
      
      // Simular processamento do pagamento (em produção, usar Stripe Elements)
      setTimeout(() => {
        setProcessing(false);
        if (onPaymentSuccess) {
          onPaymentSuccess({
            paymentType,
            amount: data.amount,
            clientSecret: data.client_secret
          });
        }
      }, 2000);

    } catch (err) {
      setProcessing(false);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      if (onPaymentError) {
        onPaymentError(errorMessage);
      }
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Resumo do Pedido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Prestador:</span>
              <span className="font-medium">{orderDetails.freelancerName}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Serviço:</span>
              <span className="font-medium">{orderDetails.serviceName}</span>
            </div>

            {orderDetails.description && (
              <div className="flex justify-between">
                <span>Descrição:</span>
                <span className="text-sm text-muted-foreground text-right max-w-48">
                  {orderDetails.description}
                </span>
              </div>
            )}

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Valor do serviço:</span>
                <span>R$ {orderDetails.amount.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-muted-foreground">
                <span>Taxa de processamento:</span>
                <span>R$ {processingFee.toFixed(2)}</span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between font-bold">
              <span>Total a pagar:</span>
              <span>R$ {totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Tipo de Pagamento
          </CardTitle>
          <CardDescription>
            Escolha como o pagamento será processado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={paymentType} onValueChange={(value) => setPaymentType(value as 'escrow' | 'direct')}>
            <div className="space-y-4">
              {/* Escrow */}
              <div className="flex items-start space-x-3 p-4 border rounded-lg">
                <RadioGroupItem value="escrow" id="escrow" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="escrow" className="font-medium cursor-pointer">
                    Pagamento Seguro (Escrow)
                  </Label>
                  <div className="mt-2 space-y-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Recomendado
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Seu pagamento fica em custódia até que o serviço seja entregue e aprovado.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      <span>Proteção total contra fraudes</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direto */}
              <div className="flex items-start space-x-3 p-4 border rounded-lg opacity-75">
                <RadioGroupItem value="direct" id="direct" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="direct" className="font-medium cursor-pointer">
                    Pagamento Direto
                  </Label>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm text-muted-foreground">
                      O pagamento é transferido imediatamente para o prestador.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-yellow-600">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Menor proteção em caso de problemas</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </RadioGroup>

          {paymentType === 'escrow' && (
            <Alert className="mt-4 border-blue-200 bg-blue-50">
              <Shield className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Como funciona o Escrow:</strong><br />
                1. Seu pagamento fica seguro em custódia<br />
                2. O prestador entrega o serviço<br />
                3. Você aprova a entrega<br />
                4. O pagamento é liberado automaticamente
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-6">
          <Button 
            onClick={createPaymentIntent}
            disabled={processing}
            className="w-full"
            size="lg"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processando Pagamento...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Pagar R$ {totalAmount.toFixed(2)}
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>

          <div className="mt-4 text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3 w-3" />
              <span>Pagamento seguro processado pelo Stripe</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Seus dados de pagamento são criptografados e seguros
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown de taxas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Detalhamento de Taxas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span>Taxa da plataforma (10%):</span>
              <span>R$ {platformFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxa de processamento:</span>
              <span>R$ {processingFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Valor que o prestador recebe:</span>
              <span>R$ {(orderDetails.amount - platformFee).toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}