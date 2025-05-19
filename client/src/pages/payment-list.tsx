import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaymentItem } from "@/services/payment-services";
import { Loader2, Search, Filter, Eye, Receipt, DownloadIcon, ChevronLeft, ChevronRight, ArrowLeft, X } from "lucide-react";
import { format } from "date-fns";
import { useListPayments } from "@/hooks/use-payment";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

// Format currency for VND
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const PaymentListPage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const { 
    data: paymentsData, 
    isLoading,
    error,
    refetch
  } = useListPayments(page, pageSize);

  console.log(paymentsData);
  
  // Calculate total pages
  const totalPages = paymentsData?.totalPages || 1;
  
  // Get payment status badge color
  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "success":
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>;
      case "pending":
        return <Badge className="bg-[#FFA726] hover:bg-[#FF9800]">Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-500 hover:bg-red-600">Failed</Badge>;
      default:
        return <Badge className="bg-gray-500 hover:bg-gray-600">{status}</Badge>;
    }
  };
  
  // Get payment method icon and text
  const getPaymentMethod = (method: string) => {
    switch (method?.toLowerCase()) {
      case "vietqr":
        return (
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-[#2C78E4]" />
            <span>VietQR</span>
          </div>
        );
      case "cash":
        return (
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-[#FFA726]" />
            <span>Cash</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-gray-500" />
            <span>{method}</span>
          </div>
        );
    }
  };

  // Filter payments based on search query and filter status
  const filteredPayments = paymentsData?.payments
    ? paymentsData.payments.filter((payment: PaymentItem) => {
        // Filter by status if not "all"
        if (filterStatus !== "all" && payment.payment_status?.toLowerCase() !== filterStatus.toLowerCase()) {
          return false;
        }
        
        // Filter by search term if provided
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            payment.transaction_id?.toLowerCase()?.includes(query) ||
            payment.payment_method?.toLowerCase()?.includes(query) ||
            payment.amount?.toString()?.includes(query)
          );
        }
        
        return true;
      })
    : [];

  // Handle page size change
  const handlePageSizeChange = (newSize: string) => {
    setPageSize(parseInt(newSize, 10));
    setPage(1); // Reset to first page when changing page size
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && (!totalPages || newPage <= totalPages)) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // View payment details
  const handleViewPaymentDetails = (payment: PaymentItem) => {
    setSelectedPayment(payment);
    setIsDetailsOpen(true);
  };

  // Refetch data when filters change
  useEffect(() => {
    refetch();
  }, [page, pageSize, refetch]);

  return (
    <div className="space-y-6">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-[#2C78E4] to-[#1E40AF] px-6 py-4 rounded-xl shadow-md mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 h-8 w-8 text-white hover:bg-white/20 rounded-full"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-white">Payment History</h1>
          </div>

          <Button 
            variant="outline" 
            className="bg-white/10 text-white border-white/20 hover:bg-white/20 rounded-lg flex items-center gap-2"
            onClick={() => refetch()}
          >
            <DownloadIcon className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Search and filter section */}
      <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-white">
        
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#4B5563] h-4 w-4" />
              <Input
                placeholder="Search by transaction ID, method, amount..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-200 rounded-lg focus:ring-[#2C78E4] focus:border-[#2C78E4]"
              />
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-[#4B5563]" />
              <Select 
                value={filterStatus} 
                onValueChange={setFilterStatus}
              >
                <SelectTrigger className="w-[180px] bg-white border-gray-200 focus:ring-[#2C78E4] focus:border-[#2C78E4]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Payments data display */}
      <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-white">
        <CardHeader className="bg-white pb-3 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold text-[#111827] flex items-center">
              <Receipt className="h-5 w-5 mr-2 text-[#2C78E4]" />
              Payments List
            </CardTitle>
            <div className="text-xs text-[#4B5563]">
              {paymentsData?.total ? (
                <span>{paymentsData.total} payments found</span>
              ) : (
                <span>No payments found</span>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-[#2C78E4]" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Error loading payments: {error.message}
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-8 text-[#4B5563]">
              No payment records found matching your search criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-[#F9FAFB]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider">
                      Transaction ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-[#4B5563] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredPayments.map((payment: PaymentItem) => (
                    <tr key={payment.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-[#111827]">
                        {payment.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-[#111827]">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPaymentMethod(payment.payment_method)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment.payment_status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[#4B5563] max-w-[180px] truncate">
                        {payment.transaction_id || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[#4B5563]">
                        {payment.created_at 
                          ? format(new Date(payment.created_at), "dd MMM yyyy, HH:mm") 
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0 text-[#4B5563] hover:bg-[#2C78E4]/5 hover:text-[#2C78E4] rounded-full"
                          onClick={() => handleViewPaymentDetails(payment)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      <div className="border-t border-gray-100 px-4 py-3 bg-white rounded-xl shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-[#4B5563]">Show</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white text-sm py-1 px-2 text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2C78E4] focus:border-[#2C78E4]"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <span className="text-[#4B5563]">entries</span>
          </div>

          <div className="text-sm text-[#4B5563]">
            Showing {Math.min((page - 1) * pageSize + 1, paymentsData?.total || 0)} - {Math.min(page * pageSize, paymentsData?.total || 0)} of {paymentsData?.total || 0} payments
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className={cn(
                "rounded-lg h-8 w-8 p-0 mx-0.5 text-sm font-medium transition-colors",
                page === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-[#4B5563] hover:bg-[#2C78E4]/5 hover:text-[#2C78E4]"
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {totalPages && totalPages <= 5 ? (
              // Show all page numbers if there are 5 or fewer pages
              Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <Button
                  key={pageNum}
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  className={cn(
                    "rounded-lg h-8 w-8 p-0 mx-0.5 text-sm font-medium transition-colors",
                    page === pageNum
                      ? "bg-[#2C78E4] text-white hover:bg-[#2C78E4]/90"
                      : "text-[#4B5563] hover:bg-[#2C78E4]/5 hover:text-[#2C78E4]"
                  )}
                >
                  {pageNum}
                </Button>
              ))
            ) : (
              // Show limited page numbers with ellipsis for many pages
              <>
                {/* First page */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  className={cn(
                    "rounded-lg h-8 w-8 p-0 mx-0.5 text-sm font-medium transition-colors",
                    page === 1
                      ? "bg-[#2C78E4] text-white hover:bg-[#2C78E4]/90"
                      : "text-[#4B5563] hover:bg-[#2C78E4]/5 hover:text-[#2C78E4]"
                  )}
                >
                  1
                </Button>

                {/* Ellipsis if needed */}
                {page > 3 && (
                  <span className="px-1 text-[#4B5563]">...</span>
                )}

                {/* Pages around current page */}
                {Array.from(
                  { length: Math.min(3, totalPages || 1) },
                  (_, i) => {
                    const pageNum = Math.max(
                      2,
                      page - 1 + i - (page > 2 ? 1 : 0)
                    );
                    if (pageNum >= 2 && pageNum < (totalPages || 1)) {
                      return (
                        <Button
                          key={pageNum}
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className={cn(
                            "rounded-lg h-8 w-8 p-0 mx-0.5 text-sm font-medium transition-colors",
                            page === pageNum
                              ? "bg-[#2C78E4] text-white hover:bg-[#2C78E4]/90"
                              : "text-[#4B5563] hover:bg-[#2C78E4]/5 hover:text-[#2C78E4]"
                          )}
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                    return null;
                  }
                )}

                {/* Ellipsis if needed */}
                {totalPages && page < totalPages - 2 && (
                  <span className="px-1 text-[#4B5563]">...</span>
                )}

                {/* Last page */}
                {totalPages && totalPages > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageChange(totalPages)}
                    className={cn(
                      "rounded-lg h-8 w-8 p-0 mx-0.5 text-sm font-medium transition-colors",
                      page === totalPages
                        ? "bg-[#2C78E4] text-white hover:bg-[#2C78E4]/90"
                        : "text-[#4B5563] hover:bg-[#2C78E4]/5 hover:text-[#2C78E4]"
                    )}
                  >
                    {totalPages}
                  </Button>
                )}
              </>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={paymentsData?.total ? page >= Math.ceil(paymentsData.total / pageSize) : true}
              className={cn(
                "rounded-lg h-8 w-8 p-0 mx-0.5 text-sm font-medium transition-colors",
                (paymentsData?.total ? page >= Math.ceil(paymentsData.total / pageSize) : true)
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-[#4B5563] hover:bg-[#2C78E4]/5 hover:text-[#2C78E4]"
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Payment Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-md rounded-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center text-lg font-semibold text-[#111827]">
              <Receipt className="h-5 w-5 mr-2 text-[#2C78E4]" />
              Payment Details
            </DialogTitle>
            <DialogDescription className="text-[#4B5563]">
              View detailed information about this payment
            </DialogDescription>
          </DialogHeader>
          
          <DialogClose className="absolute right-4 top-4 rounded-full p-1 hover:bg-gray-100">
            <X className="h-4 w-4 text-gray-500" />
          </DialogClose>
          
          {selectedPayment && (
            <div className="space-y-4 mt-4">
              {selectedPayment.appointment_id && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-[#4B5563]">Appointment ID</span>
                  <span className="text-sm font-semibold text-[#111827]">{selectedPayment.appointment_id}</span>
                </div>
              )}

              {selectedPayment.order_id && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-[#4B5563]">Order ID</span>
                  <span className="text-sm font-semibold text-[#111827]">{selectedPayment.order_id}</span>
                </div>
              )}
              
              {selectedPayment.payment_details && (
                <div className="py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-[#4B5563] block mb-2">Payment Details</span>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <pre className="text-xs whitespace-pre-wrap text-[#4B5563]">
                      {JSON.stringify(selectedPayment.payment_details, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              
              <div className="pt-2 flex justify-end">
                <Button
                  onClick={() => setIsDetailsOpen(false)}
                  className="bg-[#2C78E4] text-white hover:bg-[#2C78E4]/90"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentListPage; 