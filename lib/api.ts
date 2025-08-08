/**
 * API Client para comunicação com backend Django
 * Preserva toda funcionalidade existente e adiciona novas features
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // Método para definir token de autenticação
  setAuthToken(token: string) {
    this.defaultHeaders['Authorization'] = `Token ${token}`;
  }

  // Método para remover token
  removeAuthToken() {
    delete this.defaultHeaders['Authorization'];
  }

  // Método base para requisições
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const config: RequestInit = {
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
        ...options,
      };

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Erro na requisição');
      }

      return { data, message: data.message };
    } catch (error) {
      console.error('API Error:', error);
      return { 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }

  // Métodos de autenticação
  auth = {
    // Registro básico (preserva funcionalidade existente)
    register: async (userData: {
      email: string;
      password: string;
      password_confirm: string;
      first_name: string;
      last_name: string;
      user_type: 'client' | 'freelancer';
      phone?: string;
    }) => {
      return this.request('/auth/register/', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    },

    // Registro profissional (nova funcionalidade)
    registerProfessional: async (registrationData: {
      email: string;
      password: string;
      password_confirm?: string;
      first_name: string;
      last_name: string;
      professional_type?: string;
      entity_type?: string;
      phone?: string;
      [key: string]: any;
    }) => {
      // Usar endpoint específico para profissionais
      return this.request('/auth/register-professional/', {
        method: 'POST',
        body: JSON.stringify(registrationData),
      });
    },

    // Login (preserva funcionalidade existente)
    login: async (credentials: { email: string; password: string }) => {
      return this.request('/auth/login/', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    },

    // Login social (preserva funcionalidade existente)
    socialLogin: async (socialData: {
      provider: 'google' | 'facebook';
      access_token: string;
      user_type?: 'client' | 'freelancer';
    }) => {
      return this.request('/auth/social/', {
        method: 'POST',
        body: JSON.stringify(socialData),
      });
    },

    // Logout (preserva funcionalidade existente)
    logout: async () => {
      return this.request('/auth/logout/', {
        method: 'POST',
      });
    },

    // Verificação de email (preserva funcionalidade existente)
    verifyEmail: async () => {
      return this.request('/auth/verify-email/', {
        method: 'POST',
      });
    },

    // Reenviar verificação (preserva funcionalidade existente)
    resendVerification: async () => {
      return this.request('/auth/resend-verification/', {
        method: 'POST',
      });
    },
  };

  // Métodos de perfil
  profile = {
    // Obter perfil do usuário
    get: async () => {
      return this.request('/profile/');
    },

    // Atualizar perfil
    update: async (profileData: any) => {
      return this.request('/profile/', {
        method: 'PATCH',
        body: JSON.stringify(profileData),
      });
    },
  };

  // Métodos de freelancers
  freelancers = {
    // Listar freelancers (preserva funcionalidade existente)
    list: async (params?: Record<string, any>) => {
      const queryString = params ? 
        '?' + new URLSearchParams(params).toString() : '';
      return this.request(`/freelancers/${queryString}`);
    },

    // Obter freelancer específico
    get: async (id: string) => {
      return this.request(`/freelancers/${id}/`);
    },

    // Criar perfil de freelancer
    create: async (freelancerData: any) => {
      return this.request('/freelancers/', {
        method: 'POST',
        body: JSON.stringify(freelancerData),
      });
    },

    // Atualizar perfil de freelancer
    update: async (id: string, freelancerData: any) => {
      return this.request(`/freelancers/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(freelancerData),
      });
    },
  };

  // Métodos de dashboard (preserva funcionalidade existente)
  dashboard = {
    getStats: async () => {
      return this.request('/dashboard/stats/');
    },
  };

  // Métodos de serviços (preserva funcionalidade existente)
  services = {
    list: async (params?: Record<string, any>) => {
      const queryString = params ? 
        '?' + new URLSearchParams(params).toString() : '';
      return this.request(`/services/${queryString}`);
    },

    get: async (id: string) => {
      return this.request(`/services/${id}/`);
    },

    create: async (serviceData: any) => {
      return this.request('/services/', {
        method: 'POST',
        body: JSON.stringify(serviceData),
      });
    },

    update: async (id: string, serviceData: any) => {
      return this.request(`/services/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(serviceData),
      });
    },

    delete: async (id: string) => {
      return this.request(`/services/${id}/`, {
        method: 'DELETE',
      });
    },

    // Métodos específicos para ServicePackages
    duplicate: async (id: string) => {
      return this.request(`/services/${id}/duplicate/`, {
        method: 'POST',
      });
    },

    toggleStatus: async (id: string, status: 'active' | 'paused' | 'inactive') => {
      return this.request(`/services/${id}/status/`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },

    updatePricing: async (id: string, pricingData: any) => {
      return this.request(`/services/${id}/pricing/`, {
        method: 'PATCH',
        body: JSON.stringify(pricingData),
      });
    },

    getAnalytics: async (id: string, period: string = '30d') => {
      return this.request(`/services/${id}/analytics/?period=${period}`);
    },

    // Buscar serviços públicos (para catálogo)
    search: async (query: string, filters?: Record<string, any>) => {
      const params = new URLSearchParams({ q: query, ...filters });
      return this.request(`/services/search/?${params.toString()}`);
    },

    // Listar por categoria
    byCategory: async (categoryId: string, params?: Record<string, any>) => {
      const queryString = params ? 
        '?' + new URLSearchParams(params).toString() : '';
      return this.request(`/categories/${categoryId}/services/${queryString}`);
    },

    // Serviços em destaque
    featured: async () => {
      return this.request('/services/featured/');
    },
  };

  // Métodos de categorias (preserva funcionalidade existente)
  categories = {
    list: async () => {
      return this.request('/categories/');
    },
  };

  // Métodos de busca inteligente
  search = {
    // Busca inteligente com IA
    intelligent: async (query: string, filters?: Record<string, any>) => {
      const params = new URLSearchParams({ q: query, ...filters });
      return this.request(`/search/intelligent/?${params.toString()}`);
    },

    // Sugestões de busca
    suggestions: async (query: string, limit: number = 8) => {
      const params = new URLSearchParams({ q: query, limit: limit.toString() });
      return this.request(`/search/suggestions/?${params.toString()}`);
    },

    // Filtros de busca
    filters: async () => {
      return this.request('/search/filters/');
    },

    // Classificação de query (para escolher entre IA e tradicional)
    classify: async (query: string) => {
      return this.request('/search/classify/', {
        method: 'POST',
        body: JSON.stringify({ query }),
      });
    },

    // Busca tradicional com Elasticsearch
    elasticsearch: {
      services: async (query: string, filters?: Record<string, any>) => {
        const params = new URLSearchParams({ q: query, ...filters });
        return this.request(`/search/elasticsearch/services/?${params.toString()}`);
      },

      freelancers: async (query: string, filters?: Record<string, any>) => {
        const params = new URLSearchParams({ q: query, ...filters });
        return this.request(`/search/elasticsearch/freelancers/?${params.toString()}`);
      },

      unified: async (query: string, filters?: Record<string, any>) => {
        const params = new URLSearchParams({ q: query, ...filters });
        return this.request(`/search/elasticsearch/unified/?${params.toString()}`);
      },

      aggregations: async (query?: string, filters?: Record<string, any>) => {
        const params = new URLSearchParams({ q: query || '', ...filters });
        return this.request(`/search/elasticsearch/aggregations/?${params.toString()}`);
      },
    },
  };
}

// Instância singleton da API
export const api = new ApiClient();

// Helper para gerenciar token no localStorage
export const authToken = {
  get: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  },

  set: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      api.setAuthToken(token);
    }
  },

  remove: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      api.removeAuthToken();
    }
  },

  // Inicializar token na inicialização da aplicação
  initialize: () => {
    const token = authToken.get();
    if (token) {
      api.setAuthToken(token);
    }
  },
};

// Types para TypeScript
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: 'client' | 'freelancer';
  profile_image_url?: string;
  phone?: string;
  phone_verified: boolean;
  email_verified: boolean;
  two_factor_enabled: boolean;
}

export interface FreelancerProfile {
  id: string;
  user: User;
  title: string;
  bio: string;
  skills: string[];
  hourly_rate: number;
  location: string;
  stripe_account_id?: string;
  stripe_onboarding_completed: boolean;
}

export default api;