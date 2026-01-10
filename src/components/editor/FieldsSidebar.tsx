import React from 'react';
import { useDrag } from 'react-dnd';
import { GripVertical, Trash2, Type, Calendar, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import type { TemplateField } from '@/types/template';

interface FieldsSidebarProps {
  fields: TemplateField[];
  selectedFieldId: string | null;
  onSelectField: (fieldId: string | null) => void;
  onUpdateField: (fieldId: string, updates: Partial<TemplateField>) => void;
  onDeleteField: (fieldId: string) => void;
}

export function FieldsSidebar({
  fields,
  selectedFieldId,
  onSelectField,
  onUpdateField,
  onDeleteField,
}: FieldsSidebarProps) {
  const selectedField = fields.find((f) => f.id === selectedFieldId);

  return (
    <div className="h-full flex flex-col bg-background border-l">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Fields</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Drag a field type below onto the PDF
        </p>
      </div>

      <div className="p-4 border-b space-y-2">
        <DraggableFieldButton type="text" icon={Type} label="Text Field" />
        <DraggableFieldButton type="date" icon={Calendar} label="Date Field" />
        <DraggableFieldButton type="select" icon={List} label="Select Field" />
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {fields.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No fields yet. Drag a field above onto the PDF to add one.
            </p>
          ) : (
            fields.map((field) => (
              <FieldListItem
                key={field.id}
                field={field}
                isSelected={field.id === selectedFieldId}
                onSelect={() => onSelectField(field.id)}
                onDelete={() => onDeleteField(field.id)}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {selectedField && (
        <>
          <Separator />
          <div className="p-4 space-y-4 max-h-[50%] overflow-y-auto">
            <h3 className="font-medium text-sm">Field Properties</h3>
            
            <div className="space-y-2">
              <Label htmlFor="type" className="text-xs">Type</Label>
              <div className="text-sm text-muted-foreground capitalize bg-muted px-2 py-1 rounded">
                {selectedField.type}
                {selectedField.type === 'date' && ' (auto-fills current date)'}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="label" className="text-xs">Label</Label>
              <Input
                id="label"
                value={selectedField.label}
                onChange={(e) => onUpdateField(selectedField.id, { label: e.target.value })}
                placeholder="Field label"
              />
            </div>

            {selectedField.type === 'text' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="placeholder" className="text-xs">Placeholder</Label>
                  <Input
                    id="placeholder"
                    value={selectedField.placeholder}
                    onChange={(e) => onUpdateField(selectedField.id, { placeholder: e.target.value })}
                    placeholder="Placeholder text"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultValue" className="text-xs">Default Value</Label>
                  <Input
                    id="defaultValue"
                    value={selectedField.defaultValue}
                    onChange={(e) => onUpdateField(selectedField.id, { defaultValue: e.target.value })}
                    placeholder="Default value"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxLength" className="text-xs">Max Length</Label>
                  <Input
                    id="maxLength"
                    type="number"
                    value={selectedField.maxLength || ''}
                    onChange={(e) =>
                      onUpdateField(selectedField.id, {
                        maxLength: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    placeholder="No limit"
                  />
                </div>
              </>
            )}

            {selectedField.type === 'select' && (
              <div className="space-y-2">
                <Label htmlFor="options" className="text-xs">Options (comma-separated)</Label>
                <Textarea
                  id="options"
                  value={selectedField.options || ''}
                  onChange={(e) => onUpdateField(selectedField.id, { options: e.target.value })}
                  placeholder="Option 1, Option 2, Option 3"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Enter options separated by commas
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fontSize" className="text-xs">Font Size</Label>
              <Input
                id="fontSize"
                type="number"
                value={selectedField.fontSize}
                onChange={(e) =>
                  onUpdateField(selectedField.id, { fontSize: parseInt(e.target.value) || 12 })
                }
                min={8}
                max={24}
              />
            </div>

            {selectedField.type !== 'date' && (
              <div className="flex items-center justify-between">
                <Label htmlFor="required" className="text-xs">Required</Label>
                <Switch
                  id="required"
                  checked={selectedField.required}
                  onCheckedChange={(checked) => onUpdateField(selectedField.id, { required: checked })}
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

interface DraggableFieldButtonProps {
  type: 'text' | 'date' | 'select';
  icon: React.ElementType;
  label: string;
}

function DraggableFieldButton({ type, icon: Icon, label }: DraggableFieldButtonProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'NEW_FIELD',
    item: { type: 'NEW_FIELD', fieldType: type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`flex items-center gap-2 p-2 border-2 border-dashed rounded-lg cursor-grab transition-colors ${
        isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
      }`}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground" />
      <Icon className="h-4 w-4" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

interface FieldListItemProps {
  field: TemplateField;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function FieldListItem({ field, isSelected, onSelect, onDelete }: FieldListItemProps) {
  const getFieldIcon = () => {
    switch (field.type) {
      case 'date':
        return <Calendar className="h-3 w-3" />;
      case 'select':
        return <List className="h-3 w-3" />;
      default:
        return <Type className="h-3 w-3" />;
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
        isSelected ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div className="text-muted-foreground">
          {getFieldIcon()}
        </div>
        <span className="text-sm truncate">{field.label || 'Untitled'}</span>
        {field.required && <span className="text-destructive text-xs">*</span>}
        <span className="text-xs text-muted-foreground">P{field.pageIndex + 1}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}
