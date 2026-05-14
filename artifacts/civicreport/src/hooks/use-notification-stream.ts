import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getListNotificationsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";

export function useNotificationStream() {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token || !user || user.role === "guest" || user.role === "government") {
      return;
    }

    const url = `/api/notifications/stream?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);

    es.addEventListener("notification", () => {
      queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
    });

    return () => {
      es.close();
    };
  }, [token, user, queryClient]);
}
