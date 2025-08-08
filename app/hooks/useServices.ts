import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface UseServicesOptions {
  searchQuery?: string;
  filters?: {
    category?: string;
    priceRange?: [number, number];
    rating?: number;
  };
  enabled?: boolean;
}

interface Service {
  id: string;
  title: string;
  category: string;
  professional: {
    name: string;
    level: string;
    avatarUrl: string;
  };
  rating: number;
  reviews: number;
  price: number;
  image: string;
  isFavorite: boolean;
}

// Mock data para desenvolvimento
const mockServices: Service[] = Array.from({ length: 24 }, (_, i) => ({
  id: `service_${i + 1}`,
  title: `Logo Incrível para Startup de Tecnologia ${i + 1}`,
  category: i % 3 === 0 ? "Design Gráfico" : i % 3 === 1 ? "Desenvolvimento" : "Marketing",
  professional: {
    name: `Ana Creative ${i + 1}`,
    level: i % 4 === 0 ? "Top Rated" : i % 4 === 1 ? "Rising Talent" : "Elite Pro",
    avatarUrl: `https://i.pravatar.cc/40?u=prof${i}`,
  },
  rating: parseFloat((Math.random() * (5 - 4.5) + 4.5).toFixed(1)),
  reviews: Math.floor(Math.random() * 200) + 10,
  price: Math.floor(Math.random() * 500) + 50,
  image: `https://picsum.photos/400/300?random=${i}`,
  isFavorite: i % 5 === 0,
}));

export function useServices(options: UseServicesOptions = {}) {
  const { searchQuery = '', filters = {}, enabled = true } = options;

  return useQuery({
    queryKey: ['services', searchQuery, filters],
    queryFn: async () => {
      try {
        let result;
        
        if (searchQuery?.trim()) {
          result = await api.services.search(searchQuery, filters);
        } else {
          result = await api.services.list(filters);
        }
        
        return result;
      } catch (error) {
        console.error('Erro ao buscar serviços:', error);
        
        // Em desenvolvimento, retornar mock data
        if (process.env.NODE_ENV === 'development') {
          return { data: mockServices };
        }
        
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    enabled,
    placeholderData: { data: mockServices },
    retry: (failureCount, error: any) => {
      // Não fazer retry para erros de client (4xx)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Hook para buscar um serviço específico
export function useService(serviceId: string) {
  return useQuery({
    queryKey: ['service', serviceId],
    queryFn: async () => {
      try {
        return await api.services.getById(serviceId);
      } catch (error) {
        console.error('Erro ao buscar serviço:', error);
        
        // Mock data para desenvolvimento
        if (process.env.NODE_ENV === 'development') {
          return mockServices.find(s => s.id === serviceId) || mockServices[0];
        }
        
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    enabled: !!serviceId,
  });
}

// Hook para favoritar/desfavoritar serviços
export function useFavoriteService() {
  return {
    // Implementar mutation para favoritar
    // useMutation implementation would go here
  };
}