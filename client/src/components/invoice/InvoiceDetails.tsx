import React from 'react';
import { useInvoiceData } from '@/hooks/use-invoice';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { InvoiceItem } from '@/types';

interface InvoiceDetailsProps {
  invoiceId: string;
  onPrint?: () => void;
  onDownload?: () => void;
}

const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({
  invoiceId,
  onPrint,
  onDownload
}) => {
  const { data: invoice, isLoading, error } = useInvoiceData(invoiceId);

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  // Format currency helper
  const formatCurrency = (value?: number) => {
    return value ? value.toFixed(2) : '0.00';
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex justify-between">
              <Skeleton className="h-20 w-1/3" />
              <Skeleton className="h-20 w-1/3" />
            </div>
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error || !invoice) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
            <p className="text-red-500 font-medium mb-2">
              {error ? `Error: ${error.message}` : 'Invoice not found'}
            </p>
            <p className="text-gray-500">
              The requested invoice could not be loaded.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="invoice-details max-w-4xl mx-auto">
      <div className="mb-4 flex justify-end gap-2 print:hidden">
        <Button variant="outline" size="sm" onClick={handlePrint} className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
          <Printer className="h-4 w-4 mr-1" />
          Print PDF
        </Button>
        <Button variant="outline" size="sm" onClick={onDownload} className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100">
          <Download className="h-4 w-4 mr-1" />
          Download PDF
        </Button>
      </div>

      <Card className="overflow-hidden border-2 border-indigo-100 rounded-xl shadow-lg">
        {/* Invoice Header */}
        <div className="bg-white p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Invoice #{invoice.invoice_number}</h1>
              <p className="text-gray-600">
                {invoice.date ? format(new Date(invoice.date), 'PPP') : 'No date available'}
              </p>
              <div className="mt-2">
                <p className="text-gray-700 font-medium">Total</p>
                <p className="text-2xl font-bold text-gray-900">${formatCurrency(invoice.amount)}</p>
              </div>
            </div>

            <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
              <div className="payment-status flex items-center">
                <p className="text-gray-700 mr-2">Payment status</p>
                <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  invoice.status === 'Paid' 
                    ? 'bg-green-100 text-green-800' 
                    : invoice.status === 'Partial' 
                      ? 'bg-yellow-100 text-yellow-800'
                      : invoice.status === 'Cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                }`}>
                  {invoice.status === 'Paid' && <Check className="h-3 w-3 mr-1" />}
                  {invoice.status}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Customer Details</h2>
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <p className="font-medium text-gray-900">{invoice.customer_name}</p>
                {invoice.customer_email && <p>Email: {invoice.customer_email}</p>}
                {invoice.customer_phone && <p>Phone: {invoice.customer_phone}</p>}
                {invoice.customer_address && (
                  <p className="text-sm text-gray-600">{invoice.customer_address}</p>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900">Invoice Details</h2>
              <div className="space-y-3 mt-2">
                <div className="flex justify-between text-sm">
                  <p className="text-gray-600">Invoice Number:</p>
                  <p className="font-medium text-gray-900">#{invoice.invoice_number}</p>
                </div>
                <div className="flex justify-between text-sm">
                  <p className="text-gray-600">Date Issued:</p>
                  <p className="font-medium text-gray-900">
                    {invoice.date ? format(new Date(invoice.date), 'PPP') : 'N/A'}
                  </p>
                </div>
                <div className="flex justify-between text-sm">
                  <p className="text-gray-600">Due Date:</p>
                  <p className="font-medium text-gray-900">
                    {invoice.due_date ? format(new Date(invoice.due_date), 'PPP') : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Items */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Items</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 pl-4 text-left text-sm font-medium text-gray-500">Item</th>
                  <th className="py-3 text-center text-sm font-medium text-gray-500">Quantity</th>
                  <th className="py-3 text-right text-sm font-medium text-gray-500">Unit Price</th>
                  <th className="py-3 pr-4 text-right text-sm font-medium text-gray-500">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items && invoice.items.map((item: InvoiceItem, index: number) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-4 pl-4 text-sm text-gray-900">{item.name}</td>
                    <td className="py-4 text-center text-sm text-gray-900">{item.quantity}</td>
                    <td className="py-4 text-right text-sm text-gray-900">${formatCurrency(item.price)}</td>
                    <td className="py-4 pr-4 text-right text-sm font-medium text-gray-900">
                      ${formatCurrency(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-8 flex justify-end">
            <div className="w-full max-w-xs">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <p className="text-gray-600">Subtotal:</p>
                  <p className="font-medium text-gray-900">${formatCurrency(invoice.amount)}</p>
                </div>
                {invoice.tax_amount && (
                  <div className="flex justify-between text-sm">
                    <p className="text-gray-600">Tax:</p>
                    <p className="font-medium text-gray-900">${formatCurrency(invoice.tax_amount)}</p>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3 flex justify-between font-medium">
                  <p className="text-gray-900">Total:</p>
                  <p className="text-gray-900">${formatCurrency(invoice.amount)}</p>
                </div>
                {invoice.amount_paid !== undefined && (
                  <div className="flex justify-between text-sm bg-green-50 p-2 rounded-md">
                    <p className="text-green-700">Amount Paid:</p>
                    <p className="font-medium text-green-700">${formatCurrency(invoice.amount_paid)}</p>
                  </div>
                )}
                {invoice.amount_due !== undefined && (
                  <div className="flex justify-between text-sm bg-red-50 p-2 rounded-md">
                    <p className="text-red-700">Amount Due:</p>
                    <p className="font-medium text-red-700">${formatCurrency(invoice.amount_due)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notes/Description */}
          {invoice.description && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-md font-medium text-gray-900 mb-2">Notes</h3>
              <p className="text-sm text-gray-600">{invoice.description}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default InvoiceDetails; 