/**
 * ============================================================
 *  RecordingProgress
 *  Horizontal progress bar shown at the top of camera during
 *  recording. Uses the recording gradient (red → orange) and
 *  fills based on elapsed time vs max duration.
 * ============================================================
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { GRADIENTS } from '@/constants/theme';
import { useAppSelector } from '@/store/hooks';

// ─── Component ──────────────────────────────────────────────

export function RecordingProgress() {
  const isRecording = useAppSelector((s) => s.camera.isRecording);
  const recordingDurationMs = useAppSelector((s) => s.camera.recordingDurationMs);
  const maxDuration = useAppSelector((s) => s.camera.maxDuration);

  if (!isRecording) return null;

  const progress = Math.min(recordingDurationMs / (maxDuration * 1000), 1);
  const gradientColors = GRADIENTS.recording as unknown as [string, string, ...string[]];

  return (
    <View className="absolute top-0 left-0 right-0 z-20" style={{ height: 3 }}>
      {/* Track */}
      <View className="flex-1 bg-white/10">
        {/* Fill */}
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { width: `${progress * 100}%` }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    height: 3,
    borderTopRightRadius: 1.5,
    borderBottomRightRadius: 1.5,
  },
});

export default RecordingProgress;
