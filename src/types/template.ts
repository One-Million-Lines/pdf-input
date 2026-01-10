export interface TemplateField {
  id: string;
  type: 'text' | 'date' | 'select';
  label: string;
  placeholder: string;
  required: boolean;
  maxLength?: number;
  defaultValue: string;
  pageIndex: number;
  x: number; // 0-1 relative to page width
  y: number; // 0-1 relative to page height
  w: number; // 0-1 relative to page width
  h: number; // 0-1 relative to page height
  fontSize: number;
  // For select fields: comma-separated options
  options?: string;
}

export interface PageMeta {
  width: number;
  height: number;
}

export interface Template {
  templateId: string;
  name: string;
  originalFileName: string;
  createdAt: number;
  updatedAt: number;
  pagesMeta: PageMeta[];
  fields: TemplateField[];
  shareId: string;
}

export interface FilledValues {
  [fieldId: string]: string;
}
