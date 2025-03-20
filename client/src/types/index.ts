export interface AppointmentsResponse {
  code: string;
  data: Appointment[];
  message: string;
}

export interface Appointment {
  id: number;
  pet: Pet;
  doctor: Doctor;
  service: Service;
  date: string; // ISO string, ví dụ: "2025-03-18"
  reminder_send: boolean;
  time_slot: TimeSlot;
  state : string;
  room_name: string;
  reason: string;
  owner: Owner;
  created_at: string; // ISO string, ví dụ: "2023-03-18 12:00:00"
  priority: string;
}

export interface Doctor {
  doctor_id: number;
  doctor_name: string;
  doctor_phone: string;
  doctor_email: string;
  doctor_specialty: string;
  doctor_avatar: string;
}

export interface Service {
  service_name: string;
  service_duration: number;
}

export interface Pet {
  pet_id: number;
  pet_name: string;
  pet_breed: string;

}


export interface Owner {
  owner_name: string;
  owner_phone: string;
  owner_email: string;
  owner_address: string;
}

export interface TimeSlot {
  start_time: string;
  end_time: string;
}

export interface Alert {
  type: string;
  detail: string;
}

export interface Patient {
  petid: number;
  username: string;
  name: string;
  type: string;
  breed: string;
  age: string;
  birth_date: string;
  data_image: string;
  original_name: string;
  // alerts: Alert[];
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
