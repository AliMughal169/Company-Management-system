import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "./db";
import {
  customers,
  insertCustomerSchema,
  invoices,
  insertInvoiceSchema,
  proformaInvoices,
  insertProformaInvoiceSchema,
  expenses,
  insertExpenseSchema,
  employees,
  insertEmployeeSchema,
  stock,
  insertStockSchema,
  salaries,
  insertSalarySchema,
  leave,
  insertLeaveSchema,
  attendance,
  insertAttendanceSchema,
  performance,
  insertPerformanceSchema,
  documents,
  insertDocumentSchema,
  benefits,
  insertBenefitSchema,
  training,
  insertTrainingSchema,
  exit,
  insertExitSchema,
  taxRates,
  insertTaxRateSchema,
  invoiceNotes,
  insertInvoiceNoteSchema,
  settings,
  insertSettingSchema,
  idSequences,
  insertIdSequenceSchema,
  notifications,
  reminderSettings,
  invoiceReminders,
  invoiceItems,
  stockMovements,
} from "@shared/schema";
import { checkOverdueInvoices } from "./services/reminderService";
import { eq, and, lt, sql, desc } from "drizzle-orm";
import {
  isAuthenticated,
  verifyPassword,
  hashPassword,
  getCurrentUser,
} from "./auth";

import { users, insertUserSchema } from "@shared/schema";
import { z } from "zod";

import multer from "multer";
import {
  knowledgeBaseDocuments,
  insertKnowledgeBaseDocumentSchema,
} from "@shared/schema";
import { processDocument } from "./services/documentProcessor";
import { deleteDocument } from "./services/pineconeService";

