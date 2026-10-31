import { useCallback } from 'react';
import { useToast } from '../context/ToastContext';

export function useShareCode() {
  const { showToast } = useToast();

  const shareTeamCode = useCallback(
    async (teamName: string, joinCode: string) => {
      const shareText = `Join my team '${teamName}' on Credly with code ${joinCode}`;

      try {
        if (navigator.share) {
          await navigator.share({
            title: `Credly - Join ${teamName}`,
            text: shareText,
          });
          showToast(`Team code ${joinCode} shared!`);
          return;
        }
      } catch (err) {
        // User cancelled share or not supported -> fall back to clipboard
      }

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(shareText);
          showToast(`Code ${joinCode} copied. Send it to your teammates.`);
        } else {
          showToast(`Team code: ${joinCode}`);
        }
      } catch (err) {
        showToast(`Team code: ${joinCode}`);
      }
    },
    [showToast]
  );

  return { shareTeamCode };
}
