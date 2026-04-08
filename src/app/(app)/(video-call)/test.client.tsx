"use client";
import { userInfo } from "os";
import { useEffect, useRef, useState } from "react";

export const TestJitsi = () => {
  const containerRef = useRef(null);
  const apiRef = useRef(null);
  const [estado, setEstado] = useState("cargando"); // cargando | listo | error
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://localhost/external_api.js`;
    script.async = true;

    script.onload = () => {
      try {
        apiRef.current = new (window as any).JitsiMeetExternalAPI("localhost", {
          roomName: "sala-de-prueba-local",
          parentNode: containerRef.current,
          width: "100%",
          height: "100%",
          userInfo: {
            displayName: "Josem - Prueba Local",
            email: "ducen29@gmail.com",
          },
          configOverwrite: {
            startWithVideoMuted: false,
            startWithAudioMuted: false,
            prejoinPageEnabled: false,
            disableThirdPartyRequests: true,
            enableNoisyMicDetection: true,
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: ["microphone", "camera", "desktop", "chat", "recording", "hangup", "settings"],
            SHOW_JITSI_WATERMARK: false,
            SHOW_BRAND_WATERMARK: false,
            DEFAULT_BACKGROUND: "#1a1a2e",
          },
          // Sin JWT para pruebas locales (si ENABLE_AUTH=0 en tu .env de Jitsi)
        });

        (apiRef as any)?.current?.addEventListener("videoConferenceJoined", () => {
          setEstado("listo");
          console.log("✅ Conectado a Jitsi local");
        });

        (apiRef as any)?.current?.addEventListener("errorOccurred", (e: any) => {
          setEstado("error");
          setError(e.error?.message || "Error desconocido");
          console.error("❌ Error Jitsi:", e);
        });
      } catch (e: any) {
        setEstado("error");
        setError(e.message);
      }
    };

    script.onerror = () => {
      setEstado("error");
      setError(`No se pudo cargar external_api.js. Abre https://localhost:800 y acepta el certificado.`);
    };

    document.head.appendChild(script);

    return () => {
      (apiRef as any)?.current?.dispose();
      document.head.removeChild(script);
    };
  }, []);
  return <div id="jitsi-container" style={{ height: "100%", width: "100%" }} ref={containerRef}></div>;
};

