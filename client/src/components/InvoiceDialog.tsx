import React, { useState, useCallback, memo } from 'react';
import { InvoiceData } from './InvoiceComponent';
import InvoiceComponent from './InvoiceComponent';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Expand, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InvoiceDialogProps {
  invoice?: InvoiceData;
  isLoading?: boolean;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onPrint?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}

const InvoiceDialog: React.FC<InvoiceDialogProps> = memo(({
  invoice,
  isLoading = false,
  trigger,
  open,
  onOpenChange,
  onPrint,
  onDownload,
  onShare
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Memoize toggle handler to prevent unnecessary re-renders
  const toggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);
  
  // Memoize close handler
  const handleClose = useCallback(() => {
    onOpenChange?.(false);
  }, [onOpenChange]);

  // Calculate class names once
  const contentClasses = cn(
    "p-0 border-none overflow-hidden rounded-2xl shadow-2xl",
    "backdrop:bg-gray-900/30 backdrop:backdrop-blur-sm",
    isExpanded ? "w-screen h-screen max-w-none" : "max-w-4xl"
  );
  
  const contentAreaClasses = cn(
    "overflow-y-auto bg-white",
    isExpanded ? "h-[calc(100vh-88px)]" : "max-h-[75vh]"
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      
      <DialogContent 
        className={contentClasses}
        id="invoice-dialog"
      >
        <div className="relative bg-white">
          {/* Header */}
          <div className="sticky top-0 z-20 bg-gradient-to-b from-white to-white/90 backdrop-blur-sm flex items-center justify-between px-8 py-6 border-b">
            <DialogHeader className="space-y-0">
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Invoice {invoice?.invoiceId}
                <div className="text-sm font-normal text-gray-500 mt-1">
                  View and manage invoice details
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:bg-gray-100/50 rounded-xl"
                onClick={toggleExpand}
              >
                <Expand className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:bg-gray-100/50 rounded-xl"
                onClick={handleClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Content Area */}
          <div className={contentAreaClasses}>
            <div className="p-8" id="invoice-pdf-content">
              <InvoiceComponent 
                invoice={invoice} 
                isLoading={isLoading}
                onPrint={onPrint}
                onDownload={onDownload}
                onShare={onShare}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

InvoiceDialog.displayName = 'InvoiceDialog';

export default InvoiceDialog; 