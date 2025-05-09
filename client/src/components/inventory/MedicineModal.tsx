import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateMedicine, useUpdateMedicine } from "../../hooks/use-medicine";
import { toast } from "@/components/ui/use-toast";

interface MedicineRequest {
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  side_effects: string;
  quantity: number;
  expiration_date: string;
  description: string;
  usage: string;
  supplier_id: number;
  unit_price: number;
  reorder_level: number;
}

interface MedicineModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: Partial<MedicineRequest> & { id?: number } | null;
}

const defaultForm: MedicineRequest = {
  medicine_name: "",
  dosage: "",
  frequency: "",
  duration: "",
  side_effects: "",
  quantity: 0,
  expiration_date: "",
  description: "",
  usage: "",
  supplier_id: 0,
  unit_price: 0,
  reorder_level: 0,
};

const MedicineModal: React.FC<MedicineModalProps> = ({ open, onClose, initialData }) => {
  const isEdit = Boolean(initialData && initialData.id);
  const [form, setForm] = useState<MedicineRequest>(defaultForm);
  const [errors, setErrors] = useState<Partial<Record<keyof MedicineRequest, string>>>({});
  const { mutateAsync: createMedicine, isPending: creating } = useCreateMedicine();
  const { mutateAsync: updateMedicine, isPending: updating } = useUpdateMedicine();

  useEffect(() => {
    if (open && initialData) {
      setForm({ ...defaultForm, ...initialData });
      setErrors({});
    } else if (open) {
      setForm(defaultForm);
      setErrors({});
    }
  }, [open, initialData]);

  const validateForm = () => {
    const newErrors: Partial<Record<keyof MedicineRequest, string>> = {};
    
    if (!form.medicine_name) newErrors.medicine_name = "Name is required";
    if (!form.dosage) newErrors.dosage = "Dosage is required";
    if (form.quantity < 0) newErrors.quantity = "Quantity must be positive";
    if (form.unit_price < 0) newErrors.unit_price = "Price must be positive";
    if (!form.expiration_date) newErrors.expiration_date = "Expiration date is required";
    if (form.reorder_level < 0) newErrors.reorder_level = "Reorder level must be positive";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
    // Clear error when field is updated
    if (errors[name as keyof MedicineRequest]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (isEdit && initialData?.id) {
        await updateMedicine({ data: form, medicine_id: initialData.id });
      } else {
        await createMedicine(form);
      }
      onClose();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to save medicine",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Medicine" : "Add Medicine"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="medicine_name">Name</Label>
            <Input id="medicine_name" name="medicine_name" value={form.medicine_name} onChange={handleChange} required />
            {errors.medicine_name && <p className="text-red-500 text-sm">{errors.medicine_name}</p>}
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" value={form.description} onChange={handleChange} required />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" name="quantity" type="number" min={0} value={form.quantity} onChange={handleChange} required />
              {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity}</p>}
            </div>
            <div>
              <Label htmlFor="unit_price">Unit Price</Label>
              <Input id="unit_price" name="unit_price" type="number" min={0} value={form.unit_price} onChange={handleChange} required />
              {errors.unit_price && <p className="text-red-500 text-sm">{errors.unit_price}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="reorder_level">Reorder Level</Label>
              <Input id="reorder_level" name="reorder_level" type="number" min={0} value={form.reorder_level} onChange={handleChange} required />
              {errors.reorder_level && <p className="text-red-500 text-sm">{errors.reorder_level}</p>}
            </div>
            <div>
              <Label htmlFor="expiration_date">Expiration Date</Label>
              <Input id="expiration_date" name="expiration_date" type="date" value={form.expiration_date} onChange={handleChange} required />
              {errors.expiration_date && <p className="text-red-500 text-sm">{errors.expiration_date}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="supplier_id">Supplier ID</Label>
              <Input id="supplier_id" name="supplier_id" type="number" min={0} value={form.supplier_id} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="usage">Usage</Label>
              <Input id="usage" name="usage" value={form.usage} onChange={handleChange} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="dosage">Dosage</Label>
              <Input id="dosage" name="dosage" value={form.dosage} onChange={handleChange} required />
              {errors.dosage && <p className="text-red-500 text-sm">{errors.dosage}</p>}
            </div>
            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Input id="frequency" name="frequency" value={form.frequency} onChange={handleChange} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="duration">Duration</Label>
              <Input id="duration" name="duration" value={form.duration} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="side_effects">Side Effects</Label>
              <Input id="side_effects" name="side_effects" value={form.side_effects} onChange={handleChange} required />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={creating || updating}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating || updating}>
              {isEdit ? (updating ? "Updating..." : "Update") : (creating ? "Adding..." : "Add")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MedicineModal;
