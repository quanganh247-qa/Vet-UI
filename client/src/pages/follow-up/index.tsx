import React, { useState } from 'react';
import { useParams } from 'wouter';
import WorkflowNavigation from '@/components/WorkflowNavigation';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { 
  CalendarClock, 
  Mail, 
  MessageSquare, 
  Printer, 
  Pill, 
  FileText, 
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FollowUp: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const { toast } = useToast();

  // Form state for scheduling a follow-up appointment
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointmentTime, setAppointmentTime] = useState('09:00');
  const [notes, setNotes] = useState('');
  const [selectedTab, setSelectedTab] = useState('appointment');
  const [contactMethod, setContactMethod] = useState<string[]>([]);
  const [medication, setMedication] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [hasSideEffects, setHasSideEffects] = useState(false);
  const [sideEffectsInfo, setSideEffectsInfo] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  
  const handleSchedule = () => {
    toast({
      title: "Follow-up Scheduled",
      description: "Your follow-up appointment has been scheduled successfully.",
      variant: "default"
    });
  };

  const handleSaveMedication = () => {
    toast({
      title: "Medication Saved",
      description: "Medication details have been saved successfully.",
      variant: "default"
    });
  };

  const handleSendPrescription = () => {
    toast({
      title: "Prescription Sent",
      description: `Prescription has been sent via ${contactMethod.join(', ')}.`,
      variant: "default"
    });
  };

  const handleContactMethodChange = (method: string) => {
    if (contactMethod.includes(method)) {
      setContactMethod(contactMethod.filter(m => m !== method));
    } else {
      setContactMethod([...contactMethod, method]);
    }
  };

  return (
    <div className="container mx-auto py-4">
      <WorkflowNavigation appointmentId={id} currentStep="follow-up" />
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Pet Care Follow-up</h2>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="appointment">Appointment</TabsTrigger>
          <TabsTrigger value="medication">Medication</TabsTrigger>
          <TabsTrigger value="owner-guide">Owner's Guide</TabsTrigger>
        </TabsList>
        
        {/* Appointment Tab */}
        <TabsContent value="appointment">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Follow-up Appointment</CardTitle>
              <CardDescription>Set the date and time for the pet's next check-up</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="date">Appointment Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Appointment Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Appointment Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Details about the follow-up appointment..."
                    className="h-[132px]"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSchedule} className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4" /> Schedule Follow-up
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Medication Tab */}
        <TabsContent value="medication">
          <Card>
            <CardHeader>
              <CardTitle>Medication & Side Effects</CardTitle>
              <CardDescription>Prescribe medication and document potential side effects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="medication">Medication Name</Label>
                    <Input
                      id="medication"
                      value={medication}
                      onChange={(e) => setMedication(e.target.value)}
                      placeholder="Enter medication name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dosage">Dosage</Label>
                    <Input
                      id="dosage"
                      value={dosage}
                      onChange={(e) => setDosage(e.target.value)}
                      placeholder="e.g., 50mg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select value={frequency} onValueChange={setFrequency}>
                      <SelectTrigger id="frequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Once daily</SelectItem>
                        <SelectItem value="twice-daily">Twice daily</SelectItem>
                        <SelectItem value="every-other-day">Every other day</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="side-effects" 
                      checked={hasSideEffects}
                      onCheckedChange={(checked) => setHasSideEffects(checked as boolean)}
                    />
                    <Label htmlFor="side-effects" className="font-medium">Has potential side effects</Label>
                  </div>
                  {hasSideEffects && (
                    <div>
                      <Label htmlFor="side-effects-info">Side Effects Information</Label>
                      <Textarea
                        id="side-effects-info"
                        value={sideEffectsInfo}
                        onChange={(e) => setSideEffectsInfo(e.target.value)}
                        placeholder="Document potential side effects..."
                        className="h-[132px]"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveMedication} className="flex items-center gap-2">
                <Pill className="h-4 w-4" /> Save Medication Details
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Prescription Distribution</CardTitle>
              <CardDescription>Send or print the pet's prescription</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="owner-email">Owner's Email</Label>
                    <Input
                      id="owner-email"
                      type="email"
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      placeholder="owner@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="owner-phone">Owner's Phone</Label>
                    <Input
                      id="owner-phone"
                      type="tel"
                      value={ownerPhone}
                      onChange={(e) => setOwnerPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <Label>Distribution Method</Label>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="email" 
                        checked={contactMethod.includes('email')}
                        onCheckedChange={() => handleContactMethodChange('email')}
                      />
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" /> Email
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="sms" 
                        checked={contactMethod.includes('sms')}
                        onCheckedChange={() => handleContactMethodChange('sms')}
                      />
                      <Label htmlFor="sms" className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" /> SMS
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="print" 
                        checked={contactMethod.includes('print')}
                        onCheckedChange={() => handleContactMethodChange('print')}
                      />
                      <Label htmlFor="print" className="flex items-center gap-2">
                        <Printer className="h-4 w-4" /> Print
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={handleSendPrescription} 
                disabled={contactMethod.length === 0}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" /> Send Prescription
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Owner's Guide Tab */}
        <TabsContent value="owner-guide">
          <Card>
            <CardHeader>
              <CardTitle>Owner's Guide & Care Instructions</CardTitle>
              <CardDescription>Essential information for pet owners</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="font-medium">
                    Post-Visit Care Instructions
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 text-sm">
                      <p>Monitor your pet for the next 24-48 hours for any changes in behavior, appetite, or energy levels.</p>
                      <p>Ensure your pet has access to fresh water at all times.</p>
                      <p>Follow the medication schedule precisely as prescribed.</p>
                      <p>Create a quiet, comfortable recovery space if your pet underwent any procedures.</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger className="font-medium">
                    Medication Administration Guide
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 text-sm">
                      <p>Always administer medication at the same time each day.</p>
                      <p>Some medications work better with food, while others should be given on an empty stomach.</p>
                      <p>Never crush or split pills unless specifically instructed by your veterinarian.</p>
                      <p>If you miss a dose, contact your veterinarian for guidance before administering the next dose.</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger className="font-medium">
                    When to Contact Your Veterinarian
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 text-sm">
                      <p>If your pet shows any signs of distress, pain, or unusual behavior.</p>
                      <p>If your pet refuses to eat for more than 24 hours.</p>
                      <p>If you notice any potential medication side effects.</p>
                      <p>If your pet's condition worsens or doesn't improve within the expected timeframe.</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-4">
                  <AccordionTrigger className="font-medium">
                    Check-up Schedule
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 text-sm">
                      <p><strong>Short-term follow-up:</strong> 1-2 weeks after treatment for condition assessment.</p>
                      <p><strong>Medication review:</strong> 1 month after starting new medications.</p>
                      <p><strong>Routine check-up:</strong> Every 6 months for senior pets, annually for younger pets.</p>
                      <p><strong>Vaccinations:</strong> According to your pet's specific vaccination schedule.</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button className="flex items-center gap-2">
                <Printer className="h-4 w-4" /> Print Owner's Guide
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FollowUp; 