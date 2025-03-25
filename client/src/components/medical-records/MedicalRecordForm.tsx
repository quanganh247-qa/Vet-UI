import React, { useState } from 'react';
import { X, Plus, Trash, ChevronRight, FileText, User, ArrowLeft, Calendar, FileCheck, Bell } from 'lucide-react';
import { MedicalRecord, Doctor, Patient } from '../../types';
import PhotoCapture from "./PhotoCapture";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
  
  const [photos, setPhotos] = useState<Array<{ data: string; notes: string }>>([]);
  
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
  
  const addLabResult = () => {
    if (!labTestName.trim() || !labTestValue.trim()) return;
    
    setFormData((prev) => ({
      ...prev,
      lab_results: {
        ...(prev.lab_results || {}),
        [labTestName.trim()]: {
          value: labTestValue.trim(),
          reference_range: labTestRange.trim(),
          status: labTestStatus
        }
      }
    }));
    
    setLabTestName('');
    setLabTestValue('');
    setLabTestRange('');
    setLabTestStatus('normal');
  };
  
  const removeLabResult = (testName: string) => {
    if (!formData.lab_results) return;
    
    const updatedLabResults = { ...formData.lab_results };
    delete updatedLabResults[testName];
    
    setFormData((prev) => ({
      ...prev,
      lab_results: updatedLabResults
    }));
  };
  
  const handlePhotoCapture = (photoData: { data: string; notes: string }) => {
    setPhotos(prev => [...prev, photoData]);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSave({
      ...formData,
      photos
    });
  };
  
  // Record type badge color mapping
  const getRecordTypeColor = () => {
    const types: Record<string, string> = {
      'exam': 'bg-blue-100 text-blue-800',
      'vaccination': 'bg-green-100 text-green-800',
      'surgery': 'bg-purple-100 text-purple-800',
      'lab': 'bg-amber-100 text-amber-800',
      'emergency': 'bg-red-100 text-red-800',
      'follow-up': 'bg-indigo-100 text-indigo-800'
    };
    
    return types[formData.type as string] || 'bg-gray-100 text-gray-800';
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Breadcrumb Navigation */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center text-sm">
        <Link href="/">
          <a className="text-gray-500 hover:text-gray-700">Dashboard</a>
        </Link>
        <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
        <Link href="/medical-records">
          <a className="text-gray-500 hover:text-gray-700">Medical Records</a>
        </Link>
        <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
        <Link href={`/patients/${patient.id}`}>
          <a className="text-gray-500 hover:text-gray-700">{patient.name}</a>
        </Link>
        <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
        <span className="text-gray-700 font-medium">
          {isEditing ? 'Edit Record' : 'New Record'}
        </span>
      </div>
      
      {/* Header with context */}
      <div className="px-4 py-3 border-b font-medium text-gray-700 bg-gray-50 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-gray-500 mr-2" />
            <span>{isEditing ? 'Edit Medical Record' : 'New Medical Record'}</span>
          </div>
          <div className={`text-xs px-2 py-0.5 rounded ${getRecordTypeColor()}`}>
            {formData.type?.charAt(0).toUpperCase() + formData.type?.slice(1)}
          </div>
          {isEditing && record?.id && (
            <div className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
              ID: {record.id}
            </div>
          )}
        </div>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={18} />
        </button>
      </div>
      
      {/* Quick action links */}
      <div className="px-4 py-2 bg-gray-50 border-b flex flex-wrap gap-2">
        <Link href={`/patients/${patient.id}`}>
          <Button variant="ghost" size="sm" className="h-8">
            <User className="h-4 w-4 mr-1" />
            Patient Details
          </Button>
        </Link>
        <Link href={`/patients/${patient.id}/appointments`}>
          <Button variant="ghost" size="sm" className="h-8">
            <Calendar className="h-4 w-4 mr-1" />
            Patient Appointments
          </Button>
        </Link>
        <Link href={`/patients/${patient.id}/medical-records`}>
          <Button variant="ghost" size="sm" className="h-8">
            <FileCheck className="h-4 w-4 mr-1" />
            Medical History
          </Button>
        </Link>
        {isEditing && (
          <Link href={`/notifications`}>
            <Button variant="ghost" size="sm" className="h-8">
              <Bell className="h-4 w-4 mr-1" />
              Send Notification
            </Button>
          </Link>
        )}
      </div>
      
      {/* Patient info bar */}
      <div className="px-4 py-3 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div>
            <span className="text-sm text-gray-500">Patient:</span>
            <span className="ml-1 font-medium">{patient.name}</span>
          </div>
          {patient.species && (
            <div>
              <span className="text-sm text-gray-500">Species:</span>
              <span className="ml-1">{patient.species}</span>
            </div>
          )}
          {patient.breed && (
            <div>
              <span className="text-sm text-gray-500">Breed:</span>
              <span className="ml-1">{patient.breed}</span>
            </div>
          )}
          {patient.age && (
            <div>
              <span className="text-sm text-gray-500">Age:</span>
              <span className="ml-1">{patient.age}</span>
            </div>
          )}
        </div>
        <div>
          <Badge variant="outline" className="bg-white">
            {patient.status || 'Active'}
          </Badge>
        </div>
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
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
                <div className="col-span-1">
                  <input
                    type="text"
                    value={labTestName}
                    onChange={(e) => setLabTestName(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm"
                    placeholder="Test name"
                  />
                </div>
                <div className="col-span-1">
                  <input
                    type="text"
                    value={labTestValue}
                    onChange={(e) => setLabTestValue(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm"
                    placeholder="Value"
                  />
                </div>
                <div className="col-span-1">
                  <input
                    type="text"
                    value={labTestRange}
                    onChange={(e) => setLabTestRange(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm"
                    placeholder="Ref. range"
                  />
                </div>
                <div className="col-span-1 flex">
                  <select
                    value={labTestStatus}
                    onChange={(e) => setLabTestStatus(e.target.value)}
                    className="w-full rounded-l-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm"
                  >
                    <option value="normal">Normal</option>
                    <option value="low">Low</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                  <button
                    type="button"
                    onClick={addLabResult}
                    className="px-2 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              
              {formData.lab_results && Object.keys(formData.lab_results).length > 0 ? (
                <div className="bg-gray-50 rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference Range</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="relative px-3 py-2">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Object.entries(formData.lab_results).map(([testName, testData]) => (
                        <tr key={testName}>
                          <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{testName}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{testData.value}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{testData.reference_range || '-'}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">
                            <span className={`
                              px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${testData.status === 'normal' ? 'bg-green-100 text-green-800' : ''}
                              ${testData.status === 'low' ? 'bg-yellow-100 text-yellow-800' : ''}
                              ${testData.status === 'high' ? 'bg-orange-100 text-orange-800' : ''}
                              ${testData.status === 'critical' ? 'bg-red-100 text-red-800' : ''}
                            `}>
                              {testData.status.charAt(0).toUpperCase() + testData.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              type="button"
                              onClick={() => removeLabResult(testName)}
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
          </div>
          
          <div>
            <PhotoCapture onPhotoCapture={handlePhotoCapture} />
            
            {photos.length > 0 && (
              <div className="mt-2 text-sm text-green-600">
                {photos.length} photo{photos.length !== 1 ? "s" : ""} attached to this record
              </div>
            )}
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-between space-x-2 pt-4 border-t">
          <Link href="/medical-records">
            <Button variant="outline" size="sm" className="h-9">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Records
            </Button>
          </Link>
          
          <div className="flex space-x-2">
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
        </div>
      </form>
    </div>
  );
};

export default MedicalRecordForm;