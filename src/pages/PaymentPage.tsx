import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Footer } from "@/components/Footer";
import {
  CreditCard,
  Shield,
  Lock,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  DollarSign,
  Clock,
  Info
} from "lucide-react";
import { paymentsApi, ordersApi } from "@/lib/api";
import { toast } from "sonner";

export function PaymentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch order details
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => ordersApi.getById(orderId!),
    enabled: !!orderId,
  });

  // Create payment intent mutation
  const createPaymentMutation = useMutation({
    mutationFn: (data: { paymentMethod: string }) => 
      paymentsApi.createPaymentIntent(orderId!, data),
    onSuccess: (response) => {
      const paymentIntent = response.data.paymentIntent;
      // In a real app, this would integrate with Stripe/MercadoPago
      simulatePaymentProcess(paymentIntent);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao processar pagamento');
    },
  });

  // Confirm payment mutation
  const confirmPaymentMutation = useMutation({
    mutationFn: (data: { transactionId: string; paymentIntentId: string; status: string }) =>
      paymentsApi.confirmPayment(data.transactionId, {
        paymentIntentId: data.paymentIntentId,
        status: data.status
      }),
    onSuccess: () => {
      toast.success('Pagamento confirmado! Fundos foram depositados em escrow.');
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      navigate(`/orders/${orderId}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao confirmar pagamento');
    },
  });

  // Simulate payment processing (replace with real integration)
  const simulatePaymentProcess = async (paymentIntent: any) => {
    setIsProcessing(true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate successful payment (in real app, this comes from payment processor webhook)
    const transactionId = paymentIntent.metadata?.transactionId;
    if (transactionId) {
      confirmPaymentMutation.mutate({
        transactionId,
        paymentIntentId: paymentIntent.id,
        status: 'succeeded'
      });
    }
    
    setIsProcessing(false);
  };

  const handlePayment = () => {
    if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
      toast.error('Preencha todos os campos do cartão');
      return;
    }

    createPaymentMutation.mutate({ paymentMethod });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando detalhes do pedido...</p>
        </div>
      </div>
    );
  }

  const orderData = order?.data;

  if (!orderData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Pedido não encontrado</h2>
          <Button onClick={() => navigate('/')}>Voltar ao Início</Button>
        </div>
      </div>
    );
  }

  if (orderData.status !== 'pending') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Pedido já foi processado</h2>
          <p className="text-muted-foreground mb-4">
            Status: {orderData.status}
          </p>
          <Button onClick={() => navigate(`/orders/${orderId}`)}>
            Ver Detalhes do Pedido
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Finalizar Pagamento</h1>
            <p className="text-muted-foreground">
              Pedido #{orderData.orderNumber}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Security Notice */}
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Seus dados de pagamento são protegidos com criptografia SSL de 256 bits. 
                Nós não armazenamos informações do seu cartão.
              </AlertDescription>
            </Alert>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Método de Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="credit_card" id="credit_card" />
                    <Label htmlFor="credit_card" className="flex items-center gap-2 cursor-pointer">
                      <CreditCard className="h-4 w-4" />
                      Cartão de Crédito
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-3 border rounded-lg opacity-50">
                    <RadioGroupItem value="pix" id="pix" disabled />
                    <Label htmlFor="pix" className="flex items-center gap-2 cursor-not-allowed">
                      <DollarSign className="h-4 w-4" />
                      PIX (Em breve)
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-3 border rounded-lg opacity-50">
                    <RadioGroupItem value="boleto" id="boleto" disabled />
                    <Label htmlFor="boleto" className="flex items-center gap-2 cursor-not-allowed">
                      <Info className="h-4 w-4" />
                      Boleto Bancário (Em breve)
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Card Details */}
            {paymentMethod === 'credit_card' && (
              <Card>
                <CardHeader>
                  <CardTitle>Dados do Cartão</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="cardName">Nome no Cartão</Label>
                    <Input
                      id="cardName"
                      placeholder="João Silva"
                      value={cardDetails.name}
                      onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cardNumber">Número do Cartão</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardDetails.number}
                      onChange={(e) => {
                        // Format card number with spaces
                        const value = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
                        if (value.replace(/\s/g, '').length <= 16) {
                          setCardDetails(prev => ({ ...prev, number: value }));
                        }
                      }}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cardExpiry">Validade</Label>
                      <Input
                        id="cardExpiry"
                        placeholder="MM/AA"
                        value={cardDetails.expiry}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length >= 2) {
                            value = value.substring(0, 2) + '/' + value.substring(2, 4);
                          }
                          setCardDetails(prev => ({ ...prev, expiry: value }));
                        }}
                        className="mt-1"
                        maxLength={5}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="cardCvv">CVV</Label>
                      <Input
                        id="cardCvv"
                        placeholder="123"
                        value={cardDetails.cvv}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 4) {
                            setCardDetails(prev => ({ ...prev, cvv: value }));
                          }
                        }}
                        className="mt-1"
                        maxLength={4}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Escrow Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  Proteção do Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Escrow Automático</p>
                      <p className="text-sm text-muted-foreground">
                        Seus fundos ficam protegidos até a entrega do trabalho
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Liberação Controlada</p>
                      <p className="text-sm text-muted-foreground">
                        Você autoriza o pagamento apenas quando estiver satisfeito
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Reembolso Garantido</p>
                      <p className="text-sm text-muted-foreground">
                        Sistema de disputas para resolução de conflitos
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium">{orderData.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {orderData.description}
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Valor do serviço</span>
                    <span>R$ {Number(orderData.amount).toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Taxa da plataforma (10%)</span>
                    <span>R$ {Number(orderData.platformFee).toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Taxa de processamento</span>
                    <span>R$ {Number(orderData.processingFee).toLocaleString()}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>R$ {Number(orderData.totalAmount).toLocaleString()}</span>
                  </div>
                </div>
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    O freelancer receberá R$ {Number(orderData.freelancerAmount).toLocaleString()} 
                    após a conclusão do trabalho.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Payment Button */}
            <Card>
              <CardContent className="pt-6">
                <Button
                  onClick={handlePayment}
                  disabled={isProcessing || createPaymentMutation.isPending || confirmPaymentMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processando Pagamento...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Pagar R$ {Number(orderData.totalAmount).toLocaleString()}
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-center text-muted-foreground mt-3">
                  Ao confirmar o pagamento, você concorda com nossos{' '}
                  <a href="#" className="text-primary hover:underline">
                    Termos de Uso
                  </a>{' '}
                  e{' '}
                  <a href="#" className="text-primary hover:underline">
                    Política de Privacidade
                  </a>
                </p>
              </CardContent>
            </Card>

            {/* Security Features */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span>SSL 256-bit encryption</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Lock className="h-4 w-4 text-green-500" />
                    <span>PCI DSS compliant</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Monitoramento 24/7</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}