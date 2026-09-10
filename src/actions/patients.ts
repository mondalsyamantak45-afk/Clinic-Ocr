"use server";

import { db } from "@/db";
import { patients } from "@/db/schema";
import { eq, desc, or, ilike, like } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getPatients(searchQuery?: string) {
  let query = db.select().from(patients).$dynamic();
  
  if (searchQuery) {
    query = query.where(
      or(
        ilike(patients.name, `%${searchQuery}%`),
        like(patients.phone, `%${searchQuery}%`)
      )
    );
  }
  
  return await query.orderBy(desc(patients.createdAt));
}

export async function getPatient(id: string) {
  const result = await db.select().from(patients).where(eq(patients.id, id));
  return result[0];
}

export async function createPatient(data: { name: string; age: number; gender: string; phone: string }) {
  const result = await db.insert(patients).values(data).returning();
  revalidatePath("/patients");
  return result[0];
}

export async function updatePatient(id: string, data: { name: string; age: number; gender: string; phone: string }) {
  const result = await db.update(patients).set(data).where(eq(patients.id, id)).returning();
  revalidatePath("/patients");
  revalidatePath(`/patients/${id}`);
  return result[0];
}

export async function deletePatient(id: string) {
  await db.delete(patients).where(eq(patients.id, id));
  revalidatePath("/patients");
}

