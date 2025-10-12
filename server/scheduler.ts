import cron from "node-cron";
import { checkOverdueInvoices } from "./services/reminderService";

export function startScheduler() {
  // Run every day at 9:00 AM
  cron.schedule("0 9 * * *", async () => {
    console.log("🔔 Running scheduled payment reminder check...");
    try {
      const results = await checkOverdueInvoices();
      console.log(`✅ Sent ${results.length} reminders`);
    } catch (error) {
      console.error("❌ Reminder check failed:", error);
    }
  });

  console.log("⏰ Payment reminder scheduler started (runs daily at 9 AM)");
}