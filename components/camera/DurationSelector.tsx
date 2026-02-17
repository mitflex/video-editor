/**
 * ============================================================
 *  DurationSelector
 *  Row of AnimatedPill buttons to select max recording duration
 *  (10s / 30s / 60s). Shown above the record button when not
 *  recording.
 * ============================================================
 */

import React, { useCallback } from 'react';
import { View } from 'react-native';

import { AnimatedPill } from '@/components/ui/AnimatedPill';
import { DURATION_OPTIONS, type DurationValue } from '@/constants/filters';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setMaxDuration } from '@/store/slices/cameraSlice';

// ─── Component ──────────────────────────────────────────────

export function DurationSelector() {
  const dispatch = useAppDispatch();
  const maxDuration = useAppSelector((s) => s.camera.maxDuration);
  const isRecording = useAppSelector((s) => s.camera.isRecording);

  const handleSelect = useCallback(
    (value: DurationValue) => {
      dispatch(setMaxDuration(value));
    },
    [dispatch]
  );

  // Hide during recording
  if (isRecording) return null;

  return (
    <View className="flex-row items-center justify-center gap-2">
      {DURATION_OPTIONS.map((option) => (
        <AnimatedPill
          key={option.value}
          label={option.label}
          active={maxDuration === option.value}
          onPress={() => handleSelect(option.value)}
          gradient="warm"
          size="sm"
        />
      ))}
    </View>
  );
}

export default DurationSelector;
