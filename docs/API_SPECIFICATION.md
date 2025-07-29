# Especificação da API - Dashboard Enhancement
## Documentação Completa dos Endpoints

---

## 📋 Visão Geral

### **Base URL**
```
Development: http://localhost:3001/api/v1
Production: https://api.galaxia.com/v1
```

### **Autenticação**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### **Rate Limiting**
- 100 requests/minute para usuários autenticados
- 20 requests/minute para endpoints de IA
- 1000 requests/minute para WebSocket

---

## 🔐 Autenticação

### **POST /auth/login**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "type": "client|professional",
      "profile": {
        "name": "John Doe",
        "avatar": "https://...",
        "verified": true
      }
    },
    "tokens": {
      "access_token": "jwt_token",
      "refresh_token": "refresh_token",
      "expires_in": 3600
    }
  }
}
```

### **POST /auth/refresh**
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "refresh_token"
}
```

---

## 📊 Dashboard Endpoints

### **GET /dashboard/client/:userId**
Retorna dados completos do dashboard do cliente.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "type": "client",
      "profile": {
        "name": "João Silva",
        "avatar": "https://...",
        "memberSince": "2023-01-15",
        "totalProjects": 25,
        "successRate": 92.5
      }
    },
    "projects": [
      {
        "id": "uuid",
        "title": "Logo Design",
        "status": "in_progress|completed|cancelled|review",
        "professional": {
          "id": "uuid",
          "name": "Maria Designer",
          "avatar": "https://..."
        },
        "budget": {
          "amount": 500,
          "currency": "BRL"
        },
        "timeline": {
          "startDate": "2024-01-15",
          "endDate": "2024-02-15",
          "progress": 75
        },
        "lastUpdate": "2024-01-20T10:30:00Z"
      }
    ],
    "messages": [
      {
        "id": "uuid",
        "from": {
          "id": "uuid",
          "name": "Maria Designer",
          "type": "professional"
        },
        "content": "Projeto atualizado com nova versão",
        "timestamp": "2024-01-20T14:30:00Z",
        "read": false,
        "attachments": []
      }
    ],
    "notifications": [
      {
        "id": "uuid",
        "type": "project_update|message|payment|system",
        "title": "Projeto atualizado",
        "content": "Maria Designer enviou uma nova versão",
        "timestamp": "2024-01-20T14:30:00Z",
        "read": false,
        "actionUrl": "/project/uuid"
      }
    ],
    "analytics": {
      "totalSpent": 12500,
      "projectsCompleted": 20,
      "averageRating": 4.8,
      "responseTime": "2h",
      "successRate": 92.5
    },
    "recommendations": [
      {
        "id": "uuid",
        "type": "professional|service|trend",
        "title": "Profissional Recomendado",
        "description": "Baseado no seu histórico...",
        "confidence": 0.85,
        "actionUrl": "/professional/uuid"
      }
    ]
  },
  "meta": {
    "lastUpdated": "2024-01-20T15:00:00Z",
    "cacheUntil": "2024-01-20T15:05:00Z"
  }
}
```

### **GET /dashboard/professional/:userId**
Retorna dados completos do dashboard do profissional.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "type": "professional",
      "profile": {
        "name": "Maria Designer",
        "avatar": "https://...",
        "category": "design",
        "specialties": ["logo", "branding"],
        "rating": 4.9,
        "reviewsCount": 127,
        "responseTime": "1h",
        "verified": true
      }
    },
    "pipeline": {
      "leads": [
        {
          "id": "uuid",
          "client": {
            "name": "Empresa XYZ",
            "avatar": "https://..."
          },
          "project": {
            "title": "Website Redesign",
            "budget": "R$ 5.000 - R$ 8.000",
            "description": "..."
          },
          "stage": "contacted|proposal_sent|negotiating|won|lost",
          "probability": 75,
          "expectedCloseDate": "2024-02-01",
          "lastActivity": "2024-01-20T10:00:00Z"
        }
      ],
      "totalValue": 25000,
      "conversionRate": 68.5
    },
    "activeProjects": [
      {
        "id": "uuid",
        "title": "E-commerce Design",
        "client": {
          "name": "Loja ABC",
          "avatar": "https://..."
        },
        "status": "in_progress",simulation_progress": 60,
        "deadline": "2024-02-15",
        "nextMilestone": {
          "title": "Wireframes Review",
          "date": "2024-01-25"
        }
      }
    ],
    "analytics": {
      "revenue": {
        "thisMonth": 8500,
        "lastMonth": 7200,
        "growth": 18.1
      },
      "projects": {
        "active": 5,
        "completed": 42,
        "successRate": 96.2
      },
      "performance": {
        "rating": 4.9,
        "responseTime": "1h",
        "deliveryTime": 95.5
      }
    },
    "marketIntelligence": {
      "categoryTrends": [
        {
          "category": "web_design",
          "demand": 85,
          "averagePrice": 2500,
          "competition": "medium",
          "trend": "up"
        }
      ],
      "recommendations": [
        {
          "type": "pricing",
          "title": "Aumente seus preços em 15%",
          "reasoning": "Baseado na demanda atual...",
          "impact": "high"
        }
      ]
    }
  }
}
```

