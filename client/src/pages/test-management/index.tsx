import React, { useState, useEffect } from "react";
import {
  useCreateTest,
  useListTests,
  useUpdateTestStatus, // Assuming we might want to update test status later
} from "@/hooks/use-test";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Edit,
  Trash2,
  Save,
  Loader2,
  AlertCircle,
  Beaker,
  ClipboardList,
  Info,
  ChevronDown,
  ListChecks,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Interface for an individual Test Item within a Category
interface TestItem {
  id: number; // or string, depending on actual data (e.g., tst016)
  test_id: string; 
  category_id: string;
  name: string;
  description: string;
  // Add other fields like price, status, etc., if available
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
      Get started by adding tests or test categories.
    </p>
    <Button
      size="sm"
      className="bg-[#2C78E4] hover:bg-[#1E40AF] text-white rounded-2xl shadow-md transition-all duration-200 hover:shadow-lg"
      onClick={onAdd}
    >
      <PlusCircle className="h-4 w-4 mr-2" />
      Add New Test / Category
    </Button>
  </div>
);

// Define the shape of the form data for creating a test item
interface CreateTestFormData {
  petID: number | ""; // This might need to be re-evaluated based on how tests are created
  doctorID: number | ""; // Same as above
  testType: string; // This will likely be the name of the new test item
  categoryID: string; // To associate with a category
  // Add other fields needed for creating a TestItem, e.g., description
}

const TestManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [activeAccordionItem, setActiveAccordionItem] = useState<string | undefined>(undefined);
  
  const [formData, setFormData] = useState<CreateTestFormData>({
    petID: "", 
    doctorID: "", 
    testType: "",
    categoryID: "", 
  });

  const { toast } = useToast();
  const {
    data: testCategoriesData, // Renamed for clarity
    isLoading: isLoadingTestCategories,
    error: testCategoriesError,
    refetch: refetchTestCategories,
  } = useListTests("all");

  console.log(testCategoriesData); // Keep this for now

  const { mutateAsync: createTest, isPending: isCreatingTest } =
    useCreateTest();

  const testCategories: TestCategory[] = testCategoriesData || [];

  // Filter categories and their items based on search term
  const filteredCategories = testCategories.map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.test_id.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.items.length > 0 || category.name.toLowerCase().includes(searchTerm.toLowerCase()));


  const handleOpenAddDialog = () => {
    setFormData({
      petID: "",
      doctorID: "",
      testType: "",
      categoryID: "", 
    });
    setIsAddingItem(true);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "petID" || name === "doctorID" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleSubmit = async () => {
    // This needs to be adjusted based on how createTest works with categories
    if (!formData.testType || !formData.categoryID) { // Simplified for now
      toast({
        title: "Invalid data",
        description: "Test Name/Type and Category ID are required.",
        variant: "destructive",
      });
      return;
    }
    // Assuming createTest hook might take petID, doctorID, testType (as item name)
    // And we would manually handle category association or the API does it.
    try {
      await createTest({
        petID: Number(formData.petID) || 0, // Default to 0 if not provided, or handle differently
        doctorID: Number(formData.doctorID) || 0, // Default to 0
        testType: formData.testType, // This is the name of the test item
        // categoryID: formData.categoryID, // This might not be a direct param for useCreateTest
      });
      toast({
        title: "Test created successfully",
        description: `Test '${formData.testType}' has been added.`, // Modify as needed
        className: "bg-green-50 text-green-800 border-green-200",
      });
      setIsAddingItem(false);
      refetchTestCategories(); 
    } catch (error) {
      toast({
        title: "Error creating test",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#2C78E4] to-[#2C78E4]/80 px-6 py-4 md:px-8 md:py-5 rounded-2xl shadow-md mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white">Test Catalog Management</h1>
            <p className="text-blue-100 text-sm mt-1">Browse and manage test categories and individual tests.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#2C78E4]/20 shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 bg-[#F9FAFB] p-4 rounded-xl border border-[#2C78E4]/20">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#4B5563]" />
            <Input
              placeholder="Search by category or test name..."
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
            Add New Test
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
                  <div className="flex items-center">
                    <Beaker className="h-5 w-5 mr-3 text-[#2C78E4]" /> 
                    {category.name}
                    <Badge variant="outline" className="ml-3 bg-white border-[#2C78E4]/30 text-[#2C78E4]">{category.items.length} tests</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-0 pt-0 pb-2 bg-white">
                  {category.items.length > 0 ? (
                    <Table className="mt-0">
                      <TableHeader className="bg-[#F9FAFB]">
                        <TableRow>
                          <TableHead className="pl-6 font-semibold text-[#111827]">Test ID</TableHead>
                          <TableHead className="font-semibold text-[#111827]">Test Name</TableHead>
                          <TableHead className="font-semibold text-[#111827]">Description</TableHead>
                          {/* Add more columns like Status, Price if available on TestItem */}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {category.items.map((item) => (
                          <TableRow key={item.id} className="hover:bg-[#F9FAFB]/50">
                            <TableCell className="pl-6 font-mono text-sm text-[#2C78E4]">{item.test_id}</TableCell>
                            <TableCell className="font-medium text-[#111827]">{item.name}</TableCell>
                            <TableCell className="text-sm text-[#4B5563] max-w-md truncate">{item.description || "N/A"}</TableCell>
                            {/* Render other item details here */}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="px-6 py-4 text-sm text-gray-500">No tests found in this category matching your search.</p>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      {/* Add Test Dialog - Needs significant rework for categories */}
      <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
        <DialogContent className="sm:max-w-[500px] border border-[#2C78E4]/20 bg-white rounded-2xl">
          <DialogHeader className="border-b border-[#2C78E4]/10 pb-4">
            <DialogTitle className="text-[#111827] text-xl">Add New Test</DialogTitle>
            <DialogDescription className="text-[#4B5563]">
              Fill in the details to add a new test item.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 p-4">
            <div>
              <Label htmlFor="categoryID" className="text-[#111827] font-medium">
                Category*
              </Label>
              <select
                id="categoryID"
                name="categoryID"
                value={formData.categoryID}
                onChange={handleInputChange}
                className="mt-1.5 block w-full rounded-xl border-[#2C78E4]/20 shadow-sm focus:border-[#2C78E4] focus:ring focus:ring-[#2C78E4]/20 focus:ring-opacity-50"
              >
                <option value="" disabled>Select a category</option>
                {testCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="testType" className="text-[#111827] font-medium">
                Test Name*
              </Label>
              <Input
                id="testType" // Corresponds to the name of the individual test item
                name="testType"
                value={formData.testType}
                onChange={handleInputChange}
                placeholder="e.g., Complete Blood Count"
                className="mt-1.5 border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-xl"
              />
            </div>
             {/* Fields for Pet ID and Doctor ID might not be relevant when creating a general test type */}
             {/* Consider removing or making them optional if a test isn't always tied to a pet/doctor at creation */}
            <div>
              <Label htmlFor="petID" className="text-[#111827] font-medium">
                Pet ID (Optional)
              </Label>
              <Input
                id="petID"
                name="petID"
                type="number"
                value={formData.petID}
                onChange={handleInputChange}
                placeholder="Enter Pet ID if applicable"
                className="mt-1.5 border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="doctorID" className="text-[#111827] font-medium">
                Doctor ID (Optional)
              </Label>
              <Input
                id="doctorID"
                name="doctorID"
                type="number"
                value={formData.doctorID}
                onChange={handleInputChange}
                placeholder="Enter Doctor ID if applicable"
                className="mt-1.5 border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-xl"
              />
            </div>
            {/* Add fields for description, price, etc. for the new TestItem here */}
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
              disabled={isCreatingTest || !formData.testType || !formData.categoryID}
              onClick={handleSubmit}
              className="bg-[#2C78E4] hover:bg-[#1E40AF] text-white rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
            >
              {isCreatingTest ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding Test...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Add Test
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