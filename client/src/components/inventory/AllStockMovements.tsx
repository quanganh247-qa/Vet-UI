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
import { 
  Loader2, 
  Search, 
  Download, 
  Package, 
  Filter, 
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  FileText,
  Eye,
  MoreVertical,
  ArrowUpCircle,
  ArrowDownCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
        return "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20";
      case "export":
        return "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20";
      default:
        return "bg-[#2C78E4]/10 text-[#2C78E4] border-[#2C78E4]/20";
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "import":
        return ArrowUpCircle;
      case "export":
        return ArrowDownCircle;
      default:
        return Package;
    }
  };


  const clearAllFilters = () => {
    setTypeFilter("all");
    setSearchTerm("");
    setCurrentPage(1);
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
    // Convert to whole numbers (remove decimal places)
    const wholeAmount = Math.round(amount);
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0
    }).format(wholeAmount);
  };

  // Get paginated data
  const paginatedMovements = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredMovements.slice(startIndex, endIndex);
  };
  
  const totalPages = Math.ceil(filteredMovements.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 font-['Open_Sans',_sans-serif]">
      {/* Enhanced Filters Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#4B5563]" />
            <Input
              placeholder="Search by product ID or reason..."
              className="pl-10 border-gray-200 focus:border-[#2C78E4] focus:ring-[#2C78E4]/20 rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-3">
            {/* Movement Type Filter */}
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

           

            {/* Clear Filters Button */}
            {(typeFilter !== "all" || searchTerm) && (
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

        {/* Active Filters Display */}
        {(typeFilter !== "all" || searchTerm) && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
            <span className="text-sm text-[#4B5563] flex items-center">
              <Filter className="h-3.5 w-3.5 mr-2 text-[#2C78E4]" />
              Active filters:
            </span>
            
            {searchTerm && (
              <Badge className="bg-[#2C78E4]/10 text-[#2C78E4] border-[#2C78E4]/20 font-normal rounded-full px-3 py-1">
                Search: "{searchTerm}"
              </Badge>
            )}
            
            {typeFilter !== "all" && (
              <Badge className="bg-[#FFA726]/10 text-[#FFA726] border-[#FFA726]/20 font-normal rounded-full px-3 py-1">
                Type: {typeFilter === "import" ? "Stock In" : "Stock Out"}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Stock Movements Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-[#2C78E4] mx-auto mb-4" />
              <p className="text-[#4B5563] font-medium">Loading stock movements...</p>
              <p className="text-sm text-[#6B7280] mt-1">Please wait while we fetch your data</p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-[#F9FAFB] to-gray-50 border-b border-gray-200">
                    <TableHead className="text-[#111827] font-semibold px-6 py-4">Product</TableHead>
                    <TableHead className="text-[#111827] font-semibold px-6 py-4">Movement</TableHead>
                    <TableHead className="text-[#111827] font-semibold px-6 py-4">Quantity</TableHead>
                    <TableHead className="text-[#111827] font-semibold px-6 py-4">Price</TableHead>
                    <TableHead className="text-[#111827] font-semibold px-6 py-4">Current Stock</TableHead>
                    <TableHead className="text-[#111827] font-semibold px-6 py-4">Reason</TableHead>
                    <TableHead className="text-[#111827] font-semibold px-6 py-4">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMovements.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-16 px-6"
                      >
                        <div className="flex flex-col items-center">
                          <div className="bg-[#2C78E4]/10 p-4 rounded-full mb-4">
                            <BarChart3 className="h-12 w-12 text-[#2C78E4]" />
                          </div>
                          <h3 className="font-semibold text-[#111827] mb-2 text-lg">No stock movements found</h3>
                          <p className="text-[#4B5563] mb-4 max-w-sm">
                            {searchTerm || typeFilter !== "all"
                              ? "Try adjusting your filters or search criteria"
                              : "No stock movements have been recorded yet"}
                          </p>
                          {(searchTerm || typeFilter !== "all") && (
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
                    paginatedMovements().map((movement: ProductStockMovementResponse) => {
                      const MovementIcon = getMovementIcon(movement.movement_type);
                      return (
                        <TableRow 
                          key={movement.id} 
                          className="hover:bg-[#F9FAFB]/60 border-b border-gray-100 transition-colors duration-200"
                        >
                          <TableCell className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="bg-[#2C78E4]/10 p-2 rounded-full">
                                <Package className="h-4 w-4 text-[#2C78E4]" />
                              </div>
                              <div>
                                <div className="font-semibold text-[#111827]">{movement.product_name}</div>
                                <div className="text-xs text-[#4B5563]">ID: {movement.product_id}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <MovementIcon className="h-4 w-4 text-[#2C78E4]" />
                              <Badge
                                variant="outline"
                                className={cn(
                                  "rounded-full font-medium",
                                  getMovementTypeColor(movement.movement_type)
                                )}
                              >
                                {movement.movement_type === "import" ? "Stock In" : "Stock Out"}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-[#4B5563] px-6 py-4 font-medium">
                            {movement.quantity}
                          </TableCell>
                          <TableCell className="text-[#4B5563] px-6 py-4">
                            {formatCurrency(movement.price)}
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <div className="flex items-center space-x-1">
                              <span className="font-semibold text-[#111827]">{movement.current_stock}</span>
                              <span className="text-xs text-[#4B5563]">units</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-[#4B5563] px-6 py-4">
                            {movement.reason ? (
                              <div className="max-w-[150px] truncate" title={movement.reason}>
                                {movement.reason}
                              </div>
                            ) : (
                              <span className="text-[#6B7280]">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-[#4B5563] px-6 py-4">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-2 text-[#2C78E4]" />
                              <span className="text-sm">{formatDate(movement.movement_date)}</span>
                            </div>
                          </TableCell>
                         
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="py-4 px-6 border-t border-gray-100 bg-gradient-to-r from-[#F9FAFB] to-gray-50">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredMovements.length}
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

export default AllStockMovements; 