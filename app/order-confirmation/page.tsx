'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';

// Carrega a instância do Stripe. Use a mesma chave publicável da página de checkout.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

const StatusComponent = () => {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<'success' | 'processing' | 'error'>('processing');

  useEffect(() => {
    const clientSecret = searchParams.get('payment_intent_client_secret');

    if (!clientSecret) {
      setStatus('error');
      setMessage('Erro: O segredo do cliente não foi encontrado. Por favor, entre em contato com o suporte.');
      return;
    }

    stripePromise.then(stripe => {
      if (!stripe) {
        setStatus('error');
        setMessage('Erro: Falha ao carregar a infraestrutura de pagamento.');
        return;
      }

      stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
        switch (paymentIntent?.status) {
          case 'succeeded':
            setStatus('success');
            setMessage('Pagamento realizado com sucesso! Um e-mail de confirmação foi enviado.');
            break;
          case 'processing':
            setStatus('processing');
            setMessage('Seu pagamento está sendo processado. Você receberá uma notificação em breve.');
            break;
          case 'requires_payment_method':
            setStatus('error');
            setMessage('Falha no pagamento. Por favor, tente novamente ou use um método de pagamento diferente.');
            break;
          default:
            setStatus('error');
            setMessage('Algo deu errado. Por favor, entre em contato com o suporte.');
            break;
        }
      });
    });
  }, [searchParams]);

  const renderStatus = () => {
    switch (status) {
      case 'success':
        return (
          <div className="text-center text-green-600">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h2 className="text-2xl font-bold">Pagamento Aprovado!</h2>
            <p className="mt-2">{message}</p>
          </div>
        );
      case 'processing':
        return (
          <div className="text-center text-blue-600">
            {/* Você pode adicionar um spinner animado aqui */}
            <h2 className="text-2xl font-bold">Processando...</h2>
            <p className="mt-2">{message}</p>
          </div>
        );
      case 'error':
        return (
          <div className="text-center text-red-600">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h2 className="text-2xl font-bold">Ocorreu um Problema</h2>
            <p className="mt-2">{message}</p>
          </div>
        );
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-md">
        {renderStatus()}
        <div className="text-center mt-6">
          <a href="/" className="text-indigo-600 hover:text-indigo-800 font-semibold">
            &larr; Voltar para a página inicial
          </a>
        </div>
      </div>
    </div>
  );
};

// Next.js recomenda usar <Suspense> para componentes que usam useSearchParams
export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <StatusComponent />
    </Suspense>
  );
}
