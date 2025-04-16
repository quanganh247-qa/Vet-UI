import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Expand, Plus, X } from 'lucide-react';
import { WalkInRegistrationForm } from './WalkInRegistrationForm';
import { cn } from '@/lib/utils';

export const WalkInDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size="lg"
          className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white shadow-lg hover:shadow-indigo-500/30"
        >
          <Plus className="mr-2 h-5 w-5 stroke-[2.5]" />
          New Walk-in
        </Button>
      </DialogTrigger>
      
      <DialogContent 
        className={cn(
          "p-0 border-none overflow-hidden rounded-2xl shadow-2xl",
          "backdrop:bg-gray-900/30 backdrop:backdrop-blur-sm",
          isExpanded ? "w-screen h-screen max-w-none" : "max-w-3xl"
        )}
      >
        <div className="relative bg-white">
          {/* Header */}
          <div className="sticky top-0 z-20 bg-gradient-to-b from-white to-white/90 backdrop-blur-sm flex items-center justify-between px-8 py-6 border-b">
            <DialogHeader className="space-y-0">
              <DialogTitle className="text-2xl font-bold text-gray-900">
                New Walk-in Registration
                <div className="text-sm font-normal text-gray-500 mt-1">
                  Register a new walk-in appointment
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:bg-gray-100/50 rounded-xl"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <Expand className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:bg-gray-100/50 rounded-xl"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Content Area */}
          <div className={cn(
            "overflow-y-auto bg-gray-50/50",
            isExpanded ? "h-[calc(100vh-88px)]" : "max-h-[75vh]"
          )}>
            <div className="p-8">
              <WalkInRegistrationForm 
                onSuccess={() => setOpen(false)}
                onCancel={() => setOpen(false)}
                className="space-y-6"
              />
            </div>
          </div>

        
        </div>
      </DialogContent>
    </Dialog>
  );
};