import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validation, useRealTimeValidation } from '@/lib/validation';
import { CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  fieldName: string;
  entityType?: 'pf' | 'pj';
  onValidationChange?: (isValid: boolean) => void;
  showPasswordStrength?: boolean;
}

export function ValidatedInput({
  label,
  fieldName,
  entityType,
  value = '',
  onChange,
  onValidationChange,
  showPasswordStrength = false,
  type = 'text',
  className,
  ...props
}: ValidatedInputProps) {
  const [localValue, setLocalValue] = useState(value as string);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<any>(null);
  const { validateField, formatField } = useRealTimeValidation();

  // Sincronizar com valor externo
  useEffect(() => {
    setLocalValue(value as string);
  }, [value]);

  // Validação em tempo real
  useEffect(() => {
    if (localValue) {
      const errorMessage = validateField(fieldName, localValue, entityType);
      setError(errorMessage);
      setIsValid(!errorMessage);
      
      // Força callback de validação
      onValidationChange?.(!errorMessage);

      // Análise de força da senha
      if (fieldName === 'password' && showPasswordStrength) {
        setPasswordStrength(validation.password.getStrength(localValue));
      }
    } else {
      setError(null);
      setIsValid(false);
      onValidationChange?.(false);
      setPasswordStrength(null);
    }
  }, [localValue, fieldName, entityType, onValidationChange, showPasswordStrength]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    // Formatação automática para alguns campos
    if (['cpf', 'cnpj', 'phone', 'cep'].includes(fieldName)) {
      newValue = formatField(fieldName, newValue);
    }

    setLocalValue(newValue);
    
    // Chama onChange externo com valor formatado
    if (onChange) {
      const syntheticEvent = {
        ...e,
        target: { ...e.target, value: newValue }
      };
      onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const isPasswordField = type === 'password' || fieldName === 'password';
  const inputType = isPasswordField ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldName} className="text-sm font-medium">
        {label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          {...props}
          id={fieldName}
          type={inputType}
          value={localValue}
          onChange={handleInputChange}
          className={cn(
            className,
            error && 'border-red-500 focus:border-red-500',
            isValid && localValue && 'border-green-500 focus:border-green-500',
            isPasswordField && 'pr-10'
          )}
        />
        
        {/* Ícone de validação */}
        {localValue && !isPasswordField && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isValid ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
        )}

        {/* Toggle para mostrar/ocultar senha */}
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Mensagem de erro */}
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}

      {/* Indicador de força da senha */}
      {showPasswordStrength && passwordStrength && localValue && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Força da senha:</span>
            <span className={cn("text-xs font-medium", passwordStrength.color)}>
              {passwordStrength.label}
            </span>
          </div>
          
          {/* Barra de progresso */}
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                passwordStrength.score <= 1 && "bg-red-500",
                passwordStrength.score === 2 && "bg-red-400", 
                passwordStrength.score === 3 && "bg-yellow-500",
                passwordStrength.score === 4 && "bg-green-500",
                passwordStrength.score === 5 && "bg-green-600"
              )}
              style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
            />
          </div>

          {/* Lista de requisitos */}
          <div className="space-y-1">
            {passwordStrength.requirements.map((req: any, index: number) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  req.met ? "bg-green-500" : "bg-gray-300"
                )}>
                </div>
                <span className={cn(
                  req.met ? "text-green-600" : "text-gray-500"
                )}>
                  {req.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mensagem de sucesso */}
      {isValid && localValue && !error && (
        <p className="text-sm text-green-600 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          {fieldName === 'cpf' && 'CPF válido'}
          {fieldName === 'cnpj' && 'CNPJ válido'}
          {fieldName === 'email' && 'Email válido'}
          {fieldName === 'phone' && 'Telefone válido'}
          {fieldName === 'cep' && 'CEP válido'}
          {fieldName === 'password' && 'Senha forte'}
        </p>
      )}
    </div>
  );
}