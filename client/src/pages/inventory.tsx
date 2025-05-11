import React, { useState } from "react";
import TransactionHistory from "@/components/inventory/TransactionHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AllStockMovements from "@/components/inventory/AllStockMovements";
import MedicineTable from "@/components/inventory/MedicineTable";
import SupplierList from "@/components/inventory/SupplierList";
import MedicineAlerts from "@/components/inventory/MedicineAlerts";
import MedicineModal from "@/components/inventory/MedicineModal";
import { Input } from "@/components/ui/input";
import { Search, Package, Pill, Users, AlertTriangle, History } from "lucide-react";

const InventoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("transactions");
  const [searchQuery, setSearchQuery] = useState("");
  const [medicineModalOpen, setMedicineModalOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);

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

  return (
    <div className="space-y-6">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-5 rounded-xl shadow-md mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Inventory Management</h1>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-indigo-100 p-5 mb-6">
        <div className="bg-indigo-50 p-3 rounded-md border border-indigo-100 mb-6 flex items-center">
          <Search className="text-indigo-400 w-5 h-5 mr-2" />
          <Input
            placeholder="Search inventory..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="flex-1 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 bg-white"
          />
        </div>

        <div className="bg-white rounded-lg border border-indigo-100 shadow-sm overflow-hidden">
          <Tabs defaultValue="transactions" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 p-0 border-b border-indigo-100 bg-indigo-50">
              <TabsTrigger 
                value="transactions" 
                className="rounded-none border-r border-indigo-100 data-[state=active]:bg-white data-[state=active]:text-indigo-800 flex items-center justify-center py-3"
              >
                <History className="w-4 h-4 mr-2" />
                Transaction History
              </TabsTrigger>
              <TabsTrigger 
                value="movements" 
                className="rounded-none border-r border-indigo-100 data-[state=active]:bg-white data-[state=active]:text-indigo-800 flex items-center justify-center py-3"
              >
                <Package className="w-4 h-4 mr-2" />
                Stock Movements
              </TabsTrigger>
              <TabsTrigger 
                value="medicines" 
                className="rounded-none border-r border-indigo-100 data-[state=active]:bg-white data-[state=active]:text-indigo-800 flex items-center justify-center py-3"
              >
                <Pill className="w-4 h-4 mr-2" />
                Medicines
              </TabsTrigger>
              <TabsTrigger 
                value="suppliers" 
                className="rounded-none border-r border-indigo-100 data-[state=active]:bg-white data-[state=active]:text-indigo-800 flex items-center justify-center py-3"
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
            
            <TabsContent value="medicines" className="p-0">
              <MedicineTable searchQuery={searchQuery} onEditMedicine={handleEditMedicine} />
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
            </TabsContent>
            
            <TabsContent value="suppliers" className="p-0">
              <SupplierList searchQuery={searchQuery} />
            </TabsContent>
            
            <TabsContent value="alerts" className="p-0">
              <MedicineAlerts 
                lowStockAlerts={[]} 
                expiringAlerts={[]} 
                isLoading={false}
                onRefresh={handleRefreshAlerts}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default InventoryPage; 