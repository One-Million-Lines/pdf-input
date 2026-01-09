import { nanoid } from 'nanoid';
import type { Template, TemplateField } from '@/types/template';
import {
  storePDF,
  getPDF,
  storeTemplate,
  getTemplate as getTemplateFromDB,
  getTemplateByShareId as getTemplateByShareIdFromDB,
  getAllTemplates,
  deleteTemplate as deleteTemplateFromDB,
} from '@/lib/storage';

export async function createTemplate(
  file: File,
  pagesMeta: { width: number; height: number }[]
): Promise<Template> {
  const templateId = nanoid(10);
  const shareId = nanoid(12);
  
  const arrayBuffer = await file.arrayBuffer();
  await storePDF(templateId, arrayBuffer);
  
  const template: Template = {
    templateId,
    name: file.name.replace(/\.pdf$/i, ''),
    originalFileName: file.name,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    pagesMeta,
    fields: [],
    shareId,
  };
  
  await storeTemplate(template);
  return template;
}

export async function getTemplateById(templateId: string): Promise<Template | undefined> {
  return getTemplateFromDB(templateId);
}

export async function getTemplatePDF(templateId: string): Promise<ArrayBuffer | undefined> {
  return getPDF(templateId);
}

export async function saveTemplate(template: Template): Promise<void> {
  template.updatedAt = Date.now();
  await storeTemplate(template);
}

export async function listTemplates(): Promise<Template[]> {
  const templates = await getAllTemplates();
  return templates.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function deleteTemplate(templateId: string): Promise<void> {
  await deleteTemplateFromDB(templateId);
}

export async function generateShareLink(templateId: string): Promise<string> {
  const template = await getTemplateFromDB(templateId);
  if (!template) throw new Error('Template not found');
  
  // ShareId is already generated on creation, just return it
  return template.shareId;
}

export async function getTemplateByShareId(shareId: string): Promise<Template | undefined> {
  return getTemplateByShareIdFromDB(shareId);
}

export function createField(pageIndex: number, x: number, y: number): TemplateField {
  return {
    id: nanoid(8),
    type: 'text',
    label: 'New Field',
    placeholder: 'Enter text...',
    required: false,
    maxLength: undefined,
    defaultValue: '',
    pageIndex,
    x,
    y,
    w: 0.2, // 20% of page width
    h: 0.03, // 3% of page height
    fontSize: 12,
  };
}
