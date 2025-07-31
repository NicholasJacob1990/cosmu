import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

const freelancerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  title: z.string().min(5, "Título profissional é obrigatório"),
  description: z.string().min(50, "Descrição deve ter pelo menos 50 caracteres"),
  hourlyRate: z.string().min(1, "Taxa horária é obrigatória"),
  experience: z.string().min(1, "Selecione o nível de experiência"),
  category: z.string().min(1, "Selecione uma categoria"),
  skills: z.array(z.string()).min(3, "Adicione pelo menos 3 habilidades"),
});

type FreelancerFormData = z.infer<typeof freelancerSchema>;

const categories = [
  "Desenvolvimento Web",
  "Design Gráfico",
  "Marketing Digital",
  "Redação",
  "Tradução",
  "Consultoria",
  "Arquitetura",
  "Engenharia",
  "Medicina",
  "Educação",
  "Jurídico",
  "Contabilidade"
];

const experienceLevels = [
  { value: "junior", label: "Iniciante (0-2 anos)" },
  { value: "mid", label: "Intermediário (2-5 anos)" },
  { value: "senior", label: "Sênior (5+ anos)" },
  { value: "expert", label: "Especialista (10+ anos)" }
];

export function FreelancerRegistrationForm({ onClose }: { onClose: () => void }) {
  const [skills, setSkills] = React.useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = React.useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<FreelancerFormData>({
    resolver: zodResolver(freelancerSchema),
    defaultValues: {
      skills: []
    }
  });

  const addSkill = () => {
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      const newSkills = [...skills, currentSkill.trim()];
      setSkills(newSkills);
      setValue("skills", newSkills);
      setCurrentSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const newSkills = skills.filter(skill => skill !== skillToRemove);
    setSkills(newSkills);
    setValue("skills", newSkills);
  };

  const onSubmit = async (data: FreelancerFormData) => {
    try {
      // Aqui seria a chamada para API
      console.log("Dados do freelancer:", data);
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      onClose();
    } catch (error) {
      console.error("Erro ao cadastrar freelancer:", error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="gradient-text">Cadastre-se como Freelancer</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Informações Pessoais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações Pessoais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Seu nome completo"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="seu@email.com"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="(11) 99999-9999"
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Informações Profissionais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações Profissionais</h3>
            <div className="space-y-2">
              <Label htmlFor="title">Título Profissional</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Ex: Desenvolvedor Full Stack, Designer UX/UI"
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select onValueChange={(value) => setValue("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-destructive">{errors.category.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="experience">Experiência</Label>
                <Select onValueChange={(value) => setValue("experience", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Nível de experiência" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.experience && (
                  <p className="text-sm text-destructive">{errors.experience.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Taxa Horária (R$)</Label>
              <Input
                id="hourlyRate"
                type="number"
                {...register("hourlyRate")}
                placeholder="150"
              />
              {errors.hourlyRate && (
                <p className="text-sm text-destructive">{errors.hourlyRate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição Profissional</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Descreva sua experiência, especialidades e o que você pode oferecer aos clientes..."
                className="min-h-[100px]"
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            {/* Habilidades */}
            <div className="space-y-2">
              <Label>Habilidades</Label>
              <div className="flex gap-2">
                <Input
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  placeholder="Ex: React, Photoshop, SEO..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <Button type="button" onClick={addSkill} size="icon" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              {errors.skills && (
                <p className="text-sm text-destructive">{errors.skills.message}</p>
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Cadastrando..." : "Cadastrar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}