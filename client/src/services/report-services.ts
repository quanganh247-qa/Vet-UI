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




