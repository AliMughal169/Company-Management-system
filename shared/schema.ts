import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, decimal, timestamp, date, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Customers
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address"),
  company: text("company"),
  taxId: text("tax_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
});

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;

// Sales Invoices
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  issueDate: date("issue_date").notNull(),
  dueDate: date("due_date").notNull(),
  items: text("items").notNull(), // JSON string of line items
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, paid, overdue
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
});

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

// Proforma Invoices
export const proformaInvoices = pgTable("proforma_invoices", {
  id: serial("id").primaryKey(),
  proformaNumber: text("proforma_number").notNull().unique(),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  issueDate: date("issue_date").notNull(),
  validUntil: date("valid_until").notNull(),
  items: text("items").notNull(), // JSON string of line items
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("draft"), // draft, sent, converted, expired
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProformaInvoiceSchema = createInsertSchema(proformaInvoices).omit({
  id: true,
  createdAt: true,
});

export type InsertProformaInvoice = z.infer<typeof insertProformaInvoiceSchema>;
export type ProformaInvoice = typeof proformaInvoices.$inferSelect;

// Expenses
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  date: date("date").notNull(),
  paymentMethod: text("payment_method").notNull(),
  receipt: text("receipt"), // File path or URL
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
});

export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;

// Employees
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  employeeId: text("employee_id").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  designation: text("designation").notNull(),
  department: text("department").notNull(),
  joinDate: date("join_date").notNull(),
  status: text("status").notNull().default("active"), // active, inactive, on_leave
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
});

export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;

// Stock Management
export const stock = pgTable("stock", {
  id: serial("id").primaryKey(),
  productName: text("product_name").notNull(),
  sku: text("sku").notNull().unique(),
  category: text("category").notNull(),
  quantity: integer("quantity").notNull().default(0),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  reorderLevel: integer("reorder_level").notNull().default(10),
  supplier: text("supplier"),
  lastRestocked: date("last_restocked"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertStockSchema = createInsertSchema(stock).omit({
  id: true,
  createdAt: true,
});

export type InsertStock = z.infer<typeof insertStockSchema>;
export type Stock = typeof stock.$inferSelect;

// Salaries
export const salaries = pgTable("salaries", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => employees.id),
  month: text("month").notNull(), // e.g., "January 2024"
  baseSalary: decimal("base_salary", { precision: 10, scale: 2 }).notNull(),
  housingAllowance: decimal("housing_allowance", { precision: 10, scale: 2 }).notNull().default("0"),
  transportAllowance: decimal("transport_allowance", { precision: 10, scale: 2 }).notNull().default("0"),
  healthInsurance: decimal("health_insurance", { precision: 10, scale: 2 }).notNull().default("0"),
  taxDeduction: decimal("tax_deduction", { precision: 10, scale: 2 }).notNull().default("0"),
  otherDeductions: decimal("other_deductions", { precision: 10, scale: 2 }).notNull().default("0"),
  netPay: decimal("net_pay", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, paid
  paidDate: date("paid_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSalarySchema = createInsertSchema(salaries).omit({
  id: true,
  createdAt: true,
});

export type InsertSalary = z.infer<typeof insertSalarySchema>;
export type Salary = typeof salaries.$inferSelect;

// Leave Management
export const leaveRequests = pgTable("leave_requests", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => employees.id),
  leaveType: text("leave_type").notNull(), // Annual, Sick, Emergency, etc.
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  days: integer("days").notNull(),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  approvedBy: text("approved_by"),
  approvedDate: date("approved_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLeaveRequestSchema = createInsertSchema(leaveRequests).omit({
  id: true,
  createdAt: true,
});

export type InsertLeaveRequest = z.infer<typeof insertLeaveRequestSchema>;
export type LeaveRequest = typeof leaveRequests.$inferSelect;

// Attendance
export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => employees.id),
  date: date("date").notNull(),
  checkIn: text("check_in"),
  checkOut: text("check_out"),
  workHours: text("work_hours"),
  overtime: text("overtime").default("0h"),
  status: text("status").notNull(), // Present, Late, Absent, On Leave
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  createdAt: true,
});

export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Attendance = typeof attendance.$inferSelect;

// Performance Reviews
export const performanceReviews = pgTable("performance_reviews", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => employees.id),
  reviewPeriod: text("review_period").notNull(),
  reviewer: text("reviewer").notNull(),
  overallRating: decimal("overall_rating", { precision: 2, scale: 1 }).notNull(),
  goals: text("goals"),
  achievements: text("achievements"),
  areasForImprovement: text("areas_for_improvement"),
  status: text("status").notNull().default("pending"), // pending, in_progress, completed
  completionDate: date("completion_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPerformanceReviewSchema = createInsertSchema(performanceReviews).omit({
  id: true,
  createdAt: true,
});

export type InsertPerformanceReview = z.infer<typeof insertPerformanceReviewSchema>;
export type PerformanceReview = typeof performanceReviews.$inferSelect;

// Employee Documents
export const employeeDocuments = pgTable("employee_documents", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => employees.id),
  documentType: text("document_type").notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  uploadDate: date("upload_date").notNull(),
  expiryDate: date("expiry_date"),
  status: text("status").notNull().default("active"), // active, expired, archived
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEmployeeDocumentSchema = createInsertSchema(employeeDocuments).omit({
  id: true,
  createdAt: true,
});

export type InsertEmployeeDocument = z.infer<typeof insertEmployeeDocumentSchema>;
export type EmployeeDocument = typeof employeeDocuments.$inferSelect;

// Benefits
export const benefits = pgTable("benefits", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => employees.id),
  healthInsurance: text("health_insurance").notNull(),
  retirementPlan: text("retirement_plan").notNull(),
  lifeInsurance: text("life_insurance").notNull(),
  otherBenefits: text("other_benefits"),
  totalValue: decimal("total_value", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("active"), // active, inactive
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBenefitSchema = createInsertSchema(benefits).omit({
  id: true,
  createdAt: true,
});

export type InsertBenefit = z.infer<typeof insertBenefitSchema>;
export type Benefit = typeof benefits.$inferSelect;

// Training
export const training = pgTable("training", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => employees.id),
  courseName: text("course_name").notNull(),
  category: text("category").notNull(),
  provider: text("provider").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  progress: integer("progress").notNull().default(0), // 0-100
  status: text("status").notNull().default("not_started"), // not_started, in_progress, completed
  certificateUrl: text("certificate_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTrainingSchema = createInsertSchema(training).omit({
  id: true,
  createdAt: true,
});

export type InsertTraining = z.infer<typeof insertTrainingSchema>;
export type Training = typeof training.$inferSelect;

// Exit Management
export const exitManagement = pgTable("exit_management", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => employees.id),
  resignationDate: date("resignation_date").notNull(),
  lastWorkingDay: date("last_working_day").notNull(),
  reason: text("reason").notNull(),
  clearanceStatus: integer("clearance_status").notNull().default(0), // 0-100
  finalSettlement: decimal("final_settlement", { precision: 10, scale: 2 }),
  status: text("status").notNull().default("pending"), // pending, in_progress, completed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertExitManagementSchema = createInsertSchema(exitManagement).omit({
  id: true,
  createdAt: true,
});

export type InsertExitManagement = z.infer<typeof insertExitManagementSchema>;
export type ExitManagement = typeof exitManagement.$inferSelect;
