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
  state: string;
  room_name: string;
  reason: string;
  owner: Owner;
  created_at: string; // ISO string, ví dụ: "2023-03-18 12:00:00"
  priority: string;
}

export interface MedicalRecord {
  id: number;
  pet: Pet;
  doctor: Doctor;
  service: Service;
  date: string;
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
  alerts: PatientAlert[];
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

export interface RoomResponse {
  data: Room[];
  message: string;
  status: number;
}

export type Resource = Staff | Room;

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: "info" | "success" | "warning" | "error";
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface Vaccination {
  vaccination_id: number;
  pet_id: number;
  vaccine_name: string;
  date_administered: string;
  next_due_date: string;
  vaccine_provider: string;
  batch_number: string;
  notes: string;
}


// Define types for the treatment management
interface Task {
  id: number;
  name: string;
  status: string;
  dueDate: string;
}

export interface PhaseMedicine {
  phase_id: number;
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes: string;
  created_at: string;
}

export interface TreatmentPhase {
  id: number;
  treatment_id: number;
  phase_name: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string | null;
  medications: PhaseMedicine[];
}

export interface Treatment {
  id: number;
  type: string;
  status: string;
  start_date: string;
  end_date: string | null;
  doctor_name: string;
  description: string;
  phases: TreatmentPhase[];
}

export interface PatientAlert {
  type: string;
  detail: string;
}


// Add interfaces for AI suggestion data
export interface AIMedication {
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  notes?: string;
  duration?: string;
}

export interface AIPhase {
  name: string;
  duration: string;
  tasks: string[];
  medications: AIMedication[];
}

export interface AITreatmentProtocol {
  name: string;
  description: string;
  phases: AIPhase[];
}

export interface AIMedicationDosage {
  medication: string;
  calculatedDosage: string;
  frequency: string;
  route: string;
  warnings: string;
  alternatives: string[];
}

export interface AISuggestions {
  treatmentProtocols: AITreatmentProtocol[];
  medicationDosages: AIMedicationDosage[];
}


/**
 * Response data interface for chat message response
 */
export interface ChatResponse {
  message: string;
  data?: any;
  chartData?: any;
  chartType?: string;
  chartTitle?: string;
  sourceDetails?: string;
}

/**
 * Error response interface
 */
export interface ErrorResponse {
  error: string;
  details?: string;
}


