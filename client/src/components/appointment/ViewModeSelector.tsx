import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { 
  LayoutGrid, 
  List, 
  Calendar as CalendarIcon,
  Columns
} from 'lucide-react';

interface ViewModeSelectorProps {
  viewMode: string;
  setViewMode: (mode: string) => void;
}

export const ViewModeSelector: React.FC<ViewModeSelectorProps> = ({
  viewMode,
  setViewMode
}) => {
  return (
    <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value)}>
      <ToggleGroupItem value="list" aria-label="List View" title="List View">
        <List size={16} />
      </ToggleGroupItem>
      
      <ToggleGroupItem value="timeline" aria-label="Timeline View" title="Timeline View">
        <CalendarIcon size={16} />
      </ToggleGroupItem>
      
      <ToggleGroupItem value="column" aria-label="Column View" title="Column View">
        <Columns size={16} />
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export default ViewModeSelector;