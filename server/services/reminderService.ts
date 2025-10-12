import { db } from "../db";
import { invoices, invoiceReminders, notifications, reminderSettings, customers } from "@shared/schema";
import { eq, and, lt, sql } from "drizzle-orm";

export async function checkOverdueInvoices() {
  const today = new Date();

  // Get all pending invoices that are overdue
  const overdueInvoices = await db
    .select({
      invoice: invoices,
      customer: customers,
    })
    .from(invoices)
    .innerJoin(customers, eq(invoices.customerId, customers.id))
    .where(
      and(
        eq(invoices.status, "pending"),
        lt(invoices.dueDate, today.toISOString().split('T')[0])
      )
    );

  // Get active reminder settings
  const settings = await db
    .select()
    .from(reminderSettings)
    .where(eq(reminderSettings.enabled, true));

  const results = [];

  for (const { invoice, customer } of overdueInvoices) {
    const dueDate = new Date(invoice.dueDate);
    const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

    // Check each setting to see if we should send reminder
    for (const setting of settings) {
      if (daysOverdue >= setting.daysOverdue) {
        // Check if we already sent this reminder
        const existing = await db
          .select()
          .from(invoiceReminders)
          .where(
            and(
              eq(invoiceReminders.invoiceId, invoice.id),
              eq(invoiceReminders.daysOverdue, setting.daysOverdue)
            )
          );

        if (existing.length === 0) {
          // Send reminder!
          await sendReminder(invoice, customer, daysOverdue, setting);
          results.push({ invoice: invoice.invoiceNumber, daysOverdue, sent: true });
        }
      }
    }
  }

  return results;
}

async function sendReminder(invoice: any, customer: any, daysOverdue: number, setting: any) {
  // 1. Record that we sent this reminder
  await db.insert(invoiceReminders).values({
    invoiceId: invoice.id,
    daysOverdue: setting.daysOverdue,
    emailSent: false, // Will be true when email integration added
  });

  // 2. Create notification for admin/employees
  await db.insert(notifications).values({
    userId: null, // null = visible to all admins
    title: `Payment Overdue: ${invoice.invoiceNumber}`,
    message: `Invoice ${invoice.invoiceNumber} for ${customer.name} is ${daysOverdue} days overdue (Amount: $${invoice.total})`,
    type: "warning",
    relatedInvoiceId: invoice.id,
  });

  // 3. Log email placeholder (will actually send when Resend is added)
  console.log(`📧 [EMAIL PLACEHOLDER] To: ${customer.email}`);
  console.log(`Subject: Payment Reminder - Invoice ${invoice.invoiceNumber}`);
  console.log(`Body: Your invoice is ${daysOverdue} days overdue. Amount: $${invoice.total}`);
  console.log(`---`);
}