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
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="p-6">
      {/* Search and filters section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-indigo-900 flex items-center">
          <ShoppingBag className="h-5 w-5 mr-2 text-indigo-600" />
          Transaction History
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="h-9 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
        >
          <FileDownIcon className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6 bg-indigo-50 p-3 rounded-md border border-indigo-100">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-400" />
          <Input
            placeholder="Search transactions..."
            className="pl-10 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
          />
        </div>

        {/* Transaction Type Filter */}
        <div className="w-40">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-9 border-indigo-200">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="bg-white">
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
                "w-[240px] justify-start text-left font-normal h-9 border-indigo-200",
                !dateRange.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
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
          <PopoverContent className="w-auto p-0 bg-white" align="start">
            <Calendar
              initialFocus
              mode="range"
              selected={dateRange}
              onSelect={setDateRange as any}
              numberOfMonths={2}
              className="border rounded-md"
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
            className="h-9 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <>
          <div className="rounded-md border border-indigo-100 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-indigo-50">
                  <TableHead>Date</TableHead>
                  <TableHead>Medicine</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Supplier/Prescription</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions?.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-gray-500"
                    >
                      No transactions found with the current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions?.map((transaction) => (
                    <TableRow key={transaction.id} className="hover:bg-gray-50">
                      <TableCell>
                        {new Date(transaction.transaction_date).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell className="font-medium">
                        {transaction.medicine_name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            getTransactionTypeColor(transaction.transaction_type)
                          )}
                        >
                          {transaction.transaction_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.quantity}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND"
                        }).format(transaction.unit_price)}
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND"
                        }).format(transaction.total_amount)}
                      </TableCell>
                      <TableCell>
                        {transaction.transaction_type.toLowerCase() === "import"
                          ? transaction.supplier_name
                          : transaction.appointment_id > 0
                          ? `Appointment #${transaction.appointment_id}`
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  );
};

export default TransactionHistory;
