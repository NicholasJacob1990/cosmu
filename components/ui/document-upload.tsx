"use client";

import React, { useCallback, useRef, useState } from "react";
import type { DragEvent } from "react";
import { Button } from "./button";
import { Label } from "./label";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Progress } from "./progress";
import { cn } from "../../lib/utils";

export interface DocumentUploadFile {
  file: File;
  previewUrl?: string;
  progress?: number;
  error?: string | null;
}

export interface DocumentUploadProps {
  label?: string;
  description?: string;
  accept?: string;
  maxSizeMB?: number;
  multiple?: boolean;
  onFilesChange?: (files: File[]) => void;
  className?: string;
}

export function DocumentUpload({
  label = "Upload de Documentos",
  description,
  accept = ".pdf,.jpg,.jpeg,.png,.webp",
  maxSizeMB = 25,
  multiple = true,
  onFilesChange,
  className,
}: DocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<DocumentUploadFile[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const validateFile = (file: File): string | null => {
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return `Arquivo excede ${maxSizeMB}MB`;
    }
    if (accept) {
      const accepted = accept.split(",").map((s) => s.trim().toLowerCase());
      const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
      const mime = file.type.toLowerCase();
      const ok = accepted.some((a) => a === ext || a === mime);
      if (!ok) return "Formato não permitido";
    }
    return null;
  };

  const handleFiles = useCallback(
    (selected: FileList | null) => {
      if (!selected) return;
      const next: DocumentUploadFile[] = [];
      Array.from(selected).forEach((file) => {
        const error = validateFile(file);
        const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;
        next.push({ file, previewUrl, progress: 0, error });
      });
      setFiles(next);
      onFilesChange?.(next.filter((f) => !f.error).map((f) => f.file));
    },
    [onFilesChange]
  );

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const simulateUpload = async () => {
    // Simulação de progresso de upload
    for (let p = 10; p <= 100; p += 10) {
      await new Promise((r) => setTimeout(r, 120));
      setFiles((prev) => prev.map((f) => ({ ...f, progress: f.error ? 0 : p })));
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      <Card
        className={cn(
          "border-dashed cursor-pointer transition-colors",
          dragOver ? "border-primary bg-primary/5" : ""
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Arraste e solte arquivos aqui ou clique para selecionar</CardTitle>
        </CardHeader>
        <CardContent className="py-4">
          <input
            ref={inputRef}
            type="file"
            hidden
            accept={accept}
            multiple={multiple}
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className="grid gap-3">
            {files.length === 0 && (
              <p className="text-xs text-muted-foreground">Formatos permitidos: {accept} • Até {maxSizeMB}MB</p>
            )}

            {files.map((f, idx) => (
              <div key={idx} className={cn("p-3 rounded border", f.error ? "border-red-300 bg-red-50" : "border-border")}> 
                <div className="flex items-center gap-3">
                  {f.previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={f.previewUrl} alt={f.file.name} className="h-12 w-12 object-cover rounded" />
                  ) : (
                    <div className="h-12 w-12 rounded bg-muted flex items-center justify-center text-xs">
                      {f.file.type.split("/")[1] || "FILE"}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="text-sm font-medium truncate">{f.file.name}</div>
                    {f.error ? (
                      <div className="text-xs text-red-600">{f.error}</div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Progress value={f.progress || 0} className="h-1" />
                        <span className="text-xs text-muted-foreground">{f.progress || 0}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {files.length > 0 && (
            <div className="pt-3 flex gap-2">
              <Button type="button" size="sm" onClick={() => inputRef.current?.click()} variant="outline">
                Adicionar mais
              </Button>
              <Button type="button" size="sm" onClick={simulateUpload}>
                Enviar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default DocumentUpload;