export async function registerRoutes(app: Express): Promise<Server> {
  // ========== AUTH ROUTES (PUBLIC) ==========

  // Login with username/password
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res
          .status(400)
          .json({ message: "Username and password are required" });
      }

      // Find user by username
      const user = await db.query.users.findFirst({
        where: eq(users.username, username),
      });

      if (!user) {
        return res
          .status(401)
          .json({ message: "Invalid username or password" });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(403).json({ message: "Account is disabled" });
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.passwordHash);

      if (!isValidPassword) {
        return res
          .status(401)
          .json({ message: "Invalid username or password" });
      }

      // Regenerate session to prevent fixation attacks
      req.session.regenerate((err) => {
        if (err) {
          console.error("Session regeneration error:", err);
          return res.status(500).json({ message: "Login failed" });
        }

        // Set session
        req.session.userId = user.id;

        // Return user data (without password hash)
        const { passwordHash, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Logout
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user (protected)
  app.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Return user without password hash
      const { passwordHash, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // ========== PROTECTED ROUTES (All routes below require authentication) ==========

  // ========== USERS MANAGEMENT (Admin only) ==========
  app.get("/api/users", isAuthenticated, async (req, res) => {
    try {
      const allUsers = await db.select().from(users);
      // Remove password hashes from response
      const usersWithoutPasswords = allUsers.map(
        ({ passwordHash, ...user }) => user,
      );
      res.json(usersWithoutPasswords);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/users", isAuthenticated, async (req, res) => {
    try {
      const { password, ...userData } = req.body;

      if (!password) {
        return res.status(400).json({ error: "Password is required" });
      }

      // Hash the password
      const passwordHash = await hashPassword(password);

      // Create user with hashed password
      const [newUser] = await db
        .insert(users)
        .values({
          ...userData,
          passwordHash,
        })
        .returning();

      // Return user without password hash
      const { passwordHash: _, ...userWithoutPassword } = newUser;
      res.json({ user: userWithoutPassword, password }); // Return password so admin can share it
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const id = req.params.id;
      const { password, ...userData } = req.body;

      let updateData: any = userData;

      // If password is being updated, hash it
      if (password) {
        updateData.passwordHash = await hashPassword(password);
      }

      const [updated] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, id))
        .returning();

      // Return user without password hash
      const { passwordHash: _, ...userWithoutPassword } = updated;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const id = req.params.id;
      await db.delete(users).where(eq(users.id, id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== NOTIFICATIONS ==========
  app.get("/api/notifications", isAuthenticated, async (req, res) => {
    const allNotifications = await db
      .select()
      .from(notifications)
      .orderBy(sql`${notifications.createdAt} DESC`);
    res.json(allNotifications);
  });

  app.patch(
    "/api/notifications/:id/read",
    isAuthenticated,
    async (req, res) => {
      const id = parseInt(req.params.id);
      const [updated] = await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, id))
        .returning();
      res.json(updated);
    },
  );

  // ========== REMINDER SETTINGS ==========
  app.get("/api/reminder-settings", isAuthenticated, async (req, res) => {
    const settings = await db.select().from(reminderSettings);
    res.json(settings);
  });

  app.post("/api/reminder-settings", isAuthenticated, async (req, res) => {
    const [newSetting] = await db
      .insert(reminderSettings)
      .values(req.body)
      .returning();
    res.json(newSetting);
  });

  // Manual trigger for testing
  app.post("/api/check-reminders", isAuthenticated, async (req, res) => {
    const results = await checkOverdueInvoices();
    res.json({ message: "Reminder check completed", results });
  });
  // ========== CUSTOMERS ==========
  app.get("/api/customers", isAuthenticated, async (req, res) => {
    const allCustomers = await db.select().from(customers);
    res.json(allCustomers);
  });

  app.post("/api/customers", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      const [newCustomer] = await db
        .insert(customers)
        .values(validatedData)
        .returning();
      res.json(newCustomer);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/customers/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCustomerSchema.partial().parse(req.body);
      const [updated] = await db
        .update(customers)
        .set(validatedData)
        .where(eq(customers.id, id))
        .returning();
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/customers/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(customers).where(eq(customers.id, id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== SALES INVOICES ==========
  app.get("/api/invoices", isAuthenticated, async (req, res) => {
    const allInvoices = await db.select().from(invoices);
    res.json(allInvoices);
  });

  app.post("/api/invoices", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertInvoiceSchema.parse(req.body);
      // Validate stock availability
      if (req.body.items) {
        const lineItems = JSON.parse(req.body.items);

        for (const item of lineItems) {
          if (item.stockId) {
            // Get current stock
            const [stockItem] = await db
              .select()
              .from(stock)
              .where(eq(stock.id, item.stockId));

            if (!stockItem) {
              return res.status(400).json({
                message: `Product "${item.description}" not found in stock`,
              });
            }

            // Check if enough quantity available
            if (stockItem.quantity < item.quantity) {
              return res.status(400).json({
                message: `Insufficient stock for "${item.description}".                         Available: ${stockItem.quantity}, Requested: ${item.quantity}`,
              });
            }
          }
        }
      }
      const [newInvoice] = await db
        .insert(invoices)
        .values(validatedData)
        .returning();
      // Parse and save line items
      if (req.body.items) {
        const lineItems = JSON.parse(req.body.items);

        for (const item of lineItems) {
          await db.insert(invoiceItems).values({
            invoiceId: newInvoice.id,
            stockId: item.stockId || 0, // We'll add this later from frontend
            productName: item.description,
            sku: item.sku || "N/A", // We'll add this later
            quantity: item.quantity,
            unitPrice: item.rate.toString(),
            total: (item.quantity * item.rate).toString(),
          });
          // Deduct stock and create movement record
          if (item.stockId) {
            // Decrease stock quantity
            await db
              .update(stock)
              .set({
                quantity: sql`${stock.quantity} - ${item.quantity}`,
              })
              .where(eq(stock.id, item.stockId));

            // Create stock movement record (audit trail)
            await db.insert(stockMovements).values({
              stockId: item.stockId,
              movementType: "sale",
              quantity: -item.quantity, // Negative for decrease
              referenceType: "invoice",
              referenceId: newInvoice.id,
              notes: `Sold via invoice ${newInvoice.invoiceNumber}`,
              createdBy: (req.user as any).id,
            });
          }
        }
      }
      res.json(newInvoice);
    } catch (error: any) {
      console.log("Error In API invoice: ", error.message);
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/invoices/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertInvoiceSchema.partial().parse(req.body);
      const [updated] = await db
        .update(invoices)
        .set(validatedData)
        .where(eq(invoices.id, id))
        .returning();
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/invoices/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(invoices).where(eq(invoices.id, id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== PROFORMA INVOICES ==========
  app.get("/api/proforma-invoices", isAuthenticated, async (req, res) => {
    const allProformaInvoices = await db.select().from(proformaInvoices);
    res.json(allProformaInvoices);
  });

  app.post("/api/proforma-invoices", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertProformaInvoiceSchema.parse(req.body);
      const [newProforma] = await db
        .insert(proformaInvoices)
        .values(validatedData)
        .returning();
      res.json(newProforma);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/proforma-invoices/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProformaInvoiceSchema
        .partial()
        .parse(req.body);
      const [updated] = await db
        .update(proformaInvoices)
        .set(validatedData)
        .where(eq(proformaInvoices.id, id))
        .returning();
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete(
    "/api/proforma-invoices/:id",
    isAuthenticated,
    async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        await db.delete(proformaInvoices).where(eq(proformaInvoices.id, id));
        res.json({ success: true });
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    },
  );

  // ========== EXPENSES ==========
  app.get("/api/expenses", isAuthenticated, async (req, res) => {
    const allExpenses = await db.select().from(expenses);
    res.json(allExpenses);
  });

  app.post("/api/expenses", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertExpenseSchema.parse(req.body);
      const [newExpense] = await db
        .insert(expenses)
        .values(validatedData)
        .returning();
      res.json(newExpense);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/expenses/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertExpenseSchema.partial().parse(req.body);
      const [updated] = await db
        .update(expenses)
        .set(validatedData)
        .where(eq(expenses.id, id))
        .returning();
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/expenses/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(expenses).where(eq(expenses.id, id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== EMPLOYEES ==========
  app.get("/api/employees", isAuthenticated, async (req, res) => {
    const allEmployees = await db.select().from(employees);
    res.json(allEmployees);
  });

  app.post("/api/employees", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertEmployeeSchema.parse(req.body);
      const [newEmployee] = await db
        .insert(employees)
        .values(validatedData)
        .returning();
      res.json(newEmployee);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/employees/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertEmployeeSchema.partial().parse(req.body);
      const [updated] = await db
        .update(employees)
        .set(validatedData)
        .where(eq(employees.id, id))
        .returning();
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/employees/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(employees).where(eq(employees.id, id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== STOCK ==========
  app.get("/api/stock", isAuthenticated, async (req, res) => {
    const allStock = await db.select().from(stock);
    res.json(allStock);
  });
  // Stock search for autocomplete
  app.get("/api/stock/search", isAuthenticated, async (req, res) => {
    try {
      const query = req.query.q as string;

      if (!query || query.length < 1) {
        return res.json([]);
      }

      const searchTerm = `%${query.toLowerCase()}%`;

      const results = await db
        .select()
        .from(stock)
        .where(
          sql`LOWER(${stock.productName}) LIKE ${searchTerm} OR LOWER(${stock.sku}) LIKE ${searchTerm}`,
        )
        .limit(10);

      res.json(results);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  app.post("/api/stock", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertStockSchema.parse(req.body);
      const [newStock] = await db
        .insert(stock)
        .values(validatedData)
        .returning();
      res.json(newStock);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/stock/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertStockSchema.partial().parse(req.body);
      const [updated] = await db
        .update(stock)
        .set(validatedData)
        .where(eq(stock.id, id))
        .returning();
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/stock/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(stock).where(eq(stock.id, id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== SALARIES ==========
  app.get("/api/salaries", isAuthenticated, async (req, res) => {
    const allSalaries = await db.select().from(salaries);
    res.json(allSalaries);
  });

  app.post("/api/salaries", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertSalarySchema.parse(req.body);
      const [newSalary] = await db
        .insert(salaries)
        .values(validatedData)
        .returning();
      res.json(newSalary);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/salaries/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertSalarySchema.partial().parse(req.body);
      const [updated] = await db
        .update(salaries)
        .set(validatedData)
        .where(eq(salaries.id, id))
        .returning();
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/salaries/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(salaries).where(eq(salaries.id, id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== LEAVE ==========
  app.get("/api/leave", isAuthenticated, async (req, res) => {
    const allLeave = await db.select().from(leave);
    res.json(allLeave);
  });

  app.post("/api/leave", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertLeaveSchema.parse(req.body);
      const [newLeave] = await db
        .insert(leave)
        .values(validatedData)
        .returning();
      res.json(newLeave);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/leave/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertLeaveSchema.partial().parse(req.body);
      const [updated] = await db
        .update(leave)
        .set(validatedData)
        .where(eq(leave.id, id))
        .returning();
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/leave/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(leave).where(eq(leave.id, id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== ATTENDANCE ==========
  app.get("/api/attendance", isAuthenticated, async (req, res) => {
    const allAttendance = await db.select().from(attendance);
    res.json(allAttendance);
  });

  app.post("/api/attendance", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertAttendanceSchema.parse(req.body);
      const [newAttendance] = await db
        .insert(attendance)
        .values(validatedData)
        .returning();
      res.json(newAttendance);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/attendance/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertAttendanceSchema.partial().parse(req.body);
      const [updated] = await db
        .update(attendance)
        .set(validatedData)
        .where(eq(attendance.id, id))
        .returning();
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/attendance/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(attendance).where(eq(attendance.id, id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== PERFORMANCE ==========
  app.get("/api/performance", isAuthenticated, async (req, res) => {
    const allPerformance = await db.select().from(performance);
    res.json(allPerformance);
  });

  app.post("/api/performance", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPerformanceSchema.parse(req.body);
      const [newPerformance] = await db
        .insert(performance)
        .values(validatedData)
        .returning();
      res.json(newPerformance);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/performance/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPerformanceSchema.partial().parse(req.body);
      const [updated] = await db
        .update(performance)
        .set(validatedData)
        .where(eq(performance.id, id))
        .returning();
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/performance/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(performance).where(eq(performance.id, id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== DOCUMENTS ==========
  app.get("/api/documents", isAuthenticated, async (req, res) => {
    const allDocuments = await db.select().from(documents);
    res.json(allDocuments);
  });

  app.post("/api/documents", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertDocumentSchema.parse(req.body);
      const [newDocument] = await db
        .insert(documents)
        .values(validatedData)
        .returning();
      res.json(newDocument);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/documents/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertDocumentSchema.partial().parse(req.body);
      const [updated] = await db
        .update(documents)
        .set(validatedData)
        .where(eq(documents.id, id))
        .returning();
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/documents/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(documents).where(eq(documents.id, id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== BENEFITS ==========
  app.get("/api/benefits", isAuthenticated, async (req, res) => {
    const allBenefits = await db.select().from(benefits);
    res.json(allBenefits);
  });

  app.post("/api/benefits", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertBenefitSchema.parse(req.body);
      const [newBenefit] = await db
        .insert(benefits)
        .values(validatedData)
        .returning();
      res.json(newBenefit);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/benefits/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertBenefitSchema.partial().parse(req.body);
      const [updated] = await db
        .update(benefits)
        .set(validatedData)
        .where(eq(benefits.id, id))
        .returning();
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/benefits/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(benefits).where(eq(benefits.id, id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== TRAINING ==========
  app.get("/api/training", isAuthenticated, async (req, res) => {
    const allTraining = await db.select().from(training);
    res.json(allTraining);
  });

  app.post("/api/training", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertTrainingSchema.parse(req.body);
      const [newTraining] = await db
        .insert(training)
        .values(validatedData)
        .returning();
      res.json(newTraining);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/training/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertTrainingSchema.partial().parse(req.body);
      const [updated] = await db
        .update(training)
        .set(validatedData)
        .where(eq(training.id, id))
        .returning();
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/training/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(training).where(eq(training.id, id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== EXIT ==========
  app.get("/api/exit", isAuthenticated, async (req, res) => {
    const allExits = await db.select().from(exit);
    res.json(allExits);
  });

  app.post("/api/exit", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertExitSchema.parse(req.body);
      const [newExit] = await db.insert(exit).values(validatedData).returning();
      res.json(newExit);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/exit/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertExitSchema.partial().parse(req.body);
      const [updated] = await db
        .update(exit)
        .set(validatedData)
        .where(eq(exit.id, id))
        .returning();
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/exit/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(exit).where(eq(exit.id, id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== TAX RATES ==========
  app.get("/api/tax-rates", isAuthenticated, async (req, res) => {
    const allTaxRates = await db.select().from(taxRates);
    res.json(allTaxRates);
  });

  app.post("/api/tax-rates", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertTaxRateSchema.parse(req.body);
      const [newTaxRate] = await db
        .insert(taxRates)
        .values(validatedData)
        .returning();
      res.json(newTaxRate);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/tax-rates/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertTaxRateSchema.partial().parse(req.body);
      const [updated] = await db
        .update(taxRates)
        .set(validatedData)
        .where(eq(taxRates.id, id))
        .returning();
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/tax-rates/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(taxRates).where(eq(taxRates.id, id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== INVOICE NOTES ==========
  app.get("/api/invoice-notes", isAuthenticated, async (req, res) => {
    const allNotes = await db.select().from(invoiceNotes);
    res.json(allNotes);
  });

  app.post("/api/invoice-notes", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertInvoiceNoteSchema.parse(req.body);
      const [newNote] = await db
        .insert(invoiceNotes)
        .values(validatedData)
        .returning();
      res.json(newNote);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/invoice-notes/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertInvoiceNoteSchema.partial().parse(req.body);
      const [updated] = await db
        .update(invoiceNotes)
        .set(validatedData)
        .where(eq(invoiceNotes.id, id))
        .returning();
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/invoice-notes/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(invoiceNotes).where(eq(invoiceNotes.id, id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== SETTINGS ==========
  app.get("/api/settings", isAuthenticated, async (req, res) => {
    const allSettings = await db.select().from(settings);
    res.json(allSettings);
  });

  app.get("/api/settings/:key", isAuthenticated, async (req, res) => {
    const [setting] = await db
      .select()
      .from(settings)
      .where(eq(settings.key, req.params.key));
    res.json(setting || null);
  });

  app.post("/api/settings", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertSettingSchema.parse(req.body);
      const [newSetting] = await db
        .insert(settings)
        .values(validatedData)
        .returning();
      res.json(newSetting);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/settings/:key", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertSettingSchema.partial().parse(req.body);
      const [updated] = await db
        .update(settings)
        .set(validatedData)
        .where(eq(settings.key, req.params.key))
        .returning();
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== ID SEQUENCES ==========
  app.get("/api/id-sequences", isAuthenticated, async (req, res) => {
    const allSequences = await db.select().from(idSequences);
    res.json(allSequences);
  });

  app.get("/api/id-sequences/:module", isAuthenticated, async (req, res) => {
    const [sequence] = await db
      .select()
      .from(idSequences)
      .where(eq(idSequences.module, req.params.module));
    res.json(sequence || null);
  });

  app.post("/api/id-sequences", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertIdSequenceSchema.parse(req.body);
      const [newSequence] = await db
        .insert(idSequences)
        .values(validatedData)
        .returning();
      res.json(newSequence);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/id-sequences/:module", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertIdSequenceSchema.partial().parse(req.body);
      const [updated] = await db
        .update(idSequences)
        .set(validatedData)
        .where(eq(idSequences.module, req.params.module))
        .returning();
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Generate next ID for a module
  app.post(
    "/api/id-sequences/:module/next",
    isAuthenticated,
    async (req, res) => {
      try {
        const module = req.params.module;
        const [sequence] = await db
          .select()
          .from(idSequences)
          .where(eq(idSequences.module, module));

        if (!sequence) {
          return res.status(404).json({ error: "Sequence not found" });
        }

        const nextId = `${sequence.prefix}${String(sequence.nextNumber).padStart(4, "0")}`;

        // Increment the sequence
        await db
          .update(idSequences)
          .set({ nextNumber: sequence.nextNumber + 1 })
          .where(eq(idSequences.module, module));

        res.json({ id: nextId });
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    },
  );

  // Get next ID preview without incrementing
  app.get(
    "/api/id-sequences/:module/preview",
    isAuthenticated,
    async (req, res) => {
      try {
        const module = req.params.module;
        const [sequence] = await db
          .select()
          .from(idSequences)
          .where(eq(idSequences.module, module));

        if (!sequence) {
          return res.status(404).json({ error: "Sequence not found" });
        }

        const nextId = `${sequence.prefix}${String(sequence.nextNumber).padStart(4, "0")}`;
        res.json({ id: nextId });
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    },
  );

  // Initialize default ID sequences if they don't exist
  app.post(
    "/api/id-sequences/initialize",
    isAuthenticated,
    async (req, res) => {
      try {
        const defaultSequences = [
          { module: "invoice", prefix: "INV-", nextNumber: 1 },
          { module: "proforma", prefix: "PF-", nextNumber: 1 },
          { module: "employee", prefix: "EMP-", nextNumber: 1 },
          { module: "expense", prefix: "EXP-", nextNumber: 1 },
          { module: "customer", prefix: "CUST-", nextNumber: 1 },
          { module: "stock", prefix: "STK-", nextNumber: 1 },
        ];

        for (const seq of defaultSequences) {
          const existing = await db
            .select()
            .from(idSequences)
            .where(eq(idSequences.module, seq.module));
          if (existing.length === 0) {
            await db.insert(idSequences).values(seq);
          }
        }

        res.json({ success: true, message: "Default sequences initialized" });
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    },
  );
  // ========== AI CHAT ==========
  app.post("/api/chat/message", isAuthenticated, async (req, res) => {
    try {
      const { message } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }

      const { businessAgent } = await import("./ai/agent");

      // Generate response from AI agent
      const response = await businessAgent.generate(message);

      res.json({
        success: true,
        response: response.text,
      });
    } catch (error: any) {
      console.error("AI Chat Error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to process message",
      });
    }
  });

  // Configure multer for file uploads (store in memory)
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max file size
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];
      console.log("file recieved in multer");
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          new Error(
            "Invalid file type. Only PDF, DOCX, and TXT files are allowed.",
          ),
        );
      }
    },
  });

  // Upload knowledge base document
  app.post(
    "/api/knowledge-base/upload",
    isAuthenticated,
    upload.single("file"),
    async (req, res) => {
      try {
        console.log("=== UPLOAD START ===");
        console.log("File:", req.file?.originalname);
        console.log("User ID:", req.session.userId);
        if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
        }
        console.log("About to insert into database...");
        // Create document record in database
        const [document] = await db
          .insert(knowledgeBaseDocuments)
          .values({
            filename: req.file.originalname,
            contentType: req.file.mimetype,
            fileSize: req.file.size,
            uploadedBy: req.session.userId!,
            status: "processing",
          })
          .returning();
        console.log("Database insert successful! Document ID:", document.id);
        // Process document asynchronously (don't wait for completion)
        processDocument(document.id, req.file.buffer, req.file.mimetype).catch(
          (error) => {
            console.error("Background processing error:", error);
          },
        );
        console.log("Sending response...");
        res.json({
          success: true,
          message: "Document uploaded and processing started",
          document,
        });
      } catch (error: any) {
        console.error("Upload error:", error);
        res.status(500).json({ error: error.message });
      }
    },
  );

  // Get all knowledge base documents
  app.get(
    "/api/knowledge-base/documents",
    isAuthenticated,
    async (req, res) => {
      try {
        const documents = await db
          .select()
          .from(knowledgeBaseDocuments)
          .orderBy(desc(knowledgeBaseDocuments.uploadDate));

        res.json(documents);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    },
  );

  // Delete knowledge base document
  app.delete(
    "/api/knowledge-base/documents/:id",
    isAuthenticated,
    async (req, res) => {
      try {
        const documentId = parseInt(req.params.id);

        // Delete from Pinecone first
        await deleteDocument(documentId);

        // Delete from database
        await db
          .delete(knowledgeBaseDocuments)
          .where(eq(knowledgeBaseDocuments.id, documentId));

        res.json({ success: true });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    },
  );
  const httpServer = createServer(app);
  return httpServer;
}
