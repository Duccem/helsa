export const toAppWeekday = (weekday: number) => (weekday + 6) % 7;
export const toDbWeekday = (weekday: number) => (weekday + 1) % 7;