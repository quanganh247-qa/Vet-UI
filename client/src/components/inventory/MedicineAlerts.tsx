import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, RefreshCw, AlertTriangle, Bell } from 'lucide-react';
import { useLocation } from 'wouter';
import { useImportMedicine } from '@/hooks/use-medicine-transaction';
import { LowStockNotification, ExpiredMedicineNotification } from '@/types';
import Pagination from '@/components/ui/pagination';

interface MedicineAlertsProps {
  lowStockAlerts: LowStockNotification[];
  expiringAlerts: ExpiredMedicineNotification[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
}

const MedicineAlerts: React.FC<MedicineAlertsProps> = ({ 
  lowStockAlerts,
  expiringAlerts,
  isLoading,
  onRefresh
}) => {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = React.useState('low-stock');
  const importMutation = useImportMedicine();
  const [lowStockPage, setLowStockPage] = useState(1);
  const [expiringPage, setExpiringPage] = useState(1);
  const itemsPerPage = 6;

  // Pagination calculations
  const paginatedLowStockAlerts = lowStockAlerts ? lowStockAlerts.slice(
    (lowStockPage - 1) * itemsPerPage,
    lowStockPage * itemsPerPage
  ) : [];
  
  const paginatedExpiringAlerts = expiringAlerts ? expiringAlerts.slice(
    (expiringPage - 1) * itemsPerPage,
    expiringPage * itemsPerPage
  ) : [];
  
  const lowStockTotalPages = lowStockAlerts ? Math.ceil(lowStockAlerts.length / itemsPerPage) : 1;
  const expiringTotalPages = expiringAlerts ? Math.ceil(expiringAlerts.length / itemsPerPage) : 1;

  const handleReorder = async (medicineId: number) => {
    try {
      await importMutation.mutateAsync({
        medicine_id: medicineId,
        quantity: 100, // Default reorder quantity, could be made configurable
        transaction_type: "import",
        unit_price: 0, // This should be filled with actual price
        supplier_id: 0, // This should be filled with actual supplier
        expiration_date: new Date().toISOString(),
        notes: "Auto-reorder",
        prescription_id: 0,
        appointment_id: 0
      });
    } catch (error) {
      console.error("Error reordering medicine:", error);
    }
  };

  const handleViewMedicine = (medicineId: number) => {
    setLocation(`/inventory/medicines/${medicineId}`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-indigo-900 flex items-center">
          <Bell className="h-5 w-5 mr-2 text-indigo-600" />
          Medicine Alerts
        </h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh} 
          disabled={isLoading}
          className="h-9 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <>
          {(lowStockAlerts?.length === 0 && expiringAlerts?.length === 0) ? (
            <div className="bg-green-50 border border-green-100 rounded-md p-8 text-center shadow-sm">
              <p className="text-green-800 font-medium">No alerts at the moment. Your inventory is in good shape!</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-indigo-100 shadow-sm overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full bg-indigo-50 border-b border-indigo-100 p-0">
                  <TabsTrigger 
                    value="low-stock" 
                    className="flex-1 rounded-none border-r border-indigo-100 data-[state=active]:bg-white data-[state=active]:text-indigo-800 py-3"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Low Stock {lowStockAlerts?.length > 0 && (
                      <Badge className="ml-2 bg-amber-100 text-amber-800 border-amber-200">
                        {lowStockAlerts?.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="expiring" 
                    className="flex-1 rounded-none data-[state=active]:bg-white data-[state=active]:text-indigo-800 py-3"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Expiring Soon {expiringAlerts?.length > 0 && (
                      <Badge className="ml-2 bg-orange-100 text-orange-800 border-orange-200">
                        {expiringAlerts?.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="low-stock" className="p-4">
                  {lowStockAlerts.length === 0 ? (
                    <div className="bg-green-50 border border-green-100 rounded-md p-6 text-center">
                      <p className="text-green-800">No low stock alerts at the moment.</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {paginatedLowStockAlerts.map((alert) => (
                          <Card key={alert.medicine_id} className="p-4 border-l-4 border-amber-500 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-gray-900">{alert.medicine_name}</h3>
                                <div className="mt-2 flex items-center space-x-2">
                                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                    Stock: {alert.current_stock}
                                  </Badge>
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    Reorder at: {alert.reorder_level}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleViewMedicine(alert.medicine_id)}
                                  className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                                >
                                  View
                                </Button>
                                <Button 
                                  size="sm"
                                  onClick={() => handleReorder(alert.medicine_id)}
                                  disabled={importMutation.isPending}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                  {importMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    'Reorder'
                                  )}
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                      
                      {lowStockTotalPages > 1 && (
                        <Pagination
                          currentPage={lowStockPage}
                          totalPages={lowStockTotalPages}
                          onPageChange={setLowStockPage}
                          className="mt-4"
                        />
                      )}
                    </>
                  )}
                </TabsContent>

                <TabsContent value="expiring" className="p-4">
                  {expiringAlerts?.length === 0 ? (
                    <div className="bg-green-50 border border-green-100 rounded-md p-6 text-center">
                      <p className="text-green-800">No medicines expiring soon.</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {paginatedExpiringAlerts.map((alert) => (
                          <Card key={alert.medicine_id} className="p-4 border-l-4 border-orange-500 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-gray-900">{alert.medicine_name}</h3>
                                <div className="mt-1 flex items-center text-sm text-gray-500">
                                  <Calendar className="h-4 w-4 mr-1" /> 
                                  Expires: {new Date(alert.expiration_date).toLocaleDateString("vi-VN")} ({alert.days_until_expiry} days)
                                </div>
                                <div className="mt-2">
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    Quantity: {alert.quantity}
                                  </Badge>
                                </div>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleViewMedicine(alert.medicine_id)}
                                className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                              >
                                View
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                      
                      {expiringTotalPages > 1 && (
                        <Pagination
                          currentPage={expiringPage}
                          totalPages={expiringTotalPages}
                          onPageChange={setExpiringPage}
                          className="mt-4"
                        />
                      )}
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MedicineAlerts;