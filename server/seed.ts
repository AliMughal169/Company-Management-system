import { db } from "./db";
import { users } from "../shared/schema";
import { hashPassword } from "./auth";
import { eq } from "drizzle-orm";

/**
 * Seed the database with a default admin user
 * Username: admin
 * Password: admin123 (should be changed on first login)
 */
async function seedAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await db.query.users.findFirst({
      where: eq(users.username, "admin"),
    });

    if (existingAdmin) {
      console.log("✓ Admin user already exists");
      return;
    }

    // Create admin user
    const passwordHash = await hashPassword("admin123");
    
    await db.insert(users).values({
      username: "admin",
      email: "admin@company.com",
      passwordHash,
      firstName: "Admin",
      lastName: "User",
      role: "admin",
      permissions: [], // Admins have all permissions by default
      isActive: true,
    });

    console.log("✓ Admin user created successfully");
    console.log("  Username: admin");
    console.log("  Password: admin123");
    console.log("  Email: admin@company.com");
    console.log("\n⚠️  Please change the password on first login!");
  } catch (error) {
    console.error("✗ Failed to seed admin user:", error);
    throw error;
  }
}

// Run seed
seedAdminUser()
  .then(() => {
    console.log("\n✓ Database seeding completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n✗ Database seeding failed:", error);
    process.exit(1);
  });

export { seedAdminUser };
