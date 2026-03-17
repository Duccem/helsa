"use client";

import {
  AppointmentModeValues,
  AppointmentStatusValues,
  AppointmentTypeValues,
} from "@/modules/appointment/domain/appointment";
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
import { CalendarDays, ClipboardPlus, ListFilter, Presentation, SquareStack } from "lucide-react";
import { parseAsArrayOf, parseAsString, useQueryStates } from "nuqs";
import { useState } from "react";
import { StateFilter } from "./state-filter";
import { Button } from "@/modules/shared/presentation/components/ui/button";
import { ModeFilter } from "./mode-filter";
import { TypeFilter } from "./type-filter";

export const AppointmentsFilter = () => {
  const states = [...Object.values(AppointmentStatusValues)];
  const modes = [...Object.values(AppointmentModeValues)];
  const types = [...Object.values(AppointmentTypeValues)];
  const [filters, setFilters] = useQueryStates(
    {
      type: parseAsArrayOf(parseAsString),
      mode: parseAsArrayOf(parseAsString),
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
      <div className="flex  md:items-center flex-col md:flex-row gap-2">
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
            <SquareStack className="size-4 mr-2" />
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
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="">
            <Presentation className="size-4 mr-2" />
            <span>Modalidad de la cita</span>
          </DropdownMenuSubTrigger>

          <DropdownMenuPortal>
            <DropdownMenuSubContent sideOffset={14} alignOffset={-4} className="p-0 w-[250px]">
              <ModeFilter
                headless
                modes={modes}
                selected={filters.mode ? filters.mode[0] : undefined}
                onChangeAction={(selected) => {
                  setFilters({
                    mode: filters?.mode?.includes(selected) ? null : [selected],
                  });
                }}
              />
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="">
            <ClipboardPlus className="size-4 mr-2" />
            <span>Tipo de la cita</span>
          </DropdownMenuSubTrigger>

          <DropdownMenuPortal>
            <DropdownMenuSubContent sideOffset={14} alignOffset={-4} className="p-0 w-[250px]">
              <TypeFilter
                headless
                types={types}
                selected={filters.type ? filters.type[0] : undefined}
                onChangeAction={(selected) => {
                  setFilters({
                    type: filters?.type?.includes(selected) ? null : [selected],
                  });
                }}
              />
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

