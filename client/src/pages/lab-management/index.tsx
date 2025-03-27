import React, { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WorkflowNavigation from '@/components/WorkflowNavigation';
import { useAppointmentData } from '@/hooks/use-appointment';
import { usePatientData } from '@/hooks/use-pet';
import { useToast } from '@/components/ui/use-toast';
import { CalendarClock, PlusCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const LabManagement: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { data: appointment, isLoading: isAppointmentLoading } = useAppointmentData(id);
  const { data: patient, isLoading: isPatientLoading } = usePatientData(appointment?.pet?.pet_id);
  
  const [activeTab, setActiveTab] = useState('order');
  
  // Form state for ordering a lab test
  const [testName, setTestName] = useState('');
  const [priority, setPriority] = useState('normal');
  const [notes, setNotes] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  
  // State to hold ordered tests
  const [orderedTests, setOrderedTests] = useState<Array<{ id: string, name: string, orderDate: string, priority: string, notes: string }>>([]);
  
  const addTestOrder = () => {
    if (!testName.trim()) {
      toast({ title: 'Missing Test Name', description: 'Please enter test name', variant: 'destructive' });
      return;
    }
    const newOrder = {
      id: Date.now().toString(),
      name: testName,
      orderDate,
      priority,
      notes
    };
    setOrderedTests([...orderedTests, newOrder]);
    toast({
      title: 'Test Ordered',
      description: 'Lab test order added successfully',
      className: 'bg-green-50 border-green-200 text-green-800'
    });
    setTestName('');
    setNotes('');
  };
  
  if (isAppointmentLoading || isPatientLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-t-indigo-600 border-b-indigo-600 border-l-transparent rounded-full animate-spin"></div>
          <p className="text-indigo-600 font-medium">Loading lab management data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-4">
      <WorkflowNavigation appointmentId={id} petId={appointment?.pet?.pet_id?.toString()} currentStep="diagnostic" />
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Diagnostic Tests (Lab/Imaging)</h2>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="order">Order Test</TabsTrigger>
          <TabsTrigger value="history">Test History</TabsTrigger>
        </TabsList>
        <TabsContent value="order">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-xl">Order New Test</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Test Name</label>
                  <Input
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    placeholder="e.g. Complete Blood Count (CBC)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Order Date</label>
                  <Input
                    type="date"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional details or instructions"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
            <div className="flex justify-end p-4">
              <Button onClick={addTestOrder} className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" /> Order Test
              </Button>
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="history">
          {orderedTests.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No test orders found.</div>
          ) : (
            orderedTests.map((order) => (
              <Card key={order.id} className="mb-4">
                <CardHeader>
                  <CardTitle className="text-lg">{order.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600">Ordered on: {format(new Date(order.orderDate), 'MMM d, yyyy')}</div>
                  <div className="text-sm text-gray-600">Priority: {order.priority}</div>
                  {order.notes && <div className="text-sm text-gray-600 mt-2">Notes: {order.notes}</div>}
                </CardContent>
                <div className="flex justify-end p-3">
                  <Button variant="ghost" size="sm" className="text-red-600" onClick={() => setOrderedTests(orderedTests.filter(o => o.id !== order.id))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LabManagement; 