---

## 📈 Analytics Endpoints

### **POST /analytics/performance**
Retorna métricas de performance detalhadas.

**Request:**
```json
{
  "userId": "uuid",
  "timeRange": {
    "start": "2024-01-01",
    "end": "2024-01-31"
  },
  "metrics": ["revenue", "projects", "rating", "response_time"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "performance": {
      "revenue": {
        "total": 15000,
        "growth": 25.5,
        "breakdown": [
          {
            "date": "2024-01-01",
            "value": 500
          }
        ]
      },
      "projects": {
        "completed": 8,
        "successRate": 100,
        "averageRating": 4.8,
        "onTimeDelivery": 87.5
      }
    },
    "comparisons": {
      "industryAverage": {
        "revenue": 12000,
        "successRate": 85,
        "rating": 4.2
      },
      "topPerformers": {
        "revenue": 25000,
        "successRate": 95,
        "rating": 4.9
      }
    }
  }
}
```

### **POST /analytics/predictions**
Retorna análises preditivas baseadas em IA.

**Request:**
```json
{
  "userId": "uuid",
  "predictionType": "revenue|demand|seasonality",
  "timeframe": "next_month|next_quarter|next_year"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "predictions": {
      "revenue": {
        "nextMonth": {
          "predicted": 9500,
          "confidence": 0.78,
          "range": {
            "min": 7500,
            "max": 11500
          }
        },
        "factors": [
          {
            "factor": "seasonal_trend",
            "impact": 0.15,
            "description": "Janeiro é tipicamente 15% mais forte"
          }
        ]
      },
      "recommendations": [
        {
          "title": "Foque em projetos de branding",
          "reasoning": "Alta demanda prevista para Q1",
          "confidence": 0.82
        }
      ]
    }
  }
}
```

---

## 🤖 IA Endpoints

### **POST /ai/recommendations**
Gera recomendações personalizadas usando IA.

**Request:**
```json
{
  "userId": "uuid",
  "context": {
    "userType": "client|professional",
    "recentActivity": [
      {
        "type": "project_completed",
        "category": "design",
        "satisfaction": 5
      }
    ],
    "preferences": {
      "budget": "medium",
      "timeline": "flexible",
      "style": "modern"
    }
  },
  "count": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "id": "uuid",
        "type": "professional",
        "title": "Designer Especialista em E-commerce",
        "description": "João Silva tem 5 anos de experiência...",
        "reasoning": "Baseado no seu interesse por projetos de e-commerce",
        "confidence": 0.87,
        "professional": {
          "id": "uuid",
          "name": "João Silva",
          "avatar": "https://...",
          "specialties": ["e-commerce", "ui/ux"],
          "rating": 4.8,
          "priceRange": "R$ 2.000 - R$ 5.000"
        },
        "actionUrl": "/professional/uuid"
      }
    ],
    "metadata": {
      "generatedAt": "2024-01-20T15:00:00Z",
      "model": "gpt-4-turbo",
      "processingTime": 1.2
    }
  }
}
```

