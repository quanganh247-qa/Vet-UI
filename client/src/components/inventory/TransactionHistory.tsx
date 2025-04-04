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
  SearchIcon,
  FileDownIcon,
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

interface TransactionHistoryProps {
  searchQuery: string;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  searchQuery,
}) => {
  const [transactions, setTransactions] = useState<
    MedicineTransactionResponse[]
  >([]);
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

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, searchQuery, typeFilter, dateRange]);

  const token = localStorage.getItem("access_token");
  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      let url = `/api/v1/medicine/transactions?page=${currentPage}&pageSize=10`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      setTransactions(data);
      // Assuming the API returns a paginated response with total pages
      // setTotalPages(data.totalPages);
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
      case "purchase":
        return "bg-green-100 text-green-800 border-green-200";
      case "sale":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "adjustment":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "return":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "write_off":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Transaction History</h2>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <FileDownIcon className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        {/* Transaction Type Filter */}
        <div className="w-40">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="purchase">Purchase</SelectItem>
              <SelectItem value="sale">Sale</SelectItem>
              <SelectItem value="adjustment">Adjustment</SelectItem>
              <SelectItem value="return">Return</SelectItem>
              <SelectItem value="write_off">Write-off</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[240px] justify-start text-left font-normal h-9",
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
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              selected={dateRange}
              onSelect={setDateRange as any}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        {/* Clear Filters Button */}
        {(typeFilter !== "all" || dateRange.from) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setTypeFilter("all");
              setDateRange({ from: undefined, to: undefined });
            }}
            className="h-9"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
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
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {new Date(
                          transaction.transaction_date
                        ).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {transaction.medicine_name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            getTransactionTypeColor(
                              transaction.transaction_type
                            )
                          )}
                        >
                          {transaction.transaction_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.quantity}</TableCell>
                      <TableCell>
                        ${transaction.unit_price.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        ${transaction.total_amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {transaction.transaction_type.toLowerCase() ===
                        "purchase"
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
            <div className="flex items-center justify-center space-x-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TransactionHistory;
