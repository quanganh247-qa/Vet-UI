import React, { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { useQueryClient, useQuery } from "@tanstack/react-query";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MoreVertical,
  Edit,
  Trash,
  PlusCircle,
  ExternalLink,
  History,
  Loader2,
  Pill,
  Search,
  AlertCircle,
} from "lucide-react";
import { useLocation } from "wouter";
import { Progress } from "@/components/ui/progress";
import { useGetAllMedicines } from "@/hooks/use-medicine";
import api from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useImportMedicine, useExportMedicine } from "@/hooks/use-medicine-transaction";
import Pagination from "@/components/ui/pagination";
import { getAllMedicines } from "@/services/treament-services";

interface Medicine {
  id: number;
  medicine_name: string;
  supplier_id?: number;
  dosage: string;
  frequency?: string;
  duration?: string;
  category?: string;
  current_stock?: number;
  reorder_level?: number;
  unit_price?: number;
  expiration_date?: string;
  supplier_name?: string;
  notes?: string;
  administrationRoute?: string;
  sideEffects?: string;
  price?: number;
  stock?: number;
}

interface MedicineTableProps {
  searchQuery: string;
  onEditMedicine: (medicine: Medicine) => void;
}

const MedicineTable: React.FC<MedicineTableProps> = ({ searchQuery, onEditMedicine }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [adjustQuantityDialogOpen, setAdjustQuantityDialogOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [totalMedicines, setTotalMedicines] = useState(0);
  const [adjustQuantity, setAdjustQuantity] = useState(0);
  const [adjustmentType, setAdjustmentType] = useState("add");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLocation] = useLocation();
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const pageSize = 10;

  // Use the API hook with pagination and search parameters - fix query function format
  const { data: medicinesResponse, isLoading, error } = useQuery({
    queryKey: ['medicines', currentPage, pageSize, localSearchTerm],
    queryFn: () => getAllMedicines(currentPage, pageSize),
    staleTime: 300000, // Consider data fresh for 5 minutes
  });
  const importMedicineMutation = useImportMedicine();
  const exportMedicineMutation = useExportMedicine();

  // Extract medicines from response - add better debugging
  console.log("Medicine response:", medicinesResponse);
  
  // Direct approach to get the medicines array
  let medicines: Medicine[] = [];
  
  if (medicinesResponse) {
    // Direct approach - just use the array if the response itself is an array
    if (Array.isArray(medicinesResponse)) {
      medicines = medicinesResponse;
    }
    // Check if the response is an object with any kind of array property
    else if (typeof medicinesResponse === 'object') {
      // See if there's a direct array we can use
      Object.entries(medicinesResponse).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length > 0) {
          console.log(`Found array in property '${key}' with ${value.length} items`);
          medicines = value as Medicine[];
        }
      });
    }
  }
  
  console.log("Final medicines to render:", medicines);

  // Use the search query from props when it changes
  useEffect(() => {
    if (searchQuery) {
      setLocalSearchTerm(searchQuery);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (medicinesResponse?.meta) {
      setTotalPages(medicinesResponse.meta.totalPages || 1);
      if (medicinesResponse.meta.total) {
        setTotalMedicines(medicinesResponse.meta.total);
      }
    }
  }, [medicinesResponse]);

  const handleViewDetails = (medicineId: number) => {
    setLocation(`/inventory/medicines/${medicineId}`);
  };

  const handleViewTransactions = (medicineId: number) => {
    setLocation(`/inventory/medicines/${medicineId}/transactions`);
  };

  const handleOpenAdjustQuantity = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setAdjustQuantity(0);
    setAdjustmentType("add");
    setAdjustmentReason("");
    setAdjustQuantityDialogOpen(true);
    console.log("Selected medicine for adjustment:", medicine);
  };

  const handleAdjustQuantity = async () => {
    if (!selectedMedicine) return;

    try {
      setIsSubmitting(true);
      const transactionData = {
        medicine_id: selectedMedicine.id,
        quantity: adjustQuantity,
        unit_price: selectedMedicine.unit_price || selectedMedicine.price || 0,
        supplier_id: selectedMedicine.supplier_id || 0,
        expiration_date: selectedMedicine.expiration_date || new Date().toISOString(),
        notes: adjustmentReason,
        prescription_id: 0,
        appointment_id: 0,
        transaction_type: adjustmentType === "add" ? "import" : "export"
      };

      if (adjustmentType === "add") {
        await importMedicineMutation.mutateAsync(transactionData);
        toast({
          title: "Stock Updated",
          description: `Added ${adjustQuantity} units to ${selectedMedicine.medicine_name}`,
          className: "bg-green-50 text-green-800 border-green-200",
        });
      } else {
        await exportMedicineMutation.mutateAsync(transactionData);
        toast({
          title: "Stock Updated",
          description: `Removed ${adjustQuantity} units from ${selectedMedicine.medicine_name}`,
          className: "bg-blue-50 text-blue-800 border-blue-200",
        });
      }

      setAdjustQuantityDialogOpen(false);
    } catch (error) {
      console.error("Error adjusting quantity:", error);
      toast({
        title: "Error",
        description: "Failed to adjust stock quantity",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMedicine = async (medicineId: number) => {
    if (!confirm('Are you sure you want to delete this medicine?')) return;
    
    try {
      await api.delete(`/api/v1/medicine/${medicineId}`);
      toast({
        title: "Success",
        description: "Medicine deleted successfully",
        className: "bg-green-50 text-green-800 border-green-200",
      });
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
    } catch (error) {
      console.error("Error deleting medicine:", error);
      toast({
        title: "Error",
        description: "Failed to delete medicine",
        variant: "destructive",
      });
    }
  };

  const getStockLevelColor = (current: number | undefined, reorderLevel: number | undefined) => {
    const stockValue = current ?? 0;
    const minLevel = reorderLevel ?? 5; // Default reorder level if undefined
    if (stockValue <= 0) return "bg-red-500";
    if (stockValue < minLevel) return "bg-yellow-500";
    if (stockValue < minLevel * 2) return "bg-[#2C78E4]";
    return "bg-green-500";
  };

  const getStockLevelPercentage = (current: number | undefined, reorderLevel: number | undefined) => {
    const stockValue = current ?? 0;
    const minLevel = reorderLevel ?? 5; // Default reorder level if undefined
    if (stockValue <= 0) return 0;
    if (stockValue >= minLevel * 3) return 100;
    return Math.min(100, Math.round((stockValue / (minLevel * 3)) * 100));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND"
    }).format(amount);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="relative w-64 mr-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#2C78E4]" />
            <Input
              placeholder="Search medicines..."
              className="pl-10 border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-lg"
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
            />
          </div>
          <Button
            onClick={() => onEditMedicine({} as Medicine)}
            className="bg-[#2C78E4] hover:bg-[#1E40AF] text-white rounded-lg"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Medicine
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-[#2C78E4]" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-48 p-6 bg-red-50 rounded-xl border border-red-200">
          <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
          <h3 className="text-red-600 font-medium">Error loading medicines</h3>
          <p className="text-red-500 text-sm mt-1">{String(error)}</p>
          <pre className="mt-4 p-2 bg-white rounded-lg text-xs text-red-700 max-w-full overflow-auto">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-[#2C78E4]/20 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F0F7FF]">
                  <TableHead className="text-[#2C78E4]">Name</TableHead>
                  <TableHead className="text-[#2C78E4]">Stock Level</TableHead>
                  <TableHead className="text-[#2C78E4]">Price</TableHead>
                  <TableHead className="text-[#2C78E4]">Expiration</TableHead>
                  <TableHead className="text-[#2C78E4]">Supplier</TableHead>
                  <TableHead className="w-[100px] text-[#2C78E4]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(!medicines || medicines.length === 0) ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-32 text-[#2C78E4]/70">
                      <div className="flex flex-col items-center justify-center">
                        <Pill className="h-8 w-8 text-[#2C78E4]/40 mb-2" />
                        <p>No medicines found</p>
                        <div className="mt-2 p-2 bg-[#F0F7FF] rounded-lg text-sm text-[#2C78E4]/70 max-w-lg">
                          <p>Debug info: Data was received but no medicines were found.</p>
                          <p className="mt-1">Response type: {medicinesResponse ? typeof medicinesResponse : 'undefined'}</p>
                          {medicinesResponse && 
                            <details className="mt-2">
                              <summary className="cursor-pointer">View raw data</summary>
                              <pre className="mt-2 p-2 bg-white rounded-lg text-xs text-[#2C78E4] max-h-40 overflow-auto">
                                {JSON.stringify(medicinesResponse, null, 2)}
                              </pre>
                            </details>
                          }
                        </div>
                        <Button 
                          variant="link" 
                          className="text-[#2C78E4] mt-2"
                          onClick={() => onEditMedicine({} as Medicine)}
                        >
                          Add your first medicine
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  medicines.map((medicine: Medicine) => (
                    <TableRow key={medicine.id} className="hover:bg-[#F0F7FF]/50">
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="text-[#2C78E4]">{medicine.medicine_name}</span>
                          <div className="flex gap-1 mt-1">
                            {medicine.category && (
                              <Badge className="bg-[#F0F7FF] text-[#2C78E4] border-[#2C78E4]/20 text-xs">
                                {medicine.category}
                              </Badge>
                            )}
                            {medicine.dosage && (
                              <Badge variant="outline" className="text-xs border-[#2C78E4]/20 text-[#2C78E4]">
                                {medicine.dosage}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-[#2C78E4]">
                              {(medicine.current_stock || medicine.stock || 0)} units
                            </span>
                            <span className="text-[#2C78E4]/70">
                              Min: {medicine.reorder_level || 5}
                            </span>
                          </div>
                          <Progress 
                            value={getStockLevelPercentage(
                              medicine.current_stock || medicine.stock, 
                              medicine.reorder_level
                            )} 
                            className={`h-2 ${getStockLevelColor(
                              medicine.current_stock || medicine.stock, 
                              medicine.reorder_level
                            )}`} 
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-[#2C78E4]">
                        {formatCurrency(medicine.unit_price || medicine.price || 0)}
                      </TableCell>
                      <TableCell>
                        {medicine.expiration_date ? (
                          new Date(medicine.expiration_date) < new Date() ? (
                            <Badge variant="destructive">Expired</Badge>
                          ) : (
                            <span className="text-[#2C78E4]">
                              {new Date(medicine.expiration_date).toLocaleDateString()}
                            </span>
                          )
                        ) : (
                          <span className="text-[#2C78E4]/50">Not set</span>
                        )}
                      </TableCell>
                      <TableCell className="text-[#2C78E4]">
                        {medicine.supplier_name || "N/A"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-[#2C78E4] hover:bg-[#F0F7FF] rounded-lg">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="border-[#2C78E4]/20 rounded-lg">
                            <DropdownMenuItem 
                              onClick={() => onEditMedicine(medicine)}
                              className="text-[#2C78E4] hover:bg-[#F0F7FF] cursor-pointer"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleOpenAdjustQuantity(medicine)}
                              className="text-[#2C78E4] hover:bg-[#F0F7FF] cursor-pointer"
                            >
                              <History className="mr-2 h-4 w-4" />
                              Adjust Stock
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleViewDetails(medicine.id)}
                              className="text-[#2C78E4] hover:bg-[#F0F7FF] cursor-pointer"
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteMedicine(medicine.id)}
                              className="text-red-600 hover:bg-red-50 cursor-pointer"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center space-y-4 mt-8 pb-4">
              <p className="text-sm text-[#2C78E4] font-medium">
                Page {currentPage} / {totalPages} • Showing {medicines.length} of {totalMedicines} medicines
              </p>
              <div className="flex justify-center items-center space-x-2 bg-[#F0F7FF] px-4 py-3 rounded-lg shadow-sm border border-[#2C78E4]/20">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border-[#2C78E4]/20 text-[#2C78E4] hover:bg-[#F0F7FF]/70 rounded-lg"
                >
                  Previous
                </Button>
                
                {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                  // Calculate which page numbers to show
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = index + 1;
                  } else if (currentPage <= 3) {
                    pageNum = index + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + index;
                  } else {
                    pageNum = currentPage - 2 + index;
                  }
                  
                  return (
                    <Button
                      key={index}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className={
                        currentPage === pageNum
                          ? "bg-[#2C78E4] text-white font-bold hover:bg-[#1E40AF] rounded-lg"
                          : "border-[#2C78E4]/20 text-[#2C78E4] hover:bg-[#F0F7FF]/70 rounded-lg"
                      }
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="border-[#2C78E4]/20 text-[#2C78E4] hover:bg-[#F0F7FF]/70 rounded-lg"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Adjust Quantity Dialog */}
      <Dialog open={adjustQuantityDialogOpen} onOpenChange={setAdjustQuantityDialogOpen}>
        <DialogContent className="sm:max-w-[425px] border border-[#2C78E4]/20 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-[#2C78E4]">Adjust Stock Quantity</DialogTitle>
          </DialogHeader>
          {selectedMedicine && (
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-1">
                <Label className="text-[#2C78E4]">Medicine</Label>
                <p className="font-medium text-[#2C78E4]">{selectedMedicine.medicine_name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-[#F0F7FF] text-[#2C78E4] border-[#2C78E4]/20">
                    Current: {selectedMedicine.current_stock || selectedMedicine.stock || 0} units
                  </Badge>
                  {selectedMedicine.dosage && (
                    <Badge variant="outline" className="text-xs border-[#2C78E4]/20 text-[#2C78E4]">
                      {selectedMedicine.dosage}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col gap-1">
                <Label htmlFor="adjustment-type" className="text-[#2C78E4]">Adjustment Type</Label>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="add"
                      name="adjustment-type"
                      className="text-[#2C78E4] focus:ring-[#2C78E4] mr-2"
                      checked={adjustmentType === "add"}
                      onChange={() => setAdjustmentType("add")}
                    />
                    <Label htmlFor="add" className="text-[#2C78E4] cursor-pointer">Add Stock</Label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="remove"
                      name="adjustment-type"
                      className="text-[#2C78E4] focus:ring-[#2C78E4] mr-2"
                      checked={adjustmentType === "remove"}
                      onChange={() => setAdjustmentType("remove")}
                    />
                    <Label htmlFor="remove" className="text-[#2C78E4] cursor-pointer">Remove Stock</Label>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-1">
                <Label htmlFor="quantity" className="text-[#2C78E4]">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={adjustmentType === "remove" ? selectedMedicine.current_stock || selectedMedicine.stock || 0 : undefined}
                  value={adjustQuantity || ""}
                  onChange={(e) => setAdjustQuantity(parseInt(e.target.value) || 0)}
                  className="border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-lg"
                />
                {adjustmentType === "remove" && 
                 adjustQuantity > (selectedMedicine?.current_stock || selectedMedicine?.stock || 0) && (
                  <p className="text-xs text-red-500 mt-1">
                    Cannot remove more than current stock
                  </p>
                )}
              </div>
              
              <div className="flex flex-col gap-1">
                <Label htmlFor="reason" className="text-[#2C78E4]">Reason (Optional)</Label>
                <Input
                  id="reason"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder="Reason for stock adjustment"
                  className="border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-lg"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAdjustQuantityDialogOpen(false)}
              className="border-[#2C78E4]/20 text-[#2C78E4] hover:bg-[#F0F7FF] rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdjustQuantity}
              disabled={
                isSubmitting ||
                adjustQuantity <= 0 ||
                (adjustmentType === "remove" && 
                 adjustQuantity > (selectedMedicine?.current_stock || selectedMedicine?.stock || 0))
              }
              className="bg-[#2C78E4] hover:bg-[#1E40AF] text-white rounded-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MedicineTable;
