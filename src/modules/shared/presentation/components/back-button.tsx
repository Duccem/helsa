"use client";

import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";

type BackButtonProps = {
  href?: string;
  compact?: boolean;
};

export const BackButton = ({ compact, href }: BackButtonProps) => {
  const router = useRouter();
  return (
    <Button
      variant="ghost"
      size={compact ? "icon" : "default"}
      onClick={() => (href ? router.push(href) : router.back())}
      className={"cursor-pointer"}
    >
      <ArrowLeft />
      {!compact && "Back"}
    </Button>
  );
};

