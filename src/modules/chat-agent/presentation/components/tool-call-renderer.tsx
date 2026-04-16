"use client";

import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/modules/shared/presentation/components/ai-elements/tool";
import type { ToolUIPart } from "ai";
import { getToolTitle } from "./tools/tool-result-registry";

type ToolCallRendererProps = {
  part: ToolUIPart;
};

export const ToolCallRenderer = ({ part }: ToolCallRendererProps) => {
  const toolName = part.type.replace(/^tool-/, "");

  return (
    <Tool>
      <ToolHeader title={getToolTitle(toolName)} type={part.type as ToolUIPart["type"]} state={part.state} />
      <ToolContent>
        <ToolInput input={part.input} />
        <ToolOutput output={part.output} errorText={part.errorText} />
      </ToolContent>
    </Tool>
  );
};
