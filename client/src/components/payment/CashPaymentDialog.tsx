import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import CashPayment from './CashPayment';

interface CashPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  amount: number;
  orderId?: number;
  testOrderId?: number;
  appointmentId?: number;
  onSuccess?: () => void;
}

const CashPaymentDialog: React.FC<CashPaymentDialogProps> = ({
  open,
  onOpenChange,
  invoiceId,
  amount,
  orderId = 0,
  testOrderId = 0,
  appointmentId = 0,
  onSuccess,
}) => {
  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <CashPayment
          invoiceId={invoiceId}
          amount={amount}
          orderId={orderId}
          testOrderId={testOrderId}
          appointmentId={appointmentId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CashPaymentDialog; 