### **POST /ai/pricing-suggestion**
Sugere preços otimizados para projetos.

**Request:**
```json
{
  "projectData": {
    "title": "Website E-commerce",
    "description": "Loja online com 50 produtos...",
    "category": "web_development",
    "complexity": "high",
    "timeline": "2_months",
    "requirements": [
      "responsive_design",
      "payment_integration",
      "admin_panel"
    ]
  },
  "professionalProfile": {
    "experience": "5_years",
    "specialties": ["e-commerce", "react"],
    "previousPricing": [3000, 4500, 5500]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pricing": {
      "suggested": 4200,
      "range": {
        "min": 3500,
        "max": 5000
      },
      "packages": [
        {
          "name": "Básico",
          "price": 3500,
          "features": ["Design responsivo", "5 páginas"],
          "timeline": "6 semanas"
        },
        {
          "name": "Padrão",
          "price": 4200,
          "features": ["Design responsivo", "10 páginas", "Integração pagamento"],
          "timeline": "8 semanas"
        },
        {
          "name": "Premium",
          "price": 5000,
          "features": ["Tudo do Padrão", "Admin panel", "SEO otimizado"],
          "timeline": "10 semanas"
        }
      ]
    },
    "analysis": {
      "marketAverage": 4000,
      "competitorRange": {
        "min": 3000,
        "max": 6000
      },
      "reasoning": "Preço baseado na complexidade do projeto e sua experiência",
      "confidence": 0.84
    }
  }
}
```

---

## 📱 Real-time WebSocket

### **Conexão WebSocket**
```javascript
// URL: ws://localhost:3001/ws?token=jwt_token

// Eventos enviados pelo servidor
{
  "type": "PROJECT_UPDATE",
  "data": {
    "projectId": "uuid",
    "status": "completed",
    "updates": {
      "progress": 100,
      "lastActivity": "2024-01-20T15:00:00Z"
    }
  }
}

{
  "type": "NEW_MESSAGE",
  "data": {
    "message": {
      "id": "uuid",
      "from": {
        "id": "uuid",
        "name": "Maria Designer"
      },
      "content": "Projeto finalizado!",
      "timestamp": "2024-01-20T15:00:00Z"
    }
  }
}

{
  "type": "NOTIFICATION",
  "data": {
    "notification": {
      "id": "uuid",
      "type": "payment_received",
      "title": "Pagamento recebido",
      "content": "R$ 2.500 foi creditado na sua conta",
      "timestamp": "2024-01-20T15:00:00Z"
    }
  }
}

// Eventos enviados pelo cliente
{
  "type": "SUBSCRIBE",
  "data": {
    "channels": ["projects", "messages", "notifications"]
  }
}

{
  "type": "MARK_READ",
  "data": {
    "messageId": "uuid"
  }
}
```

---

## 📊 Projetos

### **GET /projects**
Lista projetos do usuário.

**Query Parameters:**
```
?status=active&page=1&limit=10&sort=created_at&order=desc
```

**Response:**
```json
{
  "success": true,
  "data": {
    "projects": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "totalPages": 5
    }
  }
}
```

### **PUT /projects/:id/status**
Atualiza status do projeto.

**Request:**
```json
{
  "status": "completed",
  "notes": "Projeto finalizado com sucesso"
}
```

---

## 💬 Mensagens

### **GET /messages**
Lista mensagens do usuário.

