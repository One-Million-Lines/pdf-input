import React, { useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Download, RotateCcw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PDFViewer, ZoomControls } from '@/components/editor/PDFViewer';
import { FieldOverlay } from '@/components/editor/FieldOverlay';
import { useTemplateByShareId, useTemplatePDF } from '@/hooks/useTemplates';
import { generateFilledPDF, downloadPDF } from '@/lib/pdf-utils';
import { toast } from 'sonner';
import type { TemplateField, FilledValues } from '@/types/template';

export default function FillPage() {
  const { shareId } = useParams<{ shareId: string }>();
  const { data: template, isLoading: isLoadingTemplate } = useTemplateByShareId(shareId);
  const { data: pdfData, isLoading: isLoadingPDF } = useTemplatePDF(template?.templateId);

  const [values, setValues] = useState<FilledValues>({});
  const [zoom, setZoom] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize values with defaults when template loads
  React.useEffect(() => {
    if (template) {
      const defaultValues: FilledValues = {};
      template.fields.forEach((field) => {
        if (field.defaultValue) {
          defaultValues[field.id] = field.defaultValue;
        }
      });
      setValues(defaultValues);
    }
  }, [template]);

  const handleValueChange = useCallback((fieldId: string, value: string) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
  }, []);

  const handleReset = useCallback(() => {
    if (!template) return;
    const defaultValues: FilledValues = {};
    template.fields.forEach((field) => {
      if (field.defaultValue) {
        defaultValues[field.id] = field.defaultValue;
      }
    });
    setValues(defaultValues);
    toast.success('Form reset');
  }, [template]);

  const missingRequired = useMemo(() => {
    if (!template) return [];
    return template.fields.filter((f) => f.required && !values[f.id]?.trim());
  }, [template, values]);

  const handleDownload = useCallback(async () => {
    if (!template || !pdfData) return;

    if (missingRequired.length > 0) {
      toast.error(`Please fill in all required fields (${missingRequired.length} missing)`);
      return;
    }

    setIsGenerating(true);
    try {
      const filledPdfData = await generateFilledPDF(pdfData, template, values);
      const filename = template.originalFileName.replace(/\.pdf$/i, '') + '-filled.pdf';
      downloadPDF(filledPdfData, filename);
      toast.success('PDF downloaded!');
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  }, [template, pdfData, values, missingRequired]);

  const renderFieldOverlay = useCallback(
    (field: TemplateField, pageIndex: number, pageWidth: number, pageHeight: number) => (
      <FieldOverlay
        field={field}
        pageWidth={pageWidth}
        pageHeight={pageHeight}
        isSelected={false}
        onSelect={() => {}}
        onUpdate={() => {}}
        mode="fill"
        value={values[field.id] || ''}
        onChange={(value) => handleValueChange(field.id, value)}
      />
    ),
    [values, handleValueChange]
  );

  if (isLoadingTemplate) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading form...</p>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <p className="text-lg">Form not found</p>
        <p className="text-sm text-muted-foreground">This link may be invalid or the form was deleted.</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            <div>
              <h1 className="font-semibold">{template.name}</h1>
              <p className="text-xs text-muted-foreground">
                {template.fields.length} field{template.fields.length !== 1 ? 's' : ''} to fill
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ZoomControls zoom={zoom} onZoomChange={setZoom} />
          </div>
        </div>
      </header>

      {/* PDF Viewer */}
      <div className="flex-1 overflow-auto">
        {isLoadingPDF ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading PDF...</p>
          </div>
        ) : (
          <PDFViewer
            pdfData={pdfData}
            fields={template.fields}
            zoom={zoom}
            renderFieldOverlay={renderFieldOverlay}
            className="h-full"
          />
        )}
      </div>

      {/* Footer actions */}
      <footer className="border-t bg-background px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {missingRequired.length > 0 ? (
              <span className="text-destructive">
                {missingRequired.length} required field{missingRequired.length !== 1 ? 's' : ''} empty
              </span>
            ) : (
              <span className="text-green-600">All required fields filled</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <Button onClick={handleDownload} disabled={isGenerating}>
              <Download className="h-4 w-4 mr-1" />
              {isGenerating ? 'Generating...' : 'Download Filled PDF'}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
