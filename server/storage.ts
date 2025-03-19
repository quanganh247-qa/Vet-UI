import { 
  patients, Patient, InsertPatient,
  appointments, Appointment, InsertAppointment,
  staff, Staff, InsertStaff,
  schedules, Schedule, InsertSchedule,
  analytics, Analytic, InsertAnalytic,
  users, User, InsertUser 
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Patient methods
  getPatient(id: number): Promise<Patient | undefined>;
  getPatients(): Promise<Patient[]>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: number, patient: Partial<InsertPatient>): Promise<Patient | undefined>;
  deletePatient(id: number): Promise<boolean>;
  getRecentPatients(limit: number): Promise<Patient[]>;

  // Appointment methods
  getAppointment(id: number): Promise<Appointment | undefined>;
  getAppointments(): Promise<Appointment[]>;
  getAppointmentsByDate(date: Date): Promise<Appointment[]>;
  getAppointmentsByPatient(patientId: number): Promise<Appointment[]>;
  getAppointmentsByDoctor(doctorId: number): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: number): Promise<boolean>;

  // Staff methods
  getStaff(id: number): Promise<Staff | undefined>;
  getAllStaff(): Promise<Staff[]>;
  createStaff(staff: InsertStaff): Promise<Staff>;
  updateStaff(id: number, staff: Partial<InsertStaff>): Promise<Staff | undefined>;
  deleteStaff(id: number): Promise<boolean>;

  // Schedule methods
  getSchedule(id: number): Promise<Schedule | undefined>;
  getSchedulesByStaff(staffId: number): Promise<Schedule[]>;
  getSchedulesByDate(date: Date): Promise<Schedule[]>;
  createSchedule(schedule: InsertSchedule): Promise<Schedule>;
  updateSchedule(id: number, schedule: Partial<InsertSchedule>): Promise<Schedule | undefined>;
  deleteSchedule(id: number): Promise<boolean>;

  // Analytics methods
  getAnalytics(): Promise<Analytic[]>;
  getAnalyticsByDate(date: Date): Promise<Analytic | undefined>;
  createAnalytic(analytic: InsertAnalytic): Promise<Analytic>;
  updateAnalytic(id: number, analytic: Partial<InsertAnalytic>): Promise<Analytic | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private patients: Map<number, Patient>;
  private appointments: Map<number, Appointment>;
  private staffMembers: Map<number, Staff>;
  private schedules: Map<number, Schedule>;
  private analyticsData: Map<number, Analytic>;
  
  private userCurrentId: number;
  private patientCurrentId: number;
  private appointmentCurrentId: number;
  private staffCurrentId: number;
  private scheduleCurrentId: number;
  private analyticCurrentId: number;

  constructor() {
    this.users = new Map();
    this.patients = new Map();
    this.appointments = new Map();
    this.staffMembers = new Map();
    this.schedules = new Map();
    this.analyticsData = new Map();
    
    this.userCurrentId = 1;
    this.patientCurrentId = 1;
    this.appointmentCurrentId = 1;
    this.staffCurrentId = 1;
    this.scheduleCurrentId = 1;
    this.analyticCurrentId = 1;
    
    // Initialize with demo data
    this.initializeData();
  }

  // Initialize demo data
  private initializeData() {
    // Add staff members
    const staffData: InsertStaff[] = [
      {
        name: "Dr. Sarah Wilson",
        role: "Lead Veterinarian",
        specialty: "General Care",
        image_url: "https://images.unsplash.com/photo-1527980965255-d3b416303d12",
        is_active: true
      },
      {
        name: "Dr. Marcus Chen",
        role: "Veterinary Surgeon",
        specialty: "Surgery",
        image_url: "https://images.unsplash.com/photo-1639149888905-fb39731f2e6c",
        is_active: true
      },
      {
        name: "Dr. Alex Thompson",
        role: "Exotic Animals Specialist",
        specialty: "Exotic Animals",
        image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
        is_active: false
      },
      {
        name: "Dr. Maria Rodriguez",
        role: "Feline Specialist",
        specialty: "Feline Care",
        image_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2",
        is_active: false
      }
    ];
    
    staffData.forEach(staff => this.createStaff(staff));
    
    // Add patients
    const patientData: InsertPatient[] = [
      {
        name: "Max",
        species: "Dog",
        breed: "Golden Retriever",
        age: 5,
        gender: "Male",
        owner_name: "John & Sarah Peterson",
        owner_phone: "555-123-4567",
        image_url: "https://images.unsplash.com/photo-1517849845537-4d257902454a",
        notes: "Annual checkup completed"
      },
      {
        name: "Luna",
        species: "Cat",
        breed: "Siamese",
        age: 3,
        gender: "Female",
        owner_name: "Emily Johnson",
        owner_phone: "555-234-5678",
        image_url: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce",
        notes: "Vaccination completed"
      },
      {
        name: "Rocky",
        species: "Dog",
        breed: "German Shepherd",
        age: 4,
        gender: "Male",
        owner_name: "Michael & Tina Rivera",
        owner_phone: "555-345-6789",
        image_url: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca",
        notes: "Surgery follow-up in progress"
      },
      {
        name: "Coco",
        species: "Rabbit",
        breed: "Holland Lop",
        age: 2,
        gender: "Female",
        owner_name: "Kelly Zhang",
        owner_phone: "555-456-7890",
        image_url: "https://images.unsplash.com/photo-1518288774672-b94e808873ff",
        notes: "Dental checkup scheduled"
      },
      {
        name: "Simba",
        species: "Cat",
        breed: "Maine Coon",
        age: 6,
        gender: "Male",
        owner_name: "David & Amy Williams",
        owner_phone: "555-567-8901",
        image_url: "https://images.unsplash.com/photo-1560807707-8cc77767d783",
        notes: "Vaccination due"
      },
      {
        name: "Bella",
        species: "Dog",
        breed: "Beagle",
        age: 3,
        gender: "Female",
        owner_name: "Robert & Sue Anderson",
        owner_phone: "555-678-9012",
        image_url: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55",
        notes: "Annual checkup scheduled"
      }
    ];
    
    patientData.forEach(patient => this.createPatient(patient));
    
    // Add appointments today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const appointmentData: InsertAppointment[] = [
      {
        patient_id: 1,
        doctor_id: 1,
        date: new Date(today.getTime() + 9 * 60 * 60 * 1000), // 9:00 AM
        type: "checkup",
        status: "completed",
        notes: "Annual checkup"
      },
      {
        patient_id: 2,
        doctor_id: 2,
        date: new Date(today.getTime() + 10.25 * 60 * 60 * 1000), // 10:15 AM
        type: "vaccination",
        status: "completed",
        notes: "Vaccination"
      },
      {
        patient_id: 3,
        doctor_id: 1,
        date: new Date(today.getTime() + 11.5 * 60 * 60 * 1000), // 11:30 AM
        type: "follow_up",
        status: "in_progress",
        notes: "Surgery Follow-up"
      },
      {
        patient_id: 4,
        doctor_id: 2,
        date: new Date(today.getTime() + 13 * 60 * 60 * 1000), // 1:00 PM
        type: "dental",
        status: "scheduled",
        notes: "Dental Checkup"
      },
      {
        patient_id: 5,
        doctor_id: 3,
        date: new Date(today.getTime() + 14.75 * 60 * 60 * 1000), // 2:45 PM
        type: "vaccination",
        status: "scheduled",
        notes: "Vaccination"
      },
      {
        patient_id: 6,
        doctor_id: 1,
        date: new Date(today.getTime() + 15.5 * 60 * 60 * 1000), // 3:30 PM
        type: "checkup",
        status: "canceled",
        notes: "Annual Checkup"
      }
    ];
    
    appointmentData.forEach(appointment => this.createAppointment(appointment));
    
    // Add schedules
    const scheduleData: InsertSchedule[] = [
      {
        staff_id: 1,
        date: today,
        start_time: new Date(today.getTime() + 9 * 60 * 60 * 1000), // 9:00 AM
        end_time: new Date(today.getTime() + 10.5 * 60 * 60 * 1000), // 10:30 AM
        activity_type: "appointments",
        description: "Morning Appointments"
      },
      {
        staff_id: 1,
        date: today,
        start_time: new Date(today.getTime() + 10.5 * 60 * 60 * 1000), // 10:30 AM
        end_time: new Date(today.getTime() + 11.5 * 60 * 60 * 1000), // 11:30 AM
        activity_type: "meeting",
        description: "Staff Meeting"
      },
      {
        staff_id: 1,
        date: today,
        start_time: new Date(today.getTime() + 11.5 * 60 * 60 * 1000), // 11:30 AM
        end_time: new Date(today.getTime() + 13 * 60 * 60 * 1000), // 1:00 PM
        activity_type: "surgery",
        description: "Surgical Procedures"
      },
      {
        staff_id: 1,
        date: today,
        start_time: new Date(today.getTime() + 14 * 60 * 60 * 1000), // 2:00 PM
        end_time: new Date(today.getTime() + 17 * 60 * 60 * 1000), // 5:00 PM
        activity_type: "appointments",
        description: "Afternoon Appointments"
      }
    ];
    
    scheduleData.forEach(schedule => this.createSchedule(schedule));
    
    // Analytics data
    const analyticData: InsertAnalytic = {
      date: today,
      appointment_counts: {
        checkup: 35,
        vaccination: 28,
        surgery: 15,
        dental: 12,
        other: 10
      },
      checkins: {
        current: [14, 18, 16, 21, 15, 13, 8],
        previous: [12, 15, 14, 18, 12, 11, 7]
      },
      revenue: 8320,
      wait_time: 14
    };
    
    this.createAnalytic(analyticData);
    
    // Add demo user
    this.createUser({
      username: "admin",
      password: "admin123",
      staff_id: 1
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  // Patient methods
  async getPatient(id: number): Promise<Patient | undefined> {
    return this.patients.get(id);
  }

  async getPatients(): Promise<Patient[]> {
    return Array.from(this.patients.values());
  }

  async createPatient(patient: InsertPatient): Promise<Patient> {
    const id = this.patientCurrentId++;
    const newPatient: Patient = { ...patient, id };
    this.patients.set(id, newPatient);
    return newPatient;
  }

  async updatePatient(id: number, patient: Partial<InsertPatient>): Promise<Patient | undefined> {
    const existingPatient = this.patients.get(id);
    if (!existingPatient) return undefined;
    
    const updatedPatient = { ...existingPatient, ...patient };
    this.patients.set(id, updatedPatient);
    return updatedPatient;
  }

  async deletePatient(id: number): Promise<boolean> {
    return this.patients.delete(id);
  }

  async getRecentPatients(limit: number): Promise<Patient[]> {
    // Get all appointments sorted by date descending
    const sortedAppointments = Array.from(this.appointments.values())
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    // Get unique patient IDs from these appointments
    const recentPatientIds = Array.from(
      new Set(sortedAppointments.map(appointment => appointment.patient_id))
    );

    // Map to patients and limit to requested number
    return recentPatientIds
      .map(id => this.patients.get(id))
      .filter((patient): patient is Patient => !!patient)
      .slice(0, limit);
  }

  // Appointment methods
  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async getAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values());
  }

  async getAppointmentsByDate(date: Date): Promise<Appointment[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return Array.from(this.appointments.values()).filter(
      appointment => appointment.date >= startOfDay && appointment.date <= endOfDay
    );
  }

  async getAppointmentsByPatient(patientId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      appointment => appointment.patient_id === patientId
    );
  }

  async getAppointmentsByDoctor(doctorId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      appointment => appointment.doctor_id === doctorId
    );
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const id = this.appointmentCurrentId++;
    const newAppointment: Appointment = { ...appointment, id };
    this.appointments.set(id, newAppointment);
    return newAppointment;
  }

  async updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const existingAppointment = this.appointments.get(id);
    if (!existingAppointment) return undefined;
    
    const updatedAppointment = { ...existingAppointment, ...appointment };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  async deleteAppointment(id: number): Promise<boolean> {
    return this.appointments.delete(id);
  }

  // Staff methods
  async getStaff(id: number): Promise<Staff | undefined> {
    return this.staffMembers.get(id);
  }

  async getAllStaff(): Promise<Staff[]> {
    return Array.from(this.staffMembers.values());
  }

  async createStaff(staff: InsertStaff): Promise<Staff> {
    const id = this.staffCurrentId++;
    const newStaff: Staff = { ...staff, id };
    this.staffMembers.set(id, newStaff);
    return newStaff;
  }

  async updateStaff(id: number, staff: Partial<InsertStaff>): Promise<Staff | undefined> {
    const existingStaff = this.staffMembers.get(id);
    if (!existingStaff) return undefined;
    
    const updatedStaff = { ...existingStaff, ...staff };
    this.staffMembers.set(id, updatedStaff);
    return updatedStaff;
  }

  async deleteStaff(id: number): Promise<boolean> {
    return this.staffMembers.delete(id);
  }

  // Schedule methods
  async getSchedule(id: number): Promise<Schedule | undefined> {
    return this.schedules.get(id);
  }

  async getSchedulesByStaff(staffId: number): Promise<Schedule[]> {
    return Array.from(this.schedules.values()).filter(
      schedule => schedule.staff_id === staffId
    );
  }

  async getSchedulesByDate(date: Date): Promise<Schedule[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return Array.from(this.schedules.values()).filter(
      schedule => schedule.date >= startOfDay && schedule.date <= endOfDay
    );
  }

  async createSchedule(schedule: InsertSchedule): Promise<Schedule> {
    const id = this.scheduleCurrentId++;
    const newSchedule: Schedule = { ...schedule, id };
    this.schedules.set(id, newSchedule);
    return newSchedule;
  }

  async updateSchedule(id: number, schedule: Partial<InsertSchedule>): Promise<Schedule | undefined> {
    const existingSchedule = this.schedules.get(id);
    if (!existingSchedule) return undefined;
    
    const updatedSchedule = { ...existingSchedule, ...schedule };
    this.schedules.set(id, updatedSchedule);
    return updatedSchedule;
  }

  async deleteSchedule(id: number): Promise<boolean> {
    return this.schedules.delete(id);
  }

  // Analytics methods
  async getAnalytics(): Promise<Analytic[]> {
    return Array.from(this.analyticsData.values());
  }

  async getAnalyticsByDate(date: Date): Promise<Analytic | undefined> {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    return Array.from(this.analyticsData.values()).find(analytic => {
      const analyticDate = new Date(analytic.date);
      analyticDate.setHours(0, 0, 0, 0);
      return analyticDate.getTime() === targetDate.getTime();
    });
  }

  async createAnalytic(analytic: InsertAnalytic): Promise<Analytic> {
    const id = this.analyticCurrentId++;
    const newAnalytic: Analytic = { ...analytic, id };
    this.analyticsData.set(id, newAnalytic);
    return newAnalytic;
  }

  async updateAnalytic(id: number, analytic: Partial<InsertAnalytic>): Promise<Analytic | undefined> {
    const existingAnalytic = this.analyticsData.get(id);
    if (!existingAnalytic) return undefined;
    
    const updatedAnalytic = { ...existingAnalytic, ...analytic };
    this.analyticsData.set(id, updatedAnalytic);
    return updatedAnalytic;
  }
}

export const storage = new MemStorage();
