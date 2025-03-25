import {
  getPatientTreatments,
  getTreatmentPhasesByTreatmentId,
  getMedicationByPhaseId,
} from "@/services/treament-services";
import { useQuery } from "@tanstack/react-query";

export const useTreatmentsData = (pet_id: string, enabled = true) => {
  return useQuery({
    queryKey: ["treatments"],
    queryFn: () => getPatientTreatments(pet_id),
    enabled: !!pet_id,
    select: (data) => data.data || [],
  });
};

export const useTreatmentPhasesData = (
  treatment_id: string,
  enabled = true
) => {
  return useQuery({
    queryKey: ["treatmentPhases", treatment_id],
    queryFn: () => getTreatmentPhasesByTreatmentId(treatment_id),
    enabled: !!treatment_id,
    select: (data) => data.data || [],
  });
};

export const useMedicationByPhaseIdData = (
  treatment_id: string,
  phase_id: string,
  enabled = true
) => {
  return useQuery({
    queryKey: ["medicationByPhaseId"],
    queryFn: () => getMedicationByPhaseId(treatment_id, phase_id),
    enabled: !!treatment_id && !!phase_id,
    select: (data) => data.data || [],
  });
};
