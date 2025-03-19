import { useState } from 'react';
import { useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Clock, 
  Layout, 
  List, 
  Plus,
} from 'lucide-react';
import KanbanView from './kanban';
import ListView from './list';
import TimelineView from './timeline';

// Main Appointment Flow Component
const AppointmentFlow = () => {
  const [, setLocation] = useLocation();
  const [activeView, setActiveView] = useState('kanban');
  
  return (
    <div className="max-w-full bg-white rounded-lg shadow-sm">
      <div className="p-5">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Appointment Flow</h1>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-56 pl-8 pr-4 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#2C7BE5]"
              />
              <svg 
                className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <div className="relative">
              <div className="flex items-center justify-center h-9 w-9 bg-indigo-100 rounded-full">
                <span className="text-indigo-600 text-sm font-medium">2</span>
              </div>
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">2</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
                DR
              </div>
              <span className="text-sm">Dr. Roberts</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-2">
            <button className="p-1.5 border rounded">
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="flex items-center space-x-1.5">
              <Calendar className="h-5 w-5 text-gray-600" />
              <span className="text-gray-800 font-medium">Tuesday, March 19, 2025</span>
            </div>
            <button className="p-1.5 border rounded">
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              className="flex items-center text-indigo-600"
              onClick={() => setLocation('/appointment/create')}
            >
              <Plus className="h-4 w-4 mr-1" />
              New Appointment
            </Button>
            
            <div className="flex border rounded-md overflow-hidden">
              <button 
                className={`px-3 py-1.5 flex items-center ${activeView === 'kanban' ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-700'}`} 
                onClick={() => setActiveView('kanban')}
              >
                <Layout className="h-4 w-4 mr-1" />
                Kanban
              </button>
              <button 
                className={`px-3 py-1.5 flex items-center ${activeView === 'timeline' ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-700'}`} 
                onClick={() => setActiveView('timeline')}
              >
                <Clock className="h-4 w-4 mr-1" />
                Timeline
              </button>
              <button 
                className={`px-3 py-1.5 flex items-center ${activeView === 'list' ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-700'}`} 
                onClick={() => setActiveView('list')}
              >
                <List className="h-4 w-4 mr-1" />
                List
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 text-sm mb-5">
          <div className="border rounded px-3 py-1.5 flex items-center">
            <Filter className="h-4 w-4 mr-1.5 text-gray-500" />
            <span>All Statuses</span>
            <ChevronRight className="h-4 w-4 ml-1.5 text-gray-500" />
          </div>
          
          <div className="border rounded px-3 py-1.5 flex items-center">
            <span>All Doctors</span>
            <ChevronRight className="h-4 w-4 ml-1.5 text-gray-500" />
          </div>
          
          <div className="border rounded px-3 py-1.5 flex items-center">
            <span>All Types</span>
            <ChevronRight className="h-4 w-4 ml-1.5 text-gray-500" />
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-sm mb-5">
          <div className="flex items-center">
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            <span className="ml-1">2 Doctors Available</span>
          </div>
          <div className="text-gray-300">|</div>
          <div className="flex items-center">
            <span className="h-2 w-2 rounded-full bg-blue-500"></span>
            <span className="ml-1">1 Doctor Busy</span>
          </div>
          <div className="text-gray-300">|</div>
          <div className="flex items-center">
            <span className="h-2 w-2 rounded-full bg-gray-500"></span>
            <span className="ml-1">3 Rooms Available</span>
          </div>
          <div className="text-gray-300">|</div>
          <div className="flex items-center">
            <span className="h-2 w-2 rounded-full bg-red-500"></span>
            <span className="ml-1">2 Rooms In Use</span>
          </div>
        </div>
        
        {activeView === 'kanban' && <KanbanView />}
        {activeView === 'list' && <ListView />}
        {activeView === 'timeline' && <TimelineView />}
      </div>
    </div>
  );
};

export default AppointmentFlow;