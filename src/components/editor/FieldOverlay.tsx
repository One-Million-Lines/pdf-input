import React, { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Calendar, ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TemplateField } from '@/types/template';

interface FieldOverlayProps {
  field: TemplateField;
  pageWidth: number;
  pageHeight: number;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<TemplateField>) => void;
  mode: 'edit' | 'fill';
  value?: string;
  onChange?: (value: string) => void;
}

export function FieldOverlay({
  field,
  pageWidth,
  pageHeight,
  isSelected,
  onSelect,
  onUpdate,
  mode,
  value,
  onChange,
}: FieldOverlayProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialPos, setInitialPos] = useState({ x: 0, y: 0, w: 0, h: 0 });

  // Convert relative to absolute pixels
  const absX = field.x * pageWidth;
  const absY = field.y * pageHeight;
  const absW = field.w * pageWidth;
  const absH = field.h * pageHeight;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (mode === 'fill') return;
    e.stopPropagation();
    onSelect();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialPos({ x: field.x, y: field.y, w: field.w, h: field.h });
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (mode === 'fill') return;
    e.stopPropagation();
    setIsResizing(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialPos({ x: field.x, y: field.y, w: field.w, h: field.h });
  };

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = (e.clientX - dragStart.x) / pageWidth;
      const dy = (e.clientY - dragStart.y) / pageHeight;

      if (isDragging) {
        const newX = Math.max(0, Math.min(1 - field.w, initialPos.x + dx));
        const newY = Math.max(0, Math.min(1 - field.h, initialPos.y + dy));
        onUpdate({ x: newX, y: newY });
      } else if (isResizing) {
        const newW = Math.max(0.05, Math.min(1 - field.x, initialPos.w + dx));
        const newH = Math.max(0.02, Math.min(1 - field.y, initialPos.h + dy));
        onUpdate({ w: newW, h: newH });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, initialPos, pageWidth, pageHeight, field, onUpdate]);

  // Fill mode rendering
  if (mode === 'fill') {
    return (
      <div
        className="absolute"
        style={{
          left: absX,
          top: absY,
          width: absW,
          height: absH,
        }}
      >
        {field.type === 'date' && (
          <div
            className="w-full h-full px-1 flex items-center text-foreground bg-muted/80 border rounded-sm"
            style={{ fontSize: field.fontSize }}
          >
            <Calendar className="h-3 w-3 mr-1 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{value || new Date().toLocaleDateString()}</span>
          </div>
        )}

        {field.type === 'select' && (
          <Select value={value || ''} onValueChange={(v) => onChange?.(v)}>
            <SelectTrigger
              className={cn(
                'w-full h-full px-1 bg-background/80 border rounded-sm',
                field.required && !value && 'border-destructive'
              )}
              style={{ fontSize: field.fontSize }}
            >
              <SelectValue placeholder={field.placeholder || 'Select...'} />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              {(field.options || '')
                .split(',')
                .map((opt) => opt.trim())
                .filter(Boolean)
                .map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        )}

        {field.type === 'text' && (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            className={cn(
              'w-full h-full px-1 text-foreground bg-background/80 border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary',
              field.required && !value && 'border-destructive'
            )}
            style={{ fontSize: field.fontSize }}
          />
        )}
      </div>
    );
  }

  // Edit mode rendering
  const getFieldTypeIndicator = () => {
    switch (field.type) {
      case 'date':
        return <Calendar className="h-3 w-3" />;
      case 'select':
        return <ChevronDown className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        'absolute border-2 rounded-sm cursor-move transition-colors',
        isSelected ? 'border-primary bg-primary/10' : 'border-primary/50 bg-primary/5 hover:border-primary'
      )}
      style={{
        left: absX,
        top: absY,
        width: absW,
        height: absH,
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Label */}
      <div
        className="absolute -top-5 left-0 text-xs font-medium text-primary bg-background px-1 rounded truncate max-w-full flex items-center gap-1"
        style={{ fontSize: 10 }}
      >
        {getFieldTypeIndicator()}
        {field.label}
        {field.required && <span className="text-destructive ml-0.5">*</span>}
      </div>

      {/* Resize handle */}
      {isSelected && (
        <div
          className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-sm cursor-se-resize"
          onMouseDown={handleResizeMouseDown}
        />
      )}
    </div>
  );
}
