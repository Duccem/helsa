"use client";

import { AppointmentStatusValues } from "@/modules/appointment/domain/appointment";
import { Calendar } from "@/modules/shared/presentation/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/modules/shared/presentation/components/ui/dropdown-menu";
import { formatISO } from "date-fns";
import { CalendarDays, ListFilter, Route } from "lucide-react";
import { parseAsArrayOf, parseAsString, useQueryStates } from "nuqs";
import { useState } from "react";
import { StateFilter } from "./state-filter";
import { Button } from "@/modules/shared/presentation/components/ui/button";

export const AppointmentsFilter = () => {
  const states = [...Object.values(AppointmentStatusValues)];
  const [filters, setFilters] = useQueryStates(
    {
      types: parseAsArrayOf(parseAsString),
      start: parseAsString,
      end: parseAsString,
      state: parseAsArrayOf(parseAsString),
    },
    {
      shallow: false,
    },
  );
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu>
      <div className="flex  md:items-center w-full flex-col md:flex-row gap-2">
        <DropdownMenuTrigger
          render={
            <Button onClick={() => setIsOpen((prev) => !prev)} variant={"secondary"}>
              <ListFilter className="size-4" />
              Filter appointments
            </Button>
          }
        />
      </div>
      <DropdownMenuContent className=" w-[200px]" align="start" side="bottom">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="">
            <CalendarDays className="size-4 mr-2" />
            <span>Fechas</span>
          </DropdownMenuSubTrigger>

          <DropdownMenuPortal>
            <DropdownMenuSubContent sideOffset={14} alignOffset={-4} className="p-0 ">
              <Calendar
                mode="range"
                initialFocus
                selected={{
                  from: filters.start ? new Date(filters.start) : undefined,
                  to: filters.end ? new Date(filters.end) : undefined,
                }}
                onSelect={(range) => {
                  if (!range) return;

                  const newRange = {
                    start: range.from ? formatISO(range.from, { representation: "date" }) : filters.start,
                    end: range.to ? formatISO(range.to, { representation: "date" }) : filters.end,
                  };

                  setFilters(newRange);
                }}
              />
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="">
            <Route className="size-4 mr-2" />
            <span>Estado de la cita</span>
          </DropdownMenuSubTrigger>

          <DropdownMenuPortal>
            <DropdownMenuSubContent sideOffset={14} alignOffset={-4} className="p-0 w-[250px] h-[270px] ">
              <StateFilter
                headless
                states={states}
                selected={filters.state ? filters.state[0] : undefined}
                onChangeAction={(selected) => {
                  setFilters({
                    state: filters?.state?.includes(selected) ? null : [selected],
                  });
                }}
              />
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        {/* <DropdownMenuSub>
          <DropdownMenuSubTrigger className="">
            <SquareStack className="size-4 mr-2" />
            <span>Tipo de cita</span>
          </DropdownMenuSubTrigger>

          <DropdownMenuPortal>
            <DropdownMenuSubContent sideOffset={14} alignOffset={-4} className="p-0 w-[250px] h-[270px] ">
              <SelectType
                headless
                types={types}
                onChange={(selected) => {
                  setFilters({
                    types: filters?.types?.includes(selected.name)
                      ? filters.types.filter((s) => s !== selected.name).length > 0
                        ? filters.types.filter((s) => s !== selected.name)
                        : null
                      : [...(filters.types ?? []), selected.name],
                  });
                }}
              />
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

