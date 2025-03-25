import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Bell, Plus, X, Edit2, Check, Send } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Reminder {
  id: string;
  title: string;
  type: "medication" | "follow-up" | "treatment";
  dueDate: Date;
  isActive: boolean;
  ownerNotified: boolean;
  notes?: string;
  frequency?: string;
}

interface MedicationReminderProps {
  patientId: number;
  ownerPhone?: string;
  ownerEmail?: string;
}

const MedicationReminder: React.FC<MedicationReminderProps> = ({
  patientId,
  ownerPhone,
  ownerEmail,
}) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  
  // New reminder form state
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"medication" | "follow-up" | "treatment">("medication");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [notes, setNotes] = useState("");
  const [frequency, setFrequency] = useState("once");
  
  const handleAddReminder = () => {
    if (!title.trim() || !dueDate) return;
    
    const dateTime = new Date(`${dueDate}T${dueTime || "12:00"}`);
    
    if (editingReminder) {
      // Update existing reminder
      setReminders(reminders.map(r => 
        r.id === editingReminder.id 
          ? {
              ...r,
              title,
              type,
              dueDate: dateTime,
              notes,
              frequency
            } 
          : r
      ));
      setEditingReminder(null);
    } else {
      // Add new reminder
      const newReminder: Reminder = {
        id: Date.now().toString(),
        title,
        type,
        dueDate: dateTime,
        isActive: true,
        ownerNotified: false,
        notes,
        frequency
      };
      
      setReminders([...reminders, newReminder]);
    }
    
    resetForm();
  };
  
  const resetForm = () => {
    setTitle("");
    setType("medication");
    setDueDate("");
    setDueTime("");
    setNotes("");
    setFrequency("once");
    setShowForm(false);
  };
  
  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setTitle(reminder.title);
    setType(reminder.type);
    setDueDate(reminder.dueDate.toISOString().split("T")[0]);
    setDueTime(reminder.dueDate.toTimeString().substring(0, 5));
    setNotes(reminder.notes || "");
    setFrequency(reminder.frequency || "once");
    setShowForm(true);
  };
  
  const handleToggleActive = (id: string) => {
    setReminders(reminders.map(r => 
      r.id === id ? { ...r, isActive: !r.isActive } : r
    ));
  };
  
  const handleDelete = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
  };
  
  const handleSendNotification = (reminder: Reminder) => {
    // In a real app, this would send an SMS/email to the owner
    console.log(`Sending notification for: ${reminder.title}`);
    
    // Mark as notified
    setReminders(reminders.map(r => 
      r.id === reminder.id ? { ...r, ownerNotified: true } : r
    ));
    
    // Mock notification
    alert(`Notification for "${reminder.title}" sent to owner's ${ownerEmail ? 'email' : 'phone'}`);
  };
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case "medication": return "bg-purple-50 text-purple-700";
      case "follow-up": return "bg-blue-50 text-blue-700";
      case "treatment": return "bg-green-50 text-green-700";
      default: return "bg-gray-50 text-gray-700";
    }
  };
  
  const isPastDue = (date: Date) => date < new Date();
  
  const formatDateForDisplay = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const reminderDate = new Date(date);
    reminderDate.setHours(0, 0, 0, 0);
    
    if (reminderDate.getTime() === today.getTime()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (reminderDate.getTime() === tomorrow.getTime()) {
      return `Tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };
  
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex justify-between items-center">
          <span>Reminders & Follow-ups</span>
          {!showForm && (
            <Button variant="ghost" size="sm" onClick={() => setShowForm(true)}>
              <Plus size={16} className="mr-1" /> Add
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {showForm ? (
          <div className="space-y-3">
            <div className="flex justify-between">
              <h3 className="text-sm font-medium">
                {editingReminder ? "Edit Reminder" : "New Reminder"}
              </h3>
              <Button size="sm" variant="ghost" onClick={resetForm}>
                <X size={16} />
              </Button>
            </div>
            
            <Input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-sm"
            />
            
            <div className="grid grid-cols-2 gap-2">
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="text-sm rounded-md border border-gray-300 px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="medication">Medication</option>
                <option value="follow-up">Follow-up</option>
                <option value="treatment">Treatment</option>
              </select>
              
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="text-sm rounded-md border border-gray-300 px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="once">Once</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full text-sm rounded-md border border-gray-300 px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Time</label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full text-sm rounded-md border border-gray-300 px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <textarea
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-sm rounded-md border border-gray-300 px-3 py-1 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={resetForm}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleAddReminder}>
                {editingReminder ? "Update" : "Add"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {reminders.length === 0 ? (
              <div className="text-gray-500 text-sm text-center py-4">
                No reminders yet. Add one to keep track of follow-ups and medications.
              </div>
            ) : (
              reminders
                .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
                .map(reminder => (
                  <div 
                    key={reminder.id} 
                    className={`p-3 rounded-md text-sm border-l-2 ${
                      !reminder.isActive 
                        ? "bg-gray-50 border-gray-300 opacity-70" 
                        : isPastDue(reminder.dueDate)
                          ? "bg-red-50 border-red-500"
                          : "bg-blue-50 border-blue-500"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium flex items-center">
                          {reminder.title}
                          <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${getTypeColor(reminder.type)}`}>
                            {reminder.type}
                          </span>
                        </div>
                        
                        <div className="flex items-center mt-1 text-xs text-gray-600">
                          <Calendar size={12} className="mr-1" />
                          {formatDateForDisplay(reminder.dueDate)}
                          {reminder.frequency !== "once" && (
                            <span className="ml-2 bg-gray-100 px-1.5 py-0.5 rounded">
                              {reminder.frequency}
                            </span>
                          )}
                        </div>
                        
                        {reminder.notes && (
                          <div className="mt-1 text-xs text-gray-600">
                            {reminder.notes}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="p-1 hover:bg-gray-200 rounded-full">
                              <Send size={14} className="text-blue-600" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-64 p-3" align="end">
                            <h3 className="font-medium text-sm mb-2">Notify Owner</h3>
                            {(ownerEmail || ownerPhone) ? (
                              <div className="space-y-2">
                                {ownerPhone && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => handleSendNotification(reminder)}
                                  >
                                    Send SMS to {ownerPhone}
                                  </Button>
                                )}
                                {ownerEmail && (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="w-full justify-start"
                                    onClick={() => handleSendNotification(reminder)}
                                  >
                                    Send Email to {ownerEmail}
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">No contact info available</p>
                            )}
                          </PopoverContent>
                        </Popover>
                        
                        <button
                          onClick={() => handleEdit(reminder)}
                          className="p-1 hover:bg-gray-200 rounded-full"
                        >
                          <Edit2 size={14} className="text-gray-600" />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(reminder.id)}
                          className="p-1 hover:bg-gray-200 rounded-full"
                        >
                          <X size={14} className="text-gray-600" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-between">
                      <div className="flex items-center">
                        <Switch
                          id={`active-${reminder.id}`}
                          checked={reminder.isActive}
                          onCheckedChange={() => handleToggleActive(reminder.id)}
                          className="mr-2 h-4 w-7"
                        />
                        <Label htmlFor={`active-${reminder.id}`} className="text-xs">
                          {reminder.isActive ? "Active" : "Inactive"}
                        </Label>
                      </div>
                      
                      {reminder.ownerNotified && (
                        <div className="text-xs flex items-center text-green-600">
                          <Check size={12} className="mr-1" />
                          Owner notified
                        </div>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MedicationReminder; 