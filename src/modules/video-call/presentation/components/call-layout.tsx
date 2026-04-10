"use client";

import { Activity, HeartPulse, Sparkles, X } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { type CSSProperties, useState } from "react";
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
  const { data } = authClient.useSession();
  const { data: role } = authClient.useActiveMemberRole();
  const [token] = useQueryState("token");
  const [appointmentId] = useQueryState("appointmentId", parseAsString.withDefault(""));
  const [sidebarTab, setSidebarTab] = useState<"chat" | "patient" | "notes" | "ai">("chat");
  const [showLiveAssistant, setShowLiveAssistant] = useState(true);
  const [showLiveVitals, setShowLiveVitals] = useState(true);
  const canManageConsultation = role ? (role.role === "doctor" ? true : false) : true;

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
                  />
                </div>

                {canManageConsultation && showLiveAssistant ? (
                  <>
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
                  </>
                ) : null}

                {canManageConsultation && showLiveVitals ? (
                  <>
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
                  </>
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
              </div>
            </div>
          </SidebarInset>

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
        </SidebarProvider>
      </div>

      <style jsx global>{`
        .jitsi-custom iframe {
          border: 0 !important;
          width: 100% !important;
          height: 100% !important;
          background: #262627 !important;
        }
      `}</style>
    </div>
  );
};

