import { useQuery } from "@tanstack/react-query";

type Participant = "doctor" | "patient";

export function useVideoCallToken(appointmentId: string | undefined, participant: Participant) {
  const { data, isFetching } = useQuery<{ token: string } | null>({
    queryKey: ["video-call-token", participant, appointmentId],
    initialData: null,
    refetchOnWindowFocus: false,
    enabled: !!appointmentId,
    queryFn: async () => {
      const response = await fetch(`/api/video-call/${appointmentId}/${participant}-token`);
      if (!response.ok) {
        throw new Error("Failed to fetch video call token");
      }
      return response.json();
    },
  });

  return { token: data?.token ?? null, isFetchingToken: isFetching };
}
