import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const authApi = {
  register: (data: { email: string; password: string; firstName: string; lastName: string; userType: string; professionalType?: string; plan?: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  logout: () => api.post('/auth/logout'),
  
  getMe: () => api.get('/auth/me'),
};

export const usersApi = {
  getById: (id: string) => api.get(`/users/${id}`),
  
  updateProfile: (data: any) => api.put('/users/profile', data),
  
  switchType: () => api.post('/users/switch-type'),
};

export const freelancersApi = {
  search: (params: any) => api.get('/freelancers/search', { params }),
  
  getById: (id: string) => api.get(`/freelancers/${id}`),
  
  createOrUpdateProfile: (data: any) => api.post('/freelancers/profile', data),
  
  getServices: (id: string, params?: any) => 
    api.get(`/freelancers/${id}/services`, { params }),
  
  getReviews: (id: string, params?: any) => 
    api.get(`/freelancers/${id}/reviews`, { params }),
};

export const projectsApi = {
  search: (params: any) => api.get('/projects/search', { params }),
  
  getById: (id: string) => api.get(`/projects/${id}`),
  
  create: (data: any) => api.post('/projects', data),
  
  update: (id: string, data: any) => api.put(`/projects/${id}`, data),
  
  getProposals: (id: string, params?: any) => 
    api.get(`/projects/${id}/proposals`, { params }),
};

export const servicesApi = {
  search: (params: any) => api.get('/services/search', { params }),
  
  getById: (id: string) => api.get(`/services/${id}`),
  
  create: (data: any) => api.post('/services', data),
  
  update: (id: string, data: any) => api.put(`/services/${id}`, data),
};

export const proposalsApi = {
  create: (data: any) => api.post('/proposals', data),
  
  update: (id: string, data: any) => api.put(`/proposals/${id}`, data),
  
  withdraw: (id: string) => api.delete(`/proposals/${id}`),
  
  getClientProposals: (params?: any) => api.get('/proposals/client', { params }),
  
  getFreelancerProposals: (params?: any) => api.get('/proposals/freelancer', { params }),
};

export const ordersApi = {
  getMyOrders: (params?: any) => api.get('/orders', { params }),
  
  getById: (id: string) => api.get(`/orders/${id}`),
  
  create: (data: any) => api.post('/orders', data),
  
  updateStatus: (id: string, status: string) => 
    api.put(`/orders/${id}/status`, { status }),
};

export const messagesApi = {
  getConversations: () => api.get('/messages/conversations'),
  
  getMessages: (conversationId: string, params?: any) => 
    api.get(`/messages/conversation/${conversationId}`, { params }),
  
  sendMessage: (data: any) => api.post('/messages', data),
  
  markAsRead: (messageId: string) => api.put(`/messages/${messageId}/read`),
};

export const reviewsApi = {
  create: (data: any) => api.post('/reviews', data),
  
  update: (id: string, data: any) => api.put(`/reviews/${id}`, data),
  
  addReply: (id: string, reply: string) => 
    api.post(`/reviews/${id}/reply`, { reply }),
};

// New APIs for advanced features
export const documentsApi = {
  upload: (formData: FormData) => 
    api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  getMyDocuments: () => api.get('/documents'),
  
  getKycStatus: () => api.get('/documents/kyc-status'),
  
  deleteDocument: (id: string) => api.delete(`/documents/${id}`),
  
  // Admin endpoints
  getPendingDocuments: () => api.get('/documents/admin/pending'),
  
  verifyDocument: (id: string, action: 'approve' | 'reject', reason?: string) =>
    api.patch(`/documents/admin/${id}/verify`, { action, reason }),
};

export const coverageApi = {
  updateAreas: (data: any) => api.put('/coverage/areas', data),
  
  getAreas: () => api.get('/coverage/areas'),
  
  searchFreelancers: (data: any) => api.post('/coverage/search', data),
  
  getAvailability: (freelancerId: string, params: any) =>
    api.get(`/coverage/${freelancerId}/availability`, { params }),
  
  updateServiceAreas: (serviceId: string, data: any) =>
    api.put(`/coverage/services/${serviceId}/areas`, data),
};

export const pricingApi = {
  createService: (data: any) => api.post('/pricing/services', data),
  
  getSuggestions: (params: any) => api.get('/pricing/suggestions', { params }),
  
  updatePricing: (serviceId: string, data: any) =>
    api.patch(`/pricing/services/${serviceId}/pricing`, data),
  
  getAnalytics: (categoryId: string, params?: any) =>
    api.get(`/pricing/analytics/${categoryId}`, { params }),
};

export const categoriesApi = {
  getAll: (params?: any) => api.get('/categories', { params }),
  
  getById: (id: string, params?: any) => api.get(`/categories/${id}`, { params }),
  
  search: (query: string) => api.get(`/categories/search/${query}`),
  
  getPopular: (params?: any) => api.get('/categories/popular/trending', { params }),
  
  // Admin endpoints
  create: (data: any) => api.post('/categories', data),
  
  update: (id: string, data: any) => api.patch(`/categories/${id}`, data),
  
  delete: (id: string) => api.delete(`/categories/${id}`),
};

export const portfolioApi = {
  upload: (formData: FormData) => 
    api.post('/portfolio/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  getMyPortfolio: (params?: any) => api.get('/portfolio', { params }),
  
  getPublicPortfolio: (freelancerId: string, params?: any) =>
    api.get(`/portfolio/public/${freelancerId}`, { params }),
  
  updateItem: (itemId: string, data: any) => api.patch(`/portfolio/${itemId}`, data),
  
  deleteItem: (itemId: string) => api.delete(`/portfolio/${itemId}`),
  
  reorder: (itemIds: string[]) => api.patch('/portfolio/reorder', { itemIds }),
  
  getStats: () => api.get('/portfolio/stats'),
};

export const searchApi = {
  services: (data: any) => api.post('/search/services', data),
  
  freelancers: (data: any) => api.post('/search/freelancers', data),
  
  projects: (data: any) => api.post('/search/projects', data),
  
  getSuggestions: (params: any) => api.get('/search/suggestions', { params }),
};

export const qnaApi = {
  askQuestion: (serviceId: string, data: any) =>
    api.post(`/qna/services/${serviceId}/questions`, data),
  
  answerQuestion: (questionId: string, answer: string) =>
    api.patch(`/qna/questions/${questionId}/answer`, { answer }),
  
  getServiceQuestions: (serviceId: string, params?: any) =>
    api.get(`/qna/services/${serviceId}/questions`, { params }),
  
  getFreelancerQuestions: (params?: any) =>
    api.get('/qna/freelancer/questions', { params }),
  
  upvoteQuestion: (questionId: string) =>
    api.post(`/qna/questions/${questionId}/upvote`),
  
  deleteQuestion: (questionId: string) => api.delete(`/qna/questions/${questionId}`),
};

export const paymentsApi = {
  createPaymentIntent: (orderId: string, data?: any) =>
    api.post(`/payments/orders/${orderId}/payment-intent`, data),
  
  confirmPayment: (transactionId: string, data: any) =>
    api.post(`/payments/transactions/${transactionId}/confirm`, data),
  
  releaseEscrow: (orderId: string, data?: any) =>
    api.post(`/payments/orders/${orderId}/release-escrow`, data),
  
  requestRefund: (orderId: string, data: any) =>
    api.post(`/payments/orders/${orderId}/request-refund`, data),
  
  getTransactions: (params?: any) => api.get('/payments/transactions', { params }),
  
  getEscrowBalance: () => api.get('/payments/escrow/balance'),
  
  // Admin
  processRefund: (transactionId: string, data: any) =>
    api.patch(`/payments/admin/refunds/${transactionId}`, data),
};

export const dashboardApi = {
  getFreelancerOverview: (params?: any) =>
    api.get('/dashboard/freelancer/overview', { params }),
  
  getFreelancerAnalytics: (params?: any) =>
    api.get('/dashboard/freelancer/analytics', { params }),
  
  getClientOverview: (params?: any) =>
    api.get('/dashboard/client/overview', { params }),
  
  getClientAnalytics: (params?: any) =>
    api.get('/dashboard/client/analytics', { params }),
  
  getClientFavorites: (params?: any) =>
    api.get('/dashboard/client/favorites', { params }),
  
  getQuickStats: () => api.get('/dashboard/quick-stats'),
};

// Subscription and billing APIs
export const subscriptionApi = {
  getCurrentPlan: () => api.get('/subscriptions/current'),
  
  getAvailablePlans: () => api.get('/subscriptions/plans'),
  
  upgradePlan: (planId: string, data?: any) =>
    api.post(`/subscriptions/upgrade/${planId}`, data),
  
  cancelSubscription: (reason?: string) =>
    api.patch('/subscriptions/cancel', { reason }),
  
  getFeatureUsage: () => api.get('/subscriptions/usage'),
  
  checkFeatureAccess: (feature: string) =>
    api.get(`/subscriptions/access/${feature}`),
  
  getBillingHistory: (params?: any) =>
    api.get('/subscriptions/billing', { params }),
  
  // Add-ons
  getAvailableAddOns: () => api.get('/subscriptions/addons'),
  
  purchaseAddOn: (addonId: string, data?: any) =>
    api.post(`/subscriptions/addons/${addonId}`, data),
  
  cancelAddOn: (addonId: string) =>
    api.delete(`/subscriptions/addons/${addonId}`),
  
  // Trial and promotions
  startTrial: (planId: string) =>
    api.post(`/subscriptions/trial/${planId}`),
  
  applyPromoCode: (code: string) =>
    api.post('/subscriptions/promo', { code }),
};