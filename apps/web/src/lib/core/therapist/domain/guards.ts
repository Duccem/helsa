import type { BetterUser } from "@helsa/auth";
import { NotPermissions } from "@/lib/utils/error";

/** Patients have their own portal; only therapists manage patient records. */
export function assertTherapistRole(user: Pick<BetterUser, "role">) {
  if (user.role === "patient") {
    throw new NotPermissions();
  }
}
