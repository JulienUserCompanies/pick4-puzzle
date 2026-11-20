import { useCallback } from 'react';
import { useAudioPlayer, AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useProgress } from '../storage/ProgressContext';

/**
 * Tap/correct/wrong/win sound effects + matching haptics, gated by the
 * player's own Settings toggles (progress.soundEnabled / hapticsEnabled).
 * Call this once per screen that needs feedback — each call creates its
 * own short-lived set of players tied to that screen's lifecycle.
 */
export function useFeedback() {
  const { progress } = useProgress();

  const tapPlayer = useAudioPlayer(require('../../assets/sounds/tap.wav'));
  const correctPlayer = useAudioPlayer(require('../../assets/sounds/correct.wav'));
  const wrongPlayer = useAudioPlayer(require('../../assets/sounds/wrong.wav'));
  const winPlayer = useAudioPlayer(require('../../assets/sounds/win.wav'));

  const replay = useCallback(
    (player: AudioPlayer) => {
      if (!progress.soundEnabled) return;
      // Rewind first so rapid repeat taps always restart from the top
      // instead of overlapping mid-sound or doing nothing while still playing.
      player.seekTo(0).finally(() => player.play());
    },
    [progress.soundEnabled]
  );

  const haptic = useCallback(
    (fn: () => void) => {
      if (!progress.hapticsEnabled) return;
      fn();
    },
    [progress.hapticsEnabled]
  );

  const tap = useCallback(() => {
    replay(tapPlayer);
    haptic(() => Haptics.selectionAsync());
  }, [replay, tapPlayer, haptic]);

  const correct = useCallback(() => {
    replay(correctPlayer);
    haptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
  }, [replay, correctPlayer, haptic]);

  const wrong = useCallback(() => {
    replay(wrongPlayer);
    haptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));
  }, [replay, wrongPlayer, haptic]);

  const win = useCallback(() => {
    replay(winPlayer);
    haptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
  }, [replay, winPlayer, haptic]);

  return { tap, correct, wrong, win };
}
