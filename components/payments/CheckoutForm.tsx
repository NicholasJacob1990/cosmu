'use client';

import React, { useState, useEffect } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button'; // Supondo que você use ShadCN UI

interface CheckoutFormProps {
  clientSecret: string;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    if (!clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case 'succeeded':
          setMessage('Pagamento realizado com sucesso!');
          break;
        case 'processing':
          setMessage('Seu pagamento está sendo processado.');
          break;
        case 'requires_payment_method':
          setMessage('Seu pagamento não foi bem-sucedido, por favor, tente novamente.');
          break;
        default:
          setMessage(null);
          break;
      }
    });
  }, [stripe, clientSecret]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js ainda não carregou.
      // Impede o formulário de ser submetido.
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Certifique-se de mudar isso para a sua página de confirmação de pagamento
        return_url: `${window.location.origin}/order-confirmation`,
      },
    });

    // Este ponto só será alcançado se houver um erro imediato ao confirmar o pagamento.
    // Caso contrário, o cliente será redirecionado para o `return_url`.
    // Por exemplo, se o navegador do cliente não puder se conectar ao Stripe.
    if (error.type === 'card_error' || error.type === 'validation_error') {
      setMessage(error.message || 'Ocorreu um erro inesperado.');
    } else {
      setMessage('Ocorreu um erro inesperado.');
    }

    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-semibold mb-4">Pagamento Seguro</h2>
      
      <PaymentElement id="payment-element" />
      
      <Button disabled={isLoading || !stripe || !elements} id="submit" className="w-full mt-6">
        <span id="button-text">
          {isLoading ? <div className="spinner" id="spinner"></div> : 'Pagar Agora'}
        </span>
      </Button>
      
      {/* Exibe mensagens de erro ou sucesso */}
      {message && <div id="payment-message" className="text-red-500 mt-2">{message}</div>}
    </form>
  );
};

export default CheckoutForm;
