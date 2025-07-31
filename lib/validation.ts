// Validação de documentos brasileiros
export const validation = {
  // Validação de CPF
  cpf: {
    // Remove caracteres não numéricos
    clean: (cpf: string): string => {
      return cpf.replace(/\D/g, '');
    },

    // Formata CPF
    format: (cpf: string): string => {
      const cleaned = validation.cpf.clean(cpf);
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    },

    // Valida CPF
    isValid: (cpf: string): boolean => {
      const cleaned = validation.cpf.clean(cpf);
      
      // Verifica se tem 11 dígitos
      if (cleaned.length !== 11) return false;
      
      // Verifica se todos os dígitos são iguais
      if (/^(\d)\1{10}$/.test(cleaned)) return false;
      
      // Valida primeiro dígito verificador
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        sum += parseInt(cleaned.charAt(i)) * (10 - i);
      }
      let remainder = 11 - (sum % 11);
      if (remainder === 10 || remainder === 11) remainder = 0;
      if (remainder !== parseInt(cleaned.charAt(9))) return false;
      
      // Valida segundo dígito verificador
      sum = 0;
      for (let i = 0; i < 10; i++) {
        sum += parseInt(cleaned.charAt(i)) * (11 - i);
      }
      remainder = 11 - (sum % 11);
      if (remainder === 10 || remainder === 11) remainder = 0;
      if (remainder !== parseInt(cleaned.charAt(10))) return false;
      
      return true;
    },

    // Mensagens de erro
    getErrorMessage: (cpf: string): string | null => {
      const cleaned = validation.cpf.clean(cpf);
      
      if (!cpf) return 'CPF é obrigatório';
      if (cleaned.length < 11) return 'CPF deve ter 11 dígitos';
      if (cleaned.length > 11) return 'CPF não pode ter mais de 11 dígitos';
      if (/^(\d)\1{10}$/.test(cleaned)) return 'CPF não pode ter todos os dígitos iguais';
      if (!validation.cpf.isValid(cpf)) return 'CPF inválido';
      
      return null;
    }
  },

  // Validação de CNPJ
  cnpj: {
    // Remove caracteres não numéricos
    clean: (cnpj: string): string => {
      return cnpj.replace(/\D/g, '');
    },

    // Formata CNPJ
    format: (cnpj: string): string => {
      const cleaned = validation.cnpj.clean(cnpj);
      return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    },

    // Valida CNPJ
    isValid: (cnpj: string): boolean => {
      const cleaned = validation.cnpj.clean(cnpj);
      
      // Verifica se tem 14 dígitos
      if (cleaned.length !== 14) return false;
      
      // Verifica se todos os dígitos são iguais
      if (/^(\d)\1{13}$/.test(cleaned)) return false;
      
      // Valida primeiro dígito verificador
      let sum = 0;
      let weight = 2;
      for (let i = 11; i >= 0; i--) {
        sum += parseInt(cleaned.charAt(i)) * weight;
        weight = weight === 9 ? 2 : weight + 1;
      }
      let remainder = sum % 11;
      const digit1 = remainder < 2 ? 0 : 11 - remainder;
      if (digit1 !== parseInt(cleaned.charAt(12))) return false;
      
      // Valida segundo dígito verificador
      sum = 0;
      weight = 2;
      for (let i = 12; i >= 0; i--) {
        sum += parseInt(cleaned.charAt(i)) * weight;
        weight = weight === 9 ? 2 : weight + 1;
      }
      remainder = sum % 11;
      const digit2 = remainder < 2 ? 0 : 11 - remainder;
      if (digit2 !== parseInt(cleaned.charAt(13))) return false;
      
      return true;
    },

    // Mensagens de erro
    getErrorMessage: (cnpj: string): string | null => {
      const cleaned = validation.cnpj.clean(cnpj);
      
      if (!cnpj) return 'CNPJ é obrigatório';
      if (cleaned.length < 14) return 'CNPJ deve ter 14 dígitos';
      if (cleaned.length > 14) return 'CNPJ não pode ter mais de 14 dígitos';
      if (/^(\d)\1{13}$/.test(cleaned)) return 'CNPJ não pode ter todos os dígitos iguais';
      if (!validation.cnpj.isValid(cnpj)) return 'CNPJ inválido';
      
      return null;
    }
  },

  // Validação de email
  email: {
    isValid: (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },

    getErrorMessage: (email: string): string | null => {
      if (!email) return 'Email é obrigatório';
      if (!validation.email.isValid(email)) return 'Email inválido';
      return null;
    }
  },

  // Validação de telefone brasileiro
  phone: {
    clean: (phone: string): string => {
      return phone.replace(/\D/g, '');
    },

    format: (phone: string): string => {
      const cleaned = validation.phone.clean(phone);
      if (cleaned.length === 11) {
        return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      } else if (cleaned.length === 10) {
        return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      }
      return phone;
    },

    isValid: (phone: string): boolean => {
      const cleaned = validation.phone.clean(phone);
      return cleaned.length === 10 || cleaned.length === 11;
    },

    getErrorMessage: (phone: string): string | null => {
      const cleaned = validation.phone.clean(phone);
      
      if (!phone) return 'Telefone é obrigatório';
      if (cleaned.length < 10) return 'Telefone deve ter pelo menos 10 dígitos';
      if (cleaned.length > 11) return 'Telefone não pode ter mais de 11 dígitos';
      if (!validation.phone.isValid(phone)) return 'Telefone inválido';
      
      return null;
    }
  },

  // Validação de senha
  password: {
    getStrength: (password: string): { 
      score: number; 
      label: string; 
      color: string;
      requirements: { text: string; met: boolean; }[];
    } => {
      const requirements = [
        { text: 'Pelo menos 8 caracteres', met: password.length >= 8 },
        { text: 'Pelo menos uma letra minúscula', met: /[a-z]/.test(password) },
        { text: 'Pelo menos uma letra maiúscula', met: /[A-Z]/.test(password) },
        { text: 'Pelo menos um número', met: /\d/.test(password) },
        { text: 'Pelo menos um caractere especial', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) }
      ];

      const score = requirements.filter(req => req.met).length;
      
      let label = '';
      let color = '';
      
      switch (score) {
        case 0:
        case 1:
          label = 'Muito fraca';
          color = 'text-red-500';
          break;
        case 2:
          label = 'Fraca';
          color = 'text-red-400';
          break;
        case 3:
          label = 'Média';
          color = 'text-yellow-500';
          break;
        case 4:
          label = 'Forte';
          color = 'text-green-500';
          break;
        case 5:
          label = 'Muito forte';
          color = 'text-green-600';
          break;
      }

      return { score, label, color, requirements };
    },

    getErrorMessage: (password: string): string | null => {
      if (!password) return 'Senha é obrigatória';
      if (password.length < 8) return 'Senha deve ter pelo menos 8 caracteres';
      
      const strength = validation.password.getStrength(password);
      if (strength.score < 3) return 'Senha muito fraca. Use pelo menos 8 caracteres com letras maiúsculas, minúsculas e números.';
      
      return null;
    }
  },

  // Validação de CEP
  cep: {
    clean: (cep: string): string => {
      return cep.replace(/\D/g, '');
    },

    format: (cep: string): string => {
      const cleaned = validation.cep.clean(cep);
      return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
    },

    isValid: (cep: string): boolean => {
      const cleaned = validation.cep.clean(cep);
      return cleaned.length === 8;
    },

    getErrorMessage: (cep: string): string | null => {
      const cleaned = validation.cep.clean(cep);
      
      if (!cep) return 'CEP é obrigatório';
      if (cleaned.length < 8) return 'CEP deve ter 8 dígitos';
      if (cleaned.length > 8) return 'CEP não pode ter mais de 8 dígitos';
      
      return null;
    }
  }
};

