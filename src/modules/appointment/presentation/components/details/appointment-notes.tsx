"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { FileText, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/modules/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/modules/shared/presentation/components/ui/card";
import { Textarea } from "@/modules/shared/presentation/components/ui/textarea";
import { Field, FieldGroup, FieldLabel } from "@/modules/shared/presentation/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/modules/shared/presentation/components/ui/dialog";
import { useAppointmentDetail } from "./provider";
import { Primitives } from "@/modules/shared/domain/primitives";
import { AppointmentNote } from "@/modules/appointment/domain/appointment-note";

// -- Add Note Modal --

const noteSchema = z.object({
  note: z.string().min(1, "La nota no puede estar vacía"),
});

function AddNoteModal({ appointmentId }: { appointmentId: string }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (note: string) => {
      const response = await fetch(`/api/appointment/${appointmentId}/note`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      if (!response.ok) {
        throw new Error("Error al guardar la nota");
      }
    },
    onSuccess: () => {
      toast.success("Nota agregada correctamente");
      queryClient.invalidateQueries({ queryKey: ["appointment", appointmentId] });
      setOpen(false);
    },
    onError: () => {
      toast.error("Error al agregar la nota");
    },
  });

  const form = useForm({
    defaultValues: { note: "" },
    validators: { onSubmit: noteSchema },
    onSubmit: async ({ value }) => {
      await mutateAsync(value.note);
      form.reset();
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm">
            <Plus className="size-4 mr-1" />
            Agregar nota
          </Button>
        }
      />
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva nota</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <FieldGroup>
            <form.Field name="note">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Nota</FieldLabel>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      rows={5}
                      placeholder="Escribe una nota sobre la cita..."
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                    />
                  </Field>
                );
              }}
            </form.Field>
          </FieldGroup>

          <div className="flex justify-end gap-2 pt-1">
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

// -- Note Card --

function NoteCard({ note, appointmentId }: { note: Primitives<AppointmentNote>; appointmentId: string }) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/appointment/${appointmentId}/note`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId: note.id }),
      });
      if (!response.ok) {
        throw new Error("Error al eliminar la nota");
      }
    },
    onSuccess: () => {
      toast.success("Nota eliminada");
      queryClient.invalidateQueries({ queryKey: ["appointment", appointmentId] });
    },
    onError: () => {
      toast.error("Error al eliminar la nota");
    },
  });

  return (
    <Card>
      <CardContent className="p-4 flex items-start gap-3">
        <FileText className="size-4 text-muted-foreground mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm whitespace-pre-wrap break-words">{note.note}</p>
          <p className="text-xs text-muted-foreground mt-1.5">
            {format(new Date(note.created_at), "d 'de' MMMM yyyy, HH:mm", { locale: es })}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground hover:text-destructive"
          disabled={isPending}
          onClick={() => mutate()}
          aria-label="Eliminar nota"
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
        </Button>
      </CardContent>
    </Card>
  );
}

// -- Notes Section --

export function AppointmentNotes() {
  const { appointment, isPendingAppointment } = useAppointmentDetail();

  if (isPendingAppointment) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">Cargando notas...</div>
    );
  }

  if (!appointment) return null;

  const notes = appointment.notes ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <AddNoteModal appointmentId={appointment.id} />
      </div>

      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
          <FileText className="size-8 opacity-40" />
          <p className="text-sm">No hay notas registradas para esta cita.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} appointmentId={appointment.id} />
          ))}
        </div>
      )}
    </div>
  );
}

