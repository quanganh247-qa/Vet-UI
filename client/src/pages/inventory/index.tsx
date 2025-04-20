import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PlusCircle,
  Search,
  FileDown,
  RefreshCw,
  AlertTriangle,
  Pill,
  Users,
  FileText,
  ChevronRight,
  User,
  Settings,
  LogOut,
  Package,
  Calendar,
} from "lucide-react";
import { useLocation } from "wouter";
import MedicineAlerts from "@/components/inventory/MedicineAlerts";
import MedicineTable from "@/components/inventory/MedicineTable";
import MedicineModal from "@/components/inventory/MedicineModal";
import SupplierList from "@/components/inventory/SupplierList";
import TransactionHistory from "@/components/inventory/TransactionHistory";
import { LowStockNotification, ExpiredMedicineNotification } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

const MedicineInventory = () => {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("inventory");
  const [searchQuery, setSearchQuery] = useState("");
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockNotification[]>([]);
  const [expiringAlerts, setExpiringAlerts] = useState<ExpiredMedicineNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alertCount, setAlertCount] = useState(0);
  const [totalMedicines, setTotalMedicines] = useState<number>(0);

  // Modal state for add/edit medicine
  const [medicineModalOpen, setMedicineModalOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<any | null>(null);

  useEffect(() => {
    // Initialize data on component mount
    const initializeData = async () => {
      try {
        await Promise.all([fetchMedicines(), fetchAlerts()]);
      } catch (error) {
        console.error("Error initializing data:", error);
        toast({
          title: "Error",
          description: "Failed to load inventory data",
          variant: "destructive",
        });
      }
    };

    initializeData();
    
    // Set up periodic refresh for alerts
    const alertsInterval = setInterval(fetchAlerts, 300000); // Refresh every 5 minutes
    
    return () => clearInterval(alertsInterval);
  }, []);

  const fetchMedicines = async () => {
    try {
      const response = await api.get(`/api/v1/medicines/count`);
      setTotalMedicines(response.data.count);
    } catch (error) {
      console.error("Error fetching medicines:", error);
      throw error;
    }
  };

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const [lowStockResponse, expiringResponse] = await Promise.all([
        api.get("/api/v1/medicine/alerts/lowstock"),
        api.get("/api/v1/medicine/alerts/expiring?days=300")
      ]);

      const lowStockData = lowStockResponse.data;
      const expiringData = expiringResponse.data;

      setLowStockAlerts(lowStockData);
      setExpiringAlerts(expiringData);
      setAlertCount(lowStockData?.length + expiringData?.length);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch inventory alerts",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMedicine = () => {
    setSelectedMedicine(null);
    setMedicineModalOpen(true);
  };

  const handleEditMedicine = (medicine: any) => {
    // Map the medicine object from the table to the MedicineRequest shape for the modal
    const mapped = {
      id: medicine.id,
      medicine_name: medicine.medicine_name || "",
      dosage: medicine.dosage || "",
      frequency: medicine.frequency || "",
      duration: medicine.duration || "",
      side_effects: medicine.side_effects || "",
      quantity: medicine.current_stock || medicine.quantity || 0,
      expiration_date: medicine.expiration_date || "",
      description: medicine.description || "",
      usage: medicine.usage || "",
      supplier_id: medicine.supplier_id || 0,
      unit_price: medicine.unit_price || 0,
      reorder_level: medicine.reorder_level || 0,
    };
    setSelectedMedicine(mapped);
    setMedicineModalOpen(true);
  };


  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Define tab steps for workflow-style navigation
  const tabSteps = [
    { id: "inventory", label: "Inventory", icon: Pill },
    { id: "alerts", label: "Alerts", icon: AlertTriangle },
    { id: "suppliers", label: "Suppliers", icon: Users },
    { id: "transactions", label: "Transactions", icon: FileText },
  ];

  const activeIndex = tabSteps.findIndex((tab) => tab.id === activeTab);
  const progressPercentage = ((activeIndex + 1) / tabSteps.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4 rounded-xl shadow-md mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Inventory Management
            </h1>
            <p className="text-indigo-100 text-sm">
              Manage your clinic's medicine inventory, suppliers, and
              transactions
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto">
        <div className="bg-white rounded-lg border border-indigo-100 shadow-sm p-6 mb-6">
 
          {/* Workflow-style navigation */}
          <div className="flex flex-col space-y-3 mb-6">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
                Inventory Sections
              </div>
              <div className="text-xs text-gray-500 font-medium">
                Section {activeIndex + 1} of {tabSteps.length}
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* Tabs as workflow steps */}
            <div className="relative flex items-center space-x-1 overflow-x-auto hide-scrollbar py-2 px-1">
              {tabSteps.map((step, index) => {
                const isCurrent = step.id === activeTab;
                const isPast = index < activeIndex;
                const isFuture = index > activeIndex;
                const IconComponent = step.icon;

                return (
                  <React.Fragment key={step.id}>
                    <Button
                      variant={isCurrent ? "default" : "outline"}
                      size="sm"
                      className={`
                        flex items-center gap-1.5 whitespace-nowrap transition-all duration-200
                        ${
                          isCurrent
                            ? "bg-indigo-600 text-white shadow-md border-transparent scale-105 hover:bg-indigo-700"
                            : ""
                        }
                        ${
                          isPast
                            ? "border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                            : ""
                        }
                        ${
                          isFuture
                            ? "border-gray-200 text-gray-500 hover:border-indigo-200 hover:text-indigo-600"
                            : ""
                        }
                        ${
                          step.id === "alerts" && alertCount > 0
                            ? "text-red-600"
                            : ""
                        }
                      `}
                      onClick={() => setActiveTab(step.id)}
                    >
                      <IconComponent
                        className={`h-4 w-4 ${
                          isCurrent
                            ? "text-white"
                            : isPast
                            ? "text-indigo-500"
                            : step.id === "alerts" && alertCount > 0
                            ? "text-red-500"
                            : "text-gray-400"
                        }`}
                      />
                      <span className="text-xs font-medium">
                        {step.label}{" "}
                        {step.id === "alerts" &&
                          alertCount > 0 &&
                          `(${alertCount})`}
                      </span>
                    </Button>

                    {index < tabSteps.length - 1 && (
                      <ChevronRight
                        className={`h-4 w-4 flex-shrink-0 ${
                          index < activeIndex
                            ? "text-indigo-400"
                            : "text-gray-300"
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="border border-indigo-100 hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center text-indigo-700">
                  <Pill className="h-4 w-4 mr-2 text-indigo-500" />
                  Total Medicines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-900">
                  {totalMedicines}
                </div>
                <p className="text-xs text-indigo-500 mt-1">
                  From 12 categories
                </p>
              </CardContent>
            </Card>
            <Card className="border border-indigo-100 hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center text-indigo-700">
                  <Users className="h-4 w-4 mr-2 text-indigo-500" />
                  Active Suppliers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-900">18</div>
                <p className="text-xs text-indigo-500 mt-1">
                  Last order: 3 days ago
                </p>
              </CardContent>
            </Card>
            <Card
              className={`border ${
                alertCount > 0
                  ? "border-red-300 bg-red-50"
                  : "border-indigo-100"
              } hover:shadow-md transition-shadow`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center text-indigo-700">
                  <AlertTriangle
                    className={`h-4 w-4 mr-2 ${
                      alertCount > 0 ? "text-red-500" : "text-indigo-500"
                    }`}
                  />
                  Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-900">
                  {alertCount}
                </div>
                <p className="text-xs text-indigo-500 mt-1">
                  {lowStockAlerts?.length} low stock, {expiringAlerts?.length}{" "}
                  expiring soon
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search and add section */}
          <div className="flex justify-between items-center mb-6 bg-indigo-50 p-3 rounded-md border border-indigo-100">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-400" />
              <Input
                type="search"
                placeholder={`Search ${activeTab}...`}
                className="pl-10 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <Button
              onClick={handleAddMedicine}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Medicine
            </Button>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg border border-indigo-100 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="inventory" className="p-0 m-0">
                <MedicineTable searchQuery={searchQuery} onEditMedicine={handleEditMedicine} />
              </TabsContent>

              <TabsContent value="alerts" className="p-0 m-0">
                <MedicineAlerts
                  lowStockAlerts={lowStockAlerts}
                  expiringAlerts={expiringAlerts}
                  isLoading={isLoading}
                  onRefresh={fetchAlerts}
                />
              </TabsContent>

              <TabsContent value="suppliers" className="p-0 m-0">
                <SupplierList searchQuery={searchQuery} />
              </TabsContent>

              <TabsContent value="transactions" className="p-0 m-0">
                <TransactionHistory searchQuery={searchQuery} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      {/* Medicine Modal for Add/Edit */}
      <MedicineModal
        open={medicineModalOpen}
        onClose={() => setMedicineModalOpen(false)}
        initialData={selectedMedicine}
      />
    </div>
  );
};

export default MedicineInventory;
