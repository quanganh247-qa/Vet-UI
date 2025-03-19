import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { format } from "date-fns";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import {
  insertPatientSchema, 
  insertAppointmentSchema,
  insertStaffSchema,
  insertScheduleSchema,
  insertAnalyticSchema,
  AppointmentStatus
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes prefix with /api
  
  // Error handling middleware
  const handleZodError = (err: unknown, res: any) => {
    if (err instanceof ZodError) {
      const validationError = fromZodError(err);
      return res.status(400).json({
        message: validationError.message,
        errors: err.errors
      });
    }
    return res.status(500).json({ message: "Internal server error" });
  };

  // === PATIENTS ROUTES ===
  // Get all patients
  app.get("/api/patients", async (req, res) => {
    try {
      const patients = await storage.getPatients();
      res.json(patients);
    } catch (err) {
      console.error("Error fetching patients:", err);
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  // Get patient by ID
  app.get("/api/patients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const patient = await storage.getPatient(id);
      
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      res.json(patient);
    } catch (err) {
      console.error("Error fetching patient:", err);
      res.status(500).json({ message: "Failed to fetch patient" });
    }
  });

  // Get recent patients
  app.get("/api/patients/recent/:limit", async (req, res) => {
    try {
      const limit = parseInt(req.params.limit) || 5;
      const patients = await storage.getRecentPatients(limit);
      res.json(patients);
    } catch (err) {
      console.error("Error fetching recent patients:", err);
      res.status(500).json({ message: "Failed to fetch recent patients" });
    }
  });

  // Create patient
  app.post("/api/patients", async (req, res) => {
    try {
      const patientData = insertPatientSchema.parse(req.body);
      const patient = await storage.createPatient(patientData);
      res.status(201).json(patient);
    } catch (err) {
      console.error("Error creating patient:", err);
      handleZodError(err, res);
    }
  });

  // Update patient
  app.put("/api/patients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const patientData = insertPatientSchema.partial().parse(req.body);
      
      const updatedPatient = await storage.updatePatient(id, patientData);
      
      if (!updatedPatient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      res.json(updatedPatient);
    } catch (err) {
      console.error("Error updating patient:", err);
      handleZodError(err, res);
    }
  });

  // Delete patient
  app.delete("/api/patients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePatient(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      res.status(204).end();
    } catch (err) {
      console.error("Error deleting patient:", err);
      res.status(500).json({ message: "Failed to delete patient" });
    }
  });

  // === APPOINTMENTS ROUTES ===
  // Get all appointments
  app.get("/api/appointments", async (req, res) => {
    try {
      const appointments = await storage.getAppointments();
      res.json(appointments);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  // Get appointment by ID
  app.get("/api/appointments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const appointment = await storage.getAppointment(id);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      res.json(appointment);
    } catch (err) {
      console.error("Error fetching appointment:", err);
      res.status(500).json({ message: "Failed to fetch appointment" });
    }
  });

  // Get appointments by date
  app.get("/api/appointments/date/:date", async (req, res) => {
    try {
      const dateParam = req.params.date;
      let date: Date;
      
      if (dateParam === "today") {
        date = new Date();
      } else {
        date = new Date(dateParam);
      }
      
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      
      const appointments = await storage.getAppointmentsByDate(date);
      res.json(appointments);
    } catch (err) {
      console.error("Error fetching appointments by date:", err);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  // Get appointments by patient
  app.get("/api/appointments/patient/:patientId", async (req, res) => {
    try {
      const patientId = parseInt(req.params.patientId);
      const appointments = await storage.getAppointmentsByPatient(patientId);
      res.json(appointments);
    } catch (err) {
      console.error("Error fetching patient appointments:", err);
      res.status(500).json({ message: "Failed to fetch patient appointments" });
    }
  });

  // Get appointments by doctor
  app.get("/api/appointments/doctor/:doctorId", async (req, res) => {
    try {
      const doctorId = parseInt(req.params.doctorId);
      const appointments = await storage.getAppointmentsByDoctor(doctorId);
      res.json(appointments);
    } catch (err) {
      console.error("Error fetching doctor appointments:", err);
      res.status(500).json({ message: "Failed to fetch doctor appointments" });
    }
  });

  // Create appointment
  app.post("/api/appointments", async (req, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentData);
      res.status(201).json(appointment);
    } catch (err) {
      console.error("Error creating appointment:", err);
      handleZodError(err, res);
    }
  });

  // Update appointment
  app.put("/api/appointments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const appointmentData = insertAppointmentSchema.partial().parse(req.body);
      
      const updatedAppointment = await storage.updateAppointment(id, appointmentData);
      
      if (!updatedAppointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      res.json(updatedAppointment);
    } catch (err) {
      console.error("Error updating appointment:", err);
      handleZodError(err, res);
    }
  });

  // Update appointment status
  app.patch("/api/appointments/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!Object.values(AppointmentStatus).includes(status)) {
        return res.status(400).json({ message: "Invalid appointment status" });
      }
      
      const updatedAppointment = await storage.updateAppointment(id, { status });
      
      if (!updatedAppointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      res.json(updatedAppointment);
    } catch (err) {
      console.error("Error updating appointment status:", err);
      res.status(500).json({ message: "Failed to update appointment status" });
    }
  });

  // Delete appointment
  app.delete("/api/appointments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteAppointment(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      res.status(204).end();
    } catch (err) {
      console.error("Error deleting appointment:", err);
      res.status(500).json({ message: "Failed to delete appointment" });
    }
  });

  // === STAFF ROUTES ===
  // Get all staff
  app.get("/api/staff", async (req, res) => {
    try {
      const staff = await storage.getAllStaff();
      res.json(staff);
    } catch (err) {
      console.error("Error fetching staff:", err);
      res.status(500).json({ message: "Failed to fetch staff" });
    }
  });

  // Get staff by ID
  app.get("/api/staff/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const staff = await storage.getStaff(id);
      
      if (!staff) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      
      res.json(staff);
    } catch (err) {
      console.error("Error fetching staff member:", err);
      res.status(500).json({ message: "Failed to fetch staff member" });
    }
  });

  // Create staff
  app.post("/api/staff", async (req, res) => {
    try {
      const staffData = insertStaffSchema.parse(req.body);
      const staff = await storage.createStaff(staffData);
      res.status(201).json(staff);
    } catch (err) {
      console.error("Error creating staff member:", err);
      handleZodError(err, res);
    }
  });

  // Update staff
  app.put("/api/staff/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const staffData = insertStaffSchema.partial().parse(req.body);
      
      const updatedStaff = await storage.updateStaff(id, staffData);
      
      if (!updatedStaff) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      
      res.json(updatedStaff);
    } catch (err) {
      console.error("Error updating staff member:", err);
      handleZodError(err, res);
    }
  });

  // Delete staff
  app.delete("/api/staff/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteStaff(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      
      res.status(204).end();
    } catch (err) {
      console.error("Error deleting staff member:", err);
      res.status(500).json({ message: "Failed to delete staff member" });
    }
  });

  // === SCHEDULES ROUTES ===
  // Get schedule by ID
  app.get("/api/schedules/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const schedule = await storage.getSchedule(id);
      
      if (!schedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      
      res.json(schedule);
    } catch (err) {
      console.error("Error fetching schedule:", err);
      res.status(500).json({ message: "Failed to fetch schedule" });
    }
  });

  // Get schedules by staff
  app.get("/api/schedules/staff/:staffId", async (req, res) => {
    try {
      const staffId = parseInt(req.params.staffId);
      const schedules = await storage.getSchedulesByStaff(staffId);
      res.json(schedules);
    } catch (err) {
      console.error("Error fetching staff schedules:", err);
      res.status(500).json({ message: "Failed to fetch staff schedules" });
    }
  });

  // Get schedules by date
  app.get("/api/schedules/date/:date", async (req, res) => {
    try {
      const dateParam = req.params.date;
      let date: Date;
      
      if (dateParam === "today") {
        date = new Date();
      } else {
        date = new Date(dateParam);
      }
      
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      
      const schedules = await storage.getSchedulesByDate(date);
      res.json(schedules);
    } catch (err) {
      console.error("Error fetching schedules by date:", err);
      res.status(500).json({ message: "Failed to fetch schedules" });
    }
  });

  // Create schedule
  app.post("/api/schedules", async (req, res) => {
    try {
      const scheduleData = insertScheduleSchema.parse(req.body);
      const schedule = await storage.createSchedule(scheduleData);
      res.status(201).json(schedule);
    } catch (err) {
      console.error("Error creating schedule:", err);
      handleZodError(err, res);
    }
  });

  // Update schedule
  app.put("/api/schedules/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const scheduleData = insertScheduleSchema.partial().parse(req.body);
      
      const updatedSchedule = await storage.updateSchedule(id, scheduleData);
      
      if (!updatedSchedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      
      res.json(updatedSchedule);
    } catch (err) {
      console.error("Error updating schedule:", err);
      handleZodError(err, res);
    }
  });

  // Delete schedule
  app.delete("/api/schedules/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteSchedule(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      
      res.status(204).end();
    } catch (err) {
      console.error("Error deleting schedule:", err);
      res.status(500).json({ message: "Failed to delete schedule" });
    }
  });

  // === ANALYTICS ROUTES ===
  // Get all analytics
  app.get("/api/analytics", async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Get analytics by date
  app.get("/api/analytics/date/:date", async (req, res) => {
    try {
      const dateParam = req.params.date;
      let date: Date;
      
      if (dateParam === "today") {
        date = new Date();
      } else {
        date = new Date(dateParam);
      }
      
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      
      const analytics = await storage.getAnalyticsByDate(date);
      
      if (!analytics) {
        return res.status(404).json({ message: "Analytics not found for the specified date" });
      }
      
      res.json(analytics);
    } catch (err) {
      console.error("Error fetching analytics by date:", err);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Create analytics
  app.post("/api/analytics", async (req, res) => {
    try {
      const analyticData = insertAnalyticSchema.parse(req.body);
      const analytic = await storage.createAnalytic(analyticData);
      res.status(201).json(analytic);
    } catch (err) {
      console.error("Error creating analytics:", err);
      handleZodError(err, res);
    }
  });

  // Update analytics
  app.put("/api/analytics/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const analyticData = insertAnalyticSchema.partial().parse(req.body);
      
      const updatedAnalytic = await storage.updateAnalytic(id, analyticData);
      
      if (!updatedAnalytic) {
        return res.status(404).json({ message: "Analytics not found" });
      }
      
      res.json(updatedAnalytic);
    } catch (err) {
      console.error("Error updating analytics:", err);
      handleZodError(err, res);
    }
  });

  // === DASHBOARD ROUTES ===
  // Get dashboard data (metrics)
  app.get("/api/dashboard", async (req, res) => {
    try {
      // Get today's appointments
      const today = new Date();
      const appointments = await storage.getAppointmentsByDate(today);
      
      // Get all patients
      const patients = await storage.getPatients();
      
      // Get analytics for today
      const analytics = await storage.getAnalyticsByDate(today);
      
      // Calculate metrics
      const metrics = {
        appointmentsToday: appointments.length,
        totalPatients: patients.length,
        avgWaitTime: analytics?.wait_time || 0,
        weeklyRevenue: analytics?.revenue || 0
      };
      
      res.json(metrics);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
