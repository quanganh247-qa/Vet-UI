import React from 'react';
import { Filter } from 'lucide-react';

interface AppointmentFiltersProps {
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  filterDoctor: string;
  setFilterDoctor: (doctor: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
}

const AppointmentFilters: React.FC<AppointmentFiltersProps> = ({
  filterStatus,
  setFilterStatus,
  filterDoctor,
  setFilterDoctor,
  filterType,
  setFilterType
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <div className="flex items-center">
        <Filter size={16} className="text-gray-500 mr-2" />
        <span className="text-sm font-medium">Lọc:</span>
      </div>
      
      <select 
        className="text-sm border rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
      >
        <option value="all">Tất cả trạng thái</option>
        <option value="Scheduled">Đã lên lịch</option>
        <option value="Confirmed">Đã xác nhận</option>
        <option value="Checked In">Đã đến</option>
        <option value="Waiting">Đang chờ</option>
        <option value="In Progress">Đang khám</option>
        <option value="Completed">Hoàn thành</option>
        <option value="Cancelled">Đã hủy</option>
        <option value="No Show">Không đến</option>
      </select>
      
      <select 
        className="text-sm border rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        value={filterDoctor}
        onChange={(e) => setFilterDoctor(e.target.value)}
      >
        <option value="all">Tất cả bác sĩ</option>
        <option value="Dr. Roberts">Dr. Roberts</option>
        <option value="Dr. Carter">Dr. Carter</option>
      </select>
      
      <select 
        className="text-sm border rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        value={filterType}
        onChange={(e) => setFilterType(e.target.value)}
      >
        <option value="all">Tất cả loại cuộc hẹn</option>
        <option value="Check-up">Khám tổng quát</option>
        <option value="Surgery">Phẫu thuật</option>
        <option value="Sick Visit">Khám bệnh</option>
        <option value="Vaccination">Tiêm phòng</option>
        <option value="Follow-up">Tái khám</option>
      </select>
    </div>
  );
};

export default AppointmentFilters; 