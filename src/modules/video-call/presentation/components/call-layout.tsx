"use client";

import { Activity, CheckCircle2, HeartPulse, PhoneOff, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { type CSSProperties, useEffect, useState } from "react";
import { authClient } from "@/modules/auth/infrastructure/auth-client";
import { Badge } from "@/modules/shared/presentation/components/ui/badge";
import { Button } from "@/modules/shared/presentation/components/ui/button";
import { Sidebar, SidebarInset, SidebarProvider } from "@/modules/shared/presentation/components/ui/sidebar";
import { useCallAppointment } from "../hooks/use-call-appointment";
import { useJitsi } from "../hooks/use-jitsi";
import { CallControls } from "./call-controls";
import { CallHeader } from "./call-header";
import { CallSidebar } from "./call-sidebar";

const CONTAINER_ID = "jitsi-container";

export const CallLayout = () => {
  const router = useRouter();
  const { data } = authClient.useSession();
  const [token] = useQueryState("token");
  const [appointmentId] = useQueryState("appointmentId", parseAsString.withDefault(""));
  const [hasMounted, setHasMounted] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<"chat" | "patient" | "notes" | "ai">("chat");
  const [showLiveAssistant, setShowLiveAssistant] = useState(true);
  const [showLiveVitals, setShowLiveVitals] = useState(true);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const canManageConsultation = data ? data.user.role === "doctor" : false;

  const displayName = data?.user.name ?? "Usuario";
  const { appointment, patient } = useCallAppointment(appointmentId);
  const latestVitals = patient?.vitals?.[0];

  const { controls, state } = useJitsi({
    containerId: CONTAINER_ID,
    jwt: token ?? "",
    roomName: `consulta-${appointmentId}`,
    userInfo: {
      displayName,
      email: data?.user.email ?? "",
    },
  });

  return (
    <div className="h-screen overflow-hidden ">
      <div className="flex h-full flex-col overflow-hidden">
        <SidebarProvider defaultOpen className="min-h-0 flex-1" style={{ "--sidebar-width": "23rem" } as CSSProperties}>
          <SidebarInset className="min-h-0 bg-transparent shadow-none">
            <div className="min-h-0 flex-1 p-2 md:p-3">
              <div className="relative h-full min-h-[360px] overflow-hidden rounded-[26px] bg-[#262627] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                {!hasMounted ? (
                  <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.08),_transparent_28%)] px-6">
                    <div className="rounded-full border border-white/10 bg-background/90 px-4 py-2 text-sm text-muted-foreground backdrop-blur">
                      Preparando videollamada...
                    </div>
                  </div>
                ) : null}

                {hasMounted && !state.hasCallEnded ? (
                  <>
                    <div id={CONTAINER_ID} className="jitsi-custom absolute inset-0 h-full w-full" />

                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.08),_transparent_28%)]" />

                    <div className="absolute inset-x-0 top-0 z-20 p-2 md:p-3">
                      <CallHeader
                        title="Consulta médica"
                        participantsCount={state.participantsCount}
                        isRecording={state.isRecording}
                        callStartedAt={state.callStartedAt}
                        showLiveAssistant={showLiveAssistant}
                        showLiveVitals={showLiveVitals}
                        onToggleLiveAssistantAction={() => setShowLiveAssistant((current) => !current)}
                        onToggleLiveVitalsAction={() => setShowLiveVitals((current) => !current)}
                        canManageConsultation={canManageConsultation}
                      />
                    </div>

                    {canManageConsultation && showLiveAssistant ? (
                      <div className="pointer-events-none absolute left-4 top-24 z-10 max-w-[280px] rounded-2xl border border-white/10 bg-background/96 p-3 text-indigo-500 shadow-lg backdrop-blur md:left-5 md:top-28">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                            <Sparkles className="size-3.5" />
                            AI Live Assist
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => setShowLiveAssistant(false)}
                            className="pointer-events-auto rounded-full text-muted-foreground hover:text-foreground"
                          >
                            <X />
                          </Button>
                        </div>
                        <p className="mt-2 text-sm text-accent-foreground">
                          {appointment?.motive
                            ? `Consulta activa por ${appointment.motive.toLowerCase()}. Usa el panel lateral para documentar notas y evolución.`
                            : "Paciente conectado. Registra signos vitales y notas desde el panel lateral."}
                        </p>
                      </div>
                    ) : null}

                    {canManageConsultation && showLiveVitals ? (
                      <div className="pointer-events-none absolute right-4 top-24 z-10 rounded-2xl border border-border bg-background/96 p-3 text-indigo-500 shadow-lg backdrop-blur md:right-5 md:top-28">
                        <div className="flex items-start justify-between gap-3">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            Live Vitals
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => setShowLiveVitals(false)}
                            className="pointer-events-auto rounded-full text-muted-foreground hover:text-foreground"
                          >
                            <X />
                          </Button>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-3 text-xs">
                          <div className="flex items-center gap-1.5">
                            <HeartPulse className="size-3.5 text-rose-500" />
                            <span className="text-accent-foreground">
                              BP {latestVitals?.blood_pressure ? `${latestVitals.blood_pressure}/80` : "--"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Activity className="size-3.5 text-violet-500" />
                            <span className="text-accent-foreground">
                              HR {latestVitals?.heart_rate ? `${latestVitals.heart_rate} bpm` : "--"}
                            </span>
                          </div>
                          <Badge variant="outline" className="rounded-full text-[10px]">
                            SpO₂ {latestVitals?.oxygen_saturation ? `${latestVitals.oxygen_saturation}%` : "--"}
                          </Badge>
                        </div>
                      </div>
                    ) : null}

                    <div className="absolute inset-x-0 bottom-0 z-20 p-3 md:p-4">
                      <CallControls
                        isMicMuted={state.isMicMuted}
                        isCameraMuted={state.isCameraMuted}
                        isScreenSharing={state.isScreenSharing}
                        isChatOpen={sidebarTab === "chat"}
                        canManageConsultation={canManageConsultation}
                        isDoctorPanelOpen={sidebarTab !== "chat"}
                        unreadMessages={state.unreadMessages}
                        devices={state.devices}
                        currentDevices={state.currentDevices}
                        onToggleMicAction={controls.toggleMic}
                        onToggleCameraAction={controls.toggleCamera}
                        onToggleScreenShareAction={controls.toggleScreenShare}
                        onToggleChatAction={() => {
                          setSidebarTab("chat");
                          if (!state.isChatOpen) {
                            controls.toggleChat();
                          }
                        }}
                        onToggleDoctorPanelAction={() => {
                          const nextTab = sidebarTab === "patient" ? "notes" : "patient";
                          setSidebarTab(nextTab);
                          if (state.isChatOpen) {
                            controls.toggleChat();
                          }
                        }}
                        onHangupAction={controls.hangup}
                        onSelectAudioInputAction={controls.setAudioInputDevice}
                        onSelectAudioOutputAction={controls.setAudioOutputDevice}
                        onSelectVideoInputAction={controls.setVideoInputDevice}
                      />
                    </div>
                  </>
                ) : null}

                {hasMounted && state.hasCallEnded ? (
                  <div className="relative flex h-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(88,28,135,0.18),_transparent_28%),linear-gradient(180deg,rgba(18,18,20,0.96),rgba(10,10,12,1))] px-6">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.08),_transparent_52%)]" />
                    <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center rounded-[28px] border border-white/10 bg-background/92 p-8 text-center shadow-2xl backdrop-blur md:p-10">
                      <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <CheckCircle2 className="size-8" />
                      </div>

                      <div className="mt-6 space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                          Consulta finalizada
                        </p>
                        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                          La videollamada ha terminado
                        </h2>
                        <p className="mx-auto max-w-xl text-sm leading-6 text-muted-foreground">
                          Cerramos la sesión en tiempo real y ocultamos el visor de Jitsi. Puedes volver al inicio o
                          recargar esta pantalla si necesitas reingresar a la llamada.
                        </p>
                      </div>

                      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2">
                          <PhoneOff className="size-4 text-primary" />
                          Sesión desconectada
                        </div>
                        {state.callEndedAt ? (
                          <div className="rounded-full border border-border bg-background px-3 py-2">
                            Finalizada{" "}
                            {new Date(state.callEndedAt).toLocaleTimeString("es-ES", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        ) : null}
                      </div>

                      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                        <Button type="button" size="lg" onClick={() => router.push("/home")}>
                          Ir al inicio
                        </Button>
                        <Button type="button" variant="outline" size="lg" onClick={() => window.location.reload()}>
                          Reabrir llamada
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </SidebarInset>

          {hasMounted && !state.hasCallEnded ? (
            <Sidebar side="right" variant="sidebar" collapsible="offcanvas" className="border-l-0">
              <div className="flex h-full flex-col bg-background text-foreground">
                <CallSidebar
                  appointmentId={appointmentId}
                  currentUserName={displayName}
                  messages={state.messages}
                  activeTab={sidebarTab}
                  canManageConsultation={canManageConsultation}
                  onTabChangeAction={(tab) => {
                    setSidebarTab(tab);
                    if (tab === "chat" && !state.isChatOpen) {
                      controls.toggleChat();
                    }
                    if (tab !== "chat" && state.isChatOpen) {
                      controls.toggleChat();
                    }
                  }}
                  onSendMessageAction={controls.sendMessage}
                />
              </div>
            </Sidebar>
          ) : null}
        </SidebarProvider>
      </div>
    </div>
  );
};

