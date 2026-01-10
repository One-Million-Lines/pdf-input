import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ArrowLeft, Save, Eye, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PDFViewer, ZoomControls } from '@/components/editor/PDFViewer';
import { FieldsSidebar } from '@/components/editor/FieldsSidebar';
import { FieldOverlay } from '@/components/editor/FieldOverlay';
import { useTemplate, useTemplatePDF, useSaveTemplate, useGenerateShareLink } from '@/hooks/useTemplates';
import { createField } from '@/api/templates';
import { toast } from 'sonner';
import type { Template, TemplateField } from '@/types/template';

function EditorContent() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { data: template, isLoading: isLoadingTemplate } = useTemplate(templateId);
  const { data: pdfData, isLoading: isLoadingPDF } = useTemplatePDF(templateId);
  const saveTemplate = useSaveTemplate();
  const generateShareLink = useGenerateShareLink();

  const [localTemplate, setLocalTemplate] = useState<Template | null>(null);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (template) {
      setLocalTemplate(template);
    }
  }, [template]);

  const handleSave = useCallback(async () => {
    if (!localTemplate) return;
    
    // Validate fields
    const emptyLabels = localTemplate.fields.filter((f) => !f.label.trim());
    if (emptyLabels.length > 0) {
      toast.error('All fields must have a label');
      return;
    }

    try {
      await saveTemplate.mutateAsync(localTemplate);
      setHasChanges(false);
      toast.success('Template saved!');
    } catch (error) {
      toast.error('Failed to save template');
    }
  }, [localTemplate, saveTemplate]);

  const handlePreview = useCallback(() => {
    if (!localTemplate) return;
    window.open(`/fill/${localTemplate.shareId}`, '_blank');
  }, [localTemplate]);

  const handleGenerateLink = useCallback(async () => {
    if (!localTemplate) return;
    
    try {
      const shareId = await generateShareLink.mutateAsync(localTemplate.templateId);
      const link = `${window.location.origin}/fill/${shareId}`;
      await navigator.clipboard.writeText(link);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to generate link');
    }
  }, [localTemplate, generateShareLink]);

  const handleAddField = useCallback((pageIndex: number, x: number, y: number, fieldType: 'text' | 'date' | 'select' = 'text') => {
    if (!localTemplate) return;
    
    const field = createField(pageIndex, x, y, fieldType);
    setLocalTemplate({
      ...localTemplate,
      fields: [...localTemplate.fields, field],
    });
    setSelectedFieldId(field.id);
    setHasChanges(true);
  }, [localTemplate]);

  const handleUpdateField = useCallback((fieldId: string, updates: Partial<TemplateField>) => {
    if (!localTemplate) return;
    
    setLocalTemplate({
      ...localTemplate,
      fields: localTemplate.fields.map((f) =>
        f.id === fieldId ? { ...f, ...updates } : f
      ),
    });
    setHasChanges(true);
  }, [localTemplate]);

  const handleDeleteField = useCallback((fieldId: string) => {
    if (!localTemplate) return;
    
    setLocalTemplate({
      ...localTemplate,
      fields: localTemplate.fields.filter((f) => f.id !== fieldId),
    });
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
    setHasChanges(true);
  }, [localTemplate, selectedFieldId]);

  const renderDropZone = useCallback((pageIndex: number, pageWidth: number, pageHeight: number) => {
    return (
      <PageDropZone
        pageIndex={pageIndex}
        pageWidth={pageWidth}
        pageHeight={pageHeight}
        onDrop={handleAddField}
      />
    );
  }, [handleAddField]);

  const renderFieldOverlay = useCallback(
    (field: TemplateField, pageIndex: number, pageWidth: number, pageHeight: number) => (
      <FieldOverlay
        field={field}
        pageWidth={pageWidth}
        pageHeight={pageHeight}
        isSelected={field.id === selectedFieldId}
        onSelect={() => setSelectedFieldId(field.id)}
        onUpdate={(updates) => handleUpdateField(field.id, updates)}
        mode="edit"
      />
    ),
    [selectedFieldId, handleUpdateField]
  );

  if (isLoadingTemplate || isLoadingPDF) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading editor...</p>
      </div>
    );
  }

  if (!localTemplate || !pdfData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-destructive">Template not found</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="font-semibold">{localTemplate.name}</h1>
            <p className="text-xs text-muted-foreground">
              {localTemplate.fields.length} field{localTemplate.fields.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ZoomControls zoom={zoom} onZoomChange={setZoom} />
          <Button variant="outline" size="sm" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
          <Button variant="outline" size="sm" onClick={handleGenerateLink}>
            <Link2 className="h-4 w-4 mr-1" />
            Copy Link
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saveTemplate.isPending}>
            <Save className="h-4 w-4 mr-1" />
            {hasChanges ? 'Save*' : 'Save'}
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-auto" onClick={() => setSelectedFieldId(null)}>
          <PDFViewer
            pdfData={pdfData}
            fields={localTemplate.fields}
            selectedFieldId={selectedFieldId}
            zoom={zoom}
            renderFieldOverlay={renderFieldOverlay}
            renderDropZone={renderDropZone}
            className="h-full"
          />
        </div>
        <div className="w-80 flex-shrink-0">
          <FieldsSidebar
            fields={localTemplate.fields}
            selectedFieldId={selectedFieldId}
            onSelectField={setSelectedFieldId}
            onUpdateField={handleUpdateField}
            onDeleteField={handleDeleteField}
          />
        </div>
      </div>
    </div>
  );
}

interface PageDropZoneProps {
  pageIndex: number;
  pageWidth: number;
  pageHeight: number;
  onDrop: (pageIndex: number, x: number, y: number, fieldType: 'text' | 'date' | 'select') => void;
}

function PageDropZone({ pageIndex, pageWidth, pageHeight, onDrop }: PageDropZoneProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'NEW_FIELD',
    drop: (item: { type: string; fieldType?: 'text' | 'date' | 'select' }, monitor) => {
      const offset = monitor.getClientOffset();
      const dropTargetRect = document.querySelector(`[data-page-drop="${pageIndex}"]`)?.getBoundingClientRect();
      
      if (offset && dropTargetRect) {
        const x = (offset.x - dropTargetRect.left) / pageWidth;
        const y = (offset.y - dropTargetRect.top) / pageHeight;
        onDrop(pageIndex, Math.max(0, Math.min(0.8, x)), Math.max(0, Math.min(0.97, y)), item.fieldType || 'text');
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [pageIndex, pageWidth, pageHeight, onDrop]);

  return (
    <div
      ref={drop}
      data-page-drop={pageIndex}
      className={`absolute inset-0 transition-colors ${isOver ? 'bg-primary/10' : ''}`}
    />
  );
}

export default function Editor() {
  return (
    <DndProvider backend={HTML5Backend}>
      <EditorContent />
    </DndProvider>
  );
}
