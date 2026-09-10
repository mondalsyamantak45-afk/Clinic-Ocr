"use server";

import { db } from "@/db";
import { prescriptions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getPatientPrescriptions(patientId: string) {
  return await db
    .select()
    .from(prescriptions)
    .where(eq(prescriptions.patientId, patientId))
    .orderBy(desc(prescriptions.createdAt));
}

export async function getPrescription(id: string) {
  const result = await db.select().from(prescriptions).where(eq(prescriptions.id, id));
  return result[0];
}

export async function savePrescription(data: any) {
  const result = await db.insert(prescriptions).values(data).returning();
  revalidatePath(`/patients/${data.patientId}`);
  return result[0];
}

export async function updatePrescription(id: string, data: any) {
  const result = await db.update(prescriptions).set(data).where(eq(prescriptions.id, id)).returning();
  revalidatePath(`/prescriptions/${id}`);
  return result[0];
}

