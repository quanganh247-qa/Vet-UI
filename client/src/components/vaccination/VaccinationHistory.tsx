import React from 'react';
import { format } from 'date-fns';
import { Syringe, Calendar, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface VaccinationHistoryProps {
  vaccines: Array<{
    vaccination_id: number;
    vaccine_name: string;
    date_administered: string;
    next_due_date: string;
    batch_number: string;
    vaccine_provider: string;
    notes: string;
  }>;
}

const VaccinationHistory: React.FC<VaccinationHistoryProps> = ({ vaccines }) => {
  const sortedVaccines = [...vaccines].sort(
    (a, b) => new Date(b.date_administered).getTime() - new Date(a.date_administered).getTime()
  );

  const isUpcoming = (date: string) => new Date(date) > new Date();
  const isOverdue = (date: string) => {
    const dueDate = new Date(date);
    const today = new Date();
    return dueDate < today;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Vaccinations */}
        <Card className="border-none shadow-md">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-white pb-3 border-b">
            <CardTitle className="text-lg font-semibold text-indigo-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
              Upcoming Vaccinations
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {sortedVaccines
              .filter(v => isUpcoming(v.next_due_date))
              .map(vaccine => (
                <div
                  key={vaccine.vaccination_id}
                  className="p-4 border rounded-lg mb-3 last:mb-0 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{vaccine.vaccine_name}</h3>
                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700">
                      Due {format(new Date(vaccine.next_due_date), 'MMM d, yyyy')}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{vaccine.notes}</p>
                </div>
              ))}
          </CardContent>
        </Card>

        {/* Vaccination History */}
        <Card className="border-none shadow-md">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-white pb-3 border-b">
            <CardTitle className="text-lg font-semibold text-indigo-900 flex items-center">
              <Syringe className="h-5 w-5 mr-2 text-indigo-600" />
              Vaccination History
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {sortedVaccines.map(vaccine => (
              <div
                key={vaccine.vaccination_id}
                className="p-4 border rounded-lg mb-3 last:mb-0 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900">{vaccine.vaccine_name}</h3>
                  <Badge variant="outline" className="bg-gray-50">
                    {format(new Date(vaccine.date_administered), 'MMM d, yyyy')}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mt-2">
                  <div>
                    <span className="font-medium">Batch:</span> {vaccine.batch_number}
                  </div>
                  <div>
                    <span className="font-medium">Provider:</span> {vaccine.vaccine_provider}
                  </div>
                </div>
                {vaccine.notes && (
                  <p className="text-sm text-gray-600 mt-2 border-t pt-2">{vaccine.notes}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Overdue Vaccinations */}
      {sortedVaccines.some(v => isOverdue(v.next_due_date)) && (
        <Card className="border-none shadow-md bg-red-50">
          <CardHeader className="pb-3 border-b border-red-100">
            <CardTitle className="text-lg font-semibold text-red-900 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
              Overdue Vaccinations
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {sortedVaccines
              .filter(v => isOverdue(v.next_due_date))
              .map(vaccine => (
                <div
                  key={vaccine.vaccination_id}
                  className="p-4 bg-white border border-red-100 rounded-lg mb-3 last:mb-0"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{vaccine.vaccine_name}</h3>
                    <Badge variant="destructive">
                      Overdue since {format(new Date(vaccine.next_due_date), 'MMM d, yyyy')}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{vaccine.notes}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                  >
                    Schedule Vaccination
                  </Button>
                </div>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VaccinationHistory;