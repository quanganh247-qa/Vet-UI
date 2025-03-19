export interface Appointment {
  id: number;
  pet: {
    pet_name: string;
    pet_breed: string;
  };
  doctor_name: string;
  service: {
    service_name: string;
    service_duration: number;
  };
  date: string;
  reminder_send: boolean;
  time_slot: {
    start_time: string;
    end_time: string;
  };
  state: string;
  room_name: string;
  reason: string;
  owner: {
    owner_name: string;
    owner_phone: string;
  };
  created_at: string;
  priority: string;
}

export interface QueueItem {
  id: number;
  position: number;
  patientName: string;
  appointmentType: string;
  estimatedWaitTime: string;
  actualWaitTime: string;
  status: string;
  waitingSince: string;
  priority: string;
  doctor: string;
}

export interface Staff {
  id: number;
  name: string;
  role: string;
  status: string;
  avatar: string;
}

export interface Room {
  id: number;
  name: string;
  type: string;
  status: string;
  currentPatient: string | null;
  availableAt: string;
}

export type Resource = Staff | Room;