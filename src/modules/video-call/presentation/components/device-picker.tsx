"use client";

import { Check, ChevronUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { JitsiDevice } from "../hooks/use-jitsi";
import { cn } from "@/modules/shared/presentation/lib/utils";

type DeviceSection = {
  title: string;
  icon: React.ReactNode;
  devices: JitsiDevice[];
  currentDeviceId?: string;
  onSelect: (device: JitsiDevice) => void;
  emptyLabel: string;
};

type DevicePickerProps = {
  label: string;
  sections: DeviceSection[];
};

export const DevicePicker = ({ label, sections }: DevicePickerProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={label}
        title={label}
        className={cn(
          "flex size-12 items-center justify-center rounded-r-full border border-white/10 bg-white/10 text-white/80 transition hover:bg-white/20",
          open && "bg-white/20 text-white",
        )}
      >
        <ChevronUp className={cn("size-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute bottom-full left-1/2 z-40 mb-3 w-72 -translate-x-1/2 overflow-hidden rounded-2xl border border-white/10 bg-black/80 shadow-2xl backdrop-blur-2xl">
          <div className="max-h-[60vh] overflow-y-auto">
            {sections.map((section, idx) => (
              <div key={section.title}>
                {idx > 0 && <div className="h-px bg-white/10" />}
                <div className="flex items-center gap-2 px-4 pt-3 pb-2">
                  <span className="text-white/60">{section.icon}</span>
                  <span className="text-[11px] font-semibold tracking-wide text-white/60 uppercase">
                    {section.title}
                  </span>
                </div>
                <div className="pb-2">
                  {section.devices.length === 0 ? (
                    <p className="px-4 py-2 text-xs text-white/40">{section.emptyLabel}</p>
                  ) : (
                    section.devices.map((device) => {
                      const selected = device.deviceId === section.currentDeviceId;
                      return (
                        <button
                          key={device.deviceId}
                          type="button"
                          onClick={() => {
                            section.onSelect(device);
                            setOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition",
                            selected ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/5 hover:text-white",
                          )}
                        >
                          <span className="flex size-4 shrink-0 items-center justify-center">
                            {selected && <Check className="size-4 text-primary" />}
                          </span>
                          <span className="truncate">{device.label || "Dispositivo sin nombre"}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

