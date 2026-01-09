export interface TemplateField {
  id: string;
  type: 'text';
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
