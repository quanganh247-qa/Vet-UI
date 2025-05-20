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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  
  // Use the search query from props when it changes
  useEffect(() => {
    if (searchQuery) {
      setLocalSearchTerm(searchQuery);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, localSearchTerm, typeFilter, dateRange]);

  const token = localStorage.getItem("access_token");
  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      let url = `/api/v1/medicine/transactions?page=${currentPage}&pageSize=10`;

      // Add filters to the URL
      if (localSearchTerm) {
        url += `&search=${encodeURIComponent(localSearchTerm)}`;
      }
      
      if (typeFilter !== "all") {
        url += `&type=${encodeURIComponent(typeFilter)}`;
      }
      
      if (dateRange.from) {
        url += `&startDate=${format(dateRange.from, "yyyy-MM-dd")}`;
        if (dateRange.to) {
          url += `&endDate=${format(dateRange.to, "yyyy-MM-dd")}`;
        }
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      setTransactions(data);
      setTotalPages(5); // Placeholder, replace with actual data
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    // Implement export functionality
    console.log("Exporting transaction data...");
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "import":
        return "bg-green-100 text-green-800 border-green-200";
      case "export":
        return "bg-[#2C78E4]/10 text-[#2C78E4] border-[#2C78E4]/20";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6 font-['Open_Sans',_sans-serif]">
    
      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-md border border-[#F9FAFB] p-5">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#4B5563]" />
            <Input
              placeholder="Search transactions..."
              className="pl-10 border-[#2C78E4]/20 focus:border-[#2C78E4] focus:ring-[#2C78E4]/20 rounded-xl transition-all duration-200"
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
            />
          </div>

          {/* Transaction Type Filter */}
          <div className="w-40">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="border-[#2C78E4]/20 rounded-xl hover:border-[#2C78E4]/40 transition-all duration-200">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent className="bg-white rounded-xl shadow-lg">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="import">Import</SelectItem>
                <SelectItem value="export">Export</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal border-[#2C78E4]/20 rounded-xl hover:border-[#2C78E4]/40 transition-all duration-200",
                  !dateRange.from && "text-[#4B5563]"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-[#2C78E4]" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "MMM d, yyyy")} -{" "}
                      {format(dateRange.to, "MMM d, yyyy")}
                    </>
                  ) : (
                    format(dateRange.from, "MMM d, yyyy")
                  )
                ) : (
                  <span>Select date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white rounded-xl shadow-lg" align="start">
              <Calendar
                initialFocus
                mode="range"
                selected={dateRange}
                onSelect={setDateRange as any}
                numberOfMonths={2}
                className="border rounded-lg"
              />
            </PopoverContent>
          </Popover>

          {/* Clear Filters Button */}
          {(typeFilter !== "all" || dateRange.from || localSearchTerm) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTypeFilter("all");
                setDateRange({ from: undefined, to: undefined });
                setLocalSearchTerm("");
              }}
              className="text-[#2C78E4] hover:text-[#2C78E4] hover:bg-[#2C78E4]/10 rounded-xl transition-all duration-200"
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {(typeFilter !== "all" || dateRange.from || localSearchTerm) && (
          <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-[#F9FAFB]">
            <span className="text-sm text-[#4B5563] flex items-center">
              <Filter className="h-3.5 w-3.5 mr-1.5 text-[#2C78E4]" />
              Active filters:
            </span>
            
            {localSearchTerm && (
              <Badge className="bg-[#F9FAFB] text-[#4B5563] border-[#F9FAFB] font-normal rounded-full px-3 py-1 hover:bg-[#F9FAFB]/80 transition-all duration-200">
                Search: {localSearchTerm}
              </Badge>
            )}
            
            {typeFilter !== "all" && (
              <Badge className="bg-[#F9FAFB] text-[#4B5563] border-[#F9FAFB] font-normal rounded-full px-3 py-1 hover:bg-[#F9FAFB]/80 transition-all duration-200">
                Type: {typeFilter}
              </Badge>
            )}
            
            {dateRange.from && (
              <Badge className="bg-[#F9FAFB] text-[#4B5563] border-[#F9FAFB] font-normal rounded-full px-3 py-1 hover:bg-[#F9FAFB]/80 transition-all duration-200">
                Date: {format(dateRange.from, "MMM d")}
                {dateRange.to && ` - ${format(dateRange.to, "MMM d")}`}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl shadow-md border border-[#F9FAFB] overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-[#2C78E4]" />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F9FAFB]">
                  <TableHead className="text-[#111827] font-medium">Date</TableHead>
                  <TableHead className="text-[#111827] font-medium">Medicine</TableHead>
                  <TableHead className="text-[#111827] font-medium">Type</TableHead>
                  <TableHead className="text-[#111827] font-medium">Quantity</TableHead>
                  <TableHead className="text-[#111827] font-medium">Unit Price</TableHead>
                  <TableHead className="text-[#111827] font-medium">Total</TableHead>
                  <TableHead className="text-[#111827] font-medium">Supplier/Prescription</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions?.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-12 text-[#4B5563]"
                    >
                      <div className="flex flex-col items-center">
                        <ShoppingBag className="h-12 w-12 text-[#2C78E4]/30 mb-4" />
                        <p className="font-medium text-[#111827] mb-2">No transactions found</p>
                        <p className="text-sm">Try adjusting your filters or search term</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions?.map((transaction) => (
                    <TableRow key={transaction.id} className="hover:bg-[#F9FAFB]/50 border-b border-[#F9FAFB] transition-colors duration-200">
                      <TableCell className="text-[#4B5563]">
                        {format(new Date(transaction.transaction_date), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="font-medium text-[#111827]">
                        {transaction.medicine_name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-full font-medium px-3 py-1",
                            getTransactionTypeColor(transaction.transaction_type)
                          )}
                        >
                          {transaction.transaction_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[#4B5563]">{transaction.quantity}</TableCell>
                      <TableCell className="text-[#4B5563]">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND"
                        }).format(transaction.unit_price)}
                      </TableCell>
                      <TableCell className="font-medium text-[#111827]">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND"
                        }).format(transaction.total_amount)}
                      </TableCell>
                      <TableCell className="text-[#4B5563]">
                        {transaction.transaction_type.toLowerCase() === "import"
                          ? transaction.supplier_name
                          : transaction.appointment_id > 0
                          ? <span className="text-[#2C78E4] hover:underline transition-all duration-200">Appointment #{transaction.appointment_id}</span>
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* {totalPages > 1 && (
              <div className="py-4 px-6 border-t border-[#F9FAFB]">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )} */}
          </>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
