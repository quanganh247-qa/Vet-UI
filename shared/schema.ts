import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Patient schema
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  species: text("species").notNull(),
  breed: text("breed"),
  age: integer("age"),
  gender: text("gender"),
  owner_name: text("owner_name").notNull(),
  owner_phone: text("owner_phone"),
  owner_email: text("owner_email"),
  image_url: text("image_url"),
  notes: text("notes"),
});

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = typeof patients.$inferInsert;
export const insertPatientSchema = createInsertSchema(patients).omit({ id: true });

// Appointment status enum
export const AppointmentStatus = {
  SCHEDULED: "scheduled",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELED: "canceled",
} as const;

// Appointment type enum
export const AppointmentType = {
  CHECKUP: "checkup",
  VACCINATION: "vaccination",
  SURGERY: "surgery",
  DENTAL: "dental",
  GROOMING: "grooming",
  FOLLOW_UP: "follow_up",
  OTHER: "other",
} as const;

// Appointments schema
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patient_id: integer("patient_id").notNull(),
  doctor_id: integer("doctor_id").notNull(),
  date: timestamp("date").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull(),
  notes: text("notes"),
});

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;
export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true });

// Staff schema
export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  specialty: text("specialty"),
  image_url: text("image_url"),
  is_active: boolean("is_active").default(true),
});

export type Staff = typeof staff.$inferSelect;
export type InsertStaff = typeof staff.$inferInsert;
export const insertStaffSchema = createInsertSchema(staff).omit({ id: true });

// Schedule schema
export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  staff_id: integer("staff_id").notNull(),
  date: timestamp("date").notNull(),
  start_time: timestamp("start_time").notNull(),
  end_time: timestamp("end_time").notNull(),
  activity_type: text("activity_type").notNull(),
  description: text("description"),
});

export type Schedule = typeof schedules.$inferSelect;
export type InsertSchedule = typeof schedules.$inferInsert;
export const insertScheduleSchema = createInsertSchema(schedules).omit({ id: true });

// Analytics data
export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  appointment_counts: jsonb("appointment_counts").notNull(),
  checkins: jsonb("checkins").notNull(),
  revenue: integer("revenue"),
  wait_time: integer("wait_time"),
});

export type Analytic = typeof analytics.$inferSelect;
export type InsertAnalytic = typeof analytics.$inferInsert;
export const insertAnalyticSchema = createInsertSchema(analytics).omit({ id: true });

// Users schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  staff_id: integer("staff_id"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
