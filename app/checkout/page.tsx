'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '@/components/payments/CheckoutForm';

// Certifique-se de que sua chave publicável do Stripe esteja em uma variável de ambiente
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Exemplo de como criar uma PaymentIntent.
    // Em um aplicativo real, você faria isso após o cliente
    // selecionar um produto ou serviço.
    // Os valores de 'amount' e 'professional_id' devem ser dinâmicos.
    fetch('/api/stripe/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        amount: '199.99', // Exemplo: R$199,99
        professional_id: 1, // Exemplo: ID do profissional
        service_id: 1, // Exemplo: ID do serviço
        currency: 'brl' 
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          console.error('Failed to get client secret:', data.error);
        }
      })
      .catch(error => {
        console.error('Error fetching client secret:', error);
      });
  }, []);

  const appearance = {
    theme: 'stripe',
  };

  const options: StripeElementsOptions = {
    clientSecret,
    appearance,
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        {clientSecret ? (
          <Elements options={options} stripe={stripePromise}>
            <CheckoutForm clientSecret={clientSecret} />
          </Elements>
        ) : (
          <div className="text-center">
            <h2 className="text-xl font-semibold">Carregando Pagamento...</h2>
            <p className="text-gray-600 mt-2">
              Por favor, aguarde enquanto preparamos um ambiente seguro para seu pagamento.
            </p>
            {/* Você pode adicionar um spinner aqui */}
          </div>
        )}
      </div>
    </div>
  );
}
