"use client";

import { useQuery } from '@tanstack/react-query';
import { api } from '../index';
import { useDashboardStore } from '@/store/dashboardStore';

export const useMetrics = (
  userId: string, 
  timeRange?: { start: Date; end: Date }
) => {
  const setMetrics = useDashboardStore((state) => state.setMetrics);

  return useQuery({
    queryKey: ['metrics', userId, timeRange],
    queryFn: async () => {
      const metrics = await api.getMetrics(userId, timeRange);
      // Sync with Zustand store
      setMetrics(metrics);
      return metrics;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
};

export const useAnalytics = (
  userId: string,
  type: 'performance' | 'trends' | 'predictions'
) => {
  return useQuery({
    queryKey: ['analytics', userId, type],
    queryFn: () => api.getAnalytics(userId, type),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useSalesPipeline = (professionalId: string) => {
  return useQuery({
    queryKey: ['sales-pipeline', professionalId],
    queryFn: () => api.getSalesPipeline(professionalId),
    enabled: !!professionalId,
    staleTime: 2 * 60 * 1000, // 2 minutes - pipeline changes frequently
    refetchInterval: 2 * 60 * 1000, // Auto-refresh every 2 minutes
  });
};

export const useMarketIntelligence = (professionalId: string) => {
  return useQuery({
    queryKey: ['market-intelligence', professionalId],
    queryFn: () => api.getMarketIntelligence(professionalId),
    enabled: !!professionalId,
    staleTime: 30 * 60 * 1000, // 30 minutes - market data doesn't change often
  });
};