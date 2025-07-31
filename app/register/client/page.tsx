'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Mail, Lock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function ClientRegistrationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    entityType: 'pf' // pf = pessoa física, pj = pessoa jurídica
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validações básicas
      if (formData.password !== formData.confirmPassword) {
        toast.error("As senhas não coincidem");
        return;
      }

      if (formData.password.length < 8) {
        toast.error("A senha deve ter pelo menos 8 caracteres");
        return;
      }

      // TODO: Implementar chamada para API Django
      console.log("Client registration data:", formData);
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Cadastro realizado com sucesso!");
      router.push("/login");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Erro ao realizar cadastro. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-muted">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/register" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </div>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg shadow-lg">
              <User className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold galaxia-text-gradient">
              Cadastro de Cliente
            </h1>
            <Badge variant="secondary">
              5 min
            </Badge>
          </div>
        </div>

        {/* Registration Form */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Dados Pessoais
            </CardTitle>
            <p className="text-muted-foreground">
              Preencha seus dados para começar a contratar serviços
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tipo de Entidade */}
              <div className="space-y-3">
                <Label>Tipo de Cadastro</Label>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={formData.entityType === 'pf' ? 'default' : 'outline'}
                    onClick={() => setFormData(prev => ({ ...prev, entityType: 'pf' }))}
                    className="flex-1"
                  >
                    Pessoa Física
                  </Button>
                  <Button
                    type="button"
                    variant={formData.entityType === 'pj' ? 'default' : 'outline'}
                    onClick={() => setFormData(prev => ({ ...prev, entityType: 'pj' }))}
                    className="flex-1"
                  >
                    Pessoa Jurídica
                  </Button>
                </div>
              </div>

              {/* Dados Pessoais */}
              {formData.entityType === 'pf' ? (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Nome *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="Seu primeiro nome"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Sobrenome *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Seu sobrenome"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <Label htmlFor="companyName">Nome da Empresa *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Razão social da empresa"
                    required
                  />
                </div>
              )}

              {/* Contato */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              {/* Credenciais */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 galaxia-text-gradient">
                  <Lock className="h-5 w-5 text-primary" />
                  Credenciais de Acesso
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">Senha *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Mínimo 8 caracteres"
                      required
                      minLength={8}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Repita sua senha"
                      required
                      className={formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-500' : ''}
                    />
                    {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="text-sm text-red-600 mt-1">As senhas não coincidem</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-6">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full galaxia-button-primary"
                >
                  {isLoading ? (
                    "Criando conta..."
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Criar Conta Cliente
                    </>
                  )}
                </Button>
                
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Já tem uma conta?{" "}
                  <Link href="/login" className="text-primary hover:underline">
                    Faça login
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}