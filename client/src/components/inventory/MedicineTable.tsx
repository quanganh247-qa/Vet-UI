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
} from "lucide-react";
import { useLocation } from "wouter";
import { Progress } from "@/components/ui/progress";
import { useGetAllMedicines } from "@/hooks/use-medicine";

interface Medicine {
  id: number;
  medicine_name: string;
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
}

const MedicineTable: React.FC<MedicineTableProps> = ({ searchQuery }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [adjustQuantityDialogOpen, setAdjustQuantityDialogOpen] =
    useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(
    null
  );
  const [adjustQuantity, setAdjustQuantity] = useState(0);
  const [adjustmentType, setAdjustmentType] = useState("add");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLocation] = useLocation();

  // Use the API hook with pagination and search parameters
  const { data: medicines, isLoading, error } = useGetAllMedicines();

  console.log("medicines: ", medicines);
  useEffect(() => {
    if (medicines?.meta) {
      setTotalPages(medicines.meta.totalPages);
    }
  }, [medicines]);

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

    setIsSubmitting(true);
    try {
      
      setAdjustQuantityDialogOpen(false);
    } catch (error) {
      console.error("Error adjusting quantity:", error);
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Medicine Inventory</h2>
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
                  <TableHead>Name</TableHead>
                  {/* <TableHead>Category</TableHead> */}
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
                      colSpan={7}
                      className="text-center py-8 text-gray-500"
                    >
                      No medicines found. Add a new medicine to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  medicines?.map((medicine: Medicine) => (
                    <TableRow key={medicine.id}>
                      <TableCell>
                        <div>
                          {/* <div className="font-medium">{medicine.medicine_name}</div> */}
                          <div className="text-sm text-gray-500">
                            {medicine.medicine_name}
                          </div>
                        </div>
                      </TableCell>
                      {/* <TableCell>{medicine.category}</TableCell> */}
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">
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
                      <TableCell>${medicine.unit_price.toFixed(2)}</TableCell>
                      <TableCell>
                        {new Date(
                          medicine.expiration_date
                        ).toLocaleDateString()}
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
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(medicine.id)}
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleOpenAdjustQuantity(medicine)}
                            >
                              <PlusCircle className="mr-2 h-4 w-4" />
                              Adjust Quantity
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleViewTransactions(medicine.id)
                              }
                            >
                              <History className="mr-2 h-4 w-4" />
                              Transaction History
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
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

      {/* Adjust Quantity Dialog */}
      <Dialog
        open={adjustQuantityDialogOpen}
        onOpenChange={setAdjustQuantityDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adjust Inventory Quantity</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedMedicine && (
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-medium">{selectedMedicine.medicine_name}</h3>
                  <p className="text-sm text-gray-500">
                    {selectedMedicine.dosage}
                  </p>
                </div>
                <Badge>Current Stock: {selectedMedicine.current_stock}</Badge>
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
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="adjustmentReason">Reason</Label>
              <Input
                id="adjustmentReason"
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                placeholder="Enter reason for adjustment"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAdjustQuantityDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdjustQuantity}
              disabled={
                adjustQuantity <= 0 || !adjustmentReason || isSubmitting
              }
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
