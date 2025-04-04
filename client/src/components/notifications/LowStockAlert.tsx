import React from 'react';
import { LowStockNotification } from '../../types';

interface LowStockAlertProps {
  notification: LowStockNotification;
  onClose: () => void;
  onReorder: (medicineId: number) => void;
}

const LowStockAlert: React.FC<LowStockAlertProps> = ({ 
  notification, 
  onClose,
  onReorder 
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onReorder(notification.medicine_id);
    }
  };

  return (
    <div className="flex items-start p-4 mb-3 bg-white border-l-4 border-amber-500 rounded-md shadow-md">
      <div className="flex-shrink-0 pt-0.5">
        <svg className="w-6 h-6 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div className="ml-3 flex-1">
        <h3 className="text-sm font-medium text-gray-900">Low Stock Alert</h3>
        <div className="mt-1 text-sm text-gray-700">
          <p><span className="font-semibold">{notification.medicine_name}</span> is running low.</p>
          <p className="mt-1">
            Current stock: <span className="font-semibold text-red-600">{notification.current_stock}</span> | 
            Reorder level: <span className="font-semibold">{notification.reorder_level}</span>
          </p>
        </div>
        <div className="mt-3 flex space-x-2">
          <button
            type="button"
            onClick={() => onReorder(notification.medicine_id)}
            onKeyDown={handleKeyDown}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            aria-label="Reorder medicine"
            tabIndex={0}
          >
            Reorder Now
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            aria-label="Dismiss notification"
            tabIndex={0}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default LowStockAlert; 