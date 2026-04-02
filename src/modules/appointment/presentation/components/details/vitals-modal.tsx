"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/modules/shared/presentation/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/modules/shared/presentation/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/modules/shared/presentation/components/ui/field";
import { Input } from "@/modules/shared/presentation/components/ui/input";
import { Loader2, Plus } from "lucide-react";
import { useAppointmentDetail } from "./provider";

const vitalsSchema = z.object({
  bloodPressure: z.union([z.number().positive("Debe ser mayor a 0"), z.undefined()]),
  heartRate: z.union([z.number().positive("Debe ser mayor a 0"), z.undefined()]),
  respiratoryRate: z.union([z.number().positive("Debe ser mayor a 0"), z.undefined()]),
  oxygenSaturation: z.union([z.number().min(0).max(100, "Debe ser entre 0 y 100"), z.undefined()]),
  temperature: z.union([z.number().positive("Debe ser mayor a 0"), z.undefined()]),
});

export function AddVitalsModal() {
  const [open, setOpen] = useState(false);
  const { patient } = useAppointmentDetail();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (data: z.infer<typeof vitalsSchema>) => {
      const response = await fetch(`/api/patient/${patient?.id}/vitals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Error al guardar los signos vitales");
      }
    },
    onSuccess: () => {
      toast.success("Signos vitales registrados correctamente");
      queryClient.invalidateQueries({ queryKey: ["patient", patient?.id] });
      setOpen(false);
    },
    onError: () => {
      toast.error("Error al registrar los signos vitales");
    },
  });

  const form = useForm({
    defaultValues: {
      bloodPressure: undefined as number | undefined,
      heartRate: undefined as number | undefined,
      respiratoryRate: undefined as number | undefined,
      oxygenSaturation: undefined as number | undefined,
      temperature: undefined as number | undefined,
    },
    validators: {
      onSubmit: vitalsSchema,
    },
    onSubmit: async ({ value }) => {
      await mutateAsync(value);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="size-4 mr-1" />
            Agregar medicion
          </Button>
        }
      />
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar signos vitales</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <FieldGroup className="grid grid-cols-2 gap-x-4 gap-y-2">
            <form.Field name="bloodPressure">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Presión sanguínea (mmHg)</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      placeholder="120"
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value ? Number(e.target.value) : undefined)}
                      aria-invalid={isInvalid}
                    />
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="heartRate">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Ritmo cardíaco (bpm)</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      placeholder="75"
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value ? Number(e.target.value) : undefined)}
                      aria-invalid={isInvalid}
                    />
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="temperature">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Temperatura (°C)</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      step="0.1"
                      placeholder="36.5"
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value ? Number(e.target.value) : undefined)}
                      aria-invalid={isInvalid}
                    />
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="oxygenSaturation">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>SpO₂ (%)</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      placeholder="98"
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value ? Number(e.target.value) : undefined)}
                      aria-invalid={isInvalid}
                    />
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="respiratoryRate">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid} className="col-span-2">
                    <FieldLabel htmlFor={field.name}>Frecuencia respiratoria (/min)</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      placeholder="16"
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value ? Number(e.target.value) : undefined)}
                      aria-invalid={isInvalid}
                    />
                  </Field>
                );
              }}
            </form.Field>
          </FieldGroup>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 mr-1 animate-spin" />}
              Guardar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

