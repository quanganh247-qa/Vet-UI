// Mock data for the veterinary practice management application

export interface Patient {
  id: number;
  name: string;
  species: string;
  breed: string;
  owner_name: string;
  sex: string;
  age: string;
  weight: string;
  dob: string;
  microchip: string;
  color: string;
  owner_phone: string;
  owner_email: string;
  owner_address: string;
  insurance_provider: string;
  insurance_policy: string;
  insurance_coverage: string;
  alerts: { type: string; description: string }[];
  image_url?: string;
}

export interface Appointment {
  id: number;
  patient_id: number;
  doctor_id: number;
  type: string;
  status: 'scheduled' | 'checked-in' | 'in-progress' | 'completed' | 'waiting' | 'Scheduled' | 'Checked In' | 'In Progress' | 'Completed' | 'Waiting';
  date: string;
  start_time: string;
  end_time: string;
  reason: string;
  notes: string;
  alerts?: { type: string; description: string }[];
}

export interface Doctor {
  id: number;
  name: string;
  role: string;
  specialty?: string;
  image_url?: string;
}

export interface MedicalRecord {
  id: number;
  patient_id: number;
  doctor_id: number;
  date: string;
  type: string;
  diagnosis: string[];
  treatments: string[];
  lab_results?: any;
}

export interface Vaccine {
  id: number;
  patient_id: number;
  name: string;
  date: string;
  expiration: string;
  administered_by: number;
  lot_number: string;
  site: string;
}

// Mock patients
export const mockPatients: Patient[] = [
  {
    id: 1,
    name: 'Max',
    species: 'Dog',
    breed: 'Golden Retriever',
    owner_name: 'John Smith',
    sex: 'Male (Neutered)',
    age: '7 years 11 months',
    weight: '65.1 lbs',
    dob: '4/15/2017',
    microchip: '985112345678909',
    color: 'Golden',
    owner_phone: '(555) 123-4567',
    owner_email: 'john.smith@email.com',
    owner_address: '123 Park Avenue, Anytown, CA 12345',
    insurance_provider: 'PetShield Insurance',
    insurance_policy: 'PS123456789',
    insurance_coverage: 'Premium',
    alerts: [{ type: 'Allergy', description: 'Chicken' }],
    image_url: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80'
  },
  {
    id: 2,
    name: 'Bella',
    species: 'Dog',
    breed: 'Poodle',
    owner_name: 'Emily Johnson',
    sex: 'Female (Spayed)',
    age: '4 years 3 months',
    weight: '12.5 lbs',
    dob: '12/10/2020',
    microchip: '985187654321098',
    color: 'White',
    owner_phone: '(555) 234-5678',
    owner_email: 'emily.johnson@email.com',
    owner_address: '456 Maple Street, Anytown, CA 12345',
    insurance_provider: 'PawCare',
    insurance_policy: 'PC987654321',
    insurance_coverage: 'Standard',
    alerts: [{ type: 'Sensitive', description: 'to flea medication' }],
    image_url: 'https://images.unsplash.com/photo-1575425186775-b8de9a427e67?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80'
  },
  {
    id: 3,
    name: 'Luna',
    species: 'Cat',
    breed: 'Siamese',
    owner_name: 'Michael Brown',
    sex: 'Female (Spayed)',
    age: '3 years 8 months',
    weight: '8.2 lbs',
    dob: '7/15/2021',
    microchip: '985198765432109',
    color: 'Seal Point',
    owner_phone: '(555) 345-6789',
    owner_email: 'michael.brown@email.com',
    owner_address: '789 Oak Road, Anytown, CA 12345',
    insurance_provider: 'FeliFriend',
    insurance_policy: 'FF123789456',
    insurance_coverage: 'Premium',
    alerts: [],
    image_url: 'https://images.unsplash.com/photo-1618826411640-d6df44dd3f7a?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80'
  },
  {
    id: 4,
    name: 'Bailey',
    species: 'Dog',
    breed: 'Labrador',
    owner_name: 'James Davis',
    sex: 'Male (Neutered)',
    age: '6 years 2 months',
    weight: '78.3 lbs',
    dob: '1/20/2019',
    microchip: '985112378945610',
    color: 'Black',
    owner_phone: '(555) 456-7890',
    owner_email: 'james.davis@email.com',
    owner_address: '101 Pine Lane, Anytown, CA 12345',
    insurance_provider: 'PetShield Insurance',
    insurance_policy: 'PS567891234',
    insurance_coverage: 'Premium',
    alerts: [],
    image_url: 'https://images.unsplash.com/photo-1579213838751-6a8990261340?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80'
  },
  {
    id: 5,
    name: 'Oliver',
    species: 'Cat',
    breed: 'Maine Coon',
    owner_name: 'Sophia Martinez',
    sex: 'Male (Neutered)',
    age: '8 years 6 months',
    weight: '15.7 lbs',
    dob: '9/5/2016',
    microchip: '985175318642097',
    color: 'Tabby',
    owner_phone: '(555) 567-8901',
    owner_email: 'sophia.martinez@email.com',
    owner_address: '222 Cedar Street, Anytown, CA 12345',
    insurance_provider: 'FeliFriend',
    insurance_policy: 'FF987612345',
    insurance_coverage: 'Standard',
    alerts: [{ type: 'Condition', description: 'Kidney disease, Senior pet' }],
    image_url: 'https://images.unsplash.com/photo-1593483316242-efb5420596ca?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80'
  },
  {
    id: 6,
    name: 'Charlie',
    species: 'Dog',
    breed: 'Dachshund',
    owner_name: 'Emma Wilson',
    sex: 'Male (Neutered)',
    age: '5 years 4 months',
    weight: '12.3 lbs',
    dob: '11/12/2019',
    microchip: '985154321678905',
    color: 'Brown',
    owner_phone: '(555) 678-9012',
    owner_email: 'emma.wilson@email.com',
    owner_address: '333 Birch Drive, Anytown, CA 12345',
    insurance_provider: 'PawCare',
    insurance_policy: 'PC456123789',
    insurance_coverage: 'Premium',
    alerts: [{ type: 'Medication', description: 'On medication for heart condition' }],
    image_url: 'https://images.unsplash.com/photo-1612195583950-b8fd34c87093?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80'
  },
];

