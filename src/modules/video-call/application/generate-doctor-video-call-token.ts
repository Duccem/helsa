import { VideoCallAppointmentId } from "../domain/video-call";
import { VideoCallAuthService } from "../domain/video-call-auth-service";
import { VideoCallParticipantNotFound } from "../domain/video-call-participant-not-found";
import { VideoCallRepository } from "../domain/video-call-repository";
import { VideoCallNotFound } from "../domain/video-call-not-found";

export class GenerateDoctorVideoCallToken {
  constructor(
    private readonly videoCallRepository: VideoCallRepository,
    private readonly videoCallAuthService: VideoCallAuthService,
  ) {}

  async execute(appointment_id: string): Promise<string> {
    const appointmentId = new VideoCallAppointmentId(appointment_id);
    const videoCall = await this.videoCallRepository.findByAppointmentId(appointmentId);

    if (!videoCall) {
      throw new VideoCallNotFound(appointment_id);
    }

    if (!videoCall.doctor) {
      throw new VideoCallParticipantNotFound("doctor", appointment_id);
    }

    return this.videoCallAuthService.getDoctorToken(videoCall);
  }
}
