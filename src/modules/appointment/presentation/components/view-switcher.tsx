"use client";

import { Button } from "@/modules/shared/presentation/components/ui/button";
import { ButtonGroup } from "@/modules/shared/presentation/components/ui/button-group";
import { parseAsString, useQueryState } from "nuqs";

export const ViewSwitcher = () => {
  const [activeView, setActiveView] = useQueryState("view", parseAsString.withDefault("table"));
  return (
    <ButtonGroup>
      <Button variant={activeView == "table" ? "default" : "secondary"} onClick={() => setActiveView("table")}>
        Table
      </Button>
      <Button variant={activeView == "calendar" ? "default" : "secondary"} onClick={() => setActiveView("calendar")}>
        Calendar
      </Button>
      <Button variant={activeView == "timeline" ? "default" : "secondary"} onClick={() => setActiveView("timeline")}>
        Timeline
      </Button>
    </ButtonGroup>
  );
};

