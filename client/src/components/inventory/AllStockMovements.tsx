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
import { Loader2, Search, Download, Package, Filter, Calendar } from "lucide-react";
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
        return "bg-[#2C78E4]/10 text-[#2C78E4] border-[#2C78E4]/20";
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
      return new Intl.DateTimeFormat('en-US', {
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
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#F9FAFB] p-5">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#4B5563]" />
            <Input
              placeholder="Search by ID or reason..."
              className="pl-10 border-[#2C78E4]/20 focus:border-[#2C78E4] focus:ring-[#2C78E4]/20 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Movement Type Filter */}
          <div className="w-40">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="border-[#2C78E4]/20 rounded-xl">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent className="bg-white rounded-xl">
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
              className="text-[#2C78E4] hover:text-[#2C78E4] hover:bg-[#2C78E4]/10 rounded-xl"
            >
              Clear Filters
            </Button>
          )}

          <div className="ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="border-[#2C78E4]/20 text-[#2C78E4] hover:bg-[#2C78E4]/10 rounded-xl"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Active Filters Display */}
        {(typeFilter !== "all" || searchTerm) && (
          <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-[#F9FAFB]">
            <span className="text-sm text-[#4B5563] flex items-center">
              <Filter className="h-3.5 w-3.5 mr-1.5 text-[#2C78E4]" />
              Active filters:
            </span>
            
            {searchTerm && (
              <Badge className="bg-[#F9FAFB] text-[#4B5563] border-[#F9FAFB] font-normal rounded-full">
                Search: {searchTerm}
              </Badge>
            )}
            
            {typeFilter !== "all" && (
              <Badge className="bg-[#F9FAFB] text-[#4B5563] border-[#F9FAFB] font-normal rounded-full">
                Type: {typeFilter}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Stock Movements Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#F9FAFB] overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-[#2C78E4]" />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F9FAFB]">
                  <TableHead className="text-[#111827] font-medium">Product ID</TableHead>
                  <TableHead className="text-[#111827] font-medium">Type</TableHead>
                  <TableHead className="text-[#111827] font-medium">Quantity</TableHead>
                  <TableHead className="text-[#111827] font-medium">Price</TableHead>
                  <TableHead className="text-[#111827] font-medium">Current Stock</TableHead>
                  <TableHead className="text-[#111827] font-medium">Reason</TableHead>
                  <TableHead className="text-[#111827] font-medium">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovements.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-12 text-[#4B5563]"
                    >
                      <div className="flex flex-col items-center">
                        <Package className="h-10 w-10 text-[#2C78E4]/30 mb-3" />
                        <p className="font-medium text-[#111827] mb-1">No stock movements found</p>
                        <p className="text-sm">Try adjusting your filters or search term</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedMovements().map((movement: ProductStockMovementResponse) => (
                    <TableRow key={movement.id} className="hover:bg-[#F9FAFB]/50 border-b border-[#F9FAFB]">
                      <TableCell className="font-medium text-[#111827]">
                        {movement.product_id}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-full font-medium",
                            getMovementTypeColor(movement.movement_type)
                          )}
                        >
                          {movement.movement_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[#4B5563]">{movement.quantity}</TableCell>
                      <TableCell className="text-[#4B5563]">{formatCurrency(movement.price)}</TableCell>
                      <TableCell className="font-medium text-[#111827]">{movement.current_stock}</TableCell>
                      <TableCell className="max-w-[150px] truncate text-[#4B5563]">
                        {movement.reason || "-"}
                      </TableCell>
                      <TableCell className="text-[#4B5563] text-sm flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1.5 text-[#2C78E4]/60" />
                        {formatDate(movement.movement_date)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            
            {totalPages > 1 && (
              <div className="py-4 px-6 border-t border-[#F9FAFB]">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AllStockMovements; 