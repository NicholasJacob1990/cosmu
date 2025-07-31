'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

export function useSearchParamsSafe() {
  try {
    return useSearchParams();
  } catch (error) {
    // Fallback para quando não há params disponíveis (SSR)
    return new URLSearchParams();
  }
}