"use client";

import React, { useMemo, useState } from "react";
import { Input } from "./input";
import { Label } from "./label";
import { cn } from "../../lib/utils";

type PasswordStrength = "weak" | "medium" | "strong";

export interface ValidatedInputProps {
  label?: string;
  fieldName?: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  entityType?: "pf" | "pj";
  showPasswordStrength?: boolean;
  className?: string;
}

function isValidEmail(email: string): boolean {
  return /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email);
}

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

// CPF validation (basic algorithm: digits and verifying digits)
function isValidCPF(cpf: string): boolean {
  const digits = onlyDigits(cpf);
  if (digits.length !== 11 || /^([0-9])\1+$/.test(digits)) return false;
  const calc = (baseLen: number) => {
    let sum = 0;
    for (let i = 0; i < baseLen; i++) sum += parseInt(digits[i], 10) * (baseLen + 1 - i);
    const mod = (sum * 10) % 11;
    return mod === 10 ? 0 : mod;
  };
  const d1 = calc(9);
  const d2 = calc(10);
  return d1 === parseInt(digits[9], 10) && d2 === parseInt(digits[10], 10);
}

// CNPJ validation (basic algorithm)
function isValidCNPJ(cnpj: string): boolean {
  const digits = onlyDigits(cnpj);
  if (digits.length !== 14 || /^([0-9])\1+$/.test(digits)) return false;
  const calc = (len: number) => {
    const factors = len === 12
      ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
      : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < factors.length; i++) sum += parseInt(digits[i], 10) * factors[i];
    const mod = sum % 11;
    return mod < 2 ? 0 : 11 - mod;
  };
  const d1 = calc(12);
  const d2 = calc(13);
  return d1 === parseInt(digits[12], 10) && d2 === parseInt(digits[13], 10);
}

function isValidPhoneBR(phone: string): boolean {
  // Accept formats like (11) 98765-4321 or 11987654321
  const digits = onlyDigits(phone);
  return digits.length === 10 || digits.length === 11;
}

function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
  if (password.length >= 12) score++;
  if (score >= 3) return "strong";
  if (score === 2) return "medium";
  return "weak";
}

export function ValidatedInput({
  label,
  fieldName,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
  entityType,
  showPasswordStrength,
  className,
}: ValidatedInputProps) {
  const [touched, setTouched] = useState(false);

  const validation = useMemo(() => {
    if (!touched && !value) return { valid: true, message: "" };
    switch (fieldName) {
      case "email":
        return { valid: isValidEmail(value), message: isValidEmail(value) ? "" : "Email inválido" };
      case "cpf":
        return { valid: isValidCPF(value), message: isValidCPF(value) ? "" : "CPF inválido" };
      case "cnpj":
        return { valid: isValidCNPJ(value), message: isValidCNPJ(value) ? "" : "CNPJ inválido" };
      case "phone":
      case "companyPhone":
        return { valid: isValidPhoneBR(value), message: isValidPhoneBR(value) ? "" : "Telefone inválido" };
      default:
        if (required) return { valid: Boolean(String(value).trim()), message: String(value).trim() ? "" : "Campo obrigatório" };
        return { valid: true, message: "" };
    }
  }, [fieldName, required, touched, value]);

  const strength: PasswordStrength | null = useMemo(() => {
    if (!showPasswordStrength || type !== "password") return null;
    return getPasswordStrength(value);
  }, [showPasswordStrength, type, value]);

  const borderClass = validation.valid ? "" : "border-red-500 focus-visible:ring-red-500";

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label htmlFor={fieldName}>{label}{required ? " *" : ""}</Label>}
      <Input
        id={fieldName}
        name={fieldName}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          if (fieldName === "cpf" || fieldName === "cnpj" || fieldName === "phone" || fieldName === "companyPhone") {
            // allow user to type freely but keep value as is; validation uses digits
          }
          onChange(e);
        }}
        onBlur={() => setTouched(true)}
        className={cn(borderClass)}
        required={required}
      />
      {!validation.valid && (
        <p className="text-xs text-red-600">{validation.message}</p>
      )}
      {strength && (
        <div className="flex items-center gap-2">
          <div className={cn("h-1.5 w-16 rounded", strength === "weak" && "bg-red-500", strength === "medium" && "bg-yellow-500", strength === "strong" && "bg-green-500")}></div>
          <span className={cn("text-xs", strength === "weak" && "text-red-600", strength === "medium" && "text-yellow-700", strength === "strong" && "text-green-700")}>{strength === "weak" ? "Fraca" : strength === "medium" ? "Média" : "Forte"}</span>
        </div>
      )}
    </div>
  );
}

export default ValidatedInput;



