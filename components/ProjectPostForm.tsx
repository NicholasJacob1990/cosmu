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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { X, Plus, Calendar, DollarSign, Clock } from "lucide-react";

const projectSchema = z.object({
  title: z.string().min(10, "Título deve ter pelo menos 10 caracteres"),
  description: z.string().min(100, "Descrição deve ter pelo menos 100 caracteres"),
  category: z.string().min(1, "Selecione uma categoria"),
  budget: z.string().min(1, "Defina um orçamento"),
  budgetType: z.enum(["fixed", "hourly", "negotiable"]),
  deadline: z.string().min(1, "Defina um prazo"),
  complexity: z.string().min(1, "Selecione a complexidade"),
  requiredSkills: z.array(z.string()).min(1, "Adicione pelo menos 1 habilidade necessária"),
  requirements: z.string().min(50, "Descreva os requisitos com pelo menos 50 caracteres"),
});

type ProjectFormData = z.infer<typeof projectSchema>;

const categories = [
  "Desenvolvimento Web",
  "Desenvolvimento Mobile",
  "Design Gráfico",
  "UI/UX Design",
  "Marketing Digital",
  "SEO",
  "Redação e Conteúdo",
  "Tradução",
  "Consultoria Empresarial",
  "Arquitetura",
  "Engenharia",
  "Consultoria Médica",
  "Educação e Treinamento",
  "Jurídico",
  "Contabilidade",
  "Outros"
];

const complexityLevels = [
  { value: "simple", label: "Simples", description: "Tarefas diretas e bem definidas" },
  { value: "moderate", label: "Moderado", description: "Requer alguma especialização" },
  { value: "complex", label: "Complexo", description: "Projeto avançado com múltiplas etapas" },
  { value: "expert", label: "Especialista", description: "Requer conhecimento muito específico" }
];

export function ProjectPostForm({ onClose }: { onClose: () => void }) {
  const [skills, setSkills] = React.useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = React.useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      requiredSkills: [],
      budgetType: "fixed"
    }
  });

  const budgetType = watch("budgetType");

  const addSkill = () => {
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      const newSkills = [...skills, currentSkill.trim()];
      setSkills(newSkills);
      setValue("requiredSkills", newSkills);
      setCurrentSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const newSkills = skills.filter(skill => skill !== skillToRemove);
    setSkills(newSkills);
    setValue("requiredSkills", newSkills);
  };

  const onSubmit = async (data: ProjectFormData) => {
    try {
      // Aqui seria a chamada para API
      console.log("Dados do projeto:", data);
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      onClose();
    } catch (error) {
      console.error("Erro ao postar projeto:", error);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="gradient-text">Postar Novo Projeto</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações do Projeto</h3>
            
            <div className="space-y-2">
              <Label htmlFor="title">Título do Projeto</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Ex: Criar site institucional para consultório médico"
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
                <Label htmlFor="complexity">Complexidade</Label>
                <Select onValueChange={(value) => setValue("complexity", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Nível de complexidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {complexityLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        <div>
                          <div className="font-medium">{level.label}</div>
                          <div className="text-sm text-muted-foreground">{level.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.complexity && (
                  <p className="text-sm text-destructive">{errors.complexity.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição Detalhada</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Descreva seu projeto em detalhes: objetivos, funcionalidades desejadas, estilo, referências..."
                className="min-h-[120px]"
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Orçamento e Prazo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Orçamento e Prazo
            </h3>
            
            <div className="space-y-3">
              <Label>Tipo de Orçamento</Label>
              <RadioGroup
                value={budgetType}
                onValueChange={(value) => setValue("budgetType", value as "fixed" | "hourly" | "negotiable")}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fixed" id="fixed" />
                  <Label htmlFor="fixed" className="flex items-center gap-2 cursor-pointer">
                    <DollarSign className="h-4 w-4" />
                    Preço Fixo
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hourly" id="hourly" />
                  <Label htmlFor="hourly" className="flex items-center gap-2 cursor-pointer">
                    <Clock className="h-4 w-4" />
                    Por Hora
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="negotiable" id="negotiable" />
                  <Label htmlFor="negotiable" className="cursor-pointer">
                    Negociável
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget">
                  {budgetType === "hourly" ? "Taxa por Hora (R$)" : "Orçamento (R$)"}
                </Label>
                <Input
                  id="budget"
                  {...register("budget")}
                  placeholder={budgetType === "hourly" ? "150" : "5000"}
                  disabled={budgetType === "negotiable"}
                />
                {errors.budget && (
                  <p className="text-sm text-destructive">{errors.budget.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Prazo para Entrega</Label>
                <Input
                  id="deadline"
                  {...register("deadline")}
                  placeholder="Ex: 30 dias, 2 semanas"
                />
                {errors.deadline && (
                  <p className="text-sm text-destructive">{errors.deadline.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Habilidades e Requisitos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Habilidades e Requisitos</h3>
            
            <div className="space-y-2">
              <Label>Habilidades Necessárias</Label>
              <div className="flex gap-2">
                <Input
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  placeholder="Ex: React, Photoshop, WordPress..."
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
              {errors.requiredSkills && (
                <p className="text-sm text-destructive">{errors.requiredSkills.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requisitos Específicos</Label>
              <Textarea
                id="requirements"
                {...register("requirements")}
                placeholder="Liste requisitos específicos: experiência mínima, portfolio, certificações, metodologias..."
                className="min-h-[80px]"
              />
              {errors.requirements && (
                <p className="text-sm text-destructive">{errors.requirements.message}</p>
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Publicando..." : "Publicar Projeto"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}