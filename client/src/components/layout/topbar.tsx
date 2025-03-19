import { Bell, Search, Menu, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";

interface TopbarProps {
  openSidebar: () => void;
}

const Topbar = ({ openSidebar }: TopbarProps) => {
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center md:hidden">
          <button 
            type="button" 
            className="text-gray-500 hover:text-gray-600"
            onClick={openSidebar}
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-display font-medium ml-3 text-[#12263F]">Dashboard</h1>
        </div>
        
        <div className="hidden md:block">
          <div className="relative max-w-xs w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input 
              type="search" 
              placeholder="Search patients, appointments..." 
              className="pl-10 pr-3 py-2 border border-gray-200 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:border-[#2C7BE5] w-full"
            />
          </div>
        </div>
        
        <div className="flex items-center">
          <button className="p-2 mr-2 text-gray-500 hover:text-gray-600 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#FF6B6B]"></span>
          </button>
          <button className="p-2 mr-3 text-gray-500 hover:text-gray-600">
            <MessageSquare className="h-5 w-5" />
          </button>
          <button className="flex items-center text-sm text-[#12263F] md:hidden">
            <img 
              className="h-8 w-8 rounded-full object-cover" 
              src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80" 
              alt="Profile" 
            />
          </button>
        </div>
      </div>
      
      <div className="md:hidden p-4 pt-0">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input 
            type="search" 
            placeholder="Search patients, appointments..." 
            className="pl-10 pr-3 py-2 border border-gray-200 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:border-[#2C7BE5] w-full"
          />
        </div>
      </div>
    </header>
  );
};

export default Topbar;
