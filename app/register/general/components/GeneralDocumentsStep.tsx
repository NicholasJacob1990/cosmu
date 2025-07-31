'use client';

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload, Check, AlertCircle } from "lucide-react";

export function GeneralDocumentsStep({ data, onDataChange, entityType = 'pf' }: any) {
  const [stepData, setStepData] = useState({
    identityDocument: data.identityDocument || null,
    proofOfAddress: data.proofOfAddress || null,
    professionalLicense: data.professionalLicense || null,
    insurance: data.insurance || null,
    criminalRecord: data.criminalRecord || null,
    references: data.references || []
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onDataChange(stepData);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [stepData]);

  const handleFileUpload = (field: string, file: File | null) => {
    setStepData(prev => ({ ...prev, [field]: file }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 galaxia-text-gradient">
          <FileText className="h-5 w-5 text-primary" />
          3.1 Documentos Obrigatórios
        </h3>
        
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Documento de Identidade */}
              <div>
                <Label className="text-base font-medium">Documento de Identidade *</Label>
                <p className="text-sm text-muted-foreground mb-2">RG, CNH ou passaporte</p>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Clique para enviar ou arraste o arquivo aqui
                  </p>
                  <Button variant="outline" size="sm">
                    Selecionar Arquivo
                  </Button>
                </div>
              </div>

              {/* Comprovante de Endereço */}
              <div>
                <Label className="text-base font-medium">Comprovante de Endereço *</Label>
                <p className="text-sm text-muted-foreground mb-2">Conta de luz, água ou telefone (últimos 3 meses)</p>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Clique para enviar ou arraste o arquivo aqui
                  </p>
                  <Button variant="outline" size="sm">
                    Selecionar Arquivo
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 galaxia-text-gradient">
          <FileText className="h-5 w-5 text-primary" />
          3.2 Documentos Complementares (Opcionais)
        </h3>
        
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Licença Profissional */}
              <div>
                <Label className="text-base font-medium">Licença/Certificação Profissional</Label>
                <p className="text-sm text-muted-foreground mb-2">Se aplicável à sua profissão</p>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Clique para enviar ou arraste o arquivo aqui
                  </p>
                  <Button variant="outline" size="sm">
                    Selecionar Arquivo
                  </Button>
                </div>
              </div>

              {/* Seguro */}
              <div>
                <Label className="text-base font-medium">Seguro de Responsabilidade Civil</Label>
                <p className="text-sm text-muted-foreground mb-2">Recomendado para alguns tipos de serviço</p>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Clique para enviar ou arraste o arquivo aqui
                  </p>
                  <Button variant="outline" size="sm">
                    Selecionar Arquivo
                  </Button>
                </div>
              </div>

              {/* Antecedentes Criminais */}
              <div>
                <Label className="text-base font-medium">Certidão de Antecedentes Criminais</Label>
                <p className="text-sm text-muted-foreground mb-2">Aumenta a confiança dos clientes</p>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Clique para enviar ou arraste o arquivo aqui
                  </p>
                  <Button variant="outline" size="sm">
                    Selecionar Arquivo
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Verificação de Documentos</h4>
            <p className="text-sm text-blue-700 mt-1">
              Todos os documentos passarão por verificação. Documentos válidos aumentam sua credibilidade 
              e chances de conseguir trabalhos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}