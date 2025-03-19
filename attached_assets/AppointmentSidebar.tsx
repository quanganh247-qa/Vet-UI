import React from 'react';
import { FileText, Users, X, ExternalLink, Phone, MessageSquare, AlertCircle, Edit, XCircle, CheckCircle, Clipboard, Calendar, DollarSign } from 'lucide-react';
import { Appointment, QueueItem } from '../../types';
interface AppointmentSidebarProps {
  showSidebar: boolean;
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  sidebarContent: string;
  setSidebarContent: React.Dispatch<React.SetStateAction<string>>;
  selectedAppointment: Appointment | undefined;
  queueData: QueueItem[];
  handleStatusChange: (appointmentId: number, newStatus: string) => void;
  getStatusColorClass: (status: string) => string;
}

const AppointmentSidebar: React.FC<AppointmentSidebarProps> = ({
  showSidebar,
  setShowSidebar,
  sidebarContent,
  setSidebarContent,
  selectedAppointment,
  queueData,
  handleStatusChange,
  getStatusColorClass
}) => {
  if (!showSidebar) return null;

  return (
    <div className="w-1/4 border-l bg-white overflow-auto">
      {/* Sidebar Header */}
      <div className="p-4 border-b flex justify-between items-center bg-gray-50">
        <h3 className="font-medium">
          {sidebarContent === 'queue' && 'Danh sách chờ'}
          {sidebarContent === 'details' && 'Chi tiết lịch hẹn'}
          {sidebarContent === 'new' && 'Thêm lịch hẹn mới'}
        </h3>

        <div className="flex">
          <button
            className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100 mr-1"
            onClick={() => setSidebarContent(
              sidebarContent === 'queue' ? 'details' :
                sidebarContent === 'details' ? 'queue' : 'queue'
            )}
          >
            {sidebarContent === 'queue' ? <FileText size={16} /> : <Users size={16} />}
          </button>
          <button
            className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
            onClick={() => setShowSidebar(false)}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Sidebar Content */}
      {sidebarContent === 'queue' && (
        <div className="p-4">
          <div className="mb-4 flex justify-between items-center">
            <h4 className="font-medium">Bệnh nhân đang chờ ({queueData.length})</h4>
            <button className="text-xs text-indigo-600 hover:text-indigo-800">
              Hiển thị màn hình chờ
            </button>
          </div>

          {queueData.length > 0 ? (
            <div className="space-y-3">
              {queueData
                .sort((a, b) => {
                  if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
                  if (a.priority !== 'urgent' && b.priority === 'urgent') return 1;
                  return a.position - b.position;
                })
                .map(queueItem => {
                  const appointment = queueItem;

                  return (
                    <div
                      key={queueItem.id}
                      className={`border rounded overflow-hidden ${queueItem.priority === 'urgent' ? 'border-red-400' : 'border-gray-200'
                        }`}
                    >
                      <div className={`px-3 py-2 ${getStatusColorClass(queueItem.status)}`}>
                        <div className="flex justify-between items-center">
                          <div className="font-medium text-sm">#{queueItem.position}: {appointment.patientName}</div>
                          {queueItem.priority === 'urgent' && (
                            <span className="text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded-full">
                              Ưu tiên
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-3">
                        <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                          <div>
                            <div className="text-gray-500 text-xs">Bác sĩ</div>
                            <div>{appointment.doctor}</div>
                          </div>
                          <div>
                            <div className="text-gray-500 text-xs">Loại khám</div>
                            <div>{appointment.appointmentType}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                          <div>
                            <div className="text-gray-500 text-xs">Thời gian chờ</div>
                            <div className={queueItem.actualWaitTime > '15 min' ? 'text-red-600' : ''}>
                              {queueItem.actualWaitTime}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500 text-xs">Chờ từ</div>
                            <div>{queueItem.waitingSince}</div>
                          </div>
                        </div>

                        <div className="mt-3 flex justify-end space-x-2">
                          <button
                            className="px-2 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
                            onClick={() => handleStatusChange(queueItem.id, 'In Progress')}
                          >
                            Bắt đầu khám
                          </button>
                          <button className="px-2 py-1 border text-xs rounded hover:bg-gray-50">
                            Thông báo
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Không có bệnh nhân đang chờ
            </div>
          )}

          <div className="mt-6">
            <h4 className="font-medium mb-3">Thống kê thời gian chờ</h4>
            <div className="bg-gray-50 p-3 rounded">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Thời gian chờ trung bình</div>
                  <div className="text-xl font-bold text-indigo-600">12 phút</div>
                </div>
                <div>
                  <div className="text-gray-500">Bệnh nhân đã đợi &gt;15 phút</div>
                  <div className="text-xl font-bold text-red-600">1</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {sidebarContent === 'details' && selectedAppointment && (
        <div className="p-4">
          {/* Patient Info */}
          <div className="mb-4 flex items-start">
            <img
              src={"URL_ADDRESS.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80"}
              alt={selectedAppointment.pet.pet_name}
              className="h-16 w-16 rounded-full mr-4"
            />
            <div>
              <h3 className="font-bold text-lg">{selectedAppointment.pet.pet_breed}</h3>
              <div className="text-sm text-gray-600">
                {selectedAppointment.pet.pet_breed} 
              </div>
              <div className="mt-1 flex items-center">
                <button className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center">
                  <ExternalLink size={14} className="mr-1" />
                  Xem hồ sơ bệnh nhân
                </button>
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium mb-3">Chi tiết lịch hẹn</h4>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <div className="text-sm text-gray-500">Loại khám</div>
                <div className="font-medium">{selectedAppointment.service.service_name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Lý do khám</div>
                <div>{selectedAppointment.reason}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <div className="text-sm text-gray-500">Thời gian</div>
                <div>{selectedAppointment.time_slot.start_time} - {selectedAppointment.time_slot.end_time}</div>
              </div>
              {/* <div>
                <div className="text-sm text-gray-500">Thời lượng</div>
                <div>{selectedAppointment.duration} phút</div>
              </div> */}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <div className="text-sm text-gray-500">Bác sĩ phụ trách</div>
                <div>{selectedAppointment.doctor_name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Phòng</div>
                <div>{selectedAppointment.room_name}</div>
              </div>
            </div>

            {/* <div className="mb-3">
              <div className="text-sm text-gray-500">Ghi chú</div>
              <div>{selectedAppointment.notes || 'Không có ghi chú'}</div>
            </div> */}
          </div>

          {/* Owner Information */}
          <div className="mb-4">
            <h4 className="font-medium mb-3">Thông tin chủ nuôi</h4>

            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>
                <div className="text-sm text-gray-500">Tên</div>
                <div>{selectedAppointment.owner.owner_name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Số điện thoại</div>
                <div>{selectedAppointment.owner.owner_name}</div>
              </div>
            </div>

            <div className="flex space-x-2 mt-2">
              <button className="px-2 py-1 border text-xs rounded hover:bg-gray-50 flex items-center">
                <Phone size={12} className="mr-1" />
                Gọi điện
              </button>
              <button className="px-2 py-1 border text-xs rounded hover:bg-gray-50 flex items-center">
                <MessageSquare size={12} className="mr-1" />
                Tin nhắn
              </button>
            </div>
          </div>

          {/* Status Management */}
          <div className="mb-4">
            <h4 className="font-medium mb-3">Trạng thái lịch hẹn</h4>

            <div className="flex items-center mb-3">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-2 bg-green-500 rounded-full"
                  style={{
                    width:
                      selectedAppointment.state === 'Scheduled' ? '10%' :
                        selectedAppointment.state === 'Confirmed' ? '25%' :
                          selectedAppointment.state === 'Checked In' || selectedAppointment.state === 'Arrived' || selectedAppointment.state === 'Waiting' ? '50%' :
                            selectedAppointment.state === 'In Progress' ? '75%' :
                              selectedAppointment.state === 'Completed' ? '100%' : '0%'
                  }}
                ></div>
              </div>
              <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getStatusColorClass(selectedAppointment.state)}`}>
                {selectedAppointment.state}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {selectedAppointment.state === 'Scheduled' || selectedAppointment.state === 'Confirmed' ? (
                <button
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center justify-center"
                  onClick={() => handleStatusChange(selectedAppointment.id, 'Checked In')}
                >
                  <CheckCircle size={14} className="mr-1" />
                  Check-in
                </button>
              ) : null}

              {(selectedAppointment.state === 'Checked In' || selectedAppointment.state === 'Arrived' || selectedAppointment.state === 'Waiting') ? (
                <button
                  className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 flex items-center justify-center"
                  onClick={() => handleStatusChange(selectedAppointment.id, 'In Progress')}
                >
                  Bắt đầu khám
                </button>
              ) : null}

              {selectedAppointment.state === 'In Progress' && (
                <button
                  className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center justify-center"
                  onClick={() => handleStatusChange(selectedAppointment.id, 'Completed')}
                >
                  <CheckCircle size={14} className="mr-1" />
                  Hoàn thành
                </button>
              )}

              {selectedAppointment.state !== 'Completed' && selectedAppointment.state !== 'Cancelled' && (
                <button className="px-3 py-1.5 border text-sm rounded hover:bg-gray-50 flex items-center justify-center">
                  <Edit size={14} className="mr-1" />
                  Chỉnh sửa
                </button>
              )}

              {selectedAppointment.state !== 'Completed' && selectedAppointment.state !== 'Cancelled' && (
                <button className="px-3 py-1.5 border text-red-600 text-sm rounded hover:bg-red-50 flex items-center justify-center">
                  <XCircle size={14} className="mr-1" />
                  Hủy lịch hẹn
                </button>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between flex-wrap gap-2">
              <button className="px-3 py-1.5 border text-sm rounded hover:bg-gray-50 flex items-center">
                <FileText size={14} className="mr-1" />
                SOAP Notes
              </button>

              <button className="px-3 py-1.5 border text-sm rounded hover:bg-gray-50 flex items-center">
                <Clipboard size={14} className="mr-1" />
                Kê đơn
              </button>

              <button className="px-3 py-1.5 border text-sm rounded hover:bg-gray-50 flex items-center">
                <DollarSign size={14} className="mr-1" />
                Thanh toán
              </button>

              <button className="px-3 py-1.5 border text-sm rounded hover:bg-gray-50 flex items-center">
                <Calendar size={14} className="mr-1" />
                Đặt lịch hẹn tiếp
              </button>
            </div>
          </div>
        </div>
      )}

      {sidebarContent === 'new' && (
        <div className="p-4">
          <h3 className="font-medium mb-4">Tạo lịch hẹn mới</h3>

          <div className="space-y-4">
            {/* Patient Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bệnh nhân
              </label>
              <div className="relative mt-1">
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Tìm kiếm bệnh nhân..."
                />
              </div>
            </div>

            {/* Add more form fields for new appointment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại lịch hẹn
              </label>
              <select className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Chọn loại lịch hẹn</option>
                <option value="check-up">Khám tổng quát</option>
                <option value="sick-visit">Khám bệnh</option>
                <option value="vaccination">Tiêm phòng</option>
                <option value="surgery">Phẫu thuật</option>
                <option value="dental">Nha khoa</option>
                <option value="grooming">Làm đẹp</option>
                <option value="new-patient">Bệnh nhân mới</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                className="px-4 py-2 border rounded shadow-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setSidebarContent('queue')}
              >
                Hủy
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded shadow-sm hover:bg-indigo-700">
                Tạo lịch hẹn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentSidebar; 