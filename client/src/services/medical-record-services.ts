import axios from "axios";
import api from "@/lib/api";
export const getMedicalRecordsByPatientId = async (pet_id: number) => {
  try {
    const response = await api.get(`/api/v1/pets/${pet_id}/medical-histories`);
    return response.data;
  } catch (error) {
    console.error("Error getting medical records by patient id:", error);
    throw error;
  }
};

export type MedicalHistoryRequest = {
  condition: string;
  diagnosis_date: string;
  notes: string;
};

export const createMedicalHistory = async (
  pet_id: number,
  medicalHistoryRequest: MedicalHistoryRequest
) => {
  try {
    const response = await api.post(
      `/api/v1/pets/${pet_id}/medical-histories`,
      medicalHistoryRequest
    );
    return response.data;
  } catch (error) {
    console.error("Error creating medical history:", error);
    throw error;
  }
};

export const getMedicalHistoryByPetId = async (pet_id: number) => {
  try {
    const response = await api.get(`/api/v1/pets/${pet_id}/medical-histories`);
    console.log("Medical history response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error getting medical history by pet id:", error);
    throw error;
  }
};

// ExaminationRequest type definition
export type ExaminationRequest = {
  medical_history_id: number;
  exam_date: string;
  exam_type: string;
  findings: string;
  vet_notes?: string;
  doctor_id: number;
};

// ExaminationResponse type definition
export type ExaminationResponse = {
  id: number;
  medical_history_id: number;
  exam_date: string;
  exam_type: string;
  findings: string;
  vet_notes: string;
  doctor_id: number;
  doctor_name: string;
  created_at: string;
  updated_at: string;
};

// PrescriptionRequest type definition
export type PrescriptionRequest = {
  medical_history_id: number;
  examination_id: number;
  prescription_date: string;
  doctor_id: number;
  notes?: string;
  medications: PrescribedMedication[];
};

export type PrescribedMedication = {
  medicine_id: number;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
};

export type PrescriptionResponse = {
  id: number;
  medical_history_id: number;
  examination_id: number;
  prescription_date: string;
  doctor_id: number;
  doctor_name: string;
  notes: string;
  medications: PrescriptionMedicationResponse[];
  created_at: string;
  updated_at: string;
};

export type PrescriptionMedicationResponse = {
  id: number;
  prescription_id: number;
  medicine_id: number;
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
};

// TestResult type definitions
export type TestResultRequest = {
  medical_history_id: number;
  examination_id: number;
  test_type: string;
  test_date: string;
  results: string;
  interpretation?: string;
  file_url?: string;
  doctor_id: number;
};

export type TestResultResponse = {
  id: number;
  medical_history_id: number;
  examination_id: number;
  test_type: string;
  test_date: string;
  results: string;
  interpretation: string;
  file_url: string;
  doctor_id: number;
  doctor_name: string;
  created_at: string;
  updated_at: string;
};

// MedicalHistorySummary type definition
export type MedicalHistorySummary = {
  medical_record: MedicalRecordResponse;
  examinations: ExaminationResponse[];
  prescriptions: PrescriptionResponse[];
  test_results: TestResultResponse[];
  conditions: MedicalHistoryResponse[];
  allergies: Allergy[];
};

export type MedicalRecordResponse =  {
	id      :  string;
	pet_id  :  number;
	created_at:  string;
  updated_at:  string;
}


// MedicalHistoryResponse type definition
export type MedicalHistoryResponse = {
  id: number;
  medical_record_id: number;
  condition: string;
  diagnosis_date: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

// You should also define the Allergy type which is referenced in MedicalHistorySummary
export type Allergy = {
  id: number;
  medical_record_id: number;
  allergen: string;
  severity: string;
  notes?: string;
  created_at: string;
  updated_at: string;
};

// Complete Medical History
export const getCompleteMedicalHistory = async (pet_id: number) => {
  try {
    const response = await api.get(`/api/v1/pets/${pet_id}/complete-medical-history`);
    return response.data as MedicalHistorySummary;
  } catch (error) {
    console.error("Error getting complete medical history:", error);
    throw error;
  }
};

// Examination API functions
export const createExamination = async (examinationRequest: ExaminationRequest) => {
  try {
    const response = await api.post('/api/v1/medical-records/examinations', examinationRequest);
    return response.data as ExaminationResponse;
  } catch (error) {
    console.error("Error creating examination:", error);
    throw error;
  }
};

export const getExamination = async (examination_id: number) => {
  try {
    const response = await api.get(`/api/v1/medical-records/examinations/${examination_id}`);
    return response.data as ExaminationResponse;
  } catch (error) {
    console.error("Error getting examination details:", error);
    throw error;
  }
};

export const listExaminations = async (params?: { 
  medical_history_id?: number;
  pet_id?: number;
  doctor_id?: number; 
  date_from?: string;
  date_to?: string;
}) => {
  try {
    const response = await api.get('/api/v1/medical-records/examinations', { params });
    return response.data as ExaminationResponse[];
  } catch (error) {
    console.error("Error listing examinations:", error);
    throw error;
  }
};

// Prescription API functions
export const createPrescription = async (prescriptionRequest: PrescriptionRequest) => {
  try {
    const response = await api.post('/api/v1/medical-records/prescriptions', prescriptionRequest);
    return response.data as PrescriptionResponse;
  } catch (error) {
    console.error("Error creating prescription:", error);
    throw error;
  }
};

export const getPrescription = async (prescription_id: number) => {
  try {
    const response = await api.get(`/api/v1/medical-records/prescriptions/${prescription_id}`);
    return response.data as PrescriptionResponse;
  } catch (error) {
    console.error("Error getting prescription details:", error);
    throw error;
  }
};

export const listPrescriptions = async (params?: {
  medical_history_id?: number;
  examination_id?: number;
  pet_id?: number;
  doctor_id?: number;
  date_from?: string;
  date_to?: string;
}) => {
  try {
    const response = await api.get('/api/v1/medical-records/prescriptions', { params });
    return response.data as PrescriptionResponse[];
  } catch (error) {
    console.error("Error listing prescriptions:", error);
    throw error;
  }
};

// Test Result API functions
export const createTestResult = async (testResultRequest: TestResultRequest) => {
  try {
    const response = await api.post('/api/v1/medical-records/test-results', testResultRequest);
    return response.data as TestResultResponse;
  } catch (error) {
    console.error("Error creating test result:", error);
    throw error;
  }
};

export const getTestResult = async (test_result_id: number) => {
  try {
    const response = await api.get(`/api/v1/medical-records/test-results/${test_result_id}`);
    return response.data as TestResultResponse;
  } catch (error) {
    console.error("Error getting test result details:", error);
    throw error;
  }
};

export const listTestResults = async (params?: {
  medical_history_id?: number;
  examination_id?: number;
  pet_id?: number;
  doctor_id?: number;
  test_type?: string;
  date_from?: string;
  date_to?: string;
}) => {
  try {
    const response = await api.get('/api/v1/medical-records/test-results', { params });
    return response.data as TestResultResponse[];
  } catch (error) {
    console.error("Error listing test results:", error);
    throw error;
  }
};
