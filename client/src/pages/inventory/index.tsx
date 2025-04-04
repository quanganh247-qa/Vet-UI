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
} from "lucide-react";
import { useLocation } from "wouter";
import MedicineAlerts from "@/components/inventory/MedicineAlerts";
import MedicineTable from "@/components/inventory/MedicineTable";
import SupplierList from "@/components/inventory/SupplierList";
import TransactionHistory from "@/components/inventory/TransactionHistory";
import { LowStockNotification, ExpiredMedicineNotification } from "@/types";

const MedicineInventory = () => {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("inventory");
  const [searchQuery, setSearchQuery] = useState("");
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockNotification[]>(
    []
  );
  const [expiringAlerts, setExpiringAlerts] = useState<
    ExpiredMedicineNotification[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    // Fetch initial alerts
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      // Fetch low stock medicines
      const lowStockResponse = await fetch("/api/v1/medicine/alerts/lowstock", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const lowStockData = await lowStockResponse.json();

      // Fetch expiring medicines (default 30 days)
      const expiringResponse = await fetch(
        "/api/v1/medicine/alerts/expiring?days=300",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const expiringData = await expiringResponse.json();

      setLowStockAlerts(lowStockData);
      setExpiringAlerts(expiringData);
      setAlertCount(lowStockData?.length + expiringData?.length);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMedicine = () => {
    setLocation("/inventory/medicines/add");
  };

  const handleExportData = () => {
    // Implement export functionality
    console.log("Exporting data...");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Medicine Inventory
          </h1>
          <p className="text-gray-500">
            Manage your clinic's medicine inventory, suppliers, and transactions
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={fetchAlerts} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExportData} variant="outline" size="sm">
            <FileDown className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleAddMedicine} size="sm">
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Medicine
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Medicines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">253</div>
            <p className="text-xs text-gray-500 mt-1">From 12 categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Active Suppliers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-gray-500 mt-1">Last order: 3 days ago</p>
          </CardContent>
        </Card>
        <Card className={alertCount > 0 ? "border-red-300 bg-red-50" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              Alerts
              {alertCount > 0 && (
                <AlertTriangle className="ml-2 h-4 w-4 text-red-500" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertCount}</div>
            <p className="text-xs text-gray-500 mt-1">
              {lowStockAlerts?.length} low stock, {expiringAlerts?.length}{" "}
              expiring soon
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between p-4 border-b">
            <TabsList>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger
                value="alerts"
                className={alertCount > 0 ? "text-red-500" : ""}
              >
                Alerts {alertCount > 0 && `(${alertCount})`}
              </TabsTrigger>
              <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>

            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-8 h-9"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          <TabsContent value="inventory" className="p-0">
            <MedicineTable searchQuery={searchQuery} />
          </TabsContent>

          <TabsContent value="alerts" className="p-0">
            <MedicineAlerts
              lowStockAlerts={lowStockAlerts}
              expiringAlerts={expiringAlerts}
              isLoading={isLoading}
              onRefresh={fetchAlerts}
            />
          </TabsContent>

          <TabsContent value="suppliers" className="p-0">
            <SupplierList searchQuery={searchQuery} />
          </TabsContent>

          <TabsContent value="transactions" className="p-0">
            <TransactionHistory searchQuery={searchQuery} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MedicineInventory;
