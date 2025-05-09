import React, { useState, useEffect } from "react";
import { useAllProductStockMovements } from "@/hooks/use-product";
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
import { Loader2, Search, FileDownIcon, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductStockMovementResponse } from "@/services/product-services";
import Pagination from "@/components/ui/pagination";

interface ApiResponse {
  code: string;
  data: ProductStockMovementResponse[];
  message: string;
}

const AllStockMovements: React.FC = () => {
  const { movements, isLoading, error } = useAllProductStockMovements();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Debug the movements data when it changes
  useEffect(() => {
    console.log("Movements in component:", movements);
  }, [movements]);

  // Determine if we have movements in the data property or directly
  const hasMovementsData = movements && typeof movements === 'object' && 'data' in movements && Array.isArray(movements.data);
  
  // Get the correct movements array regardless of structure
  const movementsArray = hasMovementsData 
    ? (movements as unknown as ApiResponse).data 
    : Array.isArray(movements) 
      ? movements 
      : [];
  
  // Filter movements based on search term and type
  const filteredMovements = movementsArray.filter((movement: ProductStockMovementResponse) => {
    // Filter by type
    if (typeFilter !== "all" && movement.movement_type !== typeFilter) {
      return false;
    }
    
    // Filter by search term (if any)
    if (searchTerm.trim() !== "") {
      const searchLower = searchTerm.toLowerCase();
      const productIdMatch = String(movement.product_id).includes(searchLower);
      const reasonMatch = movement.reason?.toLowerCase().includes(searchLower) || false;
      
      return productIdMatch || reasonMatch;
    }
    
    return true;
  });

  const getMovementTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "import":
        return "bg-green-100 text-green-800 border-green-200";
      case "export":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleExport = () => {
    // Implement export functionality
    console.log("Exporting stock movements data...");
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      }).format(date);
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };

  // Format currency
  const formatCurrency = (amount: number | null | undefined) => {
    if (amount == null) return "-";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND"
    }).format(amount);
  };

  // Get paginated data
  const paginatedMovements = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredMovements.slice(startIndex, endIndex);
  };
  
  const totalPages = Math.ceil(filteredMovements.length / itemsPerPage);

  return (
    <div className="p-6">

      {/* Search and filters section */}
      <div className="flex flex-wrap gap-3 mb-6 bg-indigo-50 p-3 rounded-md border border-indigo-100">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-400" />
          <Input
            placeholder="Search by ID or reason..."
            className="pl-10 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Movement Type Filter */}
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

        {/* Clear Filters Button */}
        {(typeFilter !== "all" || searchTerm) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setTypeFilter("all");
              setSearchTerm("");
            }}
            className="h-9 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
          >
            Clear Filters
          </Button>
        )}

        <div className="ml-auto">
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
                  <TableHead>Product ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovements.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-gray-500"
                    >
                      No stock movements found with the current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedMovements().map((movement: ProductStockMovementResponse) => (
                    <TableRow key={movement.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {movement.product_id}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            getMovementTypeColor(movement.movement_type)
                          )}
                        >
                          {movement.movement_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{movement.quantity}</TableCell>
                      <TableCell>{formatCurrency(movement.price)}</TableCell>
                      <TableCell className="font-medium">{movement.current_stock}</TableCell>
                      <TableCell className="max-w-[150px] truncate">
                        {movement.reason || "-"}
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm">
                        {formatDate(movement.movement_date)}
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

export default AllStockMovements; 