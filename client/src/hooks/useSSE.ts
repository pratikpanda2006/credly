import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useSSE(teamId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!teamId) return;

    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;

    const apiBase = import.meta.env.VITE_API_URL || '';

    function connect() {
      try {
        eventSource = new EventSource(`${apiBase}/teams/${teamId}/events`, {
          withCredentials: true,
        });

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (['POST_CREATED', 'POST_DELETED', 'VOTE_CAST'].includes(data.type)) {
              queryClient.invalidateQueries({ queryKey: ['team-posts', teamId] });
              queryClient.invalidateQueries({ queryKey: ['team-analytics', teamId] });
              queryClient.invalidateQueries({ queryKey: ['teams'] });
            }
          } catch (e) {
            console.error('Failed to parse SSE data:', e);
          }
        };

        eventSource.onerror = () => {
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          // Attempt reconnect after 5s
          clearTimeout(reconnectTimeout);
          reconnectTimeout = setTimeout(connect, 5000);
        };
      } catch (err) {
        console.error('SSE initialization error:', err);
      }
    }

    connect();

    // Fallback polling every 15s as required by Section 2
    const pollInterval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['team-posts', teamId] });
      queryClient.invalidateQueries({ queryKey: ['team-analytics', teamId] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    }, 15000);

    return () => {
      clearInterval(pollInterval);
      clearTimeout(reconnectTimeout);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [teamId, queryClient]);
}
