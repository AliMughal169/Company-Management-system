import bcrypt from "bcrypt";
import { Request, Response, NextFunction } from "express";
import { db } from "./db";
import { users, User } from "../shared/schema";
import { eq } from "drizzle-orm";

const SALT_ROUNDS = 10;

// Extend Express session types
declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}
// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
/**
 * Hash a plain text password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a random password (8 characters with mixed case, numbers, and symbols)
 */
export function generateRandomPassword(): string {
  const length = 12;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

/**
 * Middleware to check if user is authenticated
 */
export async function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.session.userId) {
    // Populate req.user with full user data
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.session.userId),
    });

    if (user) {
      req.user = user;
      return next();
    }
  }
  return res.status(401).json({ message: "Unauthorized" });
}

/**
 * Middleware to check if user has admin role
 */
export async function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, req.session.userId),
  });

  if (!user || user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin access required" });
  }

  next();
}

/**
 * Middleware to check if user has specific permission
 */
export function hasPermission(permission: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, req.session.userId),
    });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Admins have all permissions
    if (user.role === "admin") {
      return next();
    }

    // Check if user has the specific permission
    const userPermissions = (user.permissions as string[]) || [];
    if (userPermissions.includes(permission)) {
      return next();
    }

    return res
      .status(403)
      .json({ message: `Forbidden: ${permission} permission required` });
  };
}

/**
 * Get current user from session
 */
export async function getCurrentUser(req: Request): Promise<User | null> {
  if (!req.session.userId) {
    return null;
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, req.session.userId),
  });

  return user || null;
}
