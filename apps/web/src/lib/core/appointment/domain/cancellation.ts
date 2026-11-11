const HOUR = 3_600_000;

/** Whether a patient may still cancel on their own, given the therapist's notice. */
export function canPatientCancel(startsAt: Date, noticeHours: number, now: Date) {
  return startsAt.getTime() - now.getTime() >= noticeHours * HOUR;
}
