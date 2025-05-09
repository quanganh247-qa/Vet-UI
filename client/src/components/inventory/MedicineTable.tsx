import React, { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
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
} from "lucide-react";
import { useLocation } from "wouter";
import { Progress } from "@/components/ui/progress";
import { useGetAllMedicines } from "@/hooks/use-medicine";
import api from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useImportMedicine, useExportMedicine } from "@/hooks/use-medicine-transaction";
import Pagination from "@/components/ui/pagination";

interface Medicine {
  id: number;
  medicine_name: string;
  supplier_id: number;
  dosage: string;
  category: string;
  current_stock: number;
  reorder_level: number;
  unit_price: number;
  expiration_date: string;
  supplier_name: string;
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

  // Use the API hook with pagination and search parameters
  const { data: medicinesResponse, isLoading, error } = useGetAllMedicines(currentPage, pageSize, localSearchTerm);
  const importMedicineMutation = useImportMedicine();
  const exportMedicineMutation = useExportMedicine();

  // Extract medicines from response
  const medicines = medicinesResponse?.data || [];

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
  };

  const handleAdjustQuantity = async () => {
    if (!selectedMedicine) return;

    try {
      setIsSubmitting(true);
      const transactionData = {
        medicine_id: selectedMedicine.id,
        quantity: adjustQuantity,
        unit_price: selectedMedicine.unit_price,
        supplier_id: selectedMedicine.supplier_id,
        expiration_date: selectedMedicine.expiration_date,
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

  const getStockLevelColor = (current: number, reorderLevel: number) => {
    if (current <= 0) return "bg-red-500";
    if (current < reorderLevel) return "bg-amber-500";
    if (current < reorderLevel * 2) return "bg-blue-500";
    return "bg-green-500";
  };

  const getStockLevelPercentage = (current: number, reorderLevel: number) => {
    if (current <= 0) return 0;
    if (current >= reorderLevel * 3) return 100;
    return Math.min(100, Math.round((current / (reorderLevel * 3)) * 100));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND"
    }).format(amount);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
       
        <div className="flex items-center gap-2">
          <div className="relative w-64 mr-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-400" />
            <Input
              placeholder="Search medicines..."
              className="pl-10 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
            />
          </div>
          <Button
            onClick={() => onEditMedicine({} as Medicine)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Medicine
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
                  <TableHead>Name</TableHead>
                  <TableHead>Stock Level</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Expiration</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medicines?.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-gray-500"
                    >
                      No medicines found. Add a new medicine to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  medicines?.map((medicine: Medicine) => (
                    <TableRow key={medicine.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="font-medium text-indigo-900">{medicine.medicine_name}</div>
                        {medicine.dosage && (
                          <div className="text-sm text-gray-500">
                            {medicine.dosage}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {medicine.current_stock} units
                            </span>
                            <span className="text-xs text-gray-500">
                              Reorder at {medicine.reorder_level}
                            </span>
                          </div>
                          <Progress
                            value={getStockLevelPercentage(
                              medicine.current_stock,
                              medicine.reorder_level
                            )}
                            className={getStockLevelColor(
                              medicine.current_stock,
                              medicine.reorder_level
                            )}
                          />
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(medicine.unit_price)}</TableCell>
                      <TableCell>
                        {new Date(
                          medicine.expiration_date
                        ).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell>{medicine.supplier_name}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white">
                            <DropdownMenuItem
                              onSelect={() => handleViewDetails(medicine.id)}
                              className="cursor-pointer"
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => handleOpenAdjustQuantity(medicine)}
                              className="cursor-pointer"
                            >
                              <PlusCircle className="mr-2 h-4 w-4" />
                              Adjust Quantity
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() =>
                                handleViewTransactions(medicine.id)
                              }
                              className="cursor-pointer"
                            >
                              <History className="mr-2 h-4 w-4" />
                              Transaction History
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => onEditMedicine(medicine)}
                              className="cursor-pointer"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600 cursor-pointer" 
                              onSelect={() => handleDeleteMedicine(medicine.id)}
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
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              className="mt-4"
            />
          )}
        </>
      )}

      {/* Adjust Quantity Dialog */}
      <Dialog
        open={adjustQuantityDialogOpen}
        onOpenChange={setAdjustQuantityDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px] bg-white border border-indigo-100">
          <DialogHeader className="border-b border-indigo-100 pb-3">
            <DialogTitle className="text-indigo-900">Adjust Inventory Quantity</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedMedicine && (
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-medium text-indigo-900">{selectedMedicine.medicine_name}</h3>
                  <p className="text-sm text-gray-500">
                    {selectedMedicine.dosage}
                  </p>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Current Stock: {selectedMedicine.current_stock}
                </Badge>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="add"
                  name="adjustmentType"
                  value="add"
                  checked={adjustmentType === "add"}
                  onChange={() => setAdjustmentType("add")}
                  className="h-4 w-4 text-indigo-600"
                />
                <Label htmlFor="add">Add Stock</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="remove"
                  name="adjustmentType"
                  value="remove"
                  checked={adjustmentType === "remove"}
                  onChange={() => setAdjustmentType("remove")}
                  className="h-4 w-4 text-indigo-600"
                />
                <Label htmlFor="remove">Remove Stock</Label>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="adjustQuantity">Quantity</Label>
              <Input
                id="adjustQuantity"
                type="number"
                min="1"
                value={adjustQuantity || ""}
                onChange={(e) =>
                  setAdjustQuantity(parseInt(e.target.value) || 0)
                }
                className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="adjustmentReason">Reason</Label>
              <Input
                id="adjustmentReason"
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                placeholder="Enter reason for adjustment"
                className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
          <DialogFooter className="border-t border-indigo-100 pt-3">
            <Button
              variant="outline"
              onClick={() => setAdjustQuantityDialogOpen(false)}
              className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdjustQuantity}
              disabled={
                adjustQuantity <= 0 || !adjustmentReason || isSubmitting
              }
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {adjustmentType === "add" ? "Add Stock" : "Remove Stock"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MedicineTable;
