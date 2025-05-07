import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DollarSign } from 'lucide-react';
import CashPaymentDialog from './CashPaymentDialog';

interface PaymentExampleProps {
  invoiceId: string;
  amount: number;
  appointmentId?: number;
}

const PaymentExample: React.FC<PaymentExampleProps> = ({ 
  invoiceId, 
  amount,
  appointmentId 
}) => {
  const [isCashPaymentOpen, setIsCashPaymentOpen] = useState(false);

  const handlePaymentSuccess = () => {
    console.log('Payment successful!');
    // Add any additional logic here, such as refreshing data or navigating to a different page
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Invoice #{invoiceId}</h3>
            <p className="text-sm text-gray-500">Due payment</p>
          </div>
          <div className="text-xl font-bold text-gray-900">${amount.toFixed(2)}</div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={() => setIsCashPaymentOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <DollarSign className="mr-2 h-4 w-4" />
            Pay with Cash
          </Button>
        </div>
      </div>

      {/* Cash Payment Dialog */}
      <CashPaymentDialog
        open={isCashPaymentOpen}
        onOpenChange={setIsCashPaymentOpen}
        invoiceId={invoiceId}
        amount={amount}
        appointmentId={appointmentId}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default PaymentExample; 