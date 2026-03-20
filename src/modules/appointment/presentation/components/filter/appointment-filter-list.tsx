"use client";
import {
  AppointmentModeValues,
  AppointmentStatusValues,
  AppointmentTypeValues,
} from "@/modules/appointment/domain/appointment";
import { parseISO, format } from "date-fns";
import { parseAsString, useQueryState, useQueryStates } from "nuqs";
import { formatDateRange } from "little-date";
import { transformState } from "./state-filter";
import { transformType } from "./type-filter";
import { transformMode } from "./mode-filter";
import { Button } from "@/modules/shared/presentation/components/ui/button";
import { X } from "lucide-react";

type AppointmentFilterKey = "state" | "type" | "mode" | "start" | "end";
type AppointmentFilterValue = {
  state: string;
  type: string;
  mode: string;
  start: string;
  end: string;
};

interface AppointmentFilterListProps {
  key: AppointmentFilterKey;
  value: AppointmentFilterValue[AppointmentFilterKey];
}

export const AppointmentsFilterList = () => {
  const [activeView, setActiveView] = useQueryState("view", parseAsString.withDefault("table"));
  const [filters, setFilter] = useQueryStates({
    state: parseAsString.withDefault(""),
    type: parseAsString.withDefault(""),
    mode: parseAsString.withDefault(""),
    start: parseAsString.withDefault(""),
    end: parseAsString.withDefault(""),
  });

  const handleOnRemove = (key: string) => {
    if (key === "end" || key === "start") {
      setFilter({ end: null, start: null });
      return;
    }

    setFilter({ [key]: null });
  };

  const clearAllFilters = () => {
    setFilter({
      state: null,
      type: null,
      mode: null,
      start: null,
      end: null,
    });
  };

  const renderFilter = ({ key, value }: AppointmentFilterListProps) => {
    switch (key) {
      case "start": {
        const startValue = value as AppointmentFilterValue["start"];
        if (startValue && filters.end) {
          return formatDateRange(parseISO(startValue), parseISO(filters.end), {
            includeTime: false,
          });
        }

        return startValue && format(parseISO(startValue), "MMM d, yyyy");
      }
      case "state": {
        const stateValue = value as AppointmentFilterValue["state"];
        return transformState(stateValue).label;
      }
      case "type": {
        const typeValue = value as AppointmentFilterValue["type"];
        return transformType(typeValue).label;
      }
      case "mode": {
        const modeValue = value as AppointmentFilterValue["mode"];
        return transformMode(modeValue).label;
      }
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center gap-2">
      <ul className="flex space-x-2">
        {Object.entries(filters)
          .filter(([key, value]) => value && key !== "end")
          .map(([key, value]) => {
            const filterKey = key as AppointmentFilterKey;
            return (
              <li key={key}>
                <Button
                  className="px-2 bg-secondary cursor-pointer hover:bg-secondary font-normal text-[#878787] flex space-x-1 items-center group"
                  onClick={() => handleOnRemove(filterKey)}
                >
                  <span>
                    {renderFilter({
                      key: filterKey,
                      value: value as AppointmentFilterValue[AppointmentFilterKey],
                    })}
                  </span>
                </Button>
              </li>
            );
          })}
      </ul>
      {activeView === "table" &&
        Object.entries(filters).filter(([key, value]) => value && key !== "end").length > 0 && (
          <Button variant={"secondary"} onClick={clearAllFilters}>
            <X className="size-4 text-[#878787]" />
          </Button>
        )}
    </div>
  );
};

