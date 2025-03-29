import React, { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  ArrowLeft, 
  FlaskConical, 
  Beaker, 
  Tablet, 
  ScanLine, 
  Microscope, 
  ClipboardList, 
  X, 
  Check, 
  Info,
  Clock,
  Calendar,
  FileText,
  Stethoscope,
  ArrowUpRight,
  Save,
  ShoppingCart,
  AlertTriangle
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { usePatientData } from '@/hooks/use-pet';
import { useAppointmentData } from '@/hooks/use-appointment';
import { useCreateTest } from '@/hooks/use-test';
import WorkflowNavigation from "@/components/WorkflowNavigation";
import { cn } from "@/lib/utils";

interface TestCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  tests: Test[];
}

interface Test {
  id: string;
  name: string;
  description: string;
  price?: string;
  turnaroundTime?: string;
}

const LabManagement: React.FC = () => {
  const { id: appointmentId } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedTests, setSelectedTests] = useState<Record<string, boolean>>({});
  const [priority, setPriority] = useState('normal');
  const [notes, setNotes] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Get appointment and patient data
  const { data: appointment, isLoading: isAppointmentLoading } = useAppointmentData(appointmentId);
  const { data: patient, isLoading: isPatientLoading } = usePatientData(appointment?.pet?.pet_id);
  
  // Create test mutation
  const createTest = useCreateTest();
  
  // Test categories with their respective tests
  const testCategories: TestCategory[] = [
    {
      id: 'blood',
      name: 'Blood Tests',
      icon: <Beaker className="h-5 w-5 text-red-500" />,
      description: 'Check blood count, liver and kidney enzymes',
      tests: [
        { 
          id: 'cbc', 
          name: 'Complete Blood Count (CBC)', 
          description: 'Measures red blood cells, white blood cells, and platelets',
          price: '$45',
          turnaroundTime: '1-2 hours'
        },
        { 
          id: 'chemistry', 
          name: 'Chemistry Panel', 
          description: 'Evaluates organ function, particularly liver and kidneys',
          price: '$65',
          turnaroundTime: '1-2 hours'
        },
        { 
          id: 'electrolytes', 
          name: 'Electrolytes', 
          description: 'Measures sodium, potassium, chloride, and bicarbonate levels',
          price: '$35',
          turnaroundTime: '1 hour'
        },
        { 
          id: 'thyroid', 
          name: 'Thyroid Function', 
          description: 'Evaluates thyroid hormone levels',
          price: '$55',
          turnaroundTime: '24 hours'
        }
      ]
    },
    {
      id: 'stool-urine',
      name: 'Stool & Urine Tests',
      icon: <Microscope className="h-5 w-5 text-amber-500" />,
      description: 'Look for parasites and infections',
      tests: [
        { 
          id: 'urinalysis', 
          name: 'Urinalysis', 
          description: 'Evaluates urine for signs of infection, inflammation, and other abnormalities',
          price: '$35',
          turnaroundTime: '1 hour'
        },
        { 
          id: 'fecal', 
          name: 'Fecal Analysis', 
          description: 'Checks for intestinal parasites and digestive abnormalities',
          price: '$40',
          turnaroundTime: '24 hours'
        },
        { 
          id: 'urine-culture', 
          name: 'Urine Culture', 
          description: 'Identifies specific bacteria causing urinary tract infections',
          price: '$50',
          turnaroundTime: '48-72 hours'
        }
      ]
    },
    {
      id: 'imaging',
      name: 'Ultrasound/X-ray',
      icon: <ScanLine className="h-5 w-5 text-blue-500" />,
      description: 'Check internal organs, broken bones, intestinal obstruction, bladder stones',
      tests: [
        { 
          id: 'xray', 
          name: 'X-ray', 
          description: 'Evaluates bones, lungs, and abdominal structures',
          price: '$95',
          turnaroundTime: '30 minutes'
        },
        { 
          id: 'ultrasound', 
          name: 'Ultrasound', 
          description: 'Examines soft tissue structures like organs and masses',
          price: '$125',
          turnaroundTime: '45 minutes'
        },
        { 
          id: 'dental-xray', 
          name: 'Dental X-ray', 
          description: 'Evaluates dental health and tooth roots',
          price: '$85',
          turnaroundTime: '30 minutes'
        }
      ]
    },
    {
      id: 'quicktest',
      name: 'Quick Tests',
      icon: <Tablet className="h-5 w-5 text-green-500" />,
      description: 'Disease-specific rapid tests (Parvo, FIP, Leptospira, etc)',
      tests: [
        { 
          id: 'parvo', 
          name: 'Parvovirus Test (Dogs)', 
          description: 'Detects canine parvovirus infection',
          price: '$45',
          turnaroundTime: '10-15 minutes'
        },
        { 
          id: 'fip', 
          name: 'FIP Test (Cats)', 
          description: 'Screens for feline infectious peritonitis',
          price: '$55',
          turnaroundTime: '15-20 minutes'
        },
        { 
          id: 'leptospira', 
          name: 'Leptospirosis Test', 
          description: 'Detects leptospira infection',
          price: '$50',
          turnaroundTime: '15 minutes'
        },
        { 
          id: 'heartworm', 
          name: 'Heartworm Test', 
          description: 'Screens for heartworm infection',
          price: '$35',
          turnaroundTime: '10 minutes'
        }
      ]
    }
  ];
  
  // Count selected tests
  const selectedTestsCount = Object.values(selectedTests).filter(Boolean).length;
  
  // Get all selected test objects
  const getSelectedTestObjects = () => {
    const result: Test[] = [];
    
    testCategories.forEach(category => {
      category.tests.forEach(test => {
        if (selectedTests[test.id]) {
          result.push(test);
        }
      });
    });
    
    return result;
  };
  
  // Get total price
  const getTotalPrice = () => {
    return getSelectedTestObjects().reduce((total, test) => {
      const price = test.price ? parseFloat(test.price.replace('$', '')) : 0;
      return total + price;
    }, 0).toFixed(2);
  };
  
  // Toggle test selection
  const toggleTest = (testId: string) => {
    setSelectedTests(prev => ({
      ...prev,
      [testId]: !prev[testId]
    }));
  };
  
  // Order the selected tests
  const orderTests = async () => {
    if (!appointmentId || !appointment?.patient_id || !appointment?.doctor_id) {
      toast({
        title: "Error",
        description: "Missing required information to order tests",
        variant: "destructive"
      });
      return;
    }
    
    const selectedTestObjects = getSelectedTestObjects();
    if (selectedTestObjects.length === 0) {
      toast({
        title: "No tests selected",
        description: "Please select at least one test to order",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const petId = parseInt(appointment.patient_id);
      const doctorId = parseInt(appointment.doctor_id);
      
      // For each selected test, create a test order
      for (const test of selectedTestObjects) {
        await createTest.mutateAsync({
          petID: petId,
          doctorID: doctorId,
          testType: test.id
        });
      }
      
      toast({
        title: "Tests ordered successfully",
        description: `${selectedTestObjects.length} test(s) have been ordered for ${patient?.name}`,
        className: "bg-green-50 border-green-200 text-green-800",
      });
      
      // Close dialog and navigate back
      setShowConfirmDialog(false);
      navigate(`/appointment/${appointmentId}`);
    } catch (error) {
      console.error('Error ordering tests:', error);
      toast({
        title: "Failed to order tests",
        description: "An error occurred while ordering tests. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleBackToAppointment = () => {
    navigate(`/appointment/${appointmentId}`);
  };
  
  if (isAppointmentLoading || isPatientLoading || !appointment || !patient) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-t-indigo-600 border-b-indigo-600 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
          <p className="text-indigo-600 font-medium">
            Loading patient details...
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto bg-gradient-to-b from-gray-50 to-white rounded-xl shadow-lg overflow-hidden">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-white flex items-center hover:bg-white/10 rounded-lg px-3 py-2 transition-all mr-4"
            onClick={handleBackToAppointment}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Back to Appointment</span>
          </Button>
          <h1 className="text-white font-semibold text-lg">Laboratory Tests</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={selectedTestsCount === 0}
            className="bg-white/10 text-white border-white/20 hover:bg-white/20 flex items-center gap-1"
            onClick={() => setShowConfirmDialog(true)}
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Place Order {selectedTestsCount > 0 ? `(${selectedTestsCount})` : ''}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-white/10 text-white border-white/20 hover:bg-white/20 flex items-center gap-1"
            onClick={handleBackToAppointment}
          >
            <Save className="h-4 w-4" />
            <span>Save & Exit</span>
          </Button>
        </div>
      </div>

      {/* Workflow Navigation */}
      <div className="px-4 pt-3">
        <WorkflowNavigation
          appointmentId={appointment?.id}
          petId={patient?.petid?.toString()}
          currentStep="diagnostic"
        />
      </div>

      {/* Patient header */}
      <div className="bg-gradient-to-b from-indigo-50 to-white pt-8 pb-6 px-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Patient photo and basic info */}
          <div className="flex gap-6">
            <div className="relative">
              <div className="h-28 w-28 rounded-xl shadow-md overflow-hidden flex-shrink-0 border-4 border-white">
                <img
                  src={patient?.data_image ? `data:image/png;base64,${patient.data_image}` : "/fallback-image.png"}
                  alt={patient.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://via.placeholder.com/100?text=Pet";
                  }}
                />
              </div>
              {patient.gender && (
                <div
                  className={`absolute bottom-0 right-0 h-7 w-7 rounded-full flex items-center justify-center text-white shadow-md ${
                    patient.gender === "Male"
                      ? "bg-blue-500"
                      : "bg-pink-500"
                  }`}
                >
                  {patient.gender === "Male" ? "♂" : "♀"}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
                <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 px-2.5 py-0.5">{patient.breed}</Badge>
              </div>
              <div className="mt-1 text-gray-500 text-sm flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="flex items-center gap-1">
                  <span className="font-medium text-gray-600">ID:</span> {patient.petid}
                </span>
                <span className="flex items-center gap-1">
                  <span className="font-medium text-gray-600">Age:</span> {patient.age}
                </span>
                <span className="flex items-center gap-1">
                  <span className="font-medium text-gray-600">Weight:</span> {patient.weight}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 flex items-center gap-1.5 px-2 py-0.5">
                  <Calendar className="h-3 w-3" />
                  <span>{appointment.date}</span>
                </Badge>
                <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 flex items-center gap-1.5 px-2 py-0.5">
                  <Clock className="h-3 w-3" />
                  <span>{appointment.time_slot?.start_time || "Scheduled"}</span>
                </Badge>
                <Badge className="bg-violet-100 text-violet-700 border-violet-200 flex items-center gap-1.5 px-2 py-0.5">
                  <Stethoscope className="h-3 w-3" />
                  <span>{appointment.doctor?.doctor_name || "Assigned Doctor"}</span>
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="p-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-white border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center">
              <FlaskConical className="h-5 w-5 text-indigo-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Laboratory Test Selection</h2>
            </div>
            <div className="flex items-center text-sm text-indigo-600 font-medium">
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                {selectedTestsCount} Test{selectedTestsCount !== 1 ? 's' : ''} Selected
              </Badge>
            </div>
          </div>
          
          {/* Guidance alert */}
          <div className="p-4 m-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-700">Diagnostic Testing Guidance</h3>
                <p className="text-blue-600 text-sm mt-1">
                  Select appropriate laboratory tests based on the patient's symptoms and diagnosis. 
                  Consider starting with essential tests before moving to more specialized ones.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <Tabs defaultValue={testCategories[0].id} className="w-full">
                <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
                  <TabsList className="inline-flex p-1 bg-gray-100 rounded-md">
                    {testCategories.map(category => (
                      <TabsTrigger 
                        key={category.id} 
                        value={category.id}
                        className="px-4 py-2 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700 flex items-center gap-1.5"
                      >
                        {category.icon}
                        <span>{category.name}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
                
                <div className="p-6">
                  {testCategories.map(category => (
                    <TabsContent key={category.id} value={category.id} className="mt-0 pt-3">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
                          {category.icon}
                          {category.name}
                        </h3>
                        <p className="text-gray-500 text-sm">{category.description}</p>
                      </div>
                      
                      <div className="space-y-4">
                        {category.tests.map(test => (
                          <div 
                            key={test.id} 
                            className={cn(
                              "p-4 border rounded-lg transition-all cursor-pointer hover:border-indigo-300",
                              selectedTests[test.id] 
                                ? "border-indigo-500 bg-indigo-50 shadow-sm" 
                                : "border-gray-200"
                            )}
                            onClick={() => toggleTest(test.id)}
                          >
                            <div className="flex items-start">
                              <Checkbox 
                                id={test.id}
                                checked={selectedTests[test.id] || false}
                                onCheckedChange={() => toggleTest(test.id)}
                                className="mt-1"
                              />
                              <div className="ml-3 flex-1">
                                <Label 
                                  htmlFor={test.id} 
                                  className="font-medium cursor-pointer text-gray-800"
                                >
                                  {test.name}
                                </Label>
                                <p className="text-sm text-gray-500 mt-1">{test.description}</p>
                                <div className="flex mt-3 items-center gap-4">
                                  {test.price && (
                                    <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded-md font-medium">
                                      {test.price}
                                    </span>
                                  )}
                                  {test.turnaroundTime && (
                                    <span className="text-sm text-gray-600 flex items-center">
                                      <Clock className="h-3 w-3 mr-1 text-indigo-500" />
                                      {test.turnaroundTime}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </div>
              </Tabs>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <Card className="sticky top-4 shadow-md border-indigo-100">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-white border-b border-indigo-100">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-indigo-600" />
                  Order Summary
                </CardTitle>
                <CardDescription>
                  {selectedTestsCount} test{selectedTestsCount !== 1 ? 's' : ''} selected
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {selectedTestsCount > 0 ? (
                  <>
                    <div className="mb-6 p-3 bg-indigo-50 border border-indigo-100 rounded-md text-center">
                      <div className="text-sm text-indigo-600">Total Estimated Cost</div>
                      <div className="text-2xl font-bold text-indigo-700 mt-1">${getTotalPrice()}</div>
                    </div>
                    
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                      {getSelectedTestObjects().map(test => (
                        <div key={test.id} className="flex justify-between items-center py-2 px-3 border-b border-gray-100">
                          <div>
                            <p className="font-medium text-gray-800">{test.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">{test.price}</span>
                              <span className="text-xs text-gray-500 flex items-center">
                                <Clock className="h-3 w-3 mr-0.5" />
                                {test.turnaroundTime}
                              </span>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0 rounded-full hover:bg-red-50 hover:text-red-500"
                            onClick={() => toggleTest(test.id)}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    {/* Priority selection */}
                    <div className="mt-6 border-t border-gray-100 pt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Processing Priority</h4>
                      <RadioGroup value={priority} onValueChange={setPriority} className="gap-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="normal" id="normal" />
                          <Label htmlFor="normal" className="text-sm">Normal</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="urgent" id="urgent" />
                          <Label htmlFor="urgent" className="text-sm">Urgent (additional fee may apply)</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    {/* Notes section */}
                    <div className="mt-4">
                      <Label htmlFor="notes" className="text-sm font-medium text-gray-700">Lab Notes (optional)</Label>
                      <Textarea 
                        id="notes" 
                        placeholder="Add special instructions or notes for the lab..." 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="mt-1 h-20 text-sm"
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 px-4">
                    <FlaskConical className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-700 font-medium">No tests selected</p>
                    <p className="text-sm text-gray-500 mt-1">Select tests from the categories on the left to begin</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button 
                  disabled={selectedTestsCount === 0}
                  onClick={() => setShowConfirmDialog(true)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Place Test Order
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full text-gray-600 border-gray-300"
                  onClick={handleBackToAppointment}
                >
                  Save Draft
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Confirm Test Order</DialogTitle>
            <DialogDescription>
              You are about to order {selectedTestsCount} test{selectedTestsCount !== 1 ? 's' : ''} for {patient.name}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-700">Selected Tests:</h4>
                <Badge className="bg-blue-100 text-blue-700">Total: ${getTotalPrice()}</Badge>
              </div>
              <div className="max-h-[200px] overflow-y-auto border border-gray-200 rounded-md p-2">
                <ul className="divide-y divide-gray-100">
                  {getSelectedTestObjects().map(test => (
                    <li key={test.id} className="py-2 px-1 flex justify-between items-center">
                      <div className="flex-1">
                        <span className="text-sm font-medium">{test.name}</span>
                        <div className="flex gap-3 mt-1">
                          <span className="text-xs text-gray-500">{test.price}</span>
                          <span className="text-xs text-gray-500">{test.turnaroundTime}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <Alert className="bg-amber-50 border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800 text-sm font-medium">Important Information</AlertTitle>
              <AlertDescription className="text-amber-700 text-xs">
                These tests will be sent to the laboratory for processing. Results will appear in the patient's record once completed.
                {priority === 'urgent' && ' Urgent processing has been requested and may incur additional fees.'}
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button 
              onClick={orderTests} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Check className="h-4 w-4 mr-1" />
              Confirm Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LabManagement; 