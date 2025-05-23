import React, { useState, useEffect } from "react";
import TransactionHistory from "@/components/inventory/TransactionHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AllStockMovements from "@/components/inventory/AllStockMovements";
import MedicineTable from "@/components/inventory/MedicineTable";
import SupplierList from "@/components/inventory/SupplierList";
import MedicineAlerts from "@/components/inventory/MedicineAlerts";
import MedicineModal from "@/components/inventory/MedicineModal";
import { Input } from "@/components/ui/input";
import {
  Search,
  Package,
  Pill,
  Users,
  AlertTriangle,
  History,
} from "lucide-react";

const InventoryPage: React.FC = () => {
  // Tab state management
  const [activeTab, setActiveTab] = useState("transactions");
  const [searchQuery, setSearchQuery] = useState("");
  const [medicineModalOpen, setMedicineModalOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  // Add a state to track when operations are complete
  const [supplierOperationComplete, setSupplierOperationComplete] =
    useState(false);

  // Reset supplier operation state when switching tabs
  useEffect(() => {
    if (supplierOperationComplete) {
      setSupplierOperationComplete(false);
    }
  }, [activeTab, supplierOperationComplete]);

  const handleEditMedicine = (medicine: any) => {
    setSelectedMedicine(medicine);
    setMedicineModalOpen(true);
  };

  const handleRefreshAlerts = async () => {
    // This would be implemented with real data
    console.log("Refreshing alerts");
    return Promise.resolve();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Add handler for supplier operations
  const handleSupplierOperation = () => {
    setSupplierOperationComplete(true);
    // Force a tab refresh by reselecting the current tab
    const currentTab = activeTab;
    setActiveTab("_temp_");
    setTimeout(() => setActiveTab(currentTab), 10);
  };

  return (
    <div className="space-y-6">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-[#2C78E4] to-[#2C78E4]/80 px-6 py-4 md:px-8 md:py-5 rounded-2xl shadow-md mb-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">Inventory Management</h1>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#2C78E4]/20 shadow-sm overflow-hidden">
        <Tabs
          defaultValue="transactions"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid grid-cols-5 p-0 border-b border-[#2C78E4]/20 bg-[#F0F7FF]">
            <TabsTrigger
              value="transactions"
              className="rounded-none border-r border-[#2C78E4]/20 data-[state=active]:bg-white data-[state=active]:text-[#2C78E4] flex items-center justify-center py-3"
            >
              <History className="w-4 h-4 mr-2" />
              Transaction History
            </TabsTrigger>
            <TabsTrigger
              value="movements"
              className="rounded-none border-r border-[#2C78E4]/20 data-[state=active]:bg-white data-[state=active]:text-[#2C78E4] flex items-center justify-center py-3"
            >
              <Package className="w-4 h-4 mr-2" />
              Stock Movements
            </TabsTrigger>
            {/* <TabsTrigger
              value="medicines"
              className="rounded-none border-r border-[#2C78E4]/20 data-[state=active]:bg-white data-[state=active]:text-[#2C78E4] flex items-center justify-center py-3"
            >
              <Pill className="w-4 h-4 mr-2" />
              Medicines
            </TabsTrigger> */}
            <TabsTrigger
              value="suppliers"
              className="rounded-none border-r border-[#2C78E4]/20 data-[state=active]:bg-white data-[state=active]:text-[#2C78E4] flex items-center justify-center py-3"
            >
              <Users className="w-4 h-4 mr-2" />
              Suppliers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="p-0">
            <TransactionHistory searchQuery={searchQuery} />
          </TabsContent>

          <TabsContent value="movements" className="p-0">
            <AllStockMovements />
          </TabsContent>

          {/* <TabsContent value="medicines" className="p-0">
            <MedicineTable
              searchQuery={searchQuery}
              onEditMedicine={handleEditMedicine}
            />
            {medicineModalOpen && (
              <MedicineModal
                open={medicineModalOpen}
                onClose={() => {
                  setMedicineModalOpen(false);
                  setSelectedMedicine(null);
                }}
                initialData={selectedMedicine}
              />
            )}
          </TabsContent> */}

          <TabsContent value="suppliers" className="p-0">
            <SupplierList
              searchQuery={searchQuery}
              onOperationComplete={handleSupplierOperation}
              key={`suppliers-${supplierOperationComplete}`}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InventoryPage;
