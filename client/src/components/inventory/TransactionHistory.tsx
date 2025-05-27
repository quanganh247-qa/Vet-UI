import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar as CalendarIcon,
  Loader2,
  Search,
  FileDownIcon,
  ShoppingBag,
  Download,
  Filter,
  MoreVertical,
  Eye,
  Trash2,
  Edit,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { MedicineTransactionResponse } from "@/types";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/ui/pagination";

interface TransactionHistoryProps {
  searchQuery: string;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  searchQuery,
}) => {
  const [transactions, setTransactions] = useState<MedicineTransactionResponse[]>([]);
  const [allFetchedTransactions, setAllFetchedTransactions] = useState<MedicineTransactionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [localSearchTerm, setLocalSearchTerm] = useState(searchQuery);
  
  useEffect(() => {
    fetchTransactions();
  }, [currentPage, localSearchTerm, itemsPerPage]);

  useEffect(() => {
    let filtered = [...allFetchedTransactions];

    if (typeFilter !== "all") {
      filtered = filtered.filter(t => t.transaction_type && t.transaction_type.toLowerCase() === typeFilter.toLowerCase());
    }

    if (dateRange.from) {
      filtered = filtered.filter(t => {
        if (!t.transaction_date) return false;
        const transactionDate = new Date(t.transaction_date);
        const fromDate = new Date(dateRange.from!);
        
        transactionDate.setHours(0, 0, 0, 0);
        fromDate.setHours(0, 0, 0, 0);

        if (dateRange.to) {
          const toDate = new Date(dateRange.to!);
          toDate.setHours(0, 0, 0, 0);
          return transactionDate >= fromDate && transactionDate <= toDate;
        }
        return transactionDate.getTime() === fromDate.getTime(); 
      });
    }
    setTransactions(filtered);
  }, [allFetchedTransactions, typeFilter, dateRange]);

  const token = localStorage.getItem("access_token");
  
  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      let url = `/api/v1/medicine/transactions?page=${currentPage}&pageSize=${itemsPerPage}`;

      if (localSearchTerm) {
        url += `&search=${encodeURIComponent(localSearchTerm)}`;
      }
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      setAllFetchedTransactions(data.transactions || data || []);
      setTotalPages(data.totalPages || Math.ceil((data.total || 100) / itemsPerPage));
      setTotalItems(data.total || 100);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactions([]);
      setTotalPages(10);
      setTotalItems(97);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    console.log("Exporting transaction data...");
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "import":
      case "in":
        return "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20";
      case "export":
      case "out":
        return "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20";
      case "adjustment":
        return "bg-[#FFA726]/10 text-[#FFA726] border-[#FFA726]/20";
      default:
        return "bg-[#2C78E4]/10 text-[#2C78E4] border-[#2C78E4]/20";
    }
  };

  const clearAllFilters = () => {
    setTypeFilter("all");
    setDateRange({ from: undefined, to: undefined });
    setLocalSearchTerm("");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 font-['Open_Sans',_sans-serif]">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#4B5563]" />
            <Input
              placeholder="Search by medicine name, supplier, or ID..."
              className="pl-10 border-gray-200 focus:border-[#2C78E4] focus:ring-[#2C78E4]/20 rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white"
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-36 border-gray-200 rounded-xl hover:border-[#2C78E4]/40 transition-all duration-200 bg-gray-50">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent className="bg-white rounded-xl shadow-lg border-gray-100">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="import">Stock In</SelectItem>
                <SelectItem value="export">Stock Out</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal border-gray-200 rounded-xl hover:border-[#2C78E4]/40 transition-all duration-200 bg-gray-50",
                    !dateRange.from && "text-[#4B5563]"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-[#2C78E4]" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d")}
                      </>
                    ) : (
                      format(dateRange.from, "MMM d, yyyy")
                    )
                  ) : (
                    <span>Date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white rounded-xl shadow-lg border-gray-100" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange as any}
                  numberOfMonths={2}
                  className="border-0"
                />
              </PopoverContent>
            </Popover>

            {(typeFilter !== "all" || dateRange.from || localSearchTerm) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-[#EF4444] hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-xl transition-all duration-200"
              >
                Clear All
              </Button>
            )}
          </div>
        </div>

        {(typeFilter !== "all" || dateRange.from || localSearchTerm) && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
            <span className="text-sm text-[#4B5563] flex items-center">
              <Filter className="h-3.5 w-3.5 mr-2 text-[#2C78E4]" />
              Active filters:
            </span>
            
            {localSearchTerm && (
              <Badge className="bg-[#2C78E4]/10 text-[#2C78E4] border-[#2C78E4]/20 font-normal rounded-full px-3 py-1">
                Search: "{localSearchTerm}"
              </Badge>
            )}
            
            {typeFilter !== "all" && (
              <Badge className="bg-[#FFA726]/10 text-[#FFA726] border-[#FFA726]/20 font-normal rounded-full px-3 py-1">
                Type: {typeFilter === "import" ? "Stock In" : typeFilter === "export" ? "Stock Out" : typeFilter}
              </Badge>
            )}
            
            {dateRange.from && (
              <Badge className="bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20 font-normal rounded-full px-3 py-1">
                Date: {format(dateRange.from, "MMM d")}
                {dateRange.to && ` - ${format(dateRange.to, "MMM d")}`}
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-[#2C78E4] mx-auto mb-4" />
              <p className="text-[#4B5563] font-medium">Loading transactions...</p>
              <p className="text-sm text-[#6B7280] mt-1">Please wait while we fetch your data</p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-[#F9FAFB] to-gray-50 border-b border-gray-200">
                    <TableHead className="text-[#111827] font-semibold px-6 py-4">Date</TableHead>
                    <TableHead className="text-[#111827] font-semibold px-6 py-4">Medicine</TableHead>
                    <TableHead className="text-[#111827] font-semibold px-6 py-4">Type</TableHead>
                    <TableHead className="text-[#111827] font-semibold px-6 py-4">Quantity</TableHead>
                    <TableHead className="text-[#111827] font-semibold px-6 py-4">Unit Price</TableHead>
                    <TableHead className="text-[#111827] font-semibold px-6 py-4">Total</TableHead>
                    <TableHead className="text-[#111827] font-semibold px-6 py-4">Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions?.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-16 px-6"
                      >
                        <div className="flex flex-col items-center">
                          <div className="bg-[#2C78E4]/10 p-4 rounded-full mb-4">
                            <ShoppingBag className="h-12 w-12 text-[#2C78E4]" />
                          </div>
                          <h3 className="font-semibold text-[#111827] mb-2 text-lg">No transactions found</h3>
                          <p className="text-[#4B5563] mb-4 max-w-sm">
                            {localSearchTerm || typeFilter !== "all" || dateRange.from
                              ? "Try adjusting your filters or search criteria"
                              : "No transactions have been recorded yet"}
                          </p>
                          {(localSearchTerm || typeFilter !== "all" || dateRange.from) && (
                            <Button
                              variant="outline"
                              onClick={clearAllFilters}
                              className="border-[#2C78E4] text-[#2C78E4] hover:bg-[#2C78E4] hover:text-white rounded-xl"
                            >
                              Clear Filters
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions?.map((transaction, index) => (
                      <TableRow 
                        key={transaction.id || index} 
                        className="hover:bg-[#F9FAFB]/60 border-b border-gray-100 transition-colors duration-200"
                      >
                        <TableCell className="text-[#4B5563] px-6 py-4 font-medium">
                          {transaction.transaction_date 
                            ? format(new Date(transaction.transaction_date), "MMM d, yyyy")
                            : format(new Date(), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="font-semibold text-[#111827] px-6 py-4">
                          {transaction.medicine_name || "Sample Medicine"}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Badge
                            variant="outline"
                            className={cn(
                              "rounded-full font-medium px-3 py-1",
                              getTransactionTypeColor(transaction.transaction_type || "import")
                            )}
                          >
                            {transaction.transaction_type === "import" ? "Stock In" :
                             transaction.transaction_type === "export" ? "Stock Out" :
                             transaction.transaction_type || "Stock In"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[#4B5563] px-6 py-4 font-medium">
                          {transaction.quantity || "50"}
                        </TableCell>
                        <TableCell className="text-[#4B5563] px-6 py-4">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND"
                          }).format(transaction.unit_price || 50000)}
                        </TableCell>
                        <TableCell className="font-semibold text-[#111827] px-6 py-4">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND"
                          }).format(transaction.total_amount || 2500000)}
                        </TableCell>
                        <TableCell className="text-[#4B5563] px-6 py-4">
                          {transaction.transaction_type?.toLowerCase() === "import"
                            ? (transaction.supplier_name || "MediCorp Supplier")
                            : transaction.appointment_id && transaction.appointment_id > 0
                            ? (
                              <span className="text-[#2C78E4] hover:underline transition-all duration-200 cursor-pointer">
                                Appointment #{transaction.appointment_id}
                              </span>
                            )
                            : "Internal Transfer"}
                        </TableCell>
                        
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="py-4 px-6 border-t border-gray-100 bg-gradient-to-r from-[#F9FAFB] to-gray-50">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  showItemsPerPage={true}
                  className="text-sm"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
