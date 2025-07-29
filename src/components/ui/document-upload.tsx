import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, CheckCircle, AlertTriangle, X, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentUploadProps {
  documentKey: string;
  name: string;
  description: string;
  required?: boolean;
  icon?: React.ComponentType<any>;
  color?: string;
  maxSize?: number; // em MB
  acceptedFormats?: string[];
  value?: File | null;
  uploadStatus?: 'idle' | 'uploading' | 'uploaded' | 'error';
  onUpload?: (file: File) => void;
  onRemove?: () => void;
  disabled?: boolean;
}

export function DocumentUpload({
  documentKey,
  name,
  description,
  required = false,
  icon: IconComponent = FileText,
  color = 'text-blue-500',
  maxSize = 5,
  acceptedFormats = ['pdf', 'jpg', 'jpeg', 'png'],
  value,
  uploadStatus = 'idle',
  onUpload,
  onRemove,
  disabled = false
}: DocumentUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Verificar tamanho
    if (file.size > maxSize * 1024 * 1024) {
      return `Arquivo muito grande. Tamanho máximo: ${maxSize}MB`;
    }

    // Verificar formato
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !acceptedFormats.includes(fileExtension)) {
      return `Formato não aceito. Formatos aceitos: ${acceptedFormats.join(', ').toUpperCase()}`;
    }

    return null;
  };

  const handleFileSelect = (file: File) => {
    setError(null);
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Simular progresso de upload
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          onUpload?.(file);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const getStatusBadge = () => {
    switch (uploadStatus) {
      case 'uploaded':
        return <Badge className="bg-green-100 text-green-700 border-green-300">Enviado ✓</Badge>;
      case 'uploading':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-300">Enviando...</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-700 border-red-300">Erro</Badge>;
      default:
        return required 
          ? <Badge variant="outline" className="text-red-600 border-red-300">Obrigatório</Badge>
          : <Badge variant="outline">Opcional</Badge>;
    }
  };

  const openFile = () => {
    if (value) {
      // Criar URL temporária para visualização
      const url = URL.createObjectURL(value);
      window.open(url, '_blank');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center gap-3">
          <IconComponent className={cn('h-5 w-5', color)} />
          <div className="flex-1">
            <p className="font-medium">{name}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
            {value && (
              <p className="text-xs text-muted-foreground mt-1">
                {value.name} ({formatFileSize(value.size)})
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {getStatusBadge()}
          
          {value && uploadStatus === 'uploaded' ? (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={openFile}>
                <Eye className="h-4 w-4 mr-2" />
                Ver
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRemove}
                disabled={disabled}
              >
                <X className="h-4 w-4 mr-2" />
                Remover
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || uploadStatus === 'uploading'}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          )}
        </div>
      </div>

      {/* Área de drag and drop */}
      {!value && uploadStatus !== 'uploaded' && (
        <div
          className={cn(
            "border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center transition-colors",
            dragOver && "border-primary bg-primary/5",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <Upload className={cn(
            "h-8 w-8 mx-auto mb-2 text-muted-foreground",
            dragOver && "text-primary"
          )} />
          <p className="text-sm text-muted-foreground">
            Arraste o arquivo aqui ou clique para selecionar
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {acceptedFormats.join(', ').toUpperCase()} • Máx {maxSize}MB
          </p>
        </div>
      )}

      {/* Progress bar durante upload */}
      {uploadStatus === 'uploading' && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Enviando...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {/* Mensagem de erro */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Input file oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.map(format => `.${format}`).join(',')}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}