import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Pencil, Link2, Trash2, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Template } from '@/types/template';
import { toast } from 'sonner';

interface TemplateCardProps {
  template: Template;
  onDelete: (templateId: string) => void;
  isDeleting?: boolean;
}

export function TemplateCard({ template, onDelete, isDeleting }: TemplateCardProps) {
  const navigate = useNavigate();

  const handleCopyLink = () => {
    const link = `${window.location.origin}/fill/${template.shareId}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard');
  };

  const handleEdit = () => {
    navigate(`/edit/${template.templateId}`);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this template?')) {
      onDelete(template.templateId);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-muted rounded-lg">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{template.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(template.updatedAt)}</span>
              <span>•</span>
              <span>{template.fields.length} field{template.fields.length !== 1 ? 's' : ''}</span>
              <span>•</span>
              <span>{template.pagesMeta.length} page{template.pagesMeta.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={handleEdit} className="flex-1">
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopyLink} className="flex-1">
            <Link2 className="h-3.5 w-3.5 mr-1.5" />
            Copy Link
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
