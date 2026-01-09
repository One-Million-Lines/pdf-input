import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { pdfjs } from 'react-pdf';
import { FileText, Plus } from 'lucide-react';
import { UploadZone } from '@/components/dashboard/UploadZone';
import { TemplateCard } from '@/components/dashboard/TemplateCard';
import { useTemplates, useCreateTemplate, useDeleteTemplate } from '@/hooks/useTemplates';
import { toast } from 'sonner';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: templates, isLoading } = useTemplates();
  const createTemplate = useCreateTemplate();
  const deleteTemplate = useDeleteTemplate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = useCallback(async (file: File) => {
    setIsProcessing(true);
    try {
      // Load PDF to get page dimensions
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const pagesMeta: { width: number; height: number }[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1 });
        pagesMeta.push({ width: viewport.width, height: viewport.height });
      }

      const template = await createTemplate.mutateAsync({ file, pagesMeta });
      toast.success('Template created!');
      navigate(`/edit/${template.templateId}`);
    } catch (error) {
      console.error('Failed to create template:', error);
      toast.error('Failed to process PDF');
    } finally {
      setIsProcessing(false);
    }
  }, [createTemplate, navigate]);

  const handleDelete = useCallback((templateId: string) => {
    deleteTemplate.mutate(templateId, {
      onSuccess: () => toast.success('Template deleted'),
      onError: () => toast.error('Failed to delete template'),
    });
  }, [deleteTemplate]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">FillLink</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Create a new template</h2>
            <p className="text-muted-foreground mb-4">
              Upload a PDF to get started. You'll be able to add fillable fields.
            </p>
            <UploadZone onFileSelect={handleFileSelect} isLoading={isProcessing} />
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Your templates</h2>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : templates && templates.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {templates.map((template) => (
                  <TemplateCard
                    key={template.templateId}
                    template={template}
                    onDelete={handleDelete}
                    isDeleting={deleteTemplate.isPending}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">
                  No templates yet. Upload a PDF to create your first template.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
