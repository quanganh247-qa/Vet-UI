import { useQuery } from "@tanstack/react-query";
import {
  getFinancialReport,
  getMedicalRecordsReport,
  getDoctorStats,
} from "@/services/report-services";

export const useFinancialReport = (start_date: string, end_date: string) => {
  return useQuery({
    queryKey: ["financial-report", start_date, end_date],
    queryFn: () => getFinancialReport(start_date, end_date),
  });
};

export const useMedicalRecordsReport = (start_date: string, end_date: string) => {
  return useQuery({
    queryKey: ["medical-records-report", start_date, end_date],
    queryFn: () => getMedicalRecordsReport(start_date, end_date),
  });
};

export const useDoctorStats = (start_date: string, end_date: string) => {
  return useQuery({
    queryKey: ["doctor-stats", start_date, end_date],
    queryFn: () => getDoctorStats(start_date, end_date),
  });
};