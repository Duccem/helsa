"use client";

import { Doctor } from "@/modules/doctor/domain/doctor";
import { DoctorPatient } from "@/modules/doctor/domain/doctor-patient";
import { AvailabilitySlot } from "@/modules/schedule/domain/availability-slot";
import { Schedule } from "@/modules/schedule/domain/schedule";
import { Primitives } from "@/modules/shared/domain/primitives";
import { Button } from "@/modules/shared/presentation/components/ui/button";
import { Calendar } from "@/modules/shared/presentation/components/ui/calendar";
import { ComboboxDropdown } from "@/modules/shared/presentation/components/ui/combobox-dropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/modules/shared/presentation/components/ui/dropdown-menu";
import { Field, FieldGroup, FieldLabel } from "@/modules/shared/presentation/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/shared/presentation/components/ui/select";
import { Textarea } from "@/modules/shared/presentation/components/ui/textarea";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { endOfDay, format, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays, Clock3, Loader2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import z from "zod";

const formSchema = z.object({
  patientId: z.uuid(),
  date: z.string(), // ISO date string
  time: z.string(), // ISO time string
  reason: z.string(),
  mode: z.enum(["ONLINE", "IN_PERSON"]),
  type: z.enum(["THERAPY", "INITIAL"]),
});

const mapPatient = (patient: Primitives<DoctorPatient>) => ({
  id: patient.id,
  label: patient.name,
});

export const NewAppointmentForm = () => {
  const router = useRouter();
  const [hourOptions, setHourOptions] = useState<{ id: string; label: string }[]>([]);
  const { data: doctor, isFetching: isPendingDoctor } = useQuery<Primitives<Doctor> | null>({
    queryKey: ["doctor-profile"],
    initialData: null,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const response = await fetch("/api/doctor/me");
      if (!response.ok) {
        throw new Error("Failed to fetch doctor profile");
      }
      const data = await response.json();
      return data.doctor;
    },
  });
  const { data: patients, isFetching: isPendingPatients } = useQuery<Primitives<DoctorPatient>[]>({
    queryKey: ["doctor-patients"],
    initialData: [],
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const response = await fetch("/api/doctor/patients");
      if (!response.ok) {
        throw new Error("Failed to fetch patients");
      }
      const data = await response.json();
      return data.patients;
    },
  });

  const form = useForm({
    defaultValues: {
      patientId: "",
      date: "",
      time: "",
      reason: "",
      mode: "IN_PERSON",
      type: "INITIAL",
    },
    validators: {
      onSubmit: formSchema,
      onBlur: formSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await fetch("/api/appointment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            doctorId: doctor?.id,
            patientId: value.patientId,
            date: value.date,
            time: value.time,
            motive: value.reason,
            mode: value.mode,
            type: value.type,
          }),
        });
        router.push("/appointments");
      } catch (error) {
        console.error("Failed to create appointment", error);
        toast.error("Failed to create appointment. Please try again.");
      }
    },
  });

  const {
    data: availability,
    refetch,
    isFetching: isFetchingAvailabilities,
  } = useQuery<Primitives<AvailabilitySlot>[]>({
    queryKey: ["doctor-schedule"],
    initialData: [],
    refetchOnWindowFocus: false,
    enabled: !!doctor,
    queryFn: async () => {
      const startDate = startOfDay(new Date(form.getFieldValue("date")));
      const endDate = endOfDay(new Date(form.getFieldValue("date")));
      const response = await fetch(
        `/api/schedule/${doctor?.id}/availability?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&state=AVAILABLE`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch doctor schedule");
      }
      const data = await response.json();
      return data.slots;
    },
  });

  useEffect(() => {
    if (!availability) {
      setHourOptions([]);
      return;
    }
    const options = availability.map((slot) => ({
      id: slot.hour,
      label: slot.hour,
    }));
    setHourOptions(options);
  }, [availability]);

  return (
    <form
      className="w-1/2 flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.Field name="patientId">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid} className="bg-card p-4 rounded-2xl">
                <FieldLabel htmlFor={field.name}>Paciente</FieldLabel>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant={"secondary"} className={"justify-start"} disabled={isPendingPatients}>
                        <Users className="size-4 " />
                        {isPendingPatients
                          ? "Loading patients..."
                          : field.state.value
                            ? mapPatient(patients?.find((p) => p.id === field.state.value)!).label
                            : "Select a patient"}
                      </Button>
                    }
                  />
                  <DropdownMenuContent>
                    <ComboboxDropdown
                      headless={true}
                      placeholder="Selecciona un modo"
                      searchPlaceholder="Busca un paciente"
                      selectedItem={
                        field.state.value ? mapPatient(patients?.find((p) => p.id === field.state.value)!) : undefined
                      }
                      items={patients.map(mapPatient)}
                      onSelect={(item) => {
                        field.handleChange(item.id);
                      }}
                      renderListItem={({ item, isChecked }) => {
                        return (
                          <div className="flex items-center space-x-2">
                            <span className="line-clamp-1">{item.label}</span>
                          </div>
                        );
                      }}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              </Field>
            );
          }}
        </form.Field>
      </FieldGroup>
      <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <form.Field name="date">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid} className="bg-card p-4 rounded-2xl">
                <FieldLabel htmlFor={field.name}>Fecha</FieldLabel>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant={"secondary"} className={"justify-start"} disabled={isPendingPatients}>
                        <CalendarDays className="size-4 " />
                        {field.state.value
                          ? format(new Date(field.state.value), "PPPP", { locale: es })
                          : "Select a date"}
                      </Button>
                    }
                  />
                  <DropdownMenuContent>
                    <Calendar
                      className="w-full"
                      mode="single"
                      disabled={{
                        before: new Date(),
                      }}
                      selected={field.state.value ? new Date(field.state.value) : undefined}
                      onSelect={(date) => {
                        if (!date) return;
                        field.handleChange(date.toISOString());
                        refetch();
                      }}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              </Field>
            );
          }}
        </form.Field>
        <form.Field name="time">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid} className="bg-card p-4 rounded-2xl">
                <FieldLabel htmlFor={field.name}>Hora</FieldLabel>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant={"secondary"}
                        className={"justify-start"}
                        disabled={isPendingPatients || isFetchingAvailabilities || hourOptions.length === 0}
                      >
                        <Clock3 className="size-4 " />
                        {field.state.value || "Select an hour"}
                      </Button>
                    }
                  />
                  <DropdownMenuContent>
                    <ComboboxDropdown
                      headless={true}
                      placeholder="Selecciona una hora"
                      searchPlaceholder="Busca una hora"
                      selectedItem={hourOptions.find((option) => option.id === field.state.value)}
                      items={hourOptions}
                      onSelect={(item) => {
                        field.handleChange(item.id);
                      }}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              </Field>
            );
          }}
        </form.Field>
        <form.Field name="mode">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid} className="bg-card p-4 rounded-2xl">
                <FieldLabel htmlFor={field.name}>Modalidad</FieldLabel>
                <Select
                  onValueChange={(value) => {
                    field.handleChange(value ?? "");
                  }}
                  value={field.state.value}
                >
                  <SelectTrigger>
                    {field.state.value ? (field.state.value === "ONLINE" ? "Online" : "Presencial") : "Select a mode"}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={"ONLINE"}>Online</SelectItem>
                    <SelectItem value={"IN_PERSON"}>Presencial</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            );
          }}
        </form.Field>
        <form.Field name="type">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid} className="bg-card p-4 rounded-2xl">
                <FieldLabel htmlFor={field.name}>Tipo</FieldLabel>
                <Select
                  onValueChange={(value) => {
                    field.handleChange(value ?? "");
                  }}
                  value={field.state.value}
                >
                  <SelectTrigger>
                    {field.state.value ? (field.state.value === "THERAPY" ? "Terapia" : "Inicial") : "Select a mode"}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={"THERAPY"}>Terapia</SelectItem>
                    <SelectItem value={"INITIAL"}>Inicial</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            );
          }}
        </form.Field>
      </FieldGroup>
      <FieldGroup>
        <form.Field name="reason">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid} className="bg-card p-4 rounded-2xl">
                <FieldLabel htmlFor={field.name}>Motivo de la consulta</FieldLabel>
                <Textarea
                  placeholder="Motivo de la consulta"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                ></Textarea>
              </Field>
            );
          }}
        </form.Field>
      </FieldGroup>
      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(disabled) => (
          <Button type="submit" disabled={disabled} className={"cursor-pointer"}>
            {disabled ? <Loader2 className="animate-spin" /> : "Schedule Appointment"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
};

