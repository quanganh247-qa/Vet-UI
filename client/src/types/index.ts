export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

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
  room: string;
  reason: string;
  owner: Owner;
  created_at: string; // ISO string, ví dụ: "2023-03-18 12:00:00"
  priority: string;
  arrival_time: string;
}

export interface MedicalRecord {
  id: number;
  pet: Pet;
  doctor: Doctor;
  service: Service;
  date: string;
  type: string;
  diagnosis: string[];
  treatments: string[];
  notes: string;
  vital_signs?: {
    temperature: string;
    heart_rate: string;
    respiratory_rate: string;
    weight: string;
  };
  lab_results?: {
    [key: string]: {
      value: string;
      reference_range?: string;
      status: "normal" | "low" | "high" | "critical";
    };
  };
  attachments?: Array<{
    id: number;
    url: string;
    type: string;
    notes?: string;
  }>;
}

export interface Doctor {
  doctor_id: number;
  doctor_name: string;
  doctor_phone?: string;
  doctor_email?: string;
  doctor_specialty?: string;
  doctor_avatar?: string;
  specialization?: string;
  years_of_exp?: number;
  education?: string;
  role?: string;
  certificate?: string;
  bio?: string;
}

export interface Service {
  service_name: string;
  service_duration: number;
  service_amount: number;
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
  gender: string;
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

export type Resource = DoctorDetail | Room;

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
  name: string;
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

export interface ChatResponse {
  message: string;
  data?: any;
  chartData?: any;
  chartType?: string;
  chartTitle?: string;
  sourceDetails?: string;
}

export interface ErrorResponse {
  error: string;
  details?: string;
}

export interface QuickLinkRequest {
  bank_id: string | "mbbank";
  account_no: string | "220220222419";
  template: string | "print";
  description: string | "Thank you for your payment";
  amount: number;         
  account_name: string | "DINH HUU QUANG ANH";
  order_id: number | 0;
  test_order_id: number | 0;
}

export interface QRCodeInformation {
  accountNo: string | "220220222419";
  accountName: string | "DINH HUU QUANG ANH";
  acqId: string | "970422";
  amount: number | 0;
  addInfo: string | "Thank you for your payment";
  format: string | "text";
  template: string | "E4jYBZ1";
  order_id: number | 0;
}

export interface GenerateQRCodeResponse {
  Code: string;
  Desc: string;
  Data: GenerateQRData;
}

export interface GenerateQRData {
  AcpID: number;
  AccountName: string;
  QRCode: string;
  QRDataURL: string;
}

export interface ObjectiveData {
  vital_signs: VitalSigns;
  systems: Systems;
}

export interface VitalSigns {
  weight: string;
  temperature: string;
  heart_rate: string;
  respiratory_rate: string;
  general_notes: string;
}

export interface Systems {
  cardiovascular: string;
  respiratory: string;
  gastrointestinal: string;
  musculoskeletal: string;
  neurological: string;
  skin: string;
  eyes: string;
  ears: string;
}

export interface TestCategory {
  id: string;
  name: string;
  icon_name: string;
  description: string;
  created_at: string;
  updated_at: string;
  tests: Test[];
}

export interface Test {
  id: string;
  name: string;
  description: string;
  price: string;
  turnaround_time: string;
}

export interface CreateInvoiceRequest {
  invoice_number: string;
  amount: number;
  date: string;
  due_date: string;
  status: string;
  description: string;
  customer_name: string;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  name: string;
  price: number;
  quantity: number;
}

export interface CreateTreatmentPhaseRequest {
  phase_name: string;
  description: string;
  start_date: string;
  status: string;
}

export interface TreatmentPhase {
  id: number;
  treatment_id: number;
  phase_name: string;
  description: string;
  status: string;
  start_date: string;
  created_at: string;
}

export interface AssignMedicineRequest {
  medicine_id: number;
  dosage: string;
  frequency: string;
  duration: string;
  notes: string;
}

export interface PhaseMedicine {
  phase_id: number;
  medicine_id: number;
  dosage: string;
  frequency: string;
  duration: string;
  notes: string;
  created_at: string;
  quantity: number;
  is_received: boolean;
}

export interface CreateTreatmentRequest {
  pet_id: number;
  doctor_id: number;
  name: string;
  type: string;
  diseases: string;
  start_date: string;
  status: string;
  notes: string;
}

export interface CreateTreatmentPhaseRequest {
  phase_name: string;
  description: string;
  start_date: string;
  status: string;
}

export interface Vaccine {
  id: number;
  name: string;
  type: string;
  manufacturer: string;
  description: string;
  recommended_age: string;
  booster_frequency: string;
  side_effects: string[];
  contraindications: string[];
  created_at: string;
  updated_at: string;
}

export interface Medication {
  id: number;
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  side_effects: string;
  description: string;
  usage: string;
  expiration_date: string;
  quantity: number;
  reorder_level: number;
  unit_price: number;
  supplier_name: string;
}

export interface MedicineTransactionRequest {
  medicine_id: number;
  quantity: number;
  transaction_type: string;
  unit_price: number;
  supplier_id: number;
  expiration_date: string;
  notes: string;
  prescription_id: number;
  appointment_id: number;
}

export interface MedicineTransactionResponse {
  id: number;
  medicine_id: number;
  medicine_name: string;
  quantity: number;
  transaction_type: string;
  unit_price: number;
  total_amount: number;
  transaction_date: string;
  supplier_id: number;
  supplier_name: string;
  expiration_date: string;
  notes: string;
  prescription_id: number;
  appointment_id: number;
}

export interface MedicineSupplierRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
  contact_name: string;
  notes: string;
}

