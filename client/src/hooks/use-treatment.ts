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
import { AssignMedicineRequest, CreateTreatmentPhaseRequest, CreateTreatmentRequest } from "@/types";
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
    mutationFn: (payload: CreateTreatmentPhaseRequest) => addNewPhaseToTreatment(payload, treatment_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatments"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};

export const useAssignMedicine = (treatment_id: string, phase_id: string) => {
  return useMutation({
    mutationFn: (payload: AssignMedicineRequest) => assignMedicineToPhase(payload, treatment_id, phase_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatments"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};

export const useGetMedicinesByPhase = (treatment_id: string, phase_id: string) => {
  return useMutation({
    mutationFn: (payload: AssignMedicineRequest) => assignMedicineToPhase(payload, treatment_id, phase_id),
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

// Updated hook for medicine search with autocomplete using client-side filtering
export const useMedicineSearch = (initialQuery = "") => {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  
  // Create a debounced function to update the debounced query
  const debouncedSetQuery = useCallback(
    debounce((value: string) => {
      setDebouncedQuery(value);
    }, 300),
    []
  );
  
  // Update the query and trigger the debounced function
  const updateQuery = (newQuery: string) => {
    setQuery(newQuery);
    debouncedSetQuery(newQuery);
  };
  
  // Fetch all medicines once
  const {
    data: allMedicines,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["allMedicines"],
    queryFn: () => getAllMedicines(),
    select: (data) => data.data || [],
    staleTime: 5 * 60 * 1000, // Cache results for 5 minutes
  });
  
  // Filter medicines based on the debounced query
  const searchResults = useMemo(() => {
    if (!allMedicines || debouncedQuery.length < 2) return [];
    
    return allMedicines.filter((medicine: any) => {
      const name = medicine.name?.toLowerCase() || '';
      const description = medicine.description?.toLowerCase() || '';
      const searchTerm = debouncedQuery.toLowerCase();
      
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
