import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPatientById } from '@/services/pet-services';
import { getVaccinations } from '@/services/vaccine-services';

export const usePatientDetails = (patientId: number) => {
  const { 
    data: pet,
    isLoading: isPetLoading,
    error: petError
  } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => getPatientById(patientId),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });

  const {
    data: vaccines,
    isLoading: isVaccinesLoading,
    error: vaccinesError
  } = useQuery({
    queryKey: ['patient-vaccines', patientId],
    queryFn: () => getVaccinations(patientId),
    enabled: !!pet, // Only fetch vaccines after pet data is available
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  return {
    pet,
    vaccines,
    isLoading: isPetLoading || isVaccinesLoading,
    error: petError || vaccinesError,
  };
};