import { ValueObject } from "@/modules/shared/domain/value-object";

export type MedicalRecordAttachmentFileType = "image/jpeg" | "image/png" | "application/pdf" | "text/plain" | string;

export type MedicalRecordAttachmentPayload = {
  filename: string;
  url: string;
  size: number;
  type: MedicalRecordAttachmentFileType;
};
export class MedicalRecordAttachment extends ValueObject<MedicalRecordAttachmentPayload> {
  constructor(value: MedicalRecordAttachmentPayload) {
    super(value);
  }

  validate(): void {
    if (this.value.filename.trim().length === 0) {
      throw new Error("Filename cannot be empty");
    }
    if (this.value.url.trim().length === 0) {
      throw new Error("URL cannot be empty");
    }
    if (isNaN(this.value.size) || this.value.size < 0) {
      throw new Error("Size must be a non-negative number");
    }
  }
}

