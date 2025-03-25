import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Plus, Pin, X } from "lucide-react";

interface QuickNote {
  id: string;
  content: string;
  timestamp: Date;
  category: string;
  isPinned: boolean;
}

interface QuickNotesProps {
  patientId: number;
  appointmentId?: number;
  onNoteSaved?: (note: QuickNote) => void;
}

const QuickNotes: React.FC<QuickNotesProps> = ({
  patientId,
  appointmentId,
  onNoteSaved
}) => {
  const [notes, setNotes] = useState<QuickNote[]>([]);
  const [newNote, setNewNote] = useState<string>("");
  const [category, setCategory] = useState<string>("general");
  const [showForm, setShowForm] = useState<boolean>(false);
  
  // Predefined templates for quick selection
  const templates = [
    { label: "Awaiting lab results", content: "Awaiting lab results before proceeding with treatment." },
    { label: "Follow-up reminder", content: "Schedule follow-up in 2 weeks to assess progress." },
    { label: "Medication change", content: "Consider changing medication if no improvement in 72 hours." }
  ];
  
  const categories = [
    { value: "general", label: "General" },
    { value: "medication", label: "Medication" },
    { value: "follow-up", label: "Follow-up" },
    { value: "lab", label: "Lab Results" }
  ];
  
  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    const note: QuickNote = {
      id: Date.now().toString(),
      content: newNote,
      timestamp: new Date(),
      category,
      isPinned: false
    };
    
    setNotes([note, ...notes]);
    setNewNote("");
    setShowForm(false);
    
    if (onNoteSaved) {
      onNoteSaved(note);
    }
  };
  
  const handleTemplateSelect = (content: string) => {
    setNewNote(content);
  };
  
  const togglePin = (id: string) => {
    setNotes(
      notes.map(note => 
        note.id === id ? { ...note, isPinned: !note.isPinned } : note
      )
    );
  };
  
  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };
  
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex justify-between items-center">
          <span>Quick Notes</span>
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
            <div className="flex gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="text-sm rounded-md border border-gray-300 px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              
              <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setShowForm(false)}>
                <X size={16} />
              </Button>
            </div>
            
            <Textarea
              placeholder="Enter your note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="min-h-[100px]"
            />
            
            <div className="flex flex-wrap gap-1">
              {templates.map((template, index) => (
                <button
                  key={index}
                  onClick={() => handleTemplateSelect(template.content)}
                  className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded px-2 py-1"
                >
                  {template.label}
                </button>
              ))}
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleAddNote}>
                <Save size={14} className="mr-1" /> Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {notes.length === 0 ? (
              <div className="text-gray-500 text-sm text-center py-4">
                No quick notes yet. Add one to keep track of important information.
              </div>
            ) : (
              notes
                .sort((a, b) => (a.isPinned === b.isPinned ? 0 : a.isPinned ? -1 : 1))
                .map(note => (
                  <div
                    key={note.id}
                    className={`p-2 rounded-md text-sm relative ${
                      note.isPinned ? "bg-yellow-50 border border-yellow-100" : "bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-gray-200 text-gray-700">
                        {categories.find(c => c.value === note.category)?.label}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => togglePin(note.id)}
                          className={`p-1 rounded-full hover:bg-gray-200 ${
                            note.isPinned ? "text-amber-500" : "text-gray-400"
                          }`}
                        >
                          <Pin size={12} />
                        </button>
                        <button
                          onClick={() => deleteNote(note.id)}
                          className="p-1 rounded-full hover:bg-gray-200 text-gray-400"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-1">{note.content}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {note.timestamp.toLocaleString()}
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

export default QuickNotes; 