import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, RefreshCw } from 'lucide-react';
import { LowStockNotification, ExpiredMedicineNotification } from '@/types';
import { useLocation } from 'wouter';

interface MedicineAlertsProps {
  lowStockAlerts: LowStockNotification[];
  expiringAlerts: ExpiredMedicineNotification[];
  isLoading: boolean;
  onRefresh: () => void;
}

const MedicineAlerts: React.FC<MedicineAlertsProps> = ({
  lowStockAlerts,
  expiringAlerts,
  isLoading,
  onRefresh
}) => {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('low-stock');

  const handleReorder = (medicineId: number) => {
    setLocation(`/inventory/medicines/${medicineId}/reorder`);
  };

  const handleViewMedicine = (medicineId: number) => {
    setLocation(`/inventory/medicines/${medicineId}`);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Medicine Alerts</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh} 
          disabled={isLoading}
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
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          {(lowStockAlerts?.length === 0 && expiringAlerts?.length === 0) ? (
            <div className="bg-green-50 border border-green-100 rounded-md p-4 text-center">
              <p className="text-green-800">No alerts at the moment. Your inventory is in good shape!</p>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="low-stock">
                  Low Stock {lowStockAlerts?.length > 0 && `(${lowStockAlerts?.length})`}
                </TabsTrigger>
                <TabsTrigger value="expiring">
                  Expiring Soon {expiringAlerts?.length > 0 && `(${expiringAlerts?.length})`}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="low-stock" className="bg-white">
                {lowStockAlerts?.length === 0 ? (
                  <div className="bg-green-50 border border-green-100 rounded-md p-4 text-center">
                    <p className="text-green-800">No low stock alerts at the moment.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {lowStockAlerts?.map((alert) => (
                      <Card key={alert.medicine_id} className="p-4 border-l-4 border-amber-500">
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
                            >
                              View
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={() => handleReorder(alert.medicine_id)}
                            >
                              Reorder
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="expiring" className="bg-white">
                {expiringAlerts?.length === 0 ? (
                  <div className="bg-green-50 border border-green-100 rounded-md p-4 text-center">
                    <p className="text-green-800">No medicines expiring soon.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {expiringAlerts?.map((alert) => (
                      <Card key={alert.medicine_id} className="p-4 border-l-4 border-orange-500">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900">{alert.medicine_name}</h3>
                            <div className="mt-1 flex items-center text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-1" /> 
                              Expires: {alert.expiration_date} ({alert.days_until_expiry} days)
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
                          >
                            View
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </>
      )}
    </div>
  );
};

export default MedicineAlerts; 