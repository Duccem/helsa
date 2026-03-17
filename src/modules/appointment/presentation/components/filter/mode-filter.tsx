"use client";

import { ComboboxDropdown } from "@/modules/shared/presentation/components/ui/combobox-dropdown";
import { cn } from "@/modules/shared/presentation/lib/utils";
import { Check } from "lucide-react";

type Props = {
  selected?: string;
  onChangeAction: (selected: string) => void;
  headless?: boolean;
  modes: any[];
};

const modeLabel: Record<string, string> = {
  ONLINE: "Online",
  IN_PERSON: "Presencial",
};

export function transformMode(mode: string) {
  return {
    id: mode,
    label: modeLabel[mode],
  };
}

export const ModeFilter = ({ selected, onChangeAction, headless, modes }: Props) => {
  const selectedValue = selected ? transformMode(selected) : undefined;
  return (
    <ComboboxDropdown
      headless={headless}
      placeholder="Selecciona un modo"
      searchPlaceholder="Busca un modo"
      selectedItem={selectedValue}
      items={modes.map(transformMode)}
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

