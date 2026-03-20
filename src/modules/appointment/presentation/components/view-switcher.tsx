"use client";

import { Button } from "@/modules/shared/presentation/components/ui/button";
import { ButtonGroup } from "@/modules/shared/presentation/components/ui/button-group";
import { parseAsString, useQueryState, useQueryStates } from "nuqs";

export const ViewSwitcher = () => {
  const [activeView, setActiveView] = useQueryState("view", parseAsString.withDefault("table"));
  const [filters, setFilter] = useQueryStates({
    state: parseAsString.withDefault(""),
    type: parseAsString.withDefault(""),
    mode: parseAsString.withDefault(""),
    start: parseAsString.withDefault(""),
    end: parseAsString.withDefault(""),
  });

  const changeView = (view: string) => {
    setActiveView(view);
    setFilter({
      state: null,
      type: null,
      mode: null,
      start: null,
      end: null,
    });
  };
  return (
    <ButtonGroup>
      <Button variant={activeView == "table" ? "default" : "secondary"} onClick={() => changeView("table")}>
        Table
      </Button>
      <Button variant={activeView == "calendar" ? "default" : "secondary"} onClick={() => changeView("calendar")}>
        Calendar
      </Button>
    </ButtonGroup>
  );
};

