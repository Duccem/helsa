import type { BetterUser } from "@helsa/auth";
import { isEncryptionConfigured, openText } from "@/lib/infra/clinical-cipher";
import { isGuestKey, jitsiServer, signJitsiToken } from "@/lib/infra/jitsi";
import { isUuid } from "@/lib/utils/is-uuid";
import { AppointmentRepository } from "../../appointment/adapters/appointment-repository";
import { NoteRepository } from "../../note/adapters/note-repository";
import { VideoRepository } from "../adapters/video-repository";
import { VideoAccessDenied, VideoSessionNotFound } from "../domain/errors";
import type { VideoRole, VideoRoom } from "../domain/types";
import { roomWindow } from "../domain/window";
import { EnsureVideoRoom } from "./ensure-video-room";

type LoadVideoSessionInput = {
  appointmentId: string;
  /** The `k` of the patient's link, for someone not signed in. */
  key?: string;
  now?: Date;
};

type Session = NonNullable<
  Awaited<ReturnType<AppointmentRepository["getForVideo"]>>
>;

export type VideoSessionState =
  | "open"
  | "early"
  | "closed"
  | "ended"
  | "cancelled";

export class LoadVideoSession {
  private appointments = new AppointmentRepository();
  private repository = new VideoRepository();
  private rooms = new EnsureVideoRoom();
  private notes = new NoteRepository();

  async execute(data: LoadVideoSessionInput, user: BetterUser | null) {
    if (!isUuid(data.appointmentId)) {
      throw new VideoSessionNotFound();
    }
    const session = await this.appointments.getForVideo(data.appointmentId);

    if (!session || session.modality !== "video") {
      throw new VideoSessionNotFound();
    }

    const role = await this.roleOf(session, data.key, user);
    // Only the people of the appointment create its room; a guest needs one to exist.
    const room =
      role === "guest"
        ? await this.repository.getByAppointment(session.id)
        : await this.rooms.execute(session);

    if (!room) {
      throw new VideoAccessDenied();
    }

    const now = data.now ?? new Date();
    const state = this.stateOf(session, room, now);
    const base = this.toBase(session, room, role, state);

    if (state !== "open") {
      return { ...base, join: null, notes: null };
    }

    const join = this.joinOf(session, room, role, user, now);
    const notes = role === "therapist" ? await this.notesOf(session) : null;

    return { ...base, join, notes };
  }

  private async roleOf(
    session: Session,
    key: string | undefined,
    user: BetterUser | null,
  ): Promise<VideoRole> {
    if (user && user.id === session.therapist_id) return "therapist";
    if (user && session.patient_user_id && user.id === session.patient_user_id)
      return "patient";

    if (key) {
      const room = await this.repository.getByAppointment(session.id);
      if (room && isGuestKey(key, room.patient_join_token_hash)) return "guest";
    }

    throw new VideoAccessDenied();
  }

  private stateOf(
    session: Session,
    room: VideoRoom,
    now: Date,
  ): VideoSessionState {
    if (session.status === "cancelled" || session.status === "no_show")
      return "cancelled";
    if (room.ended_at || session.status === "completed") return "ended";

    const window = roomWindow(session.starts_at, session.ends_at);
    if (now < window.opens_at) return "early";
    if (now > window.closes_at) return "closed";
    return "open";
  }

  private toBase(
    session: Session,
    room: VideoRoom,
    role: VideoRole,
    state: VideoSessionState,
  ) {
    const window = roomWindow(session.starts_at, session.ends_at);
    return {
      appointmentId: session.id,
      role,
      state,
      startsAt: session.starts_at.toISOString(),
      endsAt: session.ends_at.toISOString(),
      opensAt: window.opens_at.toISOString(),
      closesAt: window.closes_at.toISOString(),
      startedAt: room.started_at?.toISOString() ?? null,
      timezone:
        role === "therapist"
          ? session.therapist_timezone
          : session.patient_timezone,
      therapist: {
        name: session.therapist_name,
        title: session.therapist_title,
      },
      patient: {
        name: this.patientName(session),
        // The record id is for the therapist's notes; patients don't need it.
        id: role === "therapist" ? session.patient_id : null,
      },
    };
  }

  private joinOf(
    session: Session,
    room: VideoRoom,
    role: VideoRole,
    user: BetterUser | null,
    now: Date,
  ) {
    const server = jitsiServer();
    const window = roomWindow(session.starts_at, session.ends_at);
    const moderator = role === "therapist";

    // Guests have no token: Jitsi lets them in as plain participants once the therapist is there.
    const jwt =
      user && role !== "guest"
        ? signJitsiToken({
            room: room.room_name,
            user: {
              id: user.id,
              name: moderator
                ? session.therapist_name
                : this.patientName(session),
              email: user.email,
              avatar: user.image,
            },
            moderator,
            notBefore: new Date(
              Math.min(now.getTime(), window.opens_at.getTime()) - 60_000,
            ),
            expiresAt: window.closes_at,
          })
        : null;

    return {
      ...server,
      roomName: room.room_name,
      jwt,
      moderator,
      displayName: moderator
        ? session.therapist_name
        : this.patientName(session),
      email: role === "guest" ? null : (user?.email ?? null),
    };
  }

  /** The draft the therapist keeps writing during the call, if one exists. */
  private async notesOf(session: Session) {
    if (!isEncryptionConfigured()) {
      return { available: false, draft: null };
    }
    const draft = await this.notes.getDraftByAppointment(
      session.id,
      session.therapist_id,
    );
    if (!draft) {
      return { available: true, draft: null };
    }
    const body = openText(
      draft.content_enc,
      session.therapist_id,
      draft.enc_key_version,
    );
    if (body.locked) {
      return { available: false, draft: null };
    }

    return {
      available: true,
      draft: {
        id: draft.id,
        title: draft.title ?? "",
        content: body.text ?? "",
      },
    };
  }

  private patientName(session: Session) {
    const first = session.preferred_name?.trim() || session.first_name;
    return `${first} ${session.last_name}`.trim();
  }
}

export type VideoSession = Awaited<ReturnType<LoadVideoSession["execute"]>>;
