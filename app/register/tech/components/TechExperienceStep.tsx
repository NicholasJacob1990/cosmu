'use client';

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Award, Star, Github } from "lucide-react";

export function TechExperienceStep({ data, onDataChange, entityType = 'pf' }: any) {
  const [stepData, setStepData] = useState({
    // Projetos
    projects: data.projects || [{
      name: "",
      description: "",
      technologies: [],
      role: "",
      duration: "",
      url: ""
    }],
    
    // Certificações
    certifications: data.certifications || [],
    
    // Links profissionais
    github: data.github || "",
    linkedin: data.linkedin || "",
    portfolio: data.portfolio || "",
    
    // Educação
    education: data.education || "",
    courses: data.courses || []
  });

  useEffect(() => {
    onDataChange(stepData);
  }, [stepData, onDataChange]);

  const handleAddProject = () => {
    setStepData(prev => ({
      ...prev,
      projects: [...prev.projects, {
        name: "",
        description: "",
        technologies: [],
        role: "",
        duration: "",
        url: ""
      }]
    }));
  };

  const handleRemoveProject = (index: number) => {
    setStepData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Projetos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Projetos e Experiência
        </h3>

        {stepData.projects.map((project, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="font-medium">Projeto {index + 1}</h4>
              {stepData.projects.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveProject(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  Remover
                </Button>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Nome do Projeto *</Label>
                <Input
                  value={project.name}
                  onChange={(e) => {
                    const newProjects = [...stepData.projects];
                    newProjects[index].name = e.target.value;
                    setStepData(prev => ({ ...prev, projects: newProjects }));
                  }}
                  placeholder="Ex: E-commerce React"
                />
              </div>
              <div>
                <Label>Seu Papel *</Label>
                <Input
                  value={project.role}
                  onChange={(e) => {
                    const newProjects = [...stepData.projects];
                    newProjects[index].role = e.target.value;
                    setStepData(prev => ({ ...prev, projects: newProjects }));
                  }}
                  placeholder="Ex: Full Stack Developer"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Duração</Label>
                <Input
                  value={project.duration}
                  onChange={(e) => {
                    const newProjects = [...stepData.projects];
                    newProjects[index].duration = e.target.value;
                    setStepData(prev => ({ ...prev, projects: newProjects }));
                  }}
                  placeholder="Ex: 3 meses"
                />
              </div>
              <div>
                <Label>URL (GitHub, Demo, etc.)</Label>
                <Input
                  type="url"
                  value={project.url}
                  onChange={(e) => {
                    const newProjects = [...stepData.projects];
                    newProjects[index].url = e.target.value;
                    setStepData(prev => ({ ...prev, projects: newProjects }));
                  }}
                  placeholder="https://github.com/user/project"
                />
              </div>
            </div>

            <div>
              <Label>Descrição *</Label>
              <Textarea
                value={project.description}
                onChange={(e) => {
                  const newProjects = [...stepData.projects];
                  newProjects[index].description = e.target.value;
                  setStepData(prev => ({ ...prev, projects: newProjects }));
                }}
                placeholder="Descreva o projeto, desafios superados e resultados..."
                rows={3}
              />
            </div>

            <div>
              <Label>Tecnologias Utilizadas</Label>
              <Input
                value={project.technologies.join(", ")}
                onChange={(e) => {
                  const newProjects = [...stepData.projects];
                  newProjects[index].technologies = e.target.value.split(", ").filter(t => t.trim());
                  setStepData(prev => ({ ...prev, projects: newProjects }));
                }}
                placeholder="React, Node.js, MongoDB, AWS"
              />
              {project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {project.technologies.map((tech, techIndex) => (
                    <Badge key={techIndex} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={handleAddProject}
          className="w-full"
        >
          + Adicionar Projeto
        </Button>
      </div>

      {/* Links Profissionais */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Github className="h-5 w-5" />
          Links Profissionais
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="github">GitHub *</Label>
            <Input
              id="github"
              type="url"
              value={stepData.github}
              onChange={(e) => setStepData(prev => ({ ...prev, github: e.target.value }))}
              placeholder="https://github.com/seuusuario"
            />
          </div>
          <div>
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              type="url"
              value={stepData.linkedin}
              onChange={(e) => setStepData(prev => ({ ...prev, linkedin: e.target.value }))}
              placeholder="https://linkedin.com/in/seuperfil"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="portfolio">Portfolio/Website</Label>
            <Input
              id="portfolio"
              type="url"
              value={stepData.portfolio}
              onChange={(e) => setStepData(prev => ({ ...prev, portfolio: e.target.value }))}
              placeholder="https://seuportfolio.dev"
            />
          </div>
        </div>
      </div>

      {/* Educação e Certificações */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Award className="h-5 w-5" />
          Educação e Certificações
        </h3>

        <div>
          <Label htmlFor="education">Formação Acadêmica</Label>
          <Input
            id="education"
            value={stepData.education}
            onChange={(e) => setStepData(prev => ({ ...prev, education: e.target.value }))}
            placeholder="Ex: Bacharelado em Ciência da Computação - USP"
          />
        </div>

        <div>
          <Label htmlFor="certifications">Certificações</Label>
          <Textarea
            id="certifications"
            value={stepData.certifications.join('\n')}
            onChange={(e) => {
              const certs = e.target.value.split('\n').filter(c => c.trim());
              setStepData(prev => ({ ...prev, certifications: certs }));
            }}
            placeholder="Liste suas certificações, uma por linha&#10;Ex: AWS Certified Developer&#10;Microsoft Azure Fundamentals"
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="courses">Cursos Complementares</Label>
          <Textarea
            id="courses"
            value={stepData.courses.join('\n')}
            onChange={(e) => {
              const courses = e.target.value.split('\n').filter(c => c.trim());
              setStepData(prev => ({ ...prev, courses: courses }));
            }}
            placeholder="Liste cursos relevantes, um por linha&#10;Ex: React Avançado - Rocketseat&#10;Node.js Master Class - Udemy"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}