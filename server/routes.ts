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
  leave, insertLeaveSchema,
  attendance, insertAttendanceSchema,
  performance, insertPerformanceSchema,
  documents, insertDocumentSchema,
  benefits, insertBenefitSchema,
  training, insertTrainingSchema,
  exit, insertExitSchema,
  taxRates, insertTaxRateSchema,
  invoiceNotes, insertInvoiceNoteSchema,
  settings, insertSettingSchema,
  idSequences, insertIdSequenceSchema
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

  // ========== LEAVE ==========
  app.get("/api/leave", async (req, res) => {
    const allLeave = await db.select().from(leave);
    res.json(allLeave);
  });

  app.post("/api/leave", async (req, res) => {
    try {
      const validatedData = insertLeaveSchema.parse(req.body);
      const [newLeave] = await db.insert(leave).values(validatedData).returning();
      res.json(newLeave);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/leave/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertLeaveSchema.partial().parse(req.body);
      const [updated] = await db.update(leave).set(validatedData).where(eq(leave.id, id)).returning();
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/leave/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(leave).where(eq(leave.id, id));
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

  // ========== PERFORMANCE ==========
  app.get("/api/performance", async (req, res) => {
    const allPerformance = await db.select().from(performance);
    res.json(allPerformance);
  });

  app.post("/api/performance", async (req, res) => {
    try {
      const validatedData = insertPerformanceSchema.parse(req.body);
      const [newPerformance] = await db.insert(performance).values(validatedData).returning();
      res.json(newPerformance);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/performance/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPerformanceSchema.partial().parse(req.body);
      const [updated] = await db.update(performance).set(validatedData).where(eq(performance.id, id)).returning();
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/performance/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(performance).where(eq(performance.id, id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== DOCUMENTS ==========
  app.get("/api/documents", async (req, res) => {
    const allDocuments = await db.select().from(documents);
    res.json(allDocuments);
  });

  app.post("/api/documents", async (req, res) => {
    try {
      const validatedData = insertDocumentSchema.parse(req.body);
      const [newDocument] = await db.insert(documents).values(validatedData).returning();
      res.json(newDocument);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertDocumentSchema.partial().parse(req.body);
      const [updated] = await db.update(documents).set(validatedData).where(eq(documents.id, id)).returning();
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(documents).where(eq(documents.id, id));
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

  // ========== EXIT ==========
  app.get("/api/exit", async (req, res) => {
    const allExits = await db.select().from(exit);
    res.json(allExits);
  });

  app.post("/api/exit", async (req, res) => {
    try {
      const validatedData = insertExitSchema.parse(req.body);
      const [newExit] = await db.insert(exit).values(validatedData).returning();
      res.json(newExit);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/exit/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertExitSchema.partial().parse(req.body);
      const [updated] = await db.update(exit).set(validatedData).where(eq(exit.id, id)).returning();
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/exit/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(exit).where(eq(exit.id, id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== TAX RATES ==========
  app.get("/api/tax-rates", async (req, res) => {
    const allTaxRates = await db.select().from(taxRates);
    res.json(allTaxRates);
  });

  app.post("/api/tax-rates", async (req, res) => {
    try {
      const validatedData = insertTaxRateSchema.parse(req.body);
      const [newTaxRate] = await db.insert(taxRates).values(validatedData).returning();
      res.json(newTaxRate);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/tax-rates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertTaxRateSchema.partial().parse(req.body);
      const [updated] = await db.update(taxRates).set(validatedData).where(eq(taxRates.id, id)).returning();
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/tax-rates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(taxRates).where(eq(taxRates.id, id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== INVOICE NOTES ==========
  app.get("/api/invoice-notes", async (req, res) => {
    const allNotes = await db.select().from(invoiceNotes);
    res.json(allNotes);
  });

  app.post("/api/invoice-notes", async (req, res) => {
    try {
      const validatedData = insertInvoiceNoteSchema.parse(req.body);
      const [newNote] = await db.insert(invoiceNotes).values(validatedData).returning();
      res.json(newNote);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/invoice-notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertInvoiceNoteSchema.partial().parse(req.body);
      const [updated] = await db.update(invoiceNotes).set(validatedData).where(eq(invoiceNotes.id, id)).returning();
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/invoice-notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(invoiceNotes).where(eq(invoiceNotes.id, id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== SETTINGS ==========
  app.get("/api/settings", async (req, res) => {
    const allSettings = await db.select().from(settings);
    res.json(allSettings);
  });

  app.get("/api/settings/:key", async (req, res) => {
    const [setting] = await db.select().from(settings).where(eq(settings.key, req.params.key));
    res.json(setting || null);
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const validatedData = insertSettingSchema.parse(req.body);
      const [newSetting] = await db.insert(settings).values(validatedData).returning();
      res.json(newSetting);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/settings/:key", async (req, res) => {
    try {
      const validatedData = insertSettingSchema.partial().parse(req.body);
      const [updated] = await db.update(settings).set(validatedData).where(eq(settings.key, req.params.key)).returning();
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== ID SEQUENCES ==========
  app.get("/api/id-sequences", async (req, res) => {
    const allSequences = await db.select().from(idSequences);
    res.json(allSequences);
  });

  app.get("/api/id-sequences/:module", async (req, res) => {
    const [sequence] = await db.select().from(idSequences).where(eq(idSequences.module, req.params.module));
    res.json(sequence || null);
  });

  app.post("/api/id-sequences", async (req, res) => {
    try {
      const validatedData = insertIdSequenceSchema.parse(req.body);
      const [newSequence] = await db.insert(idSequences).values(validatedData).returning();
      res.json(newSequence);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/id-sequences/:module", async (req, res) => {
    try {
      const validatedData = insertIdSequenceSchema.partial().parse(req.body);
      const [updated] = await db.update(idSequences).set(validatedData).where(eq(idSequences.module, req.params.module)).returning();
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Generate next ID for a module
  app.post("/api/id-sequences/:module/next", async (req, res) => {
    try {
      const module = req.params.module;
      const [sequence] = await db.select().from(idSequences).where(eq(idSequences.module, module));
      
      if (!sequence) {
        return res.status(404).json({ error: "Sequence not found" });
      }

      const nextId = `${sequence.prefix}${String(sequence.nextNumber).padStart(4, '0')}`;
      
      // Increment the sequence
      await db.update(idSequences)
        .set({ nextNumber: sequence.nextNumber + 1 })
        .where(eq(idSequences.module, module));

      res.json({ id: nextId });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get next ID preview without incrementing
  app.get("/api/id-sequences/:module/preview", async (req, res) => {
    try {
      const module = req.params.module;
      const [sequence] = await db.select().from(idSequences).where(eq(idSequences.module, module));
      
      if (!sequence) {
        return res.status(404).json({ error: "Sequence not found" });
      }

      const nextId = `${sequence.prefix}${String(sequence.nextNumber).padStart(4, '0')}`;
      res.json({ id: nextId });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Initialize default ID sequences if they don't exist
  app.post("/api/id-sequences/initialize", async (req, res) => {
    try {
      const defaultSequences = [
        { module: 'invoice', prefix: 'INV-', nextNumber: 1 },
        { module: 'proforma', prefix: 'PF-', nextNumber: 1 },
        { module: 'employee', prefix: 'EMP-', nextNumber: 1 },
        { module: 'expense', prefix: 'EXP-', nextNumber: 1 },
        { module: 'customer', prefix: 'CUST-', nextNumber: 1 },
        { module: 'stock', prefix: 'STK-', nextNumber: 1 },
      ];

      for (const seq of defaultSequences) {
        const existing = await db.select().from(idSequences).where(eq(idSequences.module, seq.module));
        if (existing.length === 0) {
          await db.insert(idSequences).values(seq);
        }
      }

      res.json({ success: true, message: "Default sequences initialized" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
