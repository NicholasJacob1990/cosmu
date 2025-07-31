'use client';

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Award, FileText, Building2 } from "lucide-react";

export function HealthProfessionalStep({ data, onDataChange, entityType = 'pf' }: any) {
  const [stepData, setStepData] = useState({
    profession: data.profession || "",
    council: data.council || "",
    councilNumber: data.councilNumber || "",
    councilState: data.councilState || "",
    councilStatus: data.councilStatus || "",
    rqe: data.rqe || "",
    specialty: data.specialty || "",
    subSpecialties: data.subSpecialties || [],
    university: data.university || "",
    graduationYear: data.graduationYear || "",
    diplomaNumber: data.diplomaNumber || "",
    residency: data.residency || "",
    residencyYear: data.residencyYear || "",
    cnrm: data.cnrm || "",
    postGraduation: data.postGraduation || [],
    certifications: data.certifications || [],
    establishmentType: data.establishmentType || "",
    cnpj: data.cnpj || "",
    companyName: data.companyName || "",
    fantasyName: data.fantasyName || "",
    cnesNumber: data.cnesNumber || "",
    technicalDirector: data.technicalDirector || "",
    technicalDirectorRegistry: data.technicalDirectorRegistry || ""
  });

  useEffect(() => {
    onDataChange(stepData);
  }, [stepData, onDataChange]);

  const professions = [
    { value: "medico", label: "Médico", council: "CRM" },
    { value: "dentista", label: "Dentista", council: "CRO" },
    { value: "psicologo", label: "Psicólogo", council: "CRP" },
    { value: "fisioterapeuta", label: "Fisioterapeuta", council: "CREFITO" },
    { value: "nutricionista", label: "Nutricionista", council: "CRN" },
    { value: "enfermeiro", label: "Enfermeiro", council: "COREN" }
  ];

  return (
    <div className="space-y-6">
      {/* Dados Profissionais Básicos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Conselho de Classe
        </h3>

        <div>
          <Label htmlFor="profession">Profissão *</Label>
          <Select
            value={stepData.profession}
            onValueChange={(value) => {
              const prof = professions.find(p => p.value === value);
              setStepData(prev => ({
                ...prev,
                profession: value,
                council: prof?.council || ""
              }));
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione sua profissão" />
            </SelectTrigger>
            <SelectContent>
              {professions.map((prof) => (
                <SelectItem key={prof.value} value={prof.value}>
                  {prof.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="council">Conselho</Label>
            <Input
              id="council"
              value={stepData.council}
              onChange={(e) => setStepData(prev => ({ ...prev, council: e.target.value }))}
              placeholder="Ex: CRM"
              disabled
            />
          </div>
          <div>
            <Label htmlFor="councilNumber">Número do Registro *</Label>
            <Input
              id="councilNumber"
              value={stepData.councilNumber}
              onChange={(e) => setStepData(prev => ({ ...prev, councilNumber: e.target.value }))}
              placeholder="123456"
            />
          </div>
          <div>
            <Label htmlFor="councilState">Estado *</Label>
            <Select
              value={stepData.councilState}
              onValueChange={(value) => setStepData(prev => ({ ...prev, councilState: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                 {/* Adicione os estados aqui */}
                 <SelectItem value="SP">SP</SelectItem>
                 <SelectItem value="RJ">RJ</SelectItem>
                 {/* ... outros estados */}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="councilStatus">Situação *</Label>
            <Select
              value={stepData.councilStatus}
              onValueChange={(value) => setStepData(prev => ({ ...prev, councilStatus: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Situação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="provisorio">Provisório</SelectItem>
                <SelectItem value="transferencia">Transferência</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
