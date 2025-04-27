import React, { useState } from 'react';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Clock, 
  Check,
  X,
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Template interface
export interface ShiftTemplate {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  description: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  color?: string;
}

// Default templates
export const defaultShiftTemplates: ShiftTemplate[] = [
  {
    id: 'morning',
    name: 'Morning Shift',
    startTime: '08:00',
    endTime: '12:00',
    description: 'Standard morning shift',
    status: 'scheduled',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  {
    id: 'afternoon',
    name: 'Afternoon Shift',
    startTime: '13:00',
    endTime: '17:00',
    description: 'Standard afternoon shift',
    status: 'scheduled',
    color: 'bg-green-100 text-green-800 border-green-300',
  },
  {
    id: 'evening',
    name: 'Evening Shift',
    startTime: '18:00',
    endTime: '22:00',
    description: 'Standard evening shift',
    status: 'scheduled',
    color: 'bg-purple-100 text-purple-800 border-purple-300',
  },
  {
    id: 'full-day',
    name: 'Full Day',
    startTime: '09:00',
    endTime: '17:00',
    description: 'Standard full day shift',
    status: 'scheduled',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
  },
];

interface ShiftTemplateManagerProps {
  templates: ShiftTemplate[];
  onAddTemplate: (template: ShiftTemplate) => void;
  onEditTemplate: (id: string, template: ShiftTemplate) => void;
  onDeleteTemplate: (id: string) => void;
}

const ShiftTemplateManager: React.FC<ShiftTemplateManagerProps> = ({
  templates,
  onAddTemplate,
  onEditTemplate,
  onDeleteTemplate,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ShiftTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState<Partial<ShiftTemplate>>({
    name: '',
    startTime: '09:00',
    endTime: '17:00',
    description: '',
    status: 'scheduled',
  });

  const handleOpenDialog = (template?: ShiftTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setNewTemplate({...template});
    } else {
      setEditingTemplate(null);
      setNewTemplate({
        name: '',
        startTime: '09:00',
        endTime: '17:00',
        description: '',
        status: 'scheduled',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTemplate(null);
  };

  const handleSaveTemplate = () => {
    if (!newTemplate.name || !newTemplate.startTime || !newTemplate.endTime) {
      return; // Require at minimum name, start and end time
    }

    const template: ShiftTemplate = {
      id: editingTemplate?.id || `template_${Date.now()}`,
      name: newTemplate.name!,
      startTime: newTemplate.startTime!,
      endTime: newTemplate.endTime!,
      description: newTemplate.description || '',
      status: newTemplate.status as 'scheduled' | 'completed' | 'cancelled',
      color: editingTemplate?.color || `bg-gray-100 text-gray-800 border-gray-300`,
    };

    if (editingTemplate) {
      onEditTemplate(editingTemplate.id, template);
    } else {
      onAddTemplate(template);
    }

    handleCloseDialog();
  };

  return (
    <>
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Shift Templates</CardTitle>
              <CardDescription>
                Create and manage reusable shift templates
              </CardDescription>
            </div>
            <Button 
              size="sm" 
              onClick={() => handleOpenDialog()}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" /> Add Template
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div 
                key={template.id} 
                className={`border rounded-md p-4 shadow-sm ${template.color || 'bg-gray-100'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-base">{template.name}</h3>
                  <div className="flex items-center space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0" 
                      onClick={() => handleOpenDialog(template)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0"
                      onClick={() => onDeleteTemplate(template.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center text-sm mb-2">
                  <Clock className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                  <span>
                    {template.startTime} - {template.endTime}
                  </span>
                </div>
                
                {template.description && (
                  <p className="text-sm opacity-80 line-clamp-2">{template.description}</p>
                )}
              </div>
            ))}
          </div>
          
          {templates.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              <p>No templates found. Create your first shift template.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? 'Edit' : 'Create'} Shift Template</DialogTitle>
            <DialogDescription>
              {editingTemplate 
                ? 'Update an existing shift template' 
                : 'Create a new reusable template for shifts'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-1">Template Name</label>
              <Input 
                placeholder="Morning Shift"
                value={newTemplate.name || ''}
                onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Time</label>
                <Input 
                  type="time" 
                  value={newTemplate.startTime}
                  onChange={(e) => setNewTemplate({...newTemplate, startTime: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Time</label>
                <Input 
                  type="time" 
                  value={newTemplate.endTime}
                  onChange={(e) => setNewTemplate({...newTemplate, endTime: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea 
                placeholder="Enter a description of this shift template"
                value={newTemplate.description || ''}
                onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                className="resize-none"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              <X className="mr-1.5 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate}>
              <Check className="mr-1.5 h-4 w-4" />
              {editingTemplate ? 'Update' : 'Create'} Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ShiftTemplateManager;