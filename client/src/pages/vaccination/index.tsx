import React, { useState, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Syringe,
  PlusCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Search,
  PawPrint,
  FlaskConical,
  Info,
} from "lucide-react";
import VaccinationAdministration from "@/components/vaccination/VaccinationAdministration";
import VaccinationHistory from "@/components/vaccination/VaccinationHistory";
import { useToast } from "@/components/ui/use-toast";
import { usePatientData } from "@/hooks/use-pet";
import { useVaccineData, useAllVaccines } from "@/hooks/use-vaccine";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

const ITEMS_PER_PAGE = 10;

const VaccinationPage: React.FC = () => {
  const { patientId: petIdParam } = useParams<{ patientId: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const petId = petIdParam ? parseInt(petIdParam, 10) : 0;
  const isValidPetId = petId > 0;
  const isStandaloneMode = !isValidPetId;

  // Patient data (if in patient-specific mode)
  const { data: patient, isLoading: isPatientLoading } = usePatientData(
    isValidPetId ? petId.toString() : undefined
  );

  // Vaccination history for the selected patient
  const {
    data: vaccinationHistory = [],
    isLoading: isHistoryLoading,
    refetch: refetchHistory,
  } = useVaccineData(isValidPetId ? petId : 0);

  // Load all vaccines for standalone mode
  const { data: allVaccines = [], isLoading: isAllVaccinesLoading } =
    useAllVaccines();

  const [isAdministrationDialogOpen, setIsAdministrationDialogOpen] =
    useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("vaccinations");

  const filteredHistory = useMemo(() => {
    if (!Array.isArray(vaccinationHistory)) return [];
    return vaccinationHistory.filter((record) => {
      const searchStr = searchQuery.toLowerCase();
      return (
        record.vaccine_name?.toLowerCase().includes(searchStr) ||
        record.vaccine?.name?.toLowerCase().includes(searchStr) ||
        record.batch_number?.toLowerCase().includes(searchStr) ||
        record.administered_by_name?.toLowerCase().includes(searchStr) ||
        record.doctor?.name?.toLowerCase().includes(searchStr)
      );
    });
  }, [vaccinationHistory, searchQuery]);

  const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE);
  const paginatedHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredHistory.slice(startIndex, endIndex);
  }, [filteredHistory, currentPage]);

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleVaccinationComplete = () => {
    setIsAdministrationDialogOpen(false);
    refetchHistory();
    toast({
      title: "Vaccination Record Saved",
      description:
        "The vaccination has been successfully recorded in the patient's chart.",
      className: "bg-green-500 text-white",
    });
  };

  const handleCancelAdministration = () => {
    setIsAdministrationDialogOpen(false);
  };

  const isLoading =
    isPatientLoading || isHistoryLoading || isAllVaccinesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-t-indigo-600 border-b-indigo-600 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
          <p className="text-indigo-600 font-medium">
            Loading vaccination details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4 rounded-xl shadow-md mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Vaccination Management {patient ? `- ${patient.name}` : ""}
            </h1>
            <p className="text-indigo-100 text-sm">
              {isStandaloneMode
                ? "View and manage vaccination records for all patients"
                : `View history and administer new vaccinations for ${
                    patient?.name || "this patient"
                  }`}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-white flex items-center hover:bg-white/10 rounded-lg px-3 py-2 transition-all"
              onClick={() =>
                navigate(isValidPetId ? `/patient/${petId}` : "/patients")
              }
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {isValidPetId ? "Back to Patient" : "Back to Patients"}
            </Button>
          </div>
        </div>
      </div>

      <Tabs
        defaultValue="vaccinations"
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="vaccinations" className="flex items-center gap-2">
            <Syringe className="h-4 w-4" />
            Vaccination Records
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4" />
            Vaccine Inventory
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vaccinations" className="space-y-4">
          <Card className="border-none shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-white border-b pb-4">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <CardTitle className="text-lg font-semibold text-indigo-900 flex items-center">
                    <Syringe className="h-5 w-5 mr-2 text-indigo-600" />
                    {isStandaloneMode
                      ? "All Vaccination Records"
                      : "Vaccination History"}
                  </CardTitle>
                  <CardDescription>
                    {isStandaloneMode
                      ? "Review vaccination records across all patients"
                      : `Review past vaccinations administered to ${
                          patient?.name || "the patient"
                        }.`}
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search vaccinations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <Dialog
                    open={isAdministrationDialogOpen}
                    onOpenChange={setIsAdministrationDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        className="bg-indigo-600 text-white hover:bg-indigo-700 w-full sm:w-auto"
                        size="sm"
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Administer New Vaccine
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[900px] md:max-w-[1000px] lg:max-w-[85%] max-h-[90vh] overflow-y-auto border border-indigo-200 bg-white">
                      <DialogHeader className="border-b border-indigo-100 pb-4">
                        <DialogTitle className="text-xl font-semibold text-indigo-900 flex items-center">
                          <Syringe className="h-5 w-5 mr-2 text-indigo-600" />
                          Administer New Vaccination
                        </DialogTitle>
                      </DialogHeader>
                      <VaccinationAdministration
                        petId={isValidPetId ? petId.toString() : undefined}
                        onComplete={handleVaccinationComplete}
                        onCancel={handleCancelAdministration}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {Array.isArray(filteredHistory) && filteredHistory.length > 0 ? (
                <div>
                  <Table>
                    <TableHeader className="bg-gray-50/80">
                      <TableRow>
                        {isStandaloneMode && (
                          <TableHead className="font-semibold">
                            Patient
                          </TableHead>
                        )}
                        <TableHead className="font-semibold">Date</TableHead>
                        <TableHead className="font-semibold">
                          Vaccine Name
                        </TableHead>
                        <TableHead className="font-semibold">
                          Batch Number
                        </TableHead>
                        <TableHead className="font-semibold">
                          Administered By
                        </TableHead>
                        <TableHead className="font-semibold">
                          Next Due
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedHistory.map((record: any, index: number) => (
                        <TableRow
                          key={
                            record.vaccination_record_id || record.id || index
                          }
                          className="hover:bg-gray-50 transition-colors"
                        >
                          {isStandaloneMode && (
                            <TableCell>
                              <div className="flex items-center">
                                <PawPrint className="h-4 w-4 mr-2 text-indigo-500" />
                                <span className="font-medium">
                                  {record.pet?.name || "Unknown"}
                                </span>
                              </div>
                            </TableCell>
                          )}
                          <TableCell className="font-medium">
                            {record.administration_date
                              ? format(
                                  new Date(record.administration_date),
                                  "PP"
                                )
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            {record.vaccine_name ||
                              record.vaccine?.name ||
                              "N/A"}
                          </TableCell>
                          <TableCell>{record.batch_number || "N/A"}</TableCell>
                          <TableCell>
                            {record.administered_by_name ||
                              record.doctor?.name ||
                              "N/A"}
                          </TableCell>
                          <TableCell>
                            {record.next_due_date ? (
                              <Badge
                                variant="outline"
                                className="bg-blue-50 text-blue-700 border-blue-200"
                              >
                                {format(new Date(record.next_due_date), "PP")}
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-gray-50 text-gray-600 border-gray-200"
                              >
                                None
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-gray-200">
                      <div className="text-sm text-gray-500">
                        Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                        {Math.min(
                          currentPage * ITEMS_PER_PAGE,
                          filteredHistory.length
                        )}{" "}
                        of {filteredHistory.length} results
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePreviousPage}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          <span className="sr-only">Previous Page</span>
                        </Button>
                        <span className="text-sm text-gray-600">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleNextPage}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                          <span className="sr-only">Next Page</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-gray-500">
                  <Syringe className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No Vaccination Records Found
                  </h3>
                  <p className="text-sm text-center max-w-md">
                    {searchQuery
                      ? "No records match your search criteria. Try using different keywords."
                      : isStandaloneMode
                      ? "There are no vaccination records in the system yet."
                      : `${
                          patient?.name || "This patient"
                        } has no vaccination records yet.`}
                  </p>
                  <Button
                    className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white"
                    size="sm"
                    onClick={() => setIsAdministrationDialogOpen(true)}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Administer New Vaccine
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {isValidPetId && filteredHistory.length > 0 && (
            <Card className="border-none shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-white border-b pb-4">
                <CardTitle className="text-lg font-semibold text-indigo-900 flex items-center">
                  <Info className="h-5 w-5 mr-2 text-indigo-600" />
                  Vaccination Overview
                </CardTitle>
                <CardDescription>
                  Upcoming, past, and overdue vaccinations for{" "}
                  {patient?.name || "this patient"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <VaccinationHistory vaccines={vaccinationHistory} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card className="border-none shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-white border-b pb-4">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <CardTitle className="text-lg font-semibold text-indigo-900 flex items-center">
                    <FlaskConical className="h-5 w-5 mr-2 text-indigo-600" />
                    Vaccine Inventory
                  </CardTitle>
                  <CardDescription>
                    Manage available vaccines and stock levels
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {Array.isArray(allVaccines) && allVaccines.length > 0 ? (
                <Table>
                  <TableHeader className="bg-gray-50/80">
                    <TableRow>
                      <TableHead className="font-semibold">
                        Vaccine Name
                      </TableHead>
                      <TableHead className="font-semibold">
                        Available Doses
                      </TableHead>
                      <TableHead className="font-semibold">
                        Batch Number
                      </TableHead>
                      <TableHead className="font-semibold">
                        Expiration Date
                      </TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allVaccines.map((vaccine: any, index: number) => (
                      <TableRow
                        key={vaccine.id || index}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <TableCell className="font-medium">
                          {vaccine.name}
                        </TableCell>
                        <TableCell>{vaccine.available_doses || 0}</TableCell>
                        <TableCell>{vaccine.batch_number || "N/A"}</TableCell>
                        <TableCell>
                          {vaccine.expiration_date
                            ? format(new Date(vaccine.expiration_date), "PP")
                            : "N/A"}
                        </TableCell>
                        <TableCell>{getVaccineStatusBadge(vaccine)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-gray-500">
                  <FlaskConical className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No Vaccines in Inventory
                  </h3>
                  <p className="text-sm text-center max-w-md">
                    There are no vaccines in inventory or the inventory data
                    couldn't be loaded.
                  </p>
                  <Button
                    className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white"
                    size="sm"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add New Vaccine
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

function getVaccineStatusBadge(vaccine: any) {
  if (!vaccine.available_doses || vaccine.available_doses <= 0) {
    return (
      <Badge
        variant="outline"
        className="bg-red-50 text-red-700 border-red-200"
      >
        Out of Stock
      </Badge>
    );
  }

  if (vaccine.available_doses < 5) {
    return (
      <Badge
        variant="outline"
        className="bg-yellow-50 text-yellow-700 border-yellow-200"
      >
        Low Stock
      </Badge>
    );
  }

  if (
    vaccine.expiration_date &&
    new Date(vaccine.expiration_date) < new Date()
  ) {
    return (
      <Badge
        variant="outline"
        className="bg-red-50 text-red-700 border-red-200"
      >
        Expired
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="bg-green-50 text-green-700 border-green-200"
    >
      In Stock
    </Badge>
  );
}

export default VaccinationPage;
