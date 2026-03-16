"use client";

import { ComboboxDropdown } from "@/modules/shared/presentation/components/ui/combobox-dropdown";
import { cn } from "@/modules/shared/presentation/lib/utils";
import { Check } from "lucide-react";

type Props = {
  selected?: string;
  onChangeAction: (selected: string) => void;
  headless?: boolean;
  states: any[];
};

const stateLabel: Record<string, string> = {
  SCHEDULED: "Agendada",
  CONFIRMED: "Confirmada",
  PAYED: "Pagada",
  READY: "Lista",
  STARTED: "Iniciada",
  CANCELLED: "Cancelada",
  MISSED_BY_PATIENT: "No asistió doctor",
  MISSED_BY_THERAPIST: "No asistió paciente",
  FINISHED: "Finalizada",
};

function transformState(state: string) {
  return {
    id: state,
    label: stateLabel[state],
  };
}

export const StateFilter = ({ selected, onChangeAction, headless, states }: Props) => {
  const selectedValue = selected ? transformState(selected) : undefined;
  return (
    <ComboboxDropdown
      headless={headless}
      placeholder="Selecciona una estado"
      searchPlaceholder="Busca una estado"
      selectedItem={selectedValue}
      items={states.map(transformState)}
      onSelect={(item) => {
        onChangeAction(item.id);
      }}
      renderListItem={({ item, isChecked }) => {
        return (
          <div className="flex items-center space-x-2">
            <Check className={cn("mr-2 h-4 w-4", isChecked ? "opacity-100" : "opacity-0")} />
            <span className="line-clamp-1">{item.label}</span>
          </div>
        );
      }}
    />
  );
};