// Mock doctors
export const mockDoctors: Doctor[] = [
  {
    id: 1,
    name: 'Dr. Roberts',
    role: 'Veterinarian',
    specialty: 'General Practice',
    image_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80'
  },
  {
    id: 2,
    name: 'Dr. Carter',
    role: 'Veterinarian',
    specialty: 'Surgery',
    image_url: 'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80'
  },
  {
    id: 3,
    name: 'Dr. Chen',
    role: 'Veterinarian',
    specialty: 'Dermatology',
    image_url: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80'
  }
];

// Mock appointments
export const mockAppointments: Appointment[] = [
  {
    id: 1,
    patient_id: 1, // Max
    doctor_id: 1, // Dr. Roberts
    type: 'Check-up',
    status: 'checked-in',
    date: '2025-03-19',
    start_time: '09:00 AM',
    end_time: '09:30 AM',
    reason: 'Annual wellness exam',
    notes: '',
    alerts: [{ type: 'Allergy', description: 'Allergic to chicken' }]
  },
  {
    id: 2,
    patient_id: 2, // Bella
    doctor_id: 1, // Dr. Roberts
    type: 'Check-up',
    status: 'scheduled',
    date: '2025-03-19',
    start_time: '10:30 AM',
    end_time: '11:00 AM',
    reason: 'Skin rash follow-up',
    notes: '',
    alerts: [{ type: 'Sensitive', description: 'to flea medication' }]
  },
  {
    id: 3,
    patient_id: 3, // Luna
    doctor_id: 2, // Dr. Carter
    type: 'Surgery',
    status: 'in-progress',
    date: '2025-03-19',
    start_time: '09:30 AM',
    end_time: '11:00 AM',
    reason: 'Dental cleaning',
    notes: '',
    alerts: []
  },
  {
    id: 4,
    patient_id: 4, // Bailey
    doctor_id: 1, // Dr. Roberts
    type: 'Sick Visit',
    status: 'completed',
    date: '2025-03-19',
    start_time: '08:00 AM',
    end_time: '08:30 AM',
    reason: 'Limping on right front leg',
    notes: 'Prescribed anti-inflammatory medication for 7 days.',
    alerts: []
  },
  {
    id: 5,
    patient_id: 5, // Oliver
    doctor_id: 2, // Dr. Carter
    type: 'Vaccination',
    status: 'scheduled',
    date: '2025-03-19',
    start_time: '11:30 AM',
    end_time: '12:00 PM',
    reason: 'Rabies vaccine due',
    notes: '',
    alerts: [{ type: 'Condition', description: 'Kidney disease, Senior pet' }]
  },
  {
    id: 6,
    patient_id: 6, // Charlie
    doctor_id: 1, // Dr. Roberts
    type: 'Sick Visit',
    status: 'waiting',
    date: '2025-03-19',
    start_time: '10:00 AM',
    end_time: '10:30 AM',
    reason: 'Vomiting for 2 days',
    notes: '',
    alerts: [{ type: 'Medication', description: 'On medication for heart condition' }]
  },
];

