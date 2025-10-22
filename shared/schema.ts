import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  serial,
  integer,
  decimal,
  timestamp,
  date,
  boolean,
  index,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table for username/password authentication
export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: varchar("username").notNull().unique(),
  email: varchar("email").notNull().unique(),
  passwordHash: varchar("password_hash").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  role: varchar("role").notNull().default("user"), // user, admin
  permissions: jsonb("permissions")
    .$type<string[]>()
    .default(sql`'[]'::jsonb`), // Array of allowed modules/actions
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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
  customerId: integer("customer_id")
    .notNull()
    .references(() => customers.id),
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
  customerId: integer("customer_id")
    .notNull()
    .references(() => customers.id),
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

export const insertProformaInvoiceSchema = createInsertSchema(
  proformaInvoices,
).omit({
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

// Invoice Items Table (tracks individual line items)
export const invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  stockId: integer("stock_id")
    .notNull()
    .references(() => stock.id),
  productName: text("product_name").notNull(),
  sku: text("sku").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInvoiceItemSchema = createInsertSchema(invoiceItems).omit({
  id: true,
  createdAt: true,
});

export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;
export type InvoiceItem = typeof invoiceItems.$inferSelect;

// Stock Movements Table (audit trail for inventory)
export const stockMovements = pgTable("stock_movements", {
  id: serial("id").primaryKey(),
  stockId: integer("stock_id")
    .notNull()
    .references(() => stock.id),
  movementType: text("movement_type").notNull(), // 'sale', 'restock', 'adjustment', 'reserved', 'released'
  quantity: integer("quantity").notNull(),
  referenceType: text("reference_type"), // 'invoice', 'proforma', 'manual'
  referenceId: integer("reference_id"),
  notes: text("notes"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertStockMovementSchema = createInsertSchema(
  stockMovements,
).omit({
  id: true,
  createdAt: true,
});

export type InsertStockMovement = z.infer<typeof insertStockMovementSchema>;
export type StockMovement = typeof stockMovements.$inferSelect;

// Salaries
export const salaries = pgTable("salaries", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id")
    .notNull()
    .references(() => employees.id),
  month: text("month").notNull(),
  year: integer("year").notNull(),
  basicSalary: decimal("basic_salary", { precision: 10, scale: 2 }).notNull(),
  allowances: decimal("allowances", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  deductions: decimal("deductions", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  netSalary: decimal("net_salary", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, paid, cancelled
  paymentDate: date("payment_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSalarySchema = createInsertSchema(salaries).omit({
  id: true,
  createdAt: true,
});

export type InsertSalary = z.infer<typeof insertSalarySchema>;
export type Salary = typeof salaries.$inferSelect;

// Leave Management
export const leave = pgTable("leave", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id")
    .notNull()
    .references(() => employees.id),
  leaveType: text("leave_type").notNull(), // sick, vacation, personal, unpaid
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLeaveSchema = createInsertSchema(leave).omit({
  id: true,
  createdAt: true,
});

export type InsertLeave = z.infer<typeof insertLeaveSchema>;
export type Leave = typeof leave.$inferSelect;

// Attendance
export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id")
    .notNull()
    .references(() => employees.id),
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
export const performance = pgTable("performance", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id")
    .notNull()
    .references(() => employees.id),
  reviewDate: date("review_date").notNull(),
  rating: integer("rating").notNull(), // 1-5
  goals: text("goals"),
  achievements: text("achievements"),
  feedback: text("feedback"),
  nextReviewDate: date("next_review_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPerformanceSchema = createInsertSchema(performance).omit({
  id: true,
  createdAt: true,
});

export type InsertPerformance = z.infer<typeof insertPerformanceSchema>;
export type Performance = typeof performance.$inferSelect;

// Employee Documents
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id")
    .notNull()
    .references(() => employees.id),
  documentType: text("document_type").notNull(), // contract, certificate, id_proof, other
  documentName: text("document_name").notNull(),
  uploadDate: date("upload_date").notNull(),
  expiryDate: date("expiry_date"),
  fileUrl: text("file_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
});

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

// Benefits
export const benefits = pgTable("benefits", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id")
    .notNull()
    .references(() => employees.id),
  benefitType: text("benefit_type").notNull(), // health_insurance, retirement, gym, transport, other
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
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
  employeeId: integer("employee_id")
    .notNull()
    .references(() => employees.id),
  trainingName: text("training_name").notNull(),
  provider: text("provider"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  status: text("status").notNull().default("scheduled"), // scheduled, ongoing, completed, cancelled
  cost: decimal("cost", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTrainingSchema = createInsertSchema(training).omit({
  id: true,
  createdAt: true,
});

export type InsertTraining = z.infer<typeof insertTrainingSchema>;
export type Training = typeof training.$inferSelect;

// Exit Management
export const exit = pgTable("exit", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id")
    .notNull()
    .references(() => employees.id),
  exitDate: date("exit_date").notNull(),
  reason: text("reason").notNull(),
  exitType: text("exit_type").notNull(), // resignation, termination, retirement, other
  feedback: text("feedback"),
  finalSettlement: decimal("final_settlement", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertExitSchema = createInsertSchema(exit).omit({
  id: true,
  createdAt: true,
});

export type InsertExit = z.infer<typeof insertExitSchema>;
export type Exit = typeof exit.$inferSelect;

// Tax Rates
export const taxRates = pgTable("tax_rates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTaxRateSchema = createInsertSchema(taxRates).omit({
  id: true,
  createdAt: true,
});

export type InsertTaxRate = z.infer<typeof insertTaxRateSchema>;
export type TaxRate = typeof taxRates.$inferSelect;

// Invoice Notes Templates
export const invoiceNotes = pgTable("invoice_notes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInvoiceNoteSchema = createInsertSchema(invoiceNotes).omit({
  id: true,
  createdAt: true,
});

export type InsertInvoiceNote = z.infer<typeof insertInvoiceNoteSchema>;
export type InvoiceNote = typeof invoiceNotes.$inferSelect;

// Settings (for currency and ID sequences)
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
});

export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Setting = typeof settings.$inferSelect;

// ID Sequences - tracks the next ID number for each module
export const idSequences = pgTable("id_sequences", {
  id: serial("id").primaryKey(),
  module: text("module").notNull().unique(), // invoice, proforma, employee, etc.
  prefix: text("prefix").notNull(),
  nextNumber: integer("next_number").notNull().default(1),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertIdSequenceSchema = createInsertSchema(idSequences).omit({
  id: true,
  updatedAt: true,
});

//Inovice Reminders
export const invoiceReminders = pgTable("invoice_reminders", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id")
    .notNull()
    .references(() => invoices.id),
  daysOverdue: integer("days_overdue").notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  emailSent: boolean("email_sent").notNull().default(false),
});
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // info, warning, error
  isRead: boolean("is_read").notNull().default(false),
  relatedInvoiceId: integer("related_invoice_id").references(() => invoices.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reminderSettings = pgTable("reminder_settings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  daysOverdue: integer("days_overdue").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  emailTemplate: text("email_template"),
});
export const insertInvoiceReminderSchema = createInsertSchema(
  invoiceReminders,
).omit({ id: true, sentAt: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});
export const insertReminderSettingSchema = createInsertSchema(
  reminderSettings,
).omit({ id: true });
export type InvoiceReminder = typeof invoiceReminders.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type ReminderSetting = typeof reminderSettings.$inferSelect;

// Knowledge Base Documents (RAG System)
export const knowledgeBaseDocuments = pgTable("knowledge_base_documents", {
  id: serial("id").primaryKey(),
  filename: varchar("filename", { length: 255 }).notNull(),
  contentType: varchar("content_type", { length: 100 }).notNull(),
  fileSize: integer("file_size").notNull(), // in bytes
  uploadedBy: varchar("uploaded_by")
    .notNull()
    .references(() => users.id),
  uploadDate: timestamp("upload_date").defaultNow().notNull(),
  status: varchar("status", { length: 50 }).notNull().default("processing"), // processing, completed, failed
  chunksCount: integer("chunks_count").default(0), // number of chunks created
  error: text("error"), // error message if processing failed
});

export type KnowledgeBaseDocument = typeof knowledgeBaseDocuments.$inferSelect;
export type InsertKnowledgeBaseDocument =
  typeof knowledgeBaseDocuments.$inferInsert;

export const insertKnowledgeBaseDocumentSchema = createInsertSchema(
  knowledgeBaseDocuments,
).omit({
  id: true,
  uploadDate: true,
});
export type InsertIdSequence = z.infer<typeof insertIdSequenceSchema>;
export type IdSequence = typeof idSequences.$inferSelect;
