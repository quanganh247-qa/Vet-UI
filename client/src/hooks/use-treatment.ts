import { queryClient } from "@/lib/queryClient";
import {
  getPatientTreatments,
  getTreatmentPhasesByTreatmentId,
  getMedicationByPhaseId,
  addNewPhaseToTreatment,
  assignMedicineToPhase,
  getAllMedicines,
  addNewTreatment,
} from "@/services/treament-services";
import { AssignMedicineRequest, CreateTreatmentPhaseRequest, CreateTreatmentRequest, Medication } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState, useEffect, useCallback, useMemo } from "react";
import debounce from 'lodash/debounce';

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


export const useAddTreatmentPhase = (treatment_id: string) => {
  return useMutation({
    mutationFn: (payload: CreateTreatmentPhaseRequest[]) => 
      addNewPhaseToTreatment(payload, treatment_id),
    onSuccess: () => {
      // Invalidate both the treatments list and the specific treatment
      queryClient.invalidateQueries({ queryKey: ["treatments"] });
      queryClient.invalidateQueries({ queryKey: ["treatment", treatment_id] });
    },
    onError: (error) => {
      // Consider using a toast notification here
      console.error("Failed to add treatment phase:", error);
      // Or: toast.error(`Failed to add phase: ${error.message}`);
    },
    // Optional: optimistic update
    onMutate: async (newPhases) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["treatment", treatment_id] });
      
      // Snapshot the previous value
      const previousTreatment = queryClient.getQueryData(["treatment", treatment_id]);
      
      // Optimistically update the cache
      queryClient.setQueryData(["treatment", treatment_id], (old: any) => {
        return {
          ...old,
          phases: [...(old?.phases || []), ...newPhases]
        };
      });
      
      // Return a context object with the snapshotted value
      return { previousTreatment };
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["treatment", treatment_id] });
    },
  });
};

export const useAssignMedicine = (treatment_id: string, phase_id: string) => {
  return useMutation({
    mutationFn: (payload: AssignMedicineRequest[]) =>
      assignMedicineToPhase(payload, treatment_id, phase_id),
    onSuccess: () => {
      // Invalidate both the treatments list and the specific treatment phase
      queryClient.invalidateQueries({ queryKey: ["treatments"] });
      queryClient.invalidateQueries({ queryKey: ["treatmentPhase", treatment_id, phase_id] });
    },
    onError: (error) => {
      // Use toast notifications or UI feedback instead of console.error
      console.error("Failed to assign medicine:", error);
      // Example: toast.error(error.message);
    },
    // Optional: Optimistic Update for better UX
    onMutate: async (newMedicine) => {
      await queryClient.cancelQueries({ queryKey: ["treatmentPhase", treatment_id, phase_id] });
      
      const previousPhase = queryClient.getQueryData(["treatmentPhase", treatment_id, phase_id]);
      
      // Optimistically update the cache
      queryClient.setQueryData(
        ["treatmentPhase", treatment_id, phase_id],
        (old: any) => ({
          ...old,
          medicines: [...(old?.medicines || []), newMedicine],
        })
      );
      
      return { previousPhase };
    },
    onSettled: () => {
      // Ensure data is fresh after mutation
      queryClient.invalidateQueries({ queryKey: ["treatmentPhase", treatment_id, phase_id] });
    },
  });
};

export const useGetMedicinesByPhase = (treatment_id: string, phase_id: string) => {
  return useMutation({
    mutationFn: (payload: AssignMedicineRequest[]) => assignMedicineToPhase(payload, treatment_id, phase_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatments"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
}

export const useSearchMedicine = () => {
  return useQuery({
    queryKey: ["searchMedicine"],
    queryFn: () => getAllMedicines(),
    select: (data) => data.data || [],
  })
}
export const useAddTreatment = () => {
  return useMutation({
    mutationFn: (payload: CreateTreatmentRequest) => addNewTreatment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatments"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};


export const useMedicineSearch = (initialQuery = "") => {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  
  const debouncedSetQuery = useCallback(
    debounce((value: string) => setDebouncedQuery(value), 300),
    []
  );

  const updateQuery = (newQuery: string) => {
    setQuery(newQuery);
    debouncedSetQuery(newQuery);
  };

  const { data: allMedicines, isLoading, error } = useQuery<Medication[]>({
    queryKey: ["allMedicines"],
    queryFn: getAllMedicines,
    staleTime: 5 * 60 * 1000,
  });

  const searchResults = useMemo(() => {
    if (!allMedicines) return [];
    
    // Return all medicines when search is empty
    if (debouncedQuery.length < 2) return allMedicines;
    
    const searchTerm = debouncedQuery.toLowerCase();
    return allMedicines.filter((medicine) => {
      const name = medicine.medicine_name.toLowerCase();
      const description = medicine.description?.toLowerCase() || '';
      return name.includes(searchTerm) || description.includes(searchTerm);
    });
  }, [allMedicines, debouncedQuery]);

  return {
    query,
    setQuery: updateQuery,
    searchResults,
    isLoading,
    error,
    allMedicines,
  };
};