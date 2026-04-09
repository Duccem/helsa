import { database } from "@/modules/shared/infrastructure/database/client";
import { VideoCall, VideoCallAppointmentId, VideoCallId } from "../../domain/video-call";
import { VideoCallRepository } from "../../domain/video-call-repository";
import { video_call } from "./video-call.schema";
import { eq } from "drizzle-orm";
import { appointment } from "@/modules/appointment/infrastructure/persistence/appointment.schema";
import { doctor } from "@/modules/doctor/infrastructure/persistence/doctor.schema";
import { patient } from "@/modules/patient/infrastructure/persistence/patient.schema";
import { user } from "@/modules/auth/infrastructure/persistence/auth.schema";

export class DrizzleVideoCallRepository extends VideoCallRepository {
  async create(videoCall: VideoCall): Promise<void> {
    const data = videoCall.toPrimitives();
    await database.insert(video_call).values(data);
  }

  async findById(id: VideoCallId): Promise<VideoCall | null> {
    const items = await database
      .select({
        id: video_call.id,
        appointment_id: video_call.appointment_id,
        doctor: {
          id: doctor.id,
          name: user.name,
          email: user.email,
        },
        patient: {
          id: patient.id,
          name: patient.name,
          email: patient.email,
        },
      })
      .from(video_call)
      .where(eq(video_call.id, id.value))
      .leftJoin(appointment, eq(video_call.appointment_id, appointment.id))
      .leftJoin(doctor, eq(appointment.doctor_id, doctor.id))
      .leftJoin(patient, eq(appointment.patient_id, patient.id))
      .leftJoin(user, eq(doctor.user_id, user.id))
      .limit(1);
    const videoCallData = items[0];
    if (videoCallData) {
      return VideoCall.fromPrimitives({
        id: videoCallData.id,
        appointment_id: videoCallData.appointment_id,
        doctor: {
          id: videoCallData.doctor.id ?? "",
          name: videoCallData.doctor.name ?? "",
          email: videoCallData.doctor.email ?? "",
        },
        patient: {
          id: videoCallData.patient?.id ?? "",
          name: videoCallData.patient?.name ?? "",
          email: videoCallData.patient?.email ?? "",
        },
      });
    }
    return null;
  }

  async findByAppointmentId(appointmentId: VideoCallAppointmentId): Promise<VideoCall | null> {
    const items = await database
      .select({
        id: video_call.id,
        appointment_id: video_call.appointment_id,
        doctor: {
          id: doctor.id,
          name: user.name,
          email: user.email,
        },
        patient: {
          id: patient.id,
          name: patient.name,
          email: patient.email,
        },
      })
      .from(video_call)
      .where(eq(video_call.appointment_id, appointmentId.value))
      .leftJoin(appointment, eq(video_call.appointment_id, appointment.id))
      .leftJoin(doctor, eq(appointment.doctor_id, doctor.id))
      .leftJoin(patient, eq(appointment.patient_id, patient.id))
      .leftJoin(user, eq(doctor.user_id, user.id))
      .limit(1);
    const videoCallData = items[0];
    if (videoCallData) {
      return VideoCall.fromPrimitives({
        id: videoCallData.id,
        appointment_id: videoCallData.appointment_id,
        doctor: {
          id: videoCallData.doctor.id ?? "",
          name: videoCallData.doctor.name ?? "",
          email: videoCallData.doctor.email ?? "",
        },
        patient: {
          id: videoCallData.patient?.id ?? "",
          name: videoCallData.patient?.name ?? "",
          email: videoCallData.patient?.email ?? "",
        },
      });
    }
    return null;
  }
}

