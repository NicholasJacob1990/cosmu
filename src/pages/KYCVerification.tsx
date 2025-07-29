import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Footer } from "@/components/Footer";
import {
  Upload,
  FileText,
  Camera,
  MapPin,
  Award,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  Trash2,
  Download
} from "lucide-react";
import { documentsApi } from "@/lib/api";
import { toast } from "sonner";

const DOCUMENT_TYPES = {
  identity: {
    label: "Documento de Identidade",
    description: "RG, CNH ou Carteira de Trabalho",
    icon: FileText,
    required: true
  },
  address_proof: {
    label: "Comprovante de Endereço",
    description: "Conta de luz, água ou telefone (últimos 3 meses)",
    icon: MapPin,
    required: true
  },
  selfie: {
    label: "Selfie com Documento",
    description: "Foto sua segurando o documento de identidade",
    icon: Camera,
    required: true
  },
  certificate: {
    label: "Certificados",
    description: "Diplomas, certificações profissionais (opcional)",
    icon: Award,
    required: false
  },
  business_license: {
    label: "Licença Comercial",
    description: "CNPJ, MEI ou outros registros empresariais",
    icon: FileText,
    required: false
  }
};

export function KYCVerification() {
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File[] }>({});
  const [activeTab, setActiveTab] = useState("status");
  const queryClient = useQueryClient();

  // Fetch KYC status
  const { data: kycStatus, isLoading } = useQuery({
    queryKey: ['kyc-status'],
    queryFn: () => documentsApi.getKycStatus(),
  });

  // Fetch documents
  const { data: documents } = useQuery({
    queryKey: ['my-documents'],
    queryFn: () => documentsApi.getMyDocuments(),
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: ({ type, files, description }: { type: string; files: FileList; description?: string }) => {
      const formData = new FormData();
      formData.append('type', type);
      if (description) formData.append('description', description);
      
      // Upload first file for now (can be extended for multiple files)
      if (files.length > 0) {
        formData.append('document', files[0]);
      }
      
      return documentsApi.upload(formData);
    },
    onSuccess: () => {
      toast.success('Documento enviado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['kyc-status'] });
      queryClient.invalidateQueries({ queryKey: ['my-documents'] });
      setSelectedFiles({});
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao enviar documento');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (documentId: string) => documentsApi.deleteDocument(documentId),
    onSuccess: () => {
      toast.success('Documento removido com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['kyc-status'] });
      queryClient.invalidateQueries({ queryKey: ['my-documents'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao remover documento');
    },
  });

  const handleFileSelect = (type: string, files: FileList | null) => {
    if (files && files.length > 0) {
      setSelectedFiles(prev => ({
        ...prev,
        [type]: Array.from(files)
      }));
    }
  };

  const handleUpload = (type: string) => {
    const files = selectedFiles[type];
    if (!files || files.length === 0) {
      toast.error('Selecione um arquivo primeiro');
      return;
    }

    const fileList = new DataTransfer();
    files.forEach(file => fileList.items.add(file));

    uploadMutation.mutate({
      type,
      files: fileList.files
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando status de verificação...</p>
        </div>
      </div>
    );
  }

  const kycData = kycStatus?.data?.kycStatus;
  const myDocuments = documents?.data?.documents || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Verificação KYC</h1>
              <p className="text-muted-foreground">
                Complete sua verificação para aumentar sua credibilidade
              </p>
            </div>
            <Badge 
              className={`px-3 py-1 ${
                kycData?.isFullyVerified 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900' 
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900'
              }`}
            >
              {kycData?.isFullyVerified ? 'Totalmente Verificado' : 'Verificação Pendente'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="status">Status da Verificação</TabsTrigger>
            <TabsTrigger value="upload">Enviar Documentos</TabsTrigger>
            <TabsTrigger value="documents">Meus Documentos</TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="space-y-6 mt-6">
            {/* Verification Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Progresso da Verificação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Nível de Verificação</span>
                    <Badge variant="secondary">
                      Nível {kycData?.verificationLevel || 0}
                    </Badge>
                  </div>
                  
                  <Progress 
                    value={(kycData?.verificationLevel || 0) * 50} 
                    className="h-3"
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-4 rounded-lg border">
                      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mx-auto mb-2">
                        <FileText className="h-6 w-6 text-blue-500" />
                      </div>
                      <p className="font-medium">Nível 0</p>
                      <p className="text-sm text-muted-foreground">Conta Básica</p>
                    </div>
                    
                    <div className="text-center p-4 rounded-lg border">
                      <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center mx-auto mb-2">
                        <CheckCircle className="h-6 w-6 text-yellow-500" />
                      </div>
                      <p className="font-medium">Nível 1</p>
                      <p className="text-sm text-muted-foreground">Identidade Verificada</p>
                    </div>
                    
                    <div className="text-center p-4 rounded-lg border">
                      <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-2">
                        <Award className="h-6 w-6 text-green-500" />
                      </div>
                      <p className="font-medium">Nível 2</p>
                      <p className="text-sm text-muted-foreground">KYC Completo</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requirements Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status dos Requisitos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Completed Requirements */}
                  {kycData?.completedRequirements?.map((req: string) => (
                    <div key={req} className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div className="flex-1">
                        <p className="font-medium">
                          {DOCUMENT_TYPES[req as keyof typeof DOCUMENT_TYPES]?.label || req}
                        </p>
                        <p className="text-sm text-muted-foreground">Verificado com sucesso</p>
                      </div>
                    </div>
                  ))}

                  {/* Pending Requirements */}
                  {kycData?.pendingRequirements?.map((req: string) => (
                    <div key={req} className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                      <Clock className="h-5 w-5 text-yellow-500" />
                      <div className="flex-1">
                        <p className="font-medium">
                          {DOCUMENT_TYPES[req as keyof typeof DOCUMENT_TYPES]?.label || req}
                        </p>
                        <p className="text-sm text-muted-foreground">Aguardando verificação</p>
                      </div>
                    </div>
                  ))}

                  {/* Missing Requirements */}
                  {kycData?.missingRequirements?.map((req: string) => (
                    <div key={req} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-950 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="font-medium">
                          {DOCUMENT_TYPES[req as keyof typeof DOCUMENT_TYPES]?.label || req}
                        </p>
                        <p className="text-sm text-muted-foreground">Documento necessário</p>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => setActiveTab('upload')}
                      >
                        Enviar
                      </Button>
                    </div>
                  ))}

                  {/* Rejected Documents */}
                  {kycData?.rejectedDocuments?.map((doc: any) => (
                    <div key={doc.type} className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                      <XCircle className="h-5 w-5 text-red-500" />
                      <div className="flex-1">
                        <p className="font-medium">
                          {DOCUMENT_TYPES[doc.type as keyof typeof DOCUMENT_TYPES]?.label || doc.type}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Rejeitado: {doc.reason}
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setActiveTab('upload')}
                      >
                        Reenviar
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>Benefícios da Verificação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Maior Credibilidade</p>
                      <p className="text-sm text-muted-foreground">
                        Clientes confiam mais em freelancers verificados
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Mais Oportunidades</p>
                      <p className="text-sm text-muted-foreground">
                        Acesso a projetos premium e de maior valor
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Selo de Verificação</p>
                      <p className="text-sm text-muted-foreground">
                        Badge especial no seu perfil
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Suporte Prioritário</p>
                      <p className="text-sm text-muted-foreground">
                        Atendimento diferenciado para usuários verificados
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload" className="space-y-6 mt-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Certifique-se de que todos os documentos estejam legíveis e válidos. 
                Arquivos aceitos: JPG, PNG, PDF (máximo 10MB cada).
              </AlertDescription>
            </Alert>

            <div className="grid gap-6">
              {Object.entries(DOCUMENT_TYPES).map(([type, config]) => {
                const Icon = config.icon;
                const hasSelectedFile = selectedFiles[type]?.length > 0;
                const isUploading = uploadMutation.isPending;

                return (
                  <Card key={type}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Icon className="h-5 w-5" />
                        {config.label}
                        {config.required && (
                          <Badge variant="destructive" className="text-xs">
                            Obrigatório
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {config.description}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6">
                          <div className="text-center">
                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <div className="mb-4">
                              <label htmlFor={`file-${type}`} className="cursor-pointer">
                                <span className="text-primary hover:text-primary/80">
                                  Clique para selecionar
                                </span>
                                <span className="text-muted-foreground"> ou arraste o arquivo aqui</span>
                              </label>
                              <input
                                id={`file-${type}`}
                                type="file"
                                className="hidden"
                                accept=".jpg,.jpeg,.png,.pdf"
                                onChange={(e) => handleFileSelect(type, e.target.files)}
                              />
                            </div>
                            
                            {hasSelectedFile && (
                              <div className="text-sm">
                                <p className="font-medium text-green-600">
                                  {selectedFiles[type][0].name}
                                </p>
                                <p className="text-muted-foreground">
                                  {(selectedFiles[type][0].size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <Button
                          onClick={() => handleUpload(type)}
                          disabled={!hasSelectedFile || isUploading}
                          className="w-full"
                        >
                          {isUploading ? 'Enviando...' : 'Enviar Documento'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Documentos Enviados</CardTitle>
              </CardHeader>
              <CardContent>
                {myDocuments.length > 0 ? (
                  <div className="space-y-4">
                    {myDocuments.map((doc: any) => {
                      const docType = DOCUMENT_TYPES[doc.type as keyof typeof DOCUMENT_TYPES];
                      const Icon = docType?.icon || FileText;

                      return (
                        <div key={doc.id} className="flex items-center gap-4 p-4 border rounded-lg">
                          <Icon className="h-8 w-8 text-muted-foreground" />
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{docType?.label || doc.type}</h4>
                              {getStatusIcon(doc.status)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              {doc.fileName}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(doc.status)}>
                                {doc.status === 'verified' ? 'Verificado' :
                                 doc.status === 'pending' ? 'Pendente' :
                                 doc.status === 'rejected' ? 'Rejeitado' : doc.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Enviado em {new Date(doc.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            
                            {doc.status === 'rejected' && doc.rejectionReason && (
                              <Alert className="mt-2">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription className="text-sm">
                                  Motivo da rejeição: {doc.rejectionReason}
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(doc.fileUrl, '_blank')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            
                            {doc.status !== 'verified' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteMutation.mutate(doc.id)}
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Nenhum documento enviado ainda
                    </p>
                    <Button 
                      className="mt-4"
                      onClick={() => setActiveTab('upload')}
                    >
                      Enviar Primeiro Documento
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}