import React from 'react';
import { useDrag } from 'react-dnd';
import { Plus, GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
          Drag the button below onto the PDF to add a field
        </p>
      </div>

      <div className="p-4 border-b">
        <DraggableFieldButton />
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {fields.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No fields yet. Drag the button above onto the PDF to add one.
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
          <div className="p-4 space-y-4">
            <h3 className="font-medium text-sm">Field Properties</h3>
            
            <div className="space-y-2">
              <Label htmlFor="label" className="text-xs">Label</Label>
              <Input
                id="label"
                value={selectedField.label}
                onChange={(e) => onUpdateField(selectedField.id, { label: e.target.value })}
                placeholder="Field label"
              />
            </div>

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

            <div className="flex items-center justify-between">
              <Label htmlFor="required" className="text-xs">Required</Label>
              <Switch
                id="required"
                checked={selectedField.required}
                onCheckedChange={(checked) => onUpdateField(selectedField.id, { required: checked })}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function DraggableFieldButton() {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'NEW_FIELD',
    item: { type: 'NEW_FIELD' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`flex items-center gap-2 p-3 border-2 border-dashed rounded-lg cursor-grab transition-colors ${
        isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
      }`}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground" />
      <Plus className="h-4 w-4" />
      <span className="text-sm font-medium">Add Text Field</span>
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
  return (
    <div
      onClick={onSelect}
      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
        isSelected ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div
          className={`w-2 h-2 rounded-full ${field.required ? 'bg-destructive' : 'bg-muted-foreground'}`}
        />
        <span className="text-sm truncate">{field.label || 'Untitled'}</span>
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
