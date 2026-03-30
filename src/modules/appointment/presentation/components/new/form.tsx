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
import { Label } from "@/modules/shared/presentation/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/modules/shared/presentation/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/shared/presentation/components/ui/select";
import { Textarea } from "@/modules/shared/presentation/components/ui/textarea";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { endOfDay, format, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays, CircleDollarSign, Clock3, ListCollapse, Loader2, MapPin, Pin, Users, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import z, { set } from "zod";
import { useNewAppointment } from "./provider";

const formSchema = z.object({
  patientId: z.uuid(),
  date: z.string(), // ISO date string
  time: z.string(), // ISO time string
  reason: z.string(),
  mode: z.enum(["ONLINE", "IN_PERSON"]),
  type: z.enum(["CONSULTATION", "FOLLOW_UP", "CHECK_UP", "EMERGENCY", "PROCEDURE"]),
  amount: z.number(),
  payment_mode: z.string(),
});

const mapPatient = (patient: Primitives<DoctorPatient>) => ({
  id: patient.id,
  label: patient.name,
});

const appointmentTypes = {
  CONSULTATION: "Consulta",
  FOLLOW_UP: "Seguimiento",
  CHECK_UP: "Chequeo",
  EMERGENCY: "Emergencia",
  PROCEDURE: "Procedimiento",
};

export const NewAppointmentForm = () => {
  const router = useRouter();
  const { setData } = useNewAppointment();
  const [hourOptions, setHourOptions] = useState<{ id: string; label: string; state: string }[]>([]);
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

  const { mutateAsync } = useMutation({
    mutationFn: async (appointmentData: any) => {
      const response = await fetch("/api/appointment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctorId: doctor?.id,
          patientId: appointmentData.patientId,
          date: appointmentData.date,
          hour: appointmentData.time,
          motive: appointmentData.reason,
          mode: appointmentData.mode,
          type: appointmentData.type,
          amount: appointmentData.amount,
          payment_mode: appointmentData.payment_mode,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al agendar la cita");
      }
    },
    onSuccess: () => {
      toast.success("Cita agendada exitosamente");
      router.push("/appointments");
    },
    onError: (error) => {
      console.error("Error al agendar la cita", error);
      toast.error("Error al agendar la cita. Please try again.");
    },
  });

  const form = useForm({
    defaultValues: {
      patientId: "",
      date: "",
      time: "",
      reason: "",
      mode: "IN_PERSON",
      type: "CONSULTATION",
      amount: 0,
      payment_mode: "PREPAID",
    },
    validators: {
      onSubmit: formSchema,
      onBlur: formSchema,
    },
    onSubmit: async ({ value }) => {
      await mutateAsync(value);
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
        `/api/schedule/${doctor?.id}/availability?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
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
      state: slot.state,
    }));
    setHourOptions(options);
  }, [availability]);

  return (
    <form
      className="flex flex-col gap-4 col-span-1 md:col-span-2 pb-4"
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
                <div className="flex items-center gap-2">
                  <div className="bg-indigo-500 rounded-lg p-2">
                    <Users className="size-4 text-foreground" />
                  </div>
                  <FieldLabel htmlFor={field.name}>Paciente</FieldLabel>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant={"secondary"} className={"justify-start"} disabled={isPendingPatients}>
                        {isPendingPatients
                          ? "Loading patients..."
                          : field.state.value
                            ? mapPatient(patients?.find((p) => p.id === field.state.value)!).label
                            : "Buscar paciente"}
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
                        setData((prev) => ({
                          ...prev,
                          patient: { name: item.label, email: patients?.find((p) => p.id === item.id)?.email || "" },
                        }));
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
      <FieldGroup className="bg-card p-4 rounded-2xl">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-500 rounded-lg p-2">
            <CalendarDays className="size-4 text-foreground" />
          </div>
          <FieldLabel>Fecha y hora</FieldLabel>
        </div>
        <form.Field name="date">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid} className="">
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
                  <DropdownMenuContent className={"w-[300px]"}>
                    <Calendar
                      mode="single"
                      className="w-full"
                      disabled={{
                        before: new Date(),
                      }}
                      selected={field.state.value ? new Date(field.state.value) : undefined}
                      onSelect={(date) => {
                        if (!date) return;
                        field.handleChange(date.toISOString());
                        setData((prev) => ({ ...prev, date }));
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
              <Field data-invalid={isInvalid} className="">
                <FieldLabel htmlFor={field.name}>Hora</FieldLabel>
                <div className="grid grid-cols-5 gap-2">
                  {isFetchingAvailabilities ? (
                    <div>
                      <Loader2 className="animate-spin" />
                    </div>
                  ) : (
                    <>
                      {hourOptions.length == 0 ? (
                        <div>
                          <Button variant={"outline"} className="justify-start cursor-not-allowed" disabled>
                            <Clock3 className="size-4 " />
                            No hay horas disponibles
                          </Button>
                        </div>
                      ) : (
                        <>
                          {hourOptions.map((option) => (
                            <Button
                              key={option.id}
                              variant={field.state.value === option.id ? "default" : "outline"}
                              className="justify-start"
                              onClick={() => {
                                field.handleChange(option.id);
                                setData((prev) => ({ ...prev, time: option.label }));
                              }}
                              disabled={option.state !== "AVAILABLE"}
                            >
                              <Clock3 className="size-4 " />
                              {option.label}
                            </Button>
                          ))}
                        </>
                      )}
                    </>
                  )}
                </div>
              </Field>
            );
          }}
        </form.Field>
        <div>
          <p className="text-xs text-muted-foreground">
            Las horas en gris no están disponibles para agendar. Si necesitas agendar en una hora no disponible, por
            favor contacta a tu paciente para coordinar un horario alternativo.
          </p>
        </div>
      </FieldGroup>

      <FieldGroup className="bg-card p-4 rounded-2xl">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-500 rounded-lg p-2">
            <ListCollapse className="size-4 text-foreground" />
          </div>
          <FieldLabel>Detalles</FieldLabel>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <form.Field name="type">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Tipo</FieldLabel>
                  <Select
                    onValueChange={(value) => {
                      field.handleChange(value ?? "");
                      setData((prev) => ({ ...prev, type: appointmentTypes[value as keyof typeof appointmentTypes] }));
                    }}
                    value={field.state.value}
                    defaultValue={field.state.value}
                  >
                    <SelectTrigger>
                      {field.state.value
                        ? appointmentTypes[field.state.value as keyof typeof appointmentTypes]
                        : "Select a mode"}
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(appointmentTypes).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              );
            }}
          </form.Field>
          <form.Field name="mode">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid} className="space-y-2">
                  <FieldLabel htmlFor={field.name}>Modalidad</FieldLabel>
                  <RadioGroup
                    defaultValue={field.state.value}
                    value={field.state.value}
                    className="w-fit flex items-center gap-5"
                    onValueChange={(value) => {
                      field.handleChange(value);
                      setData((prev) => ({ ...prev, mode: value }));
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="IN_PERSON" id="r2" />
                      <MapPin className="size-3" />
                      <Label htmlFor="r2">Presencial</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="ONLINE" id="r3" />
                      <Video className="size-3" />
                      <Label htmlFor="r3">Online</Label>
                    </div>
                  </RadioGroup>
                </Field>
              );
            }}
          </form.Field>
        </div>
        <form.Field name="reason">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Motivo de la consulta</FieldLabel>
                <Textarea
                  placeholder="e.g Dolor de cabeza persistente desde hace 3 días"
                  value={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                    setData((prev) => ({ ...prev, motive: e.target.value }));
                  }}
                ></Textarea>
              </Field>
            );
          }}
        </form.Field>
      </FieldGroup>
      <FieldGroup className="bg-card p-4 rounded-2xl">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-500 rounded-lg p-2">
            <CircleDollarSign className="size-4 text-foreground" />
          </div>
          <FieldLabel>Tarifa</FieldLabel>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <form.Field name="amount">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Monto</FieldLabel>
                  <Select
                    onValueChange={(value) => {
                      field.handleChange(value ?? 0);
                      setData((prev) => ({ ...prev, amount: value ? Number(value) : 0 }));
                    }}
                    value={field.state.value}
                    defaultValue={field.state.value}
                  >
                    <SelectTrigger>{field.state.value ? `$ ${field.state.value}` : "Escoge una tarifa"}</SelectTrigger>
                    <SelectContent>
                      {doctor?.prices?.map((price) => (
                        <SelectItem key={price.id} value={price.amount}>
                          $ {price.amount}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              );
            }}
          </form.Field>
          <form.Field name="payment_mode">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Modalidad de pago</FieldLabel>
                  <Select
                    onValueChange={(value) => {
                      field.handleChange(value ?? "");
                      setData((prev) => ({ ...prev, payment_mode: value ? value : "" }));
                    }}
                    value={field.state.value}
                    defaultValue={field.state.value}
                  >
                    <SelectTrigger>
                      {field.state.value
                        ? `${
                            field.state.value === "PREPAID"
                              ? "Prepago"
                              : field.state.value === "POSTPAID"
                                ? "Pospago"
                                : field.state.value === "CREDIT"
                                  ? "Crédito"
                                  : field.state.value
                          }`
                        : "Escoge una tarifa"}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={"PREPAID"}>Prepago</SelectItem>
                      <SelectItem value={"POSTPAID"}>Pospago</SelectItem>
                      <SelectItem value={"CREDIT"}>Crédito</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              );
            }}
          </form.Field>
        </div>
      </FieldGroup>
      <div className="flex justify-end">
        <Button type="reset" variant={"outline"} onClick={() => router.back()} className={"mr-2"}>
          Cancelar
        </Button>
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(disabled) => (
            <Button type="submit" disabled={disabled} className={"cursor-pointer"}>
              {disabled ? <Loader2 className="animate-spin" /> : "Agendar"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
};

