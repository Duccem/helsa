"use client";

import { Badge } from "@/modules/shared/presentation/components/ui/badge";
import { Button } from "@/modules/shared/presentation/components/ui/button";
import { cn } from "@/modules/shared/presentation/lib/utils";
import type { ToolUIPart, UIMessage } from "ai";
import { ChevronLeftIcon, ChevronRightIcon, SparklesIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { getToolTitle, isRenderableToolName, renderToolResult, type RenderableToolName } from "./tool-result-registry";

type ToolResultItem = {
  id: string;
  title: string;
  toolName: RenderableToolName;
  content: ReactNode;
};

const getToolResults = (messages: UIMessage[]): ToolResultItem[] => {
  const items: ToolResultItem[] = [];

  for (const message of messages) {
    message.parts.forEach((part, index) => {
      if (!part.type.startsWith("tool-")) {
        return;
      }

      const toolName = part.type.replace(/^tool-/, "");
      if (!isRenderableToolName(toolName)) {
        return;
      }

      const toolPart = part as ToolUIPart;
      if (toolPart.state !== "output-available") {
        return;
      }

      items.push({
        id: `${message.id}-${index}`,
        title: getToolTitle(toolName),
        toolName,
        content: renderToolResult(toolName, toolPart.output),
      });
    });
  }

  return items.reverse();
};

export const ToolResultsPanel = ({ messages }: { messages: UIMessage[] }) => {
  const [isOpen, setIsOpen] = useState(true);
  const items = useMemo(() => getToolResults(messages), [messages]);

  if (items.length === 0) {
    return null;
  }

  return (
    <aside
      className={cn(
        "w-full shrink-0 transition-[width] duration-300 lg:max-h-[700px]",
        isOpen ? "lg:w-[26rem]" : "lg:w-16",
      )}
    >
      <div className="flex h-full min-h-[220px] flex-col overflow-hidden rounded-[28px] border border-border/70 bg-gradient-to-b from-background via-background to-muted/30 shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-3">
          <div className={cn("min-w-0", !isOpen && "lg:hidden")}>
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <SparklesIcon className="size-4 text-primary" />
              Panel clínico
            </div>
            <div className="text-xs text-muted-foreground">{items.length} vistas enriquecidas activas</div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={cn(!isOpen && "lg:hidden")} variant="secondary">
              {items.length}
            </Badge>
            <Button
              aria-label={isOpen ? "Colapsar panel" : "Expandir panel"}
              onClick={() => setIsOpen((value) => !value)}
              size="icon-sm"
              variant="ghost"
            >
              {isOpen ? <ChevronRightIcon className="size-4" /> : <ChevronLeftIcon className="size-4" />}
            </Button>
          </div>
        </div>

        {isOpen ? (
          <div className="flex-1 overflow-y-auto p-3">
            <div className="flex flex-col gap-4">
              {items.map((item, index) => (
                <section className="flex flex-col gap-2" key={item.id}>
                  <div className="flex items-center justify-between px-1">
                    <div className="truncate text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      {item.title}
                    </div>
                    {index === 0 ? <Badge variant="outline">Reciente</Badge> : null}
                  </div>
                  {item.content}
                </section>
              ))}
            </div>
          </div>
        ) : (
          <div className="hidden flex-1 items-center justify-center lg:flex">
            <div className="flex flex-col items-center gap-3 text-center">
              <Badge variant="secondary">{items.length}</Badge>
              <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground [writing-mode:vertical-rl]">
                Panel clínico
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
