import { pgTable, uuid, text, integer, timestamp, boolean, json } from "drizzle-orm/pg-core";

export const patients = pgTable("patients", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(),
  phone: text("phone").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const prescriptions = pgTable("prescriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  rawOcr: text("raw_ocr"),
  correctedText: text("corrected_text"),
  aiSummary: text("ai_summary"),
  medicinesJson: json("medicines_json"),
  doctorNotes: text("doctor_notes"),
  tags: json("tags"),
  important: boolean("important").default(false),
  ocrConfidence: integer("ocr_confidence"),
  aiConfidence: integer("ai_confidence"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

