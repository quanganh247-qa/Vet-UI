import { useNavigate } from 'react-router-dom';
import NotificationCenter from '../components/notifications/NotificationCenter';

const navigate = useNavigate();

<div className="flex items-center space-x-4">
  <NotificationCenter 
    onReorderMedicine={(medicineId) => {
      // Navigate to medicine inventory page with the selected medicine
      navigate(`/inventory/medicines/${medicineId}/reorder`);
    }} 
  />
  {/* ... existing user controls ... */}
</div> 