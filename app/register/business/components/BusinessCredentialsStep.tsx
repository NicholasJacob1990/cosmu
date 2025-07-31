'use client';

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Award, Shield } from "lucide-react";

export function BusinessCredentialsStep({ data, onDataChange, entityType = 'pf' }: any) {
  const [stepData, setStepData] = useState({
    // Documentos profissionais
    diploma: data.diploma || null,
    mbaDocument: data.mbaDocument || null,
    certifications: data.certifications || null,
    
    // Registros profissionais
    crcDocument: data.crcDocument || null, // CRC para contadores
    oabDocument: data.oabDocument || null, // OAB para advogados
    creDocument: data.creDocument || null, // CRE para administradores
    
    // Experiência comprovada
    resumeDocument: data.resumeDocument || null,
    recommendationLetters: data.recommendationLetters || null,
    
    // Para PJ
    contractSamples: data.contractSamples || null,
    companyProfile: data.companyProfile || null,
    
    uploadStatus: data.uploadStatus || {}
  });

  useEffect(() => {
    onDataChange(stepData);
  }, [stepData, onDataChange]);

  const professionalDocuments = [
    {
      key: 'diploma',
      name: 'Diploma de Graduação',
      description: 'Diploma de ensino superior (frente e verso)',
      required: true,
      icon: Award,
      color: 'text-blue-500'
    },
    {
      key: 'mbaDocument',
      name: 'MBA/Pós-Graduação',
      description: 'Certificado de MBA ou pós-graduação',
      required: false,
      icon: Award,
      color: 'text-purple-500'
    },
    {
      key: 'certifications',
      name: 'Certificações Profissionais',
      description: 'PMP, CPA, ou outras certificações relevantes',
      required: false,
      icon: Shield,
      color: 'text-green-500'
    },
    {
      key: 'resumeDocument',
      name: 'Currículo Profissional',
      description: 'CV atualizado com experiências e conquistas',
      required: true,
      icon: FileText,
      color: 'text-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center p-6 border-2 border-dashed border-muted rounded-lg">
        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Credenciais Profissionais</h3>
        <p className="text-muted-foreground mb-4">
          Faça upload dos documentos para validar suas qualificações profissionais
        </p>
        <p className="text-sm text-muted-foreground">
          Formatos aceitos: PDF, JPG, PNG • Tamanho máximo: 5MB por arquivo
        </p>
      </div>

      {/* Documentos Profissionais */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold flex items-center gap-2">
          <Award className="h-5 w-5 text-blue-500" />
          Documentos Profissionais
        </h4>
        
        {professionalDocuments.map((doc) => {
          const Icon = doc.icon;
          return (
            <div key={doc.key} className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Icon className={`h-5 w-5 ${doc.color}`} />
                <div>
                  <h5 className="font-medium">{doc.name}</h5>
                  <p className="text-sm text-muted-foreground">{doc.description}</p>
                </div>
                {doc.required && <span className="text-red-500 text-sm">*</span>}
              </div>
              <div className="mt-3">
                <Label className="block w-full cursor-pointer">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center hover:border-muted-foreground/50 transition-colors">
                    <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Clique para fazer upload ou arraste o arquivo aqui
                    </span>
                  </div>
                  <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                </Label>
              </div>
            </div>
          );
        })}
      </div>

      {/* Instruções */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <h5 className="font-semibold text-green-900 mb-2">📋 Dicas Importantes:</h5>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• Diplomas e certificados: envie frente e verso</li>
          <li>• CV deve estar atualizado com últimas experiências</li>
          <li>• Certificações profissionais aumentam a credibilidade</li>
          <li>• Documentos em PDF são preferíveis para melhor qualidade</li>
        </ul>
      </div>
    </div>
  );
}