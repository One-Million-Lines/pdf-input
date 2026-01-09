import React, { useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { TemplateField } from '@/types/template';

import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  pdfData: ArrayBuffer | undefined;
  fields?: TemplateField[];
  selectedFieldId?: string | null;
  zoom?: number;
  onPageLoad?: (pageIndex: number, width: number, height: number) => void;
  onNumPages?: (numPages: number) => void;
  renderFieldOverlay?: (field: TemplateField, pageIndex: number, pageWidth: number, pageHeight: number) => React.ReactNode;
  renderDropZone?: (pageIndex: number, pageWidth: number, pageHeight: number) => React.ReactNode;
  className?: string;
}

export function PDFViewer({
  pdfData,
  fields = [],
  zoom = 1,
  onPageLoad,
  onNumPages,
  renderFieldOverlay,
  renderDropZone,
  className,
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageWidths, setPageWidths] = useState<Map<number, number>>(new Map());
  const [pageHeights, setPageHeights] = useState<Map<number, number>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDocumentLoad = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    onNumPages?.(numPages);
  };

  const handlePageLoad = (page: any) => {
    const pageIndex = page.pageNumber - 1;
    const width = page.width;
    const height = page.height;
    
    setPageWidths((prev) => new Map(prev).set(pageIndex, width));
    setPageHeights((prev) => new Map(prev).set(pageIndex, height));
    onPageLoad?.(pageIndex, width, height);
  };

  if (!pdfData) {
    return (
      <div className={cn('flex items-center justify-center bg-muted/50 rounded-lg', className)}>
        <p className="text-muted-foreground">Loading PDF...</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn('overflow-auto bg-muted/30', className)}>
      <Document
        file={{ data: pdfData }}
        onLoadSuccess={handleDocumentLoad}
        loading={
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading PDF...</p>
          </div>
        }
        error={
          <div className="flex items-center justify-center h-64">
            <p className="text-destructive">Failed to load PDF</p>
          </div>
        }
      >
        <div className="flex flex-col items-center gap-4 p-4">
          {Array.from({ length: numPages }, (_, i) => (
            <div key={i} className="relative shadow-lg bg-background">
              <Page
                pageNumber={i + 1}
                scale={zoom}
                onLoadSuccess={handlePageLoad}
                renderAnnotationLayer={false}
                renderTextLayer={false}
              />
              {/* Field overlay container */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ width: pageWidths.get(i), height: pageHeights.get(i) }}
              >
                {/* Drop zone for drag and drop */}
                {renderDropZone && (
                  <div className="absolute inset-0 pointer-events-auto">
                    {renderDropZone(i, pageWidths.get(i) || 0, pageHeights.get(i) || 0)}
                  </div>
                )}
                
                {/* Render fields for this page */}
                {fields
                  .filter((f) => f.pageIndex === i)
                  .map((field) =>
                    renderFieldOverlay ? (
                      <div key={field.id} className="pointer-events-auto">
                        {renderFieldOverlay(field, i, pageWidths.get(i) || 0, pageHeights.get(i) || 0)}
                      </div>
                    ) : null
                  )}
              </div>
            </div>
          ))}
        </div>
      </Document>
    </div>
  );
}

interface ZoomControlsProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

export function ZoomControls({ zoom, onZoomChange }: ZoomControlsProps) {
  const zoomLevels = [0.8, 1, 1.25];

  return (
    <div className="flex items-center gap-1 bg-background border rounded-lg p-1">
      {zoomLevels.map((level) => (
        <Button
          key={level}
          variant={zoom === level ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onZoomChange(level)}
          className="text-xs px-2"
        >
          {Math.round(level * 100)}%
        </Button>
      ))}
    </div>
  );
}
