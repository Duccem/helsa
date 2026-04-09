import { VideoCall } from "../domain/video-call";
import { VideoCallAuthService } from "../domain/video-call-auth-service";
import jwt from "jsonwebtoken";

export class JwtVideoCallAuthService extends VideoCallAuthService {
  async getDoctorToken(videoCall: VideoCall): Promise<string> {
    const data = videoCall.toPrimitives();
    const token = jwt.sign(
      {
        iss: process.env.JITSI_APP_ID, // debe coincidir con JWT_APP_ID
        sub: process.env.JITSI_DOMAIN, // debe coincidir con JWT_DOMAIN
        aud: "jitsi",
        room: `consulta-${data.appointment_id}`, // esto debería ser dinámico según la cita
        exp: Math.floor(Date.now() / 1000) + 7200, // 2 horas
        context: {
          user: {
            name: data.doctor?.name,
            email: data.doctor?.email,
            moderator: true, // el médico es moderador
          },
          features: {
            recording: true, // el médico puede grabar
            livestreaming: false,
          },
        },
      },
      process.env.JITSI_APP_SECRET ?? "helsa_video_secret", // debe coincidir con JWT_APP_SECRET
    );
    return token;
  }

  async getPatientToken(videoCall: VideoCall): Promise<string> {
    return jwt.sign(
      {
        iss: process.env.JITSI_APP_ID, // debe coincidir con JWT_APP_ID
        sub: process.env.JITSI_DOMAIN, // debe coincidir con JWT_DOMAIN
        aud: "jitsi",
        room: `consulta-${videoCall.appointment_id}`,
        exp: Math.floor(Date.now() / 1000) + 7200,
        context: {
          user: {
            name: videoCall.patient?.name,
            email: videoCall.patient?.email,
            moderator: false, // el paciente no es moderador
          },
          features: {
            recording: false, // el paciente no puede grabar
            livestreaming: false,
          },
        },
      },
      process.env.JITSI_APP_SECRET ?? "helsa_video_secret",
    );
  }
}

