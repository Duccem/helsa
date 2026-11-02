/** Patients and therapist can enter this long before the start. */
export const OPENS_BEFORE_MINUTES = 15;
/** The room stays open this long after the scheduled end, for sessions that run over. */
export const CLOSES_AFTER_MINUTES = 30;

const MINUTE = 60_000;

export function roomWindow(starts_at: Date, ends_at: Date) {
  return {
    opens_at: new Date(starts_at.getTime() - OPENS_BEFORE_MINUTES * MINUTE),
    closes_at: new Date(ends_at.getTime() + CLOSES_AFTER_MINUTES * MINUTE),
  };
}