// Mock medical records
export const mockMedicalRecords: MedicalRecord[] = [
  {
    id: 1,
    patient_id: 1, // Max
    doctor_id: 1, // Dr. Roberts
    date: 'March 1, 2025',
    type: 'Annual Check-up',
    diagnosis: [
      'Age-related mild weight loss',
      'Suspected lipoma on right hind leg',
      'Early stage dental disease'
    ],
    treatments: [
      'Fine needle aspirate of mass with cytology',
      'Dental care recommendations provided'
    ],
    lab_results: { bloodwork: 'Normal CBC and chemistry panel results' }
  },
  {
    id: 2,
    patient_id: 1, // Max
    doctor_id: 2, // Dr. Carter
    date: 'September 15, 2024',
    type: 'Ear Infection Treatment',
    diagnosis: [
      'Right otitis externa, yeast and bacterial'
    ],
    treatments: [
      'Prescribed Otibiotic Ointment, BID for 10 days',
      'Instructed owner on proper ear cleaning technique'
    ]
  }
];

// Mock vaccines
export const mockVaccines: Vaccine[] = [
  {
    id: 1,
    patient_id: 1, // Max
    name: 'Rabies',
    date: '3/15/2024',
    expiration: '3/15/2026',
    administered_by: 1, // Dr. Roberts
    lot_number: 'RB45692',
    site: 'Right rear leg'
  },
  {
    id: 2,
    patient_id: 1, // Max
    name: 'DHPP',
    date: '3/15/2024',
    expiration: '3/15/2025',
    administered_by: 1, // Dr. Roberts
    lot_number: 'PS789123',
    site: 'Right shoulder'
  },
  {
    id: 3,
    patient_id: 1, // Max
    name: 'Bordetella',
    date: '3/15/2024',
    expiration: '3/15/2025',
    administered_by: 1, // Dr. Roberts
    lot_number: 'NG456123',
    site: 'Intranasal'
  },
  {
    id: 4,
    patient_id: 1, // Max
    name: 'Leptospirosis',
    date: '3/15/2024',
    expiration: '3/15/2025',
    administered_by: 1, // Dr. Roberts
    lot_number: 'LV789456',
    site: 'Left shoulder'
  }
];

export interface Invoice {
  id: number;
  patient_id: number;
  amount: number;
  date: string;
  status: string;
}

// Mock invoices
export const mockInvoices: Invoice[] = [
  {
    id: 1,
    patient_id: 1, // Max
    amount: 100,
    date: '3/15/2024',
    status: 'paid'
  }
];





// Helper functions
export const getPatientById = (id: number): Patient | undefined => {
  return mockPatients.find(patient => patient.id === id);
};

export const getDoctorById = (id: number): Doctor | undefined => {
  return mockDoctors.find(doctor => doctor.id === id);
};

export const getAppointmentsByPatientId = (patientId: number): Appointment[] => {
  return mockAppointments.filter(appointment => appointment.patient_id === patientId);
};

export const getMedicalRecordsByPatientId = (patientId: number): MedicalRecord[] => {
  return mockMedicalRecords.filter(record => record.patient_id === patientId);
};

export const getVaccinesByPatientId = (patientId: number): Vaccine[] => {
  return mockVaccines.filter(vaccine => vaccine.patient_id === patientId);
};

export const getAppointmentsByStatus = (status: Appointment['status']): Appointment[] => {
  return mockAppointments.filter(appointment => appointment.status === status);
};

export const getAppointmentById = (id: number): Appointment | undefined => {
  return mockAppointments.find(appointment => appointment.id === id);
};