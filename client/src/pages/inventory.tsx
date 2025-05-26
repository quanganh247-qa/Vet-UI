import React, { useState, useEffect } from "react";
import TransactionHistory from "@/components/inventory/TransactionHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AllStockMovements from "@/components/inventory/AllStockMovements";
import SupplierList from "@/components/inventory/SupplierList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Users, 
  History, 
  Search, 
  Filter, 
  Download, 
  Plus,
  TrendingUp,
  AlertTriangle,
  Package2,
  Truck,
  BarChart3,
  RefreshCw,
  Calendar,
  FileText,
  Eye,
  Settings
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const InventoryPage: React.FC = () => {
  // Tab state management
  const [activeTab, setActiveTab] = useState("transactions");
  const [searchQuery, setSearchQuery] = useState("");

  // Add a state to track when operations are complete
  const [supplierOperationComplete, setSupplierOperationComplete] = useState(false);

  // Reset supplier operation state when switching tabs
  useEffect(() => {
    if (supplierOperationComplete) {
      setSupplierOperationComplete(false);
    }
  }, [activeTab, supplierOperationComplete]);

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
      <div className="bg-gradient-to-r from-[#2C78E4] to-[#2C78E4]/80 px-6 py-4 md:px-8 md:py-5 rounded-2xl shadow-md mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white">
              Inventory Management
            </h1>
            <p className="text-blue-100 text-sm mt-1">
              Manage your veterinary inventory
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Card className="border-none shadow-lg rounded-2xl overflow-hidden bg-white">

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 p-0 border-b border-gray-100 bg-white rounded-none">
            <TabsTrigger
              value="transactions"
              className="rounded-none border-r border-gray-100 data-[state=active]:bg-[#2C78E4]/5 data-[state=active]:text-[#2C78E4] data-[state=active]:border-b-2 data-[state=active]:border-[#2C78E4] flex items-center justify-center py-4 font-medium transition-all hover:bg-gray-50"
            >
              <History className="w-5 h-5 mr-2" />
              Transaction History
            </TabsTrigger>
            <TabsTrigger
              value="movements"
              className="rounded-none border-r border-gray-100 data-[state=active]:bg-[#2C78E4]/5 data-[state=active]:text-[#2C78E4] data-[state=active]:border-b-2 data-[state=active]:border-[#2C78E4] flex items-center justify-center py-4 font-medium transition-all hover:bg-gray-50"
            >
              <Package className="w-5 h-5 mr-2" />
              Stock Movements
            </TabsTrigger>
            <TabsTrigger
              value="suppliers"
              className="rounded-none data-[state=active]:bg-[#2C78E4]/5 data-[state=active]:text-[#2C78E4] data-[state=active]:border-b-2 data-[state=active]:border-[#2C78E4] flex items-center justify-center py-4 font-medium transition-all hover:bg-gray-50"
            >
              <Users className="w-5 h-5 mr-2" />
              Suppliers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="p-0 mt-0">
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#111827]">Transaction History</h3>
                    <p className="text-sm text-[#4B5563]">View and manage all inventory transactions</p>
                  </div>
                 
                </div>
              </div>
              <TransactionHistory searchQuery={searchQuery} />
            </div>
          </TabsContent>

          <TabsContent value="movements" className="p-0 mt-0">
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#111827]">Stock Movements</h3>
                    <p className="text-sm text-[#4B5563]">Track all stock in and out movements</p>
                  </div>
                </div>
              </div>
              <AllStockMovements />
            </div>
          </TabsContent>

          <TabsContent value="suppliers" className="p-0 mt-0">
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#111827]">Supplier Management</h3>
                    <p className="text-sm text-[#4B5563]">Manage supplier relationships and orders</p>
                  </div>
                </div>
              </div>
              <SupplierList
                searchQuery={searchQuery}
                onOperationComplete={handleSupplierOperation}
                key={`suppliers-${supplierOperationComplete}`}
              />
            </div>
          </TabsContent>
        </Tabs>
      </Card>

    
    </div>
  );
};

export default InventoryPage;
