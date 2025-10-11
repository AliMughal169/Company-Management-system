import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "./db";
import { 
  customers, insertCustomerSchema,
  invoices, insertInvoiceSchema,
  proformaInvoices, insertProformaInvoiceSchema,
  expenses, insertExpenseSchema,
  employees, insertEmployeeSchema,
  stock, insertStockSchema,
  salaries, insertSalarySchema,
  leaveRequests, insertLeaveRequestSchema,
  attendance, insertAttendanceSchema,
  performanceReviews, insertPerformanceReviewSchema,
  employeeDocuments, insertEmployeeDocumentSchema,
  benefits, insertBenefitSchema,
  training, insertTrainingSchema,
  exitManagement, insertExitManagementSchema
} from "@shared/schema";
import { eq } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // ========== CUSTOMERS ==========
  app.get("/api/customers", async (req, res) => {
    const allCustomers = await db.select().from(customers);
    res.json(allCustomers);
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      const [newCustomer] = await db.insert(customers).values(validatedData).returning();
      res.json(newCustomer);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCustomerSchema.partial().parse(req.body);
      const [updated] = await db.update(customers).set(validatedData).where(eq(customers.id, id)).returning();
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(customers).where(eq(customers.id, id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== SALES INVOICES ==========
  app.get("/api/invoices", async (req, res) => {
    const allInvoices = await db.select().from(invoices);
    res.json(allInvoices);
  });

  app.post("/api/invoices", async (req, res) => {
    try {
      const validatedData = insertInvoiceSchema.parse(req.body);
      const [newInvoice] = await db.insert(invoices).values(validatedData).returning();
      res.json(newInvoice);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertInvoiceSchema.partial().parse(req.body);
      const [updated] = await db.update(invoices).set(validatedData).where(eq(invoices.id, id)).returning();
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(invoices).where(eq(invoices.id, id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== PROFORMA INVOICES ==========
  app.get("/api/proforma-invoices", async (req, res) => {
    const allProformaInvoices = await db.select().from(proformaInvoices);
    res.json(allProformaInvoices);
  });

  app.post("/api/proforma-invoices", async (req, res) => {
    try {
      const validatedData = insertProformaInvoiceSchema.parse(req.body);
      const [newProforma] = await db.insert(proformaInvoices).values(validatedData).returning();
      res.json(newProforma);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/proforma-invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProformaInvoiceSchema.partial().parse(req.body);
      const [updated] = await db.update(proformaInvoices).set(validatedData).where(eq(proformaInvoices.id, id)).returning();
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/proforma-invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(proformaInvoices).where(eq(proformaInvoices.id, id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== EXPENSES ==========
  app.get("/api/expenses", async (req, res) => {
    const allExpenses = await db.select().from(expenses);
    res.json(allExpenses);
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      const validatedData = insertExpenseSchema.parse(req.body);
      const [newExpense] = await db.insert(expenses).values(validatedData).returning();
      res.json(newExpense);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertExpenseSchema.partial().parse(req.body);
      const [updated] = await db.update(expenses).set(validatedData).where(eq(expenses.id, id)).returning();
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(expenses).where(eq(expenses.id, id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== EMPLOYEES ==========
  app.get("/api/employees", async (req, res) => {
    const allEmployees = await db.select().from(employees);
    res.json(allEmployees);
  });

  app.post("/api/employees", async (req, res) => {
    try {
      const validatedData = insertEmployeeSchema.parse(req.body);
      const [newEmployee] = await db.insert(employees).values(validatedData).returning();
      res.json(newEmployee);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/employees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertEmployeeSchema.partial().parse(req.body);
      const [updated] = await db.update(employees).set(validatedData).where(eq(employees.id, id)).returning();
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/employees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(employees).where(eq(employees.id, id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== STOCK ==========
  app.get("/api/stock", async (req, res) => {
    const allStock = await db.select().from(stock);
    res.json(allStock);
  });

  app.post("/api/stock", async (req, res) => {
    try {
      const validatedData = insertStockSchema.parse(req.body);
      const [newStock] = await db.insert(stock).values(validatedData).returning();
      res.json(newStock);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/stock/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertStockSchema.partial().parse(req.body);
      const [updated] = await db.update(stock).set(validatedData).where(eq(stock.id, id)).returning();
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/stock/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(stock).where(eq(stock.id, id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== SALARIES ==========
  app.get("/api/salaries", async (req, res) => {
    const allSalaries = await db.select().from(salaries);
    res.json(allSalaries);
  });

  app.post("/api/salaries", async (req, res) => {
    try {
      const validatedData = insertSalarySchema.parse(req.body);
      const [newSalary] = await db.insert(salaries).values(validatedData).returning();
      res.json(newSalary);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/salaries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertSalarySchema.partial().parse(req.body);
      const [updated] = await db.update(salaries).set(validatedData).where(eq(salaries.id, id)).returning();
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/salaries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(salaries).where(eq(salaries.id, id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== LEAVE REQUESTS ==========
  app.get("/api/leave-requests", async (req, res) => {
    const allLeaveRequests = await db.select().from(leaveRequests);
    res.json(allLeaveRequests);
  });

  app.post("/api/leave-requests", async (req, res) => {
    try {
      const validatedData = insertLeaveRequestSchema.parse(req.body);
      const [newLeaveRequest] = await db.insert(leaveRequests).values(validatedData).returning();
      res.json(newLeaveRequest);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/leave-requests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertLeaveRequestSchema.partial().parse(req.body);
      const [updated] = await db.update(leaveRequests).set(validatedData).where(eq(leaveRequests.id, id)).returning();
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/leave-requests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(leaveRequests).where(eq(leaveRequests.id, id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== ATTENDANCE ==========
  app.get("/api/attendance", async (req, res) => {
    const allAttendance = await db.select().from(attendance);
    res.json(allAttendance);
  });

  app.post("/api/attendance", async (req, res) => {
    try {
      const validatedData = insertAttendanceSchema.parse(req.body);
      const [newAttendance] = await db.insert(attendance).values(validatedData).returning();
      res.json(newAttendance);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/attendance/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertAttendanceSchema.partial().parse(req.body);
      const [updated] = await db.update(attendance).set(validatedData).where(eq(attendance.id, id)).returning();
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/attendance/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(attendance).where(eq(attendance.id, id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== PERFORMANCE REVIEWS ==========
  app.get("/api/performance-reviews", async (req, res) => {
    const allReviews = await db.select().from(performanceReviews);
    res.json(allReviews);
  });

  app.post("/api/performance-reviews", async (req, res) => {
    try {
      const validatedData = insertPerformanceReviewSchema.parse(req.body);
      const [newReview] = await db.insert(performanceReviews).values(validatedData).returning();
      res.json(newReview);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/performance-reviews/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPerformanceReviewSchema.partial().parse(req.body);
      const [updated] = await db.update(performanceReviews).set(validatedData).where(eq(performanceReviews.id, id)).returning();
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/performance-reviews/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(performanceReviews).where(eq(performanceReviews.id, id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== EMPLOYEE DOCUMENTS ==========
  app.get("/api/employee-documents", async (req, res) => {
    const allDocuments = await db.select().from(employeeDocuments);
    res.json(allDocuments);
  });

  app.post("/api/employee-documents", async (req, res) => {
    try {
      const validatedData = insertEmployeeDocumentSchema.parse(req.body);
      const [newDocument] = await db.insert(employeeDocuments).values(validatedData).returning();
      res.json(newDocument);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/employee-documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertEmployeeDocumentSchema.partial().parse(req.body);
      const [updated] = await db.update(employeeDocuments).set(validatedData).where(eq(employeeDocuments.id, id)).returning();
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/employee-documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(employeeDocuments).where(eq(employeeDocuments.id, id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== BENEFITS ==========
  app.get("/api/benefits", async (req, res) => {
    const allBenefits = await db.select().from(benefits);
    res.json(allBenefits);
  });

  app.post("/api/benefits", async (req, res) => {
    try {
      const validatedData = insertBenefitSchema.parse(req.body);
      const [newBenefit] = await db.insert(benefits).values(validatedData).returning();
      res.json(newBenefit);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/benefits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertBenefitSchema.partial().parse(req.body);
      const [updated] = await db.update(benefits).set(validatedData).where(eq(benefits.id, id)).returning();
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/benefits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(benefits).where(eq(benefits.id, id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== TRAINING ==========
  app.get("/api/training", async (req, res) => {
    const allTraining = await db.select().from(training);
    res.json(allTraining);
  });

  app.post("/api/training", async (req, res) => {
    try {
      const validatedData = insertTrainingSchema.parse(req.body);
      const [newTraining] = await db.insert(training).values(validatedData).returning();
      res.json(newTraining);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/training/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertTrainingSchema.partial().parse(req.body);
      const [updated] = await db.update(training).set(validatedData).where(eq(training.id, id)).returning();
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/training/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(training).where(eq(training.id, id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== EXIT MANAGEMENT ==========
  app.get("/api/exit-management", async (req, res) => {
    const allExits = await db.select().from(exitManagement);
    res.json(allExits);
  });

  app.post("/api/exit-management", async (req, res) => {
    try {
      const validatedData = insertExitManagementSchema.parse(req.body);
      const [newExit] = await db.insert(exitManagement).values(validatedData).returning();
      res.json(newExit);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/exit-management/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertExitManagementSchema.partial().parse(req.body);
      const [updated] = await db.update(exitManagement).set(validatedData).where(eq(exitManagement.id, id)).returning();
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/exit-management/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(exitManagement).where(eq(exitManagement.id, id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
