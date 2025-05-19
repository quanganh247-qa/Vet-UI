import React, { useState } from 'react';
import { useCreateCashPayment } from '@/hooks/use-payment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Receipt, CreditCard, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

// Add format currency function
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

interface CashPaymentProps {
  invoiceId: string;
  amount: number;
  orderId?: number;
  testOrderId?: number;
  appointmentId?: number;
  onSuccess?: (response: any) => void;
  onCancel?: () => void;
  disabled?: boolean;
}

const CashPayment: React.FC<CashPaymentProps> = ({ 
  invoiceId, 
  amount, 
  orderId = 0,
  testOrderId = 0,
  appointmentId = 0,
  onSuccess, 
  onCancel,
  disabled = false
}) => {
  const [paymentAmount, setPaymentAmount] = useState<number>(amount);
  const [receivedAmount, setReceivedAmount] = useState<number>(amount);
  const [changeAmount, setChangeAmount] = useState<number>(0);
  const [description, setDescription] = useState<string>(`Payment for invoice #${invoiceId}`);
  const [receivedBy, setReceivedBy] = useState<string>('');

  const cashPaymentMutation = useCreateCashPayment();

  // Calculate change when received amount changes
  const handleReceivedAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const received = parseFloat(e.target.value) || 0;
    setReceivedAmount(received);
    setChangeAmount(Math.max(0, received - paymentAmount));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await cashPaymentMutation.mutateAsync({
        amount: paymentAmount,
        description: description,
        order_id: orderId,
        test_order_id: testOrderId,
        appointment_id: appointmentId,
        received_by: receivedBy,
        cash_received: receivedAmount,
        cash_change: changeAmount,
      });
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (error) {
      console.error('Payment error:', error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="bg-gradient-to-r from-green-50 to-white border-b">
        <CardTitle className="flex items-center text-gray-800">
          <DollarSign className="h-5 w-5 mr-2 text-green-600" />
          Cash Payment
        </CardTitle>
        <CardDescription>
          {disabled ? 'Payment has been confirmed' : `Complete payment for invoice #${invoiceId}`}
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payment-amount" className="text-sm font-medium">
              Payment Amount
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                id="payment-amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                className="pl-10"
                step="1000"
                required
                disabled={disabled}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="received-amount" className="text-sm font-medium">
              Received Amount
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                id="received-amount"
                type="number"
                value={receivedAmount}
                onChange={handleReceivedAmountChange}
                className="pl-10"
                step="1000"
                required
                disabled={disabled}
              />
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded border border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Change Amount:</span>
              <span className="font-medium text-gray-900">{formatCurrency(changeAmount)}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="received-by" className="text-sm font-medium">
              Received By
            </Label>
            <Input
              id="received-by"
              placeholder="Cashier name"
              value={receivedBy}
              onChange={(e) => setReceivedBy(e.target.value)}
              className="h-10"
              required
              disabled={disabled}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Payment Description
            </Label>
            <Textarea
              id="description"
              placeholder="Payment details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none h-24"
              required
              disabled={disabled}
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-gray-300"
            disabled={disabled}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            disabled={cashPaymentMutation.isPending || paymentAmount <= 0 || disabled}
            className={cn(
              "text-white",
              disabled ? "bg-gray-300" : "bg-green-600 hover:bg-green-700"
            )}
          >
            {cashPaymentMutation.isPending ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Processing...
              </>
            ) : disabled ? (
              <>
                <CheckCheck className="mr-2 h-4 w-4" />
                Payment Confirmed
              </>
            ) : (
              <>
                <Receipt className="mr-2 h-4 w-4" />
                Complete Payment
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CashPayment; 