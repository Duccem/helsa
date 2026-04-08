"use client";

import { parseAsString, useQueryState } from "nuqs";
import { useJitsi } from "../hooks/use-jitsi";
import { authClient } from "@/modules/auth/infrastructure/auth-client";

const CONTAINER_ID = "jitsi-container";

export const CallLayout = () => {
  const { data } = authClient.useSession();
  const [token] = useQueryState("token");
  const [appointmentId] = useQueryState("appointmentId", parseAsString.withDefault(""));
  useJitsi({
    containerId: CONTAINER_ID,
    jwt: token ?? "",
    roomName: "consulta-" + appointmentId,
    userInfo: {
      displayName: data?.user.name ?? "Usuário",
      email: data?.user.email ?? "",
    },
  });

  return (
    <div className="w-full h-screen">
      <div id={CONTAINER_ID} className="w-full h-full" />
    </div>
  );
};