**Response:**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "uuid",
        "participant": {
          "id": "uuid",
          "name": "Maria Designer",
          "avatar": "https://..."
        },
        "lastMessage": {
          "content": "Projeto atualizado",
          "timestamp": "2024-01-20T14:30:00Z",
          "read": true
        },
        "unreadCount": 2,
        "projectId": "uuid"
      }
    ]
  }
}
```

### **POST /messages**
Envia nova mensagem.

**Request:**
```json
{
  "recipientId": "uuid",
  "content": "Olá, como está o projeto?",
  "projectId": "uuid",
  "attachments": []
}
```

---

## 🔔 Notificações

### **GET /notifications**
Lista notificações do usuário.

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "type": "project_update",
        "title": "Projeto atualizado",
        "content": "Maria Designer enviou uma nova versão",
        "timestamp": "2024-01-20T14:30:00Z",
        "read": false,
        "actionUrl": "/project/uuid",
        "metadata": {
          "projectId": "uuid",
          "fromUserId": "uuid"
        }
      }
    ],
    "unreadCount": 5
  }
}
```

### **PUT /notifications/:id/read**
Marca notificação como lida.

---

## 🎯 Market Intelligence

### **GET /market/trends**
Retorna tendências de mercado.

**Response:**
```json
{
  "success": true,
  "data": {
    "trends": [
      {
        "category": "web_design",
        "demand": {
          "current": 85,
          "change": 12.5,
          "trend": "up"
        },
        "pricing": {
          "average": 2500,
          "range": {
            "min": 1500,
            "max": 5000
          },
          "change": 8.2
        },
        "competition": {
          "level": "medium",
          "activeProviders": 1250,
          "newEntries": 45
        },
        "insights": [
          "Demanda por design responsivo cresceu 15%",
          "Projetos com prazo flexível pagam 20% mais"
        ]
      }
    ],
    "lastUpdated": "2024-01-20T12:00:00Z"
  }
}
```

---

## ⚙️ Configurações de Usuário

### **GET /users/:id/preferences**
Retorna preferências do usuário.

### **PUT /users/:id/preferences**
Atualiza preferências do usuário.

**Request:**
```json
{
  "dashboard": {
    "layout": "compact",
    "widgets": ["projects", "messages", "analytics"],
    "theme": "light"
  },
  "notifications": {
    "email": true,
    "push": true,
    "sms": false,
    "frequency": "immediate"
  },
  "privacy": {
    "profileVisibility": "public",
    "showRating": true,
    "showEarnings": false
  }
}
```

---

## 🚨 Error Responses

### **Estrutura de Erro**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos fornecidos",
    "details": [
      {
        "field": "email",
        "message": "Email é obrigatório"
      }
    ],
    "timestamp": "2024-01-20T15:00:00Z",
    "requestId": "uuid"
  }
}
```

### **Códigos de Erro**
```
400 BAD_REQUEST - Dados inválidos
401 UNAUTHORIZED - Token inválido/expirado
403 FORBIDDEN - Sem permissão
404 NOT_FOUND - Recurso não encontrado
409 CONFLICT - Conflito de dados
422 VALIDATION_ERROR - Erro de validação
429 RATE_LIMIT - Muitas requisições
500 INTERNAL_ERROR - Erro interno
503 SERVICE_UNAVAILABLE - Serviço indisponível
```

---

## 📊 Estrutura de Dados

### **User Model**
```typescript
interface User {
  id: string;
  email: string;
  type: 'client' | 'professional';
  profile: UserProfile;
  preferences: UserPreferences;
  subscription: SubscriptionPlan;
  createdAt: Date;
  updatedAt: Date;
}
```

### **Project Model**
```typescript
interface Project {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'in_progress' | 'in_review' | 'completed' | 'cancelled';
  clientId: string;
  professionalId?: string;
  budget: Budget;
  timeline: Timeline;
  requirements: string[];
  deliverables: Deliverable[];
  milestones: Milestone[];
  createdAt: Date;
  updatedAt: Date;
}
```

### **Message Model**
```typescript
interface Message {
  id: string;
  conversationId: string;
  fromId: string;
  toId: string;
  content: string;
  type: 'text' | 'file' | 'system';
  attachments: Attachment[];
  read: boolean;
  createdAt: Date;
}
```

---

Esta especificação fornece a base completa para implementar todas as funcionalidades dos dashboards melhorados da GalaxIA.