export interface MedicineSupplierResponse {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  contact_name: string;
  notes: string;
  created_at: string;
}

export interface ExpiredMedicineNotification {
  medicine_id: number;
  medicine_name: string;
  expiration_date: string;
  days_until_expiry: number;
  quantity: number;
}

export interface LowStockNotification {
  medicine_id: number;
  medicine_name: string;
  current_stock: number;
  reorder_level: number;
}

export interface Shift {
  id: number;
  start_time: Date;
  end_time: Date;
  assigned_patients: number;
  created_at: Date;
  doctor_id: number;
  title?: string;
  status?: 'scheduled' | 'completed' | 'cancelled';
  location?: string;
  description?: string;
}

export interface DoctorProfile {
  doctor_id: number;
  doctor_name: string;
  specialization: string;
  years_of_exp: number;
  education: string;
  role: string;
  certificate: string;
  bio: string;
}

export interface WorkShift {
  id: string;
  title: string;
  start_time: Date;
  end_time: Date;
  doctor_id: string;
  description?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  location?: string;
  created_at: Date;
}

export interface DoctorSchedule extends Doctor {
  availability?: DoctorAvailability[];
}

export interface DoctorAvailability {
  doctorId: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  startTime: string;
  endTime: string;
}

export interface WorkScheduleFilters {
  doctorId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: 'scheduled' | 'completed' | 'cancelled';
}

export interface DoctorDetail {
	doctor_id: number;
	username: string;
	doctor_name: string;
	email: string;
	role: string;
	specialization: string;
	years_of_experience: number;
	education: string;
	certificate_number: string;
	bio: string;
	data_image: string;
}

export interface TestByAppointment {
	test_id: string;
	test_name: string;
	expiration_date: string;
	batch_number: string;
}

export interface AppointmentNotification {
  id: string;
  title: string;
  appointment_id: number;
  doctor: Doctor;
  pet: Pet;
  reason: string;
  date: string;
  time_slot: string | { start_time: string; end_time: string };
  service_name: string;
  status?: 'confirmed' | 'declined' | 'pending';
  _notificationId?: number; // Outer notification ID from the server
}
