import React, { useState, useEffect } from "react";
import {
  useCreateTest,
  useListTests,
  // useUpdateTestStatus, // Assuming we might want to update test status later - commented out if not used
} from "@/hooks/use-test";
// Assume a hook for listing medicines exists or will be created
// import { useListMedicines } from "@/hooks/use-medicine"; // Placeholder
import type { CreateTestRequest } from "@/services/test-services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
// import { ScrollArea } from "@/components/ui/scroll-area"; // Commented out if not used
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PlusCircle,
  Search,
  // Edit, // Commented out if not used
  // Trash2, // Commented out if not used
  Save,
  Loader2,
  AlertCircle,
  Beaker,
  // ClipboardList, // Commented out if not used
  // Info, // Commented out if not used
  // ChevronDown, // Commented out if not used
  ListChecks,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea"; // Added for description
import { useGetAllMedicines } from "@/hooks/use-medicine";
import { Medicine } from "@/types";

// Interface for an individual Test Item within a Category
interface TestItem {
  id: number; 
  test_id: string; 
  category_id: string;
  name: string;
  description: string;
  price?: number; // Made optional if not always present in list view
  turnaround_time?: string; // Made optional
  type?: string; // API type, made optional
  // medicine_id is likely not relevant for listing general tests
}

// Interface for a Test Category
interface TestCategory {
  id: string; // e.g., "vaccine", "imaging"
  name: string; // e.g., "Tiêm chủng", "Chẩn đoán hình ảnh"
  description: string;
  items: TestItem[];
}

// Format date
const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(date);
};

// Get status badge
const getStatusBadge = (status?: string) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          Pending
        </Badge>
      );
    case "completed":
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          Completed
        </Badge>
      );
    case "in progress":
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
          In Progress
        </Badge>
      );
    case "cancelled":
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">
          Cancelled
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status || "Unknown"}</Badge>;
  }
};

// EmptyState component for when no test categories exist
const EmptyState = ({ onAdd }: { onAdd: () => void }) => (
  <div className="flex flex-col items-center justify-center p-8 bg-[#F9FAFB] rounded-2xl border border-dashed border-[#2C78E4]/20 h-64 transition-all hover:border-[#2C78E4]/40">
    <div className="rounded-full bg-[#F0F7FF] p-4 mb-5 shadow-sm">
      <ListChecks className="h-7 w-7 text-[#2C78E4]" />
    </div>
    <h3 className="text-lg font-medium mb-2 text-[#111827]">
      No test categories found
    </h3>
    <p className="text-sm text-[#4B5563] text-center mb-6 max-w-xs">
      Get started by adding your first test item.
    </p>
    <Button
      size="sm"
      className="bg-[#2C78E4] hover:bg-[#1E40AF] text-white rounded-2xl shadow-md transition-all duration-200 hover:shadow-lg"
      onClick={onAdd}
    >
      <PlusCircle className="h-4 w-4 mr-2" />
      Add New Test Item
    </Button>
  </div>
);

// Updated form data for creating a test item, matching CreateTestRequest
interface CreateTestFormData {
  test_id: string; 
  category_id: string; 
  name: string; 
  description: string; 
  price: number | ""; 
  turnaround_time: string; 
  itemApiType: string; 
  medicine_id?: number | ""; // Added for vaccine selection
}



const TestManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [activeAccordionItem, setActiveAccordionItem] = useState<string | undefined>(undefined);
  
  const initialFormData: CreateTestFormData = {
    test_id: "",
    category_id: "",
    name: "",
    description: "",
    price: "",
    turnaround_time: "",
    itemApiType: "", 
    medicine_id: "", // Initialize medicine_id
  };
  const [formData, setFormData] = useState<CreateTestFormData>(initialFormData);

  // --- Placeholder for useListMedicines --- 
  // const { data: medicinesData, isLoading: isLoadingMedicines } = useListMedicines();
  // const medicines: Medicine[] = medicinesData || [];
  const {data: medicinesData, isLoading: isLoadingMedicines} = useGetAllMedicines(1, 999);
  const medicines: Medicine[] = medicinesData || [];
  console.log("medicines", medicines);
  // --- End Placeholder ---

  const { toast } = useToast();
  const {
    data: testCategoriesData,
    isLoading: isLoadingTestCategories,
    error: testCategoriesError,
    refetch: refetchTestCategories,
  } = useListTests("all");

  // console.log(testCategoriesData); 

  const { mutateAsync: createTest, isPending: isCreatingTest } =
    useCreateTest();

  const testCategories: TestCategory[] = testCategoriesData || [];

  const filteredCategories = testCategories.map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.test_id.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.items.length > 0 || category.name.toLowerCase().includes(searchTerm.toLowerCase()) || searchTerm === "");


  const handleOpenAddDialog = () => {
    setFormData(initialFormData);
    setIsAddingItem(true);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "price" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.category_id || !formData.name || formData.price === "" || !formData.turnaround_time || !formData.itemApiType) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields: Test ID, Category, Name, Price, Turnaround Time, and API Type.",
        variant: "destructive",
      });
      return;
    }

    const newTestData: CreateTestRequest = {
      // test_id: formData.test_id,
      category_id: formData.category_id,
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      turnaround_time: formData.turnaround_time,
      type: formData.itemApiType,
      medicine_id: Number(formData.medicine_id) || 0, // Use selected medicine_id or default
    };

    try {
      await createTest(newTestData);
      toast({
        title: "Test Item Created",
        description: `Test '${formData.name}' has been successfully added.`, 
        className: "bg-green-50 text-green-800 border-green-200",
      });
      setIsAddingItem(false);
      refetchTestCategories(); 
    } catch (error) {
      toast({
        title: "Error Creating Test Item",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. The API endpoint might be expecting 'medicine_id' or has other constraints.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
    {/* Header with gradient background */}
    <div className="bg-gradient-to-r from-[#2C78E4] to-[#2C78E4]/80 px-6 py-4 md:px-8 md:py-5 rounded-2xl shadow-md mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white">Test Catalog Management</h1>
            <p className="text-blue-100 text-sm mt-1">Browse and manage test categories and individual test items.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#2C78E4]/20 shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 bg-[#F9FAFB] p-4 rounded-xl border border-[#2C78E4]/20">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#4B5563]" />
            <Input
              placeholder="Search by category, test name, ID..."
              className="pl-10 border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-xl bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            onClick={handleOpenAddDialog}
            className="w-full sm:w-auto bg-[#2C78E4] hover:bg-[#1E40AF] text-white rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add New Test Item
          </Button>
        </div>

        {isLoadingTestCategories ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-10 w-10 animate-spin text-[#2C78E4]" />
          </div>
        ) : testCategoriesError ? (
          <div className="flex flex-col items-center justify-center h-64 text-red-600">
            <AlertCircle className="h-12 w-12 mb-3" />
            <p className="text-lg font-medium">Error loading test categories</p>
            <p className="text-sm text-gray-500">{testCategoriesError.message}</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <EmptyState onAdd={handleOpenAddDialog} />
        ) : (
          <Accordion 
            type="single" 
            collapsible 
            className="w-full space-y-3"
            value={activeAccordionItem}
            onValueChange={setActiveAccordionItem}
          >
            {filteredCategories.map((category) => (
              <AccordionItem value={category.id} key={category.id} className="border border-[#2C78E4]/10 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow">
                <AccordionTrigger className="px-6 py-4 text-lg font-medium text-[#111827] hover:bg-[#F0F7FF] data-[state=open]:bg-[#E0F2FE] data-[state=open]:text-[#0C4A6E]">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <Beaker className="h-5 w-5 mr-3 text-[#2C78E4]" /> 
                      {category.name}
                      <Badge variant="outline" className="ml-3 bg-white border-[#2C78E4]/30 text-[#2C78E4]">{category.items.length} items</Badge>
                    </div>
                    {/* Chevron icon can be added here if needed, ShadCN Accordion handles it by default */}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-0 pt-0 pb-2 bg-white">
                  {category.items.length > 0 ? (
                    <Table className="mt-0">
                      <TableHeader className="bg-[#F9FAFB]">
                        <TableRow>
                          <TableHead className="pl-6 font-semibold text-[#111827]">Test ID</TableHead>
                          <TableHead className="font-semibold text-[#111827]">Item Name</TableHead>
                          <TableHead className="font-semibold text-[#111827]">Description</TableHead>
                          <TableHead className="font-semibold text-[#111827]">Price</TableHead>
                          <TableHead className="font-semibold text-[#111827]">Turnaround</TableHead>
                          <TableHead className="font-semibold text-[#111827]">API Type</TableHead>
                          {/* Add more columns like Status, Price if available on TestItem */}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {category.items.map((item) => (
                          <TableRow key={item.id} className="hover:bg-[#F9FAFB]/50">
                            <TableCell className="pl-6 font-mono text-sm text-[#2C78E4]">{item.test_id}</TableCell>
                            <TableCell className="font-medium text-[#111827]">{item.name}</TableCell>
                            <TableCell className="text-sm text-[#4B5563] max-w-xs truncate" title={item.description}>{item.description || "N/A"}</TableCell>
                            <TableCell className="text-sm text-[#4B5563]">{item.price !== undefined ? item.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : "N/A"}</TableCell>
                            <TableCell className="text-sm text-[#4B5563]">{item.turnaround_time || "N/A"}</TableCell>
                            <TableCell className="text-sm text-[#4B5563]">{item.type || "N/A"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="px-6 py-4 text-sm text-gray-500">No test items found in this category{searchTerm ? " matching your search" : ""}.</p>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
        <DialogContent className="sm:max-w-lg border border-[#2C78E4]/20 bg-white rounded-2xl">
          <DialogHeader className="border-b border-[#2C78E4]/10 pb-4">
            <DialogTitle className="text-[#111827] text-xl">Add New Test Item</DialogTitle>
            <DialogDescription className="text-[#4B5563]">
              Fill in the details for the new test item. Test ID should be unique.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 p-4 max-h-[70vh] overflow-y-auto">
            {/* <div>
              <Label htmlFor="test_id" className="text-[#111827] font-medium">
                Test Item ID*
              </Label>
              <Input
                id="test_id"
                name="test_id"
                value={formData.test_id}
                onChange={handleInputChange}
                placeholder="e.g., TST001, BLDPNL"
                className="mt-1.5 border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-xl"
              />
            </div> */}
            <div>
              <Label htmlFor="category_id" className="text-[#111827] font-medium">
                Category*
              </Label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                className="mt-1.5 block w-full rounded-xl border-[#2C78E4]/20 shadow-sm focus:border-[#2C78E4] focus:ring focus:ring-[#2C78E4]/20 focus:ring-opacity-50 bg-white py-2 px-3"
              >
                <option value="" disabled>Select a category</option>
                {testCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="name" className="text-[#111827] font-medium">
                Item Name*
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Complete Blood Count"
                className="mt-1.5 border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-[#111827] font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Detailed description of the test item"
                className="mt-1.5 border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-xl"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="price" className="text-[#111827] font-medium">
                Price (VND)*
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="e.g., 150000"
                className="mt-1.5 border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="turnaround_time" className="text-[#111827] font-medium">
                Turnaround Time*
              </Label>
              <Input
                id="turnaround_time"
                name="turnaround_time"
                value={formData.turnaround_time}
                onChange={handleInputChange}
                placeholder="e.g., 24 hours, 1-2 days"
                className="mt-1.5 border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="itemApiType" className="text-[#111827] font-medium">
                Type Classification*
              </Label>
              <Input
                id="itemApiType"
                name="itemApiType"
                value={formData.itemApiType}
                onChange={handleInputChange}
                placeholder="e.g., lab_test, imaging_test"
                className="mt-1.5 border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-xl"
              />
              <p className="text-xs text-gray-500 mt-1">Internal type identifier for the API (e.g., 'lab_test', 'vaccine').</p>
            </div>
            {/* Conditional Medicine Selection for 'vaccine' category */}
            {formData.category_id === "vaccine" && (
              <div>
                <Label htmlFor="medicine_id" className="text-[#111827] font-medium">
                  Select Vaccine (Medicine)*
                </Label>
                <select
                  id="medicine_id"
                  name="medicine_id"
                  value={formData.medicine_id}
                  onChange={handleInputChange}
                  disabled={isLoadingMedicines}
                  className="mt-1.5 block w-full rounded-xl border-[#2C78E4]/20 shadow-sm focus:border-[#2C78E4] focus:ring focus:ring-[#2C78E4]/20 focus:ring-opacity-50 bg-white py-2 px-3"
                >
                  <option value="" disabled>Select a medicine</option>
                  {isLoadingMedicines ? (
                    <option value="" disabled>Loading medicines...</option>
                  ) : (
                    medicines.map(med => (
                      <option key={med.id} value={med.id}>{med.medicine_name}</option>
                    ))
                  )}
                </select>
                {formData.category_id === "vaccine" && !formData.medicine_id && (
                    <p className="text-xs text-red-500 mt-1">Medicine selection is required for vaccine category.</p>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-[#2C78E4]/10 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsAddingItem(false)}
              className="border-[#2C78E4]/20 text-[#4B5563] hover:bg-[#F9FAFB] rounded-xl"
            >
              Cancel
            </Button>
            <Button
              disabled={isCreatingTest || 
                        // !formData.test_id || 
                        !formData.category_id || 
                        (formData.category_id === "vaccine" && !formData.medicine_id) || // Ensure medicine_id if category is vaccine
                        !formData.name || 
                        formData.price === "" || 
                        !formData.turnaround_time || 
                        !formData.itemApiType}
              onClick={handleSubmit}
              className="bg-[#2C78E4] hover:bg-[#1E40AF] text-white rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
            >
              {isCreatingTest ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding Item...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Add Item
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestManagement; 