import { db } from "../db";
import { invoices, customers, expenses, employees, stock } from "@shared/schema";
import { eq, and, sql, gte, lte, like, desc } from "drizzle-orm";
import { createTool } from "@mastra/core";
import { z } from "zod";

// for RAG system using pinecone
import { searchDocuments } from "../services/pineconeService";

// Tool 1: Query Invoices
export const queryInvoicesTool = createTool({
  id: "query-invoices",
  description: "Search and retrieve invoice data. Can filter by status, date range, customer, or find overdue invoices.",
  inputSchema: z.object({
    status: z.enum(["pending", "paid", "overdue", "all"]).optional(),
    customerId: z.number().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    overdue: z.boolean().optional(),
  }),
  execute: async ({ context }) => {
    try {
      let query = db
        .select({
          invoice: invoices,
          customer: customers,
        })
        .from(invoices)
        .leftJoin(customers, eq(invoices.customerId, customers.id));

      const conditions = [];

      if (context.status && context.status !== "all") {
        conditions.push(eq(invoices.status, context.status));
      }

      if (context.customerId) {
        conditions.push(eq(invoices.customerId, context.customerId));
      }

      if (context.startDate) {
        conditions.push(gte(invoices.issueDate, context.startDate));
      }

      if (context.endDate) {
        conditions.push(lte(invoices.issueDate, context.endDate));
      }

      if (context.overdue) {
        const today = new Date().toISOString().split('T')[0];
        conditions.push(
          and(
            eq(invoices.status, "pending"),
            sql`${invoices.dueDate} < ${today}`
          )
        );
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }

      const results = await query.limit(50);

      return {
        success: true,
        count: results.length,
        invoices: results.map(r => ({
          id: r.invoice.id,
          invoiceNumber: r.invoice.invoiceNumber,
          customerName: r.customer?.name,
          issueDate: r.invoice.issueDate,
          dueDate: r.invoice.dueDate,
          total: r.invoice.total,
          status: r.invoice.status,
        })),
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

// Tool 2: Query Customers
export const queryCustomersTool = createTool({
  id: "query-customers",
  description: "Search and retrieve customer information. Can search by name, email, or get all customers.",
  inputSchema: z.object({
    searchTerm: z.string().optional(),
    limit: z.number().optional().default(50),
  }),
  execute: async ({ context }) => {
    try {
      let query = db.select().from(customers);

      if (context.searchTerm) {
        query = query.where(
          sql`${customers.name} ILIKE ${`%${context.searchTerm}%`} OR ${customers.email} ILIKE ${`%${context.searchTerm}%`}`
        ) as any;
      }

      const results = await query.limit(context.limit || 50);

      return {
        success: true,
        count: results.length,
        customers: results,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

// Tool 3: Query Expenses
export const queryExpensesTool = createTool({
  id: "query-expenses",
  description: "Retrieve and analyze expense data. Can filter by category, date range, or amount range.",
  inputSchema: z.object({
    category: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    minAmount: z.number().optional(),
    maxAmount: z.number().optional(),
  }),
  execute: async ({ context }) => {
    try {
      let query = db.select().from(expenses);
      const conditions = [];

      if (context.category) {
        conditions.push(eq(expenses.category, context.category));
      }

      if (context.startDate) {
        conditions.push(gte(expenses.date, context.startDate));
      }

      if (context.endDate) {
        conditions.push(lte(expenses.date, context.endDate));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }

      const results = await query.orderBy(desc(expenses.date)).limit(50);

      // Calculate totals
      const total = results.reduce((sum, exp) => sum + parseFloat(exp.amount.toString()), 0);

      return {
        success: true,
        count: results.length,
        total: total.toFixed(2),
        expenses: results,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

// Tool 4: Query Employees
export const queryEmployeesTool = createTool({
  id: "query-employees",
  description: "Search employee records. Can filter by department, designation, or status.",
  inputSchema: z.object({
    department: z.string().optional(),
    designation: z.string().optional(),
    status: z.enum(["active", "inactive", "on_leave", "all"]).optional(),
  }),
  execute: async ({ context }) => {
    try {
      let query = db.select().from(employees);
      const conditions = [];

      if (context.department) {
        conditions.push(eq(employees.department, context.department));
      }

      if (context.designation) {
        conditions.push(eq(employees.designation, context.designation));
      }

      if (context.status && context.status !== "all") {
        conditions.push(eq(employees.status, context.status));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }

      const results = await query.limit(100);

      return {
        success: true,
        count: results.length,
        employees: results,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

// Query Knowledge Base (RAG)
export const queryKnowledgeBaseTool = createTool({
  id: "query-knowledge-base",
  description: `Search through uploaded company documents, policies, procedures, and knowledge base.
Use this when users ask about:
- Company policies (leave, benefits, procedures)
- HR guidelines and employee handbook information
- Standard operating procedures (SOPs)
- Any information that might be in uploaded documents
- "What is the policy for X?"
- "How do I do Y according to company guidelines?"`,

  inputSchema: z.object({
    query: z.string().describe("The search query or question to find in knowledge base documents"),
  }),

  execute: async ({ context }) => {
    try {
      const results = await searchDocuments(context.query, 5);

      if (results.length === 0) {
        return {
          success: true,
          message: "No relevant information found in the knowledge base.",
          results: [],
        };
      }

      // Format results with relevance scores
      const formattedResults = results.map((result, index) => ({
        rank: index + 1,
        relevance: (result.score * 100).toFixed(1) + "%",
        content: result.text,
        documentId: result.documentId,
      }));

      return {
        success: true,
        message: `Found ${results.length} relevant document sections`,
        results: formattedResults,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
});
// Tool 5: Query Stock
export const queryStockTool = createTool({
  id: "query-stock",
  description: "Retrieve stock/inventory information. Can check low stock items or search by product.",
  inputSchema: z.object({
    lowStock: z.boolean().optional(),
    category: z.string().optional(),
    searchTerm: z.string().optional(),
  }),
  execute: async ({ context }) => {
    try {
      let query = db.select().from(stock);
      const conditions = [];

      if (context.lowStock) {
        conditions.push(sql`${stock.quantity} <= ${stock.reorderLevel}`);
      }

      if (context.category) {
        conditions.push(eq(stock.category, context.category));
      }

      if (context.searchTerm) {
        conditions.push(
          sql`${stock.productName} ILIKE ${`%${context.searchTerm}%`} OR ${stock.sku} ILIKE ${`%${context.searchTerm}%`}`
        );
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }

      const results = await query.limit(50);

      return {
        success: true,
        count: results.length,
        items: results,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});