import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listTemplates,
  getTemplateById,
  getTemplatePDF,
  saveTemplate,
  deleteTemplate,
  createTemplate,
  generateShareLink,
  getTemplateByShareId,
} from '@/api/templates';
import type { Template } from '@/types/template';

export function useTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: listTemplates,
  });
}

export function useTemplate(templateId: string | undefined) {
  return useQuery({
    queryKey: ['template', templateId],
    queryFn: () => (templateId ? getTemplateById(templateId) : undefined),
    enabled: !!templateId,
  });
}

export function useTemplatePDF(templateId: string | undefined) {
  return useQuery({
    queryKey: ['template-pdf', templateId],
    queryFn: () => (templateId ? getTemplatePDF(templateId) : undefined),
    enabled: !!templateId,
  });
}

export function useTemplateByShareId(shareId: string | undefined) {
  return useQuery({
    queryKey: ['template-share', shareId],
    queryFn: () => (shareId ? getTemplateByShareId(shareId) : undefined),
    enabled: !!shareId,
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ file, pagesMeta }: { file: File; pagesMeta: { width: number; height: number }[] }) =>
      createTemplate(file, pagesMeta),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
}

export function useSaveTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (template: Template) => saveTemplate(template),
    onSuccess: (_, template) => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['template', template.templateId] });
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (templateId: string) => deleteTemplate(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
}

export function useGenerateShareLink() {
  return useMutation({
    mutationFn: (templateId: string) => generateShareLink(templateId),
  });
}
