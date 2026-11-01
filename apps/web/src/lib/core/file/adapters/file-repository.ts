import { and, desc, eq, isNull } from "@helsa/db/operators";
import { file } from "@helsa/db/schema/patient";
import { db } from "@/services";
import type { NewStoredFile } from "../domain/types";

export class FileRepository {
  async listByPatient(patient_id: string, therapist_id: string) {
    return db
      .select()
      .from(file)
      .where(
        and(
          eq(file.patient_id, patient_id),
          eq(file.therapist_id, therapist_id),
          isNull(file.deleted_at),
        ),
      )
      .orderBy(desc(file.created_at));
  }

  async getById(id: string, patient_id: string, therapist_id: string) {
    const [response] = await db
      .select()
      .from(file)
      .where(
        and(
          eq(file.id, id),
          eq(file.patient_id, patient_id),
          eq(file.therapist_id, therapist_id),
          isNull(file.deleted_at),
        ),
      )
      .limit(1);

    return response;
  }

  async create(data: NewStoredFile) {
    await db.insert(file).values(data);
  }

  async softDelete(id: string, therapist_id: string) {
    await db
      .update(file)
      .set({ deleted_at: new Date() })
      .where(and(eq(file.id, id), eq(file.therapist_id, therapist_id)));
  }
}
