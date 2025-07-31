'use client';

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Camera, Shield, Award, MapPin } from "lucide-react";

export function HealthDocumentsStep({ data, onDataChange, entityType = 'pf', flowType = 'health' }: any) {
  const [stepData, setStepData] = useState({
    // Documentos de Identidade
    rgDocument: data.rgDocument || null,
    cpfDocument: data.cpfDocument || null,
    titleDocument: data.titleDocument || null,
    reservistDocument: data.reservistDocument || null,
    // Foto para Carteira e Perfil
    photo3x4: data.photo3x4 || null,
    selfieKyc: data.selfieKyc || null,
    // Documentos Profissionais
    diploma: data.diploma || null,
    historico: data.historico || null,
    councilCard: data.councilCard || null,
    cnrmCertificate: data.cnrmCertificate || null,
    ambCertificate: data.ambCertificate || null,
    rqeCertificate: data.rqeCertificate || null,
    // Comprovante de residência
    residenceProof: data.residenceProof || null,
    // Documentos de Estabelecimento (se PJ)
    cnpjDocument: data.cnpjDocument || null,
    sanitaryLicense: data.sanitaryLicense || null,
    operatingPermit: data.operatingPermit || null,
    cnesDocument: data.cnesDocument || null,
    // Status dos uploads
    uploadStatus: data.uploadStatus || {}
  });

  useEffect(() => {
    onDataChange(stepData);
  }, [stepData, onDataChange]);

  const requiredDocuments = [
    {
      key: 'photo3x4',
      name: 'Fotos 3x4',
      description: 'Fotos recentes, fundo branco, sem óculos, sem retoques',
      required: true,
      icon: Camera,
      color: 'text-blue-500'
    },
    {
      key: 'rgDocument',
      name: 'RG ou CNH',
      description: 'Documento de identidade (cópia legível)',
      required: true,
      icon: FileText,
      color: 'text-blue-500'
    },
    {
      key: 'diploma',
      name: 'Diploma de Graduação',
      description: 'Diploma ou certidão de colação de grau (frente e verso)',
      required: true,
      icon: Award,
      color: 'text-purple-500'
    },
    {
      key: 'councilCard',
      name: 'Carteira do Conselho',
      description: 'Cédula de identidade profissional (CRM, CRO, CRP, etc)',
      required: true,
      icon: Shield,
      color: 'text-green-500'
    },
    {
      key: 'residenceProof',
      name: 'Comprovante de Residência',
      description: 'Conta de água, luz, gás ou telefone recente com CEP visível',
      required: true,
      icon: MapPin,
      color: 'text-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center p-6 border-2 border-dashed border-muted rounded-lg">
        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Documentos Comprobatórios</h3>
        <p className="text-muted-foreground mb-4">
          Faça upload dos documentos necessários para validação do seu cadastro profissional
        </p>
        <p className="text-sm text-muted-foreground">
          Formatos aceitos: PDF, JPG, PNG • Tamanho máximo: 5MB por arquivo
        </p>
      </div>

      {/* Documentos Obrigatórios */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5 text-red-500" />
          Documentos Obrigatórios
        </h4>
        
        {requiredDocuments.map((doc) => {
          const Icon = doc.icon;
          return (
            <div key={doc.key} className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Icon className={`h-5 w-5 ${doc.color}`} />
                <div>
                  <h5 className="font-medium">{doc.name}</h5>
                  <p className="text-sm text-muted-foreground">{doc.description}</p>
                </div>
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

      {/* Instruções Importantes */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h5 className="font-semibold text-blue-900 mb-2">📋 Instruções Importantes:</h5>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Documentos devem estar legíveis e com boa qualidade</li>
          <li>• Para diplomas: envie frente e verso</li>
          <li>• Fotos 3x4: fundo branco, sem óculos, cabeça ereta</li>
          <li>• Comprovante de residência deve ter CEP visível e ser recente</li>
          <li>• Documentos em PDF são preferíveis para melhor qualidade</li>
        </ul>
      </div>
    </div>
  );
}