// Hook para validação em tempo real
export const useRealTimeValidation = () => {
  return {
    validateField: (fieldName: string, value: string, entityType?: 'pf' | 'pj') => {
      switch (fieldName) {
        case 'cpf':
          return validation.cpf.getErrorMessage(value);
        case 'cnpj':
          return validation.cnpj.getErrorMessage(value);
        case 'email':
          return validation.email.getErrorMessage(value);
        case 'phone':
          return validation.phone.getErrorMessage(value);
        case 'password':
          return validation.password.getErrorMessage(value);
        case 'cep':
          return validation.cep.getErrorMessage(value);
        case 'document':
          // Para documentos dinâmicos baseados no tipo de entidade
          if (entityType === 'pf') {
            return validation.cpf.getErrorMessage(value);
          } else if (entityType === 'pj') {
            return validation.cnpj.getErrorMessage(value);
          }
          return 'Tipo de documento não identificado';
        default:
          return null;
      }
    },

    formatField: (fieldName: string, value: string) => {
      switch (fieldName) {
        case 'cpf':
          return validation.cpf.format(value);
        case 'cnpj':
          return validation.cnpj.format(value);
        case 'phone':
          return validation.phone.format(value);
        case 'cep':
          return validation.cep.format(value);
        default:
          return value;
      }
    }
  };
};