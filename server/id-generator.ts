import { db } from "./db";
import { idSequences } from "@shared/schema";
import { eq } from "drizzle-orm";

export type ModuleType = 'invoice' | 'proforma' | 'employee' | 'expense' | 'customer' | 'stock';

export async function generateNextId(module: ModuleType): Promise<string> {
  const sequence = await db.query.idSequences.findFirst({
    where: eq(idSequences.module, module),
  });

  if (!sequence) {
    throw new Error(`ID sequence not found for module: ${module}`);
  }

  const paddedNumber = String(sequence.nextNumber).padStart(4, '0');
  const generatedId = `${sequence.prefix}${paddedNumber}`;

  await db
    .update(idSequences)
    .set({ 
      nextNumber: sequence.nextNumber + 1,
      updatedAt: new Date()
    })
    .where(eq(idSequences.id, sequence.id));

  return generatedId;
}

export async function getNextIdPreview(module: ModuleType): Promise<string> {
  const sequence = await db.query.idSequences.findFirst({
    where: eq(idSequences.module, module),
  });

  if (!sequence) {
    throw new Error(`ID sequence not found for module: ${module}`);
  }

  const paddedNumber = String(sequence.nextNumber).padStart(4, '0');
  return `${sequence.prefix}${paddedNumber}`;
}
