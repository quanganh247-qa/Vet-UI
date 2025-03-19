import React, { useState } from 'react';
import { X, Plus, Trash } from 'lucide-react';
import { MedicalRecord, Doctor, Patient } from '../../types';

interface MedicalRecordFormProps {
  record?: MedicalRecord;
  doctors: Doctor[];
  patient: Patient;
  onSave: (record: Partial<MedicalRecord>) => void;
  onCancel: () => void;
}

const MedicalRecordForm: React.FC<MedicalRecordFormProps> = ({
  record,
  doctors,
  patient,
  onSave,
  onCancel
}) => {
  const isEditing = Boolean(record);
  
  const [formData, setFormData] = useState<Partial<MedicalRecord>>(
    record || {
      patient_id: patient.id,
      doctor_id: 0,
      date: new Date().toISOString().split('T')[0],
      type: 'exam',
      diagnosis: [],
      treatments: [],
      notes: '',
      vital_signs: {
        temperature: '',
        heart_rate: '',
        respiratory_rate: '',
        weight: ''
      },
      lab_results: {}
    }
  );
  
  const [diagnosisInput, setDiagnosisInput] = useState('');
  const [treatmentInput, setTreatmentInput] = useState('');
  const [labTestName, setLabTestName] = useState('');
  const [labTestValue, setLabTestValue] = useState('');
  const [labTestRange, setLabTestRange] = useState('');
  const [labTestStatus, setLabTestStatus] = useState('normal');
  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleVitalSignChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      vital_signs: {
        ...prev.vital_signs,
        [name]: value
      }
    }));
  };
  
  const addDiagnosis = () => {
    if (!diagnosisInput.trim()) return;
    
    setFormData((prev) => ({
      ...prev,
      diagnosis: [...(prev.diagnosis || []), diagnosisInput.trim()]
    }));
    setDiagnosisInput('');
  };
  
  const removeDiagnosis = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      diagnosis: prev.diagnosis?.filter((_, i) => i !== index)
    }));
  };
  
  const addTreatment = () => {
    if (!treatmentInput.trim()) return;
    
    setFormData((prev) => ({
      ...prev,
      treatments: [...(prev.treatments || []), treatmentInput.trim()]
    }));
    setTreatmentInput('');
  };
  
  const removeTreatment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      treatments: prev.treatments?.filter((_, i) => i !== index)
    }));
  };
  
  const addLabTest = () => {
    if (!labTestName.trim() || !labTestValue.trim()) return;
    
    setFormData((prev) => ({
      ...prev,
      lab_results: {
        ...prev.lab_results,
        [labTestName.trim()]: {
          result: labTestValue.trim(),
          reference_range: labTestRange.trim() || 'N/A',
          status: labTestStatus
        }
      }
    }));
    
    setLabTestName('');
    setLabTestValue('');
    setLabTestRange('');
    setLabTestStatus('normal');
  };
  
  const removeLabTest = (testName: string) => {
    if (!formData.lab_results) return;
    
    const updatedLabResults = { ...formData.lab_results };
    delete updatedLabResults[testName];
    
    setFormData((prev) => ({
      ...prev,
      lab_results: updatedLabResults
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b font-medium text-gray-700 bg-gray-50 flex justify-between items-center">
        <div>{isEditing ? 'Edit Medical Record' : 'New Medical Record'}</div>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={18} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Record Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="exam">Examination</option>
              <option value="vaccination">Vaccination</option>
              <option value="surgery">Surgery</option>
              <option value="lab">Lab Work</option>
              <option value="emergency">Emergency</option>
              <option value="follow-up">Follow-up</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={typeof formData.date === 'string' ? formData.date.split('T')[0] : ''}
              onChange={handleInputChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Doctor
            </label>
            <select
              name="doctor_id"
              value={formData.doctor_id}
              onChange={handleInputChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="">Select Doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient
            </label>
            <input
              type="text"
              value={patient.name}
              disabled
              className="w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
            />
          </div>
        </div>
        
        {/* Vital Signs */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Vital Signs</h3>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Temperature (°F)
              </label>
              <input
                type="text"
                name="temperature"
                value={formData.vital_signs?.temperature || ''}
                onChange={handleVitalSignChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Heart Rate (bpm)
              </label>
              <input
                type="text"
                name="heart_rate"
                value={formData.vital_signs?.heart_rate || ''}
                onChange={handleVitalSignChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Respiratory Rate (rpm)
              </label>
              <input
                type="text"
                name="respiratory_rate"
                value={formData.vital_signs?.respiratory_rate || ''}
                onChange={handleVitalSignChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Weight (kg)
              </label>
              <input
                type="text"
                name="weight"
                value={formData.vital_signs?.weight || ''}
                onChange={handleVitalSignChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
          </div>
        </div>
        
        {/* Diagnosis */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Diagnosis
          </label>
          <div className="flex mb-2">
            <input
              type="text"
              value={diagnosisInput}
              onChange={(e) => setDiagnosisInput(e.target.value)}
              className="flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="Enter diagnosis"
            />
            <button
              type="button"
              onClick={addDiagnosis}
              className="px-3 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700"
            >
              <Plus size={16} />
            </button>
          </div>
          
          {formData.diagnosis && formData.diagnosis.length > 0 ? (
            <div className="space-y-2">
              {formData.diagnosis.map((diagnosis, index) => (
                <div key={index} className="flex items-center bg-gray-50 p-2 rounded-md">
                  <span className="flex-1 text-sm">{diagnosis}</span>
                  <button
                    type="button"
                    onClick={() => removeDiagnosis(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No diagnoses added</p>
          )}
        </div>
        
        {/* Treatments */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Treatments
          </label>
          <div className="flex mb-2">
            <input
              type="text"
              value={treatmentInput}
              onChange={(e) => setTreatmentInput(e.target.value)}
              className="flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="Enter treatment"
            />
            <button
              type="button"
              onClick={addTreatment}
              className="px-3 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700"
            >
              <Plus size={16} />
            </button>
          </div>
          
          {formData.treatments && formData.treatments.length > 0 ? (
            <div className="space-y-2">
              {formData.treatments.map((treatment, index) => (
                <div key={index} className="flex items-center bg-gray-50 p-2 rounded-md">
                  <span className="flex-1 text-sm">{treatment}</span>
                  <button
                    type="button"
                    onClick={() => removeTreatment(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No treatments added</p>
          )}
        </div>
        
        {/* Lab Results */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lab Results
          </label>
          <div className="grid grid-cols-4 gap-2 mb-2">
            <input
              type="text"
              value={labTestName}
              onChange={(e) => setLabTestName(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="Test name"
            />
            
            <input
              type="text"
              value={labTestValue}
              onChange={(e) => setLabTestValue(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="Result"
            />
            
            <input
              type="text"
              value={labTestRange}
              onChange={(e) => setLabTestRange(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="Reference range"
            />
            
            <div className="flex">
              <select
                value={labTestStatus}
                onChange={(e) => setLabTestStatus(e.target.value)}
                className="rounded-l-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 flex-1"
              >
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="low">Low</option>
                <option value="abnormal">Abnormal</option>
              </select>
              
              <button
                type="button"
                onClick={addLabTest}
                className="px-3 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
          
          {formData.lab_results && Object.keys(formData.lab_results).length > 0 ? (
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Test
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Result
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference Range
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(formData.lab_results).map(([key, value]: [string, any]) => (
                    <tr key={key}>
                      <td className="px-3 py-2 text-sm">{key}</td>
                      <td className="px-3 py-2 text-sm">{value.result}</td>
                      <td className="px-3 py-2 text-sm">{value.reference_range || 'N/A'}</td>
                      <td className="px-3 py-2 text-sm">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          value.status === 'normal' 
                            ? 'bg-green-100 text-green-800' 
                            : value.status === 'high'
                              ? 'bg-red-100 text-red-800'
                              : value.status === 'low'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                        }`}>
                          {value.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-sm text-center">
                        <button
                          type="button"
                          onClick={() => removeLabTest(key)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No lab results added</p>
          )}
        </div>
        
        {/* Notes */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes || ''}
            onChange={handleInputChange}
            rows={4}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            placeholder="Enter additional notes..."
          ></textarea>
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700"
          >
            {isEditing ? 'Update Record' : 'Save Record'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MedicalRecordForm;