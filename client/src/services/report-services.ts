import api from "@/lib/api";

export interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface FinancialReportResponse {
  total_revenue: number;
  revenue_by_service: Record<string, number>;
  revenue_by_product: Record<string, number>;
  total_expenses: number;
  profit: number;
  monthly_trends: MonthlyData[];
}

export interface DiseaseStats {
  disease: string;
  count: number;
  percentage: number;
}

export interface MonthlyExamStats {
  month: string;
  examinations: number;
}

export interface MedicalRecordsReportResponse {
  total_examinations: number;
  common_diseases: DiseaseStats[];
  examinations_by_type: Record<string, number>;
  monthly_trends: MonthlyExamStats[];
}

export const getFinancialReport = async (start_date: string, end_date: string): Promise<FinancialReportResponse> => {
  const { data } = await api.get("/api/v1/reports/financial", {
    params: { start_date, end_date }
  });
  return data;
};

export const getMedicalRecordsReport = async (start_date: string, end_date: string): Promise<MedicalRecordsReportResponse> => {
  const { data } = await api.get("/api/v1/reports/medical", {
    params: { start_date, end_date }
  });
  return data;
};






// Doctor statistics request and response structures
type DoctorStatsRequest = {
	doctor_id: number;
	start_date: string;
	end_date: string;
}

export type DoctorStatsResponse = {
	doctor_id: number;
	doctor_name: string;
	total_appointments: number;
	completed_appointments: number;
	scheduled_appointments: number;
	cancelled_appointments: number;
	unique_patients_served: number;
	appointments_by_month: MonthlyAppointmentData[];
	patients_by_month: MonthlyPatientData[];
	completion_rate: number;
	working_days: number;
	avg_appointments_per_day: number;
}

type MonthlyAppointmentData = {
	month: string;
	year: number;
	total: number;
	completed: number;
	scheduled: number;
	cancelled: number;
}

type MonthlyPatientData = {
	month: string;
	year: number;
	unique_patients: number;
	new_patients: number;
	return_patients: number;
}

// All doctors statistics response
export type AllDoctorsStatsResponse = {
	total_doctors: number;
	period_stats: DoctorStatsResponse;
	doctors_list: DoctorStatsResponse[];
	top_performers: DoctorStatsResponse[];
}

export const getDoctorStats = async (start_date: string, end_date: string): Promise<AllDoctorsStatsResponse> => {
	const { data } = await api.get(`/api/v1/reports/doctors`, {
		params: { start_date, end_date }
	});
	return data;
};
