import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export function UploadZone({ onFileSelect, isLoading }: UploadZoneProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);
      const file = acceptedFiles[0];
      
      if (!file) return;
      
      if (!file.type.includes('pdf')) {
        setError('Please upload a PDF file');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: isLoading,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors',
        isDragActive
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50 hover:bg-muted/50',
        isLoading && 'opacity-50 cursor-not-allowed'
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        {isDragActive ? (
          <FileText className="h-12 w-12 text-primary" />
        ) : (
          <Upload className="h-12 w-12 text-muted-foreground" />
        )}
        <div>
          <p className="text-lg font-medium">
            {isDragActive ? 'Drop your PDF here' : 'Drag & drop a PDF file'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            or click to browse (max 10MB)
          </p>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {isLoading && <p className="text-sm text-muted-foreground">Processing...</p>}
      </div>
    </div>
  );
}
