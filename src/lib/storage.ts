import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { Template } from '@/types/template';

interface FillLinkDB extends DBSchema {
  pdfs: {
    key: string;
    value: {
      templateId: string;
      data: ArrayBuffer;
    };
  };
  templates: {
    key: string;
    value: Template;
    indexes: { 'by-shareId': string };
  };
}

let dbPromise: Promise<IDBPDatabase<FillLinkDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<FillLinkDB>('filllink-db', 1, {
      upgrade(db) {
        db.createObjectStore('pdfs', { keyPath: 'templateId' });
        const templateStore = db.createObjectStore('templates', { keyPath: 'templateId' });
        templateStore.createIndex('by-shareId', 'shareId');
      },
    });
  }
  return dbPromise;
}

export async function storePDF(templateId: string, data: ArrayBuffer): Promise<void> {
  const db = await getDB();
  // Clone the ArrayBuffer before storing to avoid detachment issues
  await db.put('pdfs', { templateId, data: data.slice(0) });
}

export async function getPDF(templateId: string): Promise<ArrayBuffer | undefined> {
  const db = await getDB();
  const result = await db.get('pdfs', templateId);
  // Clone the ArrayBuffer to avoid "detached ArrayBuffer" errors
  // IndexedDB can detach the buffer after retrieval
  if (result?.data) {
    return result.data.slice(0);
  }
  return undefined;
}

export async function deletePDF(templateId: string): Promise<void> {
  const db = await getDB();
  await db.delete('pdfs', templateId);
}

export async function storeTemplate(template: Template): Promise<void> {
  const db = await getDB();
  await db.put('templates', template);
}

export async function getTemplate(templateId: string): Promise<Template | undefined> {
  const db = await getDB();
  return db.get('templates', templateId);
}

export async function getTemplateByShareId(shareId: string): Promise<Template | undefined> {
  const db = await getDB();
  return db.getFromIndex('templates', 'by-shareId', shareId);
}

export async function getAllTemplates(): Promise<Template[]> {
  const db = await getDB();
  return db.getAll('templates');
}

export async function deleteTemplate(templateId: string): Promise<void> {
  const db = await getDB();
  await db.delete('templates', templateId);
  await db.delete('pdfs', templateId);
}
