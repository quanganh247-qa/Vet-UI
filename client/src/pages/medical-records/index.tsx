
import React, { useState } from 'react';
import { useParams } from 'wouter';
import MedicalRecordsList from '@/components/medical-records/MedicalRecordsList';
import MedicalRecordDetail from '@/components/medical-records/MedicalRecordDetail';

const MedicalRecords = () => {
  const { patientId } = useParams();
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);
  
  // Mock medical records data
  const medicalRecords = [
    {
      id: 1,
      type: 'Exam',
      date: '2025-03-19',
      doctor: 'Dr. Wilson',
      notes: 'Regular checkup',
      vital_signs: {
        temperature: '38.5°C',
        heart_rate: '80 bpm',
        weight: '25 kg'
      }
    },
    {
      id: 2,
      type: 'Vaccination',
      date: '2025-03-15',
      doctor: 'Dr. Roberts',
      notes: 'Annual vaccination',
      vaccines: ['DHPP', 'Rabies']
    }
  ];

  return (
    <div className="p-6">
      <div className="flex space-x-6">
        <div className="w-1/3">
          <MedicalRecordsList
            medicalRecords={medicalRecords}
            onSelectRecord={setSelectedRecordId}
            selectedRecordId={selectedRecordId}
          />
        </div>
        <div className="w-2/3">
          {selectedRecordId && (
            <MedicalRecordDetail
              record={medicalRecords.find(r => r.id === selectedRecordId)!}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalRecords;
