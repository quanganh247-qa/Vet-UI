import React, { useState, useMemo, useEffect } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, MoreVertical, Loader2, Pencil, Trash, Users, Search } from "lucide-react";
import { MedicineSupplierResponse } from "@/types";
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from "@/hooks/use-supplier";
import Pagination from "@/components/ui/pagination";

interface SupplierListProps {
  searchQuery: string;
}

const SupplierList: React.FC<SupplierListProps> = ({ searchQuery }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSupplier, setSelectedSupplier] = useState<MedicineSupplierResponse | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const pageSize = 10;

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    contact_name: "",
    notes: "",
  });

  // Use the search query from props when it changes
  React.useEffect(() => {
    if (searchQuery) {
      setLocalSearchTerm(searchQuery);
    }
  }, [searchQuery]);

  // Use the custom hooks
  const { data: suppliersData, isLoading } = useSuppliers(currentPage, pageSize);
  const createSupplierMutation = useCreateSupplier();
  const updateSupplierMutation = useUpdateSupplier();
  const deleteSupplierMutation = useDeleteSupplier();

  // Update totalPages when supplier data changes
  useEffect(() => {
    if (suppliersData?.meta) {
      setTotalPages(suppliersData.meta.totalPages || 1);
    }
  }, [suppliersData]);

  // Filter suppliers based on search query
  const suppliers = useMemo(() => {
    if (!suppliersData?.data || !Array.isArray(suppliersData.data)) {
      return [];
    }
    
    return suppliersData.data.filter((supplier: MedicineSupplierResponse) => {
      if (!localSearchTerm) return true;
      const searchLower = localSearchTerm.toLowerCase();
      const matchesName = supplier.name?.toLowerCase().includes(searchLower) || false;
      const matchesContact = supplier.contact_name?.toLowerCase().includes(searchLower) || false;
      const matchesEmail = supplier.email?.toLowerCase().includes(searchLower) || false;
      return matchesName || matchesContact || matchesEmail;
    });
  }, [suppliersData, localSearchTerm]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSupplier = async () => {
    try {
      await createSupplierMutation.mutateAsync(formData);
      resetForm();
    } catch (error) {
      console.error("Error in handleAddSupplier:", error);
    }
  };

  const handleUpdateSupplier = async () => {
    if (!selectedSupplier) return;
    try {
      await updateSupplierMutation.mutateAsync({
        id: selectedSupplier.id,
        data: formData
      });
      resetForm();
      setSelectedSupplier(null);
      setIsEditing(false);
    } catch (error) {
      console.error("Error in handleUpdateSupplier:", error);
    }
  };

  const handleDeleteSupplier = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this supplier?")) return;
    try {
      await deleteSupplierMutation.mutateAsync(id);
    } catch (error) {
      console.error("Error in handleDeleteSupplier:", error);
    }
  };

  const handleEditClick = (supplier: MedicineSupplierResponse) => {
    setSelectedSupplier(supplier);
    setFormData({
      name: supplier.name,
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
      contact_name: supplier.contact_name || "",
      notes: supplier.notes || "",
    });
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      contact_name: "",
      notes: "",
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-indigo-900 flex items-center">
          <Users className="h-5 w-5 mr-2 text-indigo-600" />
          Suppliers
        </h2>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white sm:max-w-[500px] border border-indigo-100">
            <DialogHeader className="border-b border-indigo-100 pb-3">
              <DialogTitle className="text-indigo-900">Add New Supplier</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Supplier Name*</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter supplier name"
                  className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email address"
                    className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Phone number"
                    className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Full address"
                  className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contact_name">Contact Person</Label>
                <Input
                  id="contact_name"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleInputChange}
                  placeholder="Contact person name"
                  className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Additional notes"
                  rows={3}
                  className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
            <DialogFooter className="border-t border-indigo-100 pt-3">
              <DialogClose asChild>
                <Button variant="outline" className="border-indigo-200 text-indigo-600 hover:bg-indigo-50">Cancel</Button>
              </DialogClose>
              <Button
                onClick={handleAddSupplier}
                disabled={!formData.name}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Add Supplier
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Supplier Dialog */}
        <Dialog
          open={isEditing}
          onOpenChange={(open) => !open && setIsEditing(false)}
        >
          <DialogContent className="bg-white sm:max-w-[500px] border border-indigo-100">
            <DialogHeader className="border-b border-indigo-100 pb-3">
              <DialogTitle className="text-indigo-900">Edit Supplier</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Supplier Name*</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter supplier name"
                  className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email address"
                    className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Phone number"
                    className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Full address"
                  className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-contact_name">Contact Person</Label>
                <Input
                  id="edit-contact_name"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleInputChange}
                  placeholder="Contact person name"
                  className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Additional notes"
                  rows={3}
                  className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
            <DialogFooter className="border-t border-indigo-100 pt-3">
              <Button variant="outline" onClick={() => setIsEditing(false)} className="border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                Cancel
              </Button>
              <Button
                onClick={handleUpdateSupplier}
                disabled={!formData.name}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Update Supplier
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search box */}
      <div className="flex flex-wrap gap-3 mb-6 bg-indigo-50 p-3 rounded-md border border-indigo-100">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-400" />
          <Input
            placeholder="Search suppliers..."
            className="pl-10 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
          />
        </div>
        
        {localSearchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocalSearchTerm("")}
            className="h-9 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
          >
            Clear Search
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
                  <TableHead>Supplier Name</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      Loading suppliers...
                    </TableCell>
                  </TableRow>
                ) : !suppliers || suppliers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No suppliers found. Add a new supplier to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  suppliers.map((supplier: MedicineSupplierResponse) => (
                    <TableRow key={supplier.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-indigo-900">
                        {supplier.name}
                      </TableCell>
                      <TableCell>{supplier.contact_name}</TableCell>
                      <TableCell>{supplier.phone}</TableCell>
                      <TableCell>{supplier.email}</TableCell>
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
                              onSelect={() => handleEditClick(supplier)}
                              className="cursor-pointer"
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600 cursor-pointer" onSelect={() => handleDeleteSupplier(supplier.id)}>
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

export default SupplierList;
