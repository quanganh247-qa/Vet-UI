import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Download, Printer, Share2 } from 'lucide-react';

export interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  total: number;
}

export interface InvoiceData {
  invoiceId: string;
  date: string;
  total: number;
  paymentStatus: 'Paid' | 'Unpaid' | 'Partial';
  paymentMethod: string;
  client: {
    name: string;
    phone: string;
  };
  patient: {
    name: string;
  };
  hospital: {
    name: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      zipCode: string;
      country: string;
    };
  };
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  amountPaid: number;
  amountDue: number;
}

interface InvoiceComponentProps {
  invoice?: InvoiceData;
  isLoading?: boolean;
  onPrint?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}

const InvoiceComponent: React.FC<InvoiceComponentProps> = ({
  invoice,
  isLoading = false,
  onPrint,
  onDownload,
  onShare
}) => {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  if (isLoading) {
    return (
      <Card className="overflow-hidden border-2 border-indigo-100 rounded-xl shadow-lg p-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="animate-pulse space-y-4 w-full max-w-md">
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="h-24 bg-gray-200 rounded w-full"></div>
            <div className="h-12 bg-gray-200 rounded w-full"></div>
            <div className="h-12 bg-gray-200 rounded w-full"></div>
          </div>
          <p className="mt-6 text-gray-500 font-medium">Loading invoice...</p>
        </div>
      </Card>
    );
  }

  if (!invoice) {
    return (
      <Card className="overflow-hidden border-2 border-indigo-100 rounded-xl shadow-lg p-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <p className="text-gray-500 font-medium">No invoice data available</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="invoice-container print:p-0 relative max-w-4xl mx-auto" id="invoice-container">
      <div className="mb-4 flex justify-end gap-2 print:hidden">
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-1" />
          Print
        </Button>
        <Button variant="outline" size="sm" onClick={onDownload}>
          <Download className="h-4 w-4 mr-1" />
          Download
        </Button>
        <Button variant="outline" size="sm" onClick={onShare}>
          <Share2 className="h-4 w-4 mr-1" />
          Share
        </Button>
      </div>

      <Card className="overflow-hidden border-2 border-indigo-100 rounded-xl shadow-lg">
        {/* Invoice Header */}
        <div className="bg-white p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Invoice {invoice.invoiceId}</h1>
              <p className="text-gray-600">{invoice.date}</p>
              <div className="mt-2">
                <p className="text-gray-700 font-medium">Total</p>
                <p className="text-2xl font-bold text-gray-900">${invoice.total.toFixed(2)}</p>
              </div>
            </div>

            <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
              <div className="payment-status flex items-center">
                <p className="text-gray-700 mr-2">Payment status</p>
                <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  invoice.paymentStatus === 'Paid' 
                    ? 'bg-green-100 text-green-800' 
                    : invoice.paymentStatus === 'Partial' 
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                }`}>
                  {invoice.paymentStatus === 'Paid' && <Check className="h-3 w-3 mr-1" />}
                  {invoice.paymentStatus} | {invoice.paymentMethod}
                </div>
              </div>

              <div className="hospital-logo mt-4 bg-indigo-100 h-14 w-14 rounded-lg flex items-center justify-center">
                <div className="text-indigo-600 text-3xl">
                  🐾
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hospital and Client Information */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900">{invoice.hospital.name}</h2>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p>Email: {invoice.hospital.email}</p>
                  <p>Phone: {invoice.hospital.phone}</p>
                  <p className="text-sm text-gray-600">
                    {invoice.hospital.address.street}, {invoice.hospital.address.city},
                    <br />{invoice.hospital.address.zipCode}, {invoice.hospital.address.country}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Client:</p>
                  <p className="text-base font-semibold text-gray-900">{invoice.client.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone:</p>
                  <p className="text-base text-gray-900">{invoice.client.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Patient:</p>
                  <p className="text-base text-gray-900">{invoice.patient.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Items */}
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 pl-4 text-left text-sm font-medium text-gray-500">Items</th>
                  <th className="py-3 text-center text-sm font-medium text-gray-500">Quantity</th>
                  <th className="py-3 text-right text-sm font-medium text-gray-500">Unit Price</th>
                  <th className="py-3 text-right text-sm font-medium text-gray-500">Subtotal</th>
                  <th className="py-3 text-right text-sm font-medium text-gray-500">Tax</th>
                  <th className="py-3 pr-4 text-right text-sm font-medium text-gray-500">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-4 pl-4 text-sm text-gray-900">{item.name}</td>
                    <td className="py-4 text-center text-sm text-gray-900">{item.quantity}</td>
                    <td className="py-4 text-right text-sm text-gray-900">${item.unitPrice.toFixed(2)}</td>
                    <td className="py-4 text-right text-sm text-gray-900">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                    <td className="py-4 text-right text-sm text-gray-900">{item.tax}%</td>
                    <td className="py-4 pr-4 text-right text-sm font-medium text-gray-900">${item.total.toFixed(2)}</td>
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
                  <p className="font-medium text-gray-900">${invoice.subtotal.toFixed(2)}</p>
                </div>
                <div className="flex justify-between text-sm">
                  <p className="text-gray-600">Tax:</p>
                  <p className="font-medium text-gray-900">${invoice.tax.toFixed(2)}</p>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between font-medium">
                  <p className="text-gray-900">Total:</p>
                  <p className="text-gray-900">${invoice.total.toFixed(2)}</p>
                </div>
                <div className="flex justify-between text-sm bg-green-50 p-2 rounded-md">
                  <p className="text-green-700">Amount Paid:</p>
                  <p className="font-medium text-green-700">${invoice.amountPaid.toFixed(2)}</p>
                </div>
                <div className="flex justify-between text-sm bg-red-50 p-2 rounded-md">
                  <p className="text-red-700">Amount Due:</p>
                  <p className="font-medium text-red-700">${invoice.amountDue.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default InvoiceComponent; 