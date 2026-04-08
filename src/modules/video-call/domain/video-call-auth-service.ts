import { VideoCall } from "./video-call";

export abstract class VideoCallAuthService {
  abstract getDoctorToken(videoCall: VideoCall): Promise<string>;
  abstract getPatientToken(videoCall: VideoCall): Promise<string>;
}

