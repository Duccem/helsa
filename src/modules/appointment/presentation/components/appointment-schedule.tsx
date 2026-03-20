import {
  CalendarBody,
  CalendarDate,
  CalendarDatePagination,
  CalendarDatePicker,
  CalendarHeader,
  CalendarItem,
  CalendarMonthPicker,
  CalendarProvider,
  CalendarYearPicker,
  useCalendarMonth,
} from "@/modules/shared/presentation/components/kibo-ui/calendar";
import { Card, CardContent } from "@/modules/shared/presentation/components/ui/card";
import { faker } from "@faker-js/faker";
import { parseAsString, useQueryStates } from "nuqs";
import { useEffect } from "react";
import { endOfMonth, isThisMonth, startOfMonth } from "date-fns";
const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const statuses = [
  { id: faker.string.uuid(), name: "Planned", color: "#6B7280" },
  { id: faker.string.uuid(), name: "In Progress", color: "#F59E0B" },
  { id: faker.string.uuid(), name: "Done", color: "#10B981" },
];

const exampleFeatures = Array.from({ length: 20 })
  .fill(null)
  .map(() => ({
    id: faker.string.uuid(),
    name: capitalize(faker.company.buzzPhrase()),
    startAt: faker.date.past({ years: 0.5, refDate: new Date() }),
    endAt: faker.date.future({ years: 0.5, refDate: new Date() }),
    status: faker.helpers.arrayElement(statuses),
  }));
const earliestYear =
  exampleFeatures
    .map((feature) => feature.startAt.getFullYear())
    .sort()
    .at(0) ?? new Date().getFullYear();
const latestYear =
  exampleFeatures
    .map((feature) => feature.endAt.getFullYear())
    .sort()
    .at(-1) ?? new Date().getFullYear();
export const AppointmentsSchedule = () => {
  return (
    <Card className="">
      <CardContent>
        <CalendarProvider>
          <ScheduleWrapper />
        </CalendarProvider>
      </CardContent>
    </Card>
  );
};

const ScheduleWrapper = () => {
  const [{ end, start }, setDates] = useQueryStates({
    start: parseAsString.withDefault(""),
    end: parseAsString.withDefault(""),
  });
  const [month] = useCalendarMonth();

  useEffect(() => {
    console.log("month changed", month);
    const actualMonth = new Date(new Date().getFullYear(), month, 1);
    const startMonth = startOfMonth(actualMonth);
    const endMonth = endOfMonth(actualMonth);

    console.log({
      actualMonth,
      startMonth,
      endMonth,
    });

    setDates({
      start: startMonth.toISOString(),
      end: endMonth.toISOString(),
    });
  }, [month]);
  return (
    <>
      <CalendarDate>
        <CalendarDatePicker>
          <CalendarMonthPicker />
          <CalendarYearPicker end={latestYear} start={earliestYear} />
        </CalendarDatePicker>
        <CalendarDatePagination />
      </CalendarDate>
      <CalendarHeader />
      <CalendarBody features={exampleFeatures}>
        {({ feature }) => (
          <div className="flex items-center gap-2 bg-primary rounded p-1 cursor-pointer" key={feature.id}>
            <span className="truncate">{feature.name}</span>
          </div>
        )}
      </CalendarBody>
    </>
  );
};

