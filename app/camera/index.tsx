/**
 * ============================================================
 *  Camera Recording Screen
 *  Full-screen camera with record button, controls, overlays,
 *  pause/resume, countdown, duration selector, and grid.
 *
 *  Recording flow:
 *    1. User selects duration (10s/30s/60s) via DurationSelector
 *    2. User presses record → countdown (if enabled) → startRecording
 *    3. Timer ticks every 100ms → dispatch setRecordingDuration
 *    4. User can pause/resume via pause button
 *    5. Auto-stops at maxDuration OR user presses stop
 *    6. onRecordingFinished → navigate to preview
 * ============================================================
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Alert, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { VideoFile } from 'react-native-vision-camera';

import { CameraView, type CameraViewHandle } from '@/components/camera/CameraView';
import { RecordButton } from '@/components/camera/RecordButton';
import { CameraControls } from '@/components/camera/CameraControls';
import { DurationSelector } from '@/components/camera/DurationSelector';
import { CountdownOverlay } from '@/components/camera/CountdownOverlay';
import { GridOverlay } from '@/components/camera/GridOverlay';
import { RecordingProgress } from '@/components/camera/RecordingProgress';
import { useCameraPermissions } from '@/hooks/useCameraPermissions';
import { COLORS, SPACING } from '@/constants/theme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setIsRecording,
  setIsPaused,
  setRecordingDuration,
  setCountdownRemaining,
  resetCamera,
} from '@/store/slices/cameraSlice';

// ─── Screen ─────────────────────────────────────────────────

export default function CameraScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const cameraRef = useRef<CameraViewHandle>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedRef = useRef<number>(0);

  const [showCountdown, setShowCountdown] = useState(false);

  const { allGranted, requestPermissions } = useCameraPermissions();

  const isRecording = useAppSelector((s) => s.camera.isRecording);
  const isPaused = useAppSelector((s) => s.camera.isPaused);
  const maxDuration = useAppSelector((s) => s.camera.maxDuration);
  const recordingDurationMs = useAppSelector((s) => s.camera.recordingDurationMs);
  const countdownDuration = useAppSelector((s) => s.camera.countdownDuration);

  // ── Request permissions on mount ────────────────────────

  useEffect(() => {
    if (!allGranted) {
      requestPermissions();
    }
  }, [allGranted, requestPermissions]);

  // ── Reset camera state on mount ─────────────────────────

  useEffect(() => {
    dispatch(resetCamera());
    return () => {
      stopTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  // ── Timer helpers ───────────────────────────────────────

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current + accumulatedRef.current;
      dispatch(setRecordingDuration(elapsed));
    }, 100);
  }, [dispatch]);

  const pauseTimer = useCallback(() => {
    stopTimer();
    accumulatedRef.current += Date.now() - startTimeRef.current;
  }, [stopTimer]);

  const resumeTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current + accumulatedRef.current;
      dispatch(setRecordingDuration(elapsed));
    }, 100);
  }, [dispatch]);

  // ── Auto-stop at max duration ───────────────────────────

  useEffect(() => {
    if (isRecording && !isPaused && recordingDurationMs >= maxDuration * 1000) {
      handleStopRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording, isPaused, recordingDurationMs, maxDuration]);

  // ── Recording callbacks ─────────────────────────────────

  const handleRecordingFinished = useCallback(
    (video: VideoFile) => {
      dispatch(setIsRecording(false));
      dispatch(setIsPaused(false));
      stopTimer();
      accumulatedRef.current = 0;
      router.push({ pathname: '/camera/preview', params: { videoPath: video.path } });
    },
    [dispatch, router, stopTimer]
  );

  const handleRecordingError = useCallback(
    (error: unknown) => {
      console.error('Recording error:', error);
      dispatch(setIsRecording(false));
      dispatch(setIsPaused(false));
      stopTimer();
      accumulatedRef.current = 0;
      const msg = error instanceof Error ? error.message : String(error);
      Alert.alert('Recording Error', msg);
    },
    [dispatch, stopTimer]
  );

  // ── Start / Stop / Pause / Resume ───────────────────────

  const beginRecording = useCallback(() => {
    dispatch(setIsRecording(true));
    dispatch(setRecordingDuration(0));
    accumulatedRef.current = 0;
    startTimer();
    try {
      cameraRef.current?.startRecording({
        onRecordingFinished: handleRecordingFinished,
        onRecordingError: handleRecordingError,
      });
    } catch (error) {
      console.error('Start recording error:', error);
      dispatch(setIsRecording(false));
      stopTimer();
      accumulatedRef.current = 0;
      const msg = error instanceof Error ? error.message : String(error);
      Alert.alert('Recording Error', msg);
    }
  }, [dispatch, startTimer, stopTimer, handleRecordingFinished, handleRecordingError]);

  const handleStartRecording = useCallback(() => {
    if (countdownDuration > 0) {
      dispatch(setCountdownRemaining(countdownDuration));
      setShowCountdown(true);
    } else {
      beginRecording();
    }
  }, [countdownDuration, dispatch, beginRecording]);

  const handleCountdownComplete = useCallback(() => {
    setShowCountdown(false);
    dispatch(setCountdownRemaining(0));
    beginRecording();
  }, [dispatch, beginRecording]);

  const handleStopRecording = useCallback(async () => {
    stopTimer();
    dispatch(setIsPaused(false));
    try {
      await cameraRef.current?.stopRecording();
    } catch (error) {
      console.error('Stop recording error:', error);
      dispatch(setIsRecording(false));
      accumulatedRef.current = 0;
      const msg = error instanceof Error ? error.message : String(error);
      Alert.alert('Recording Error', msg);
    }
  }, [stopTimer, dispatch]);

  const handlePauseRecording = useCallback(async () => {
    pauseTimer();
    dispatch(setIsPaused(true));
    try {
      await cameraRef.current?.pauseRecording();
    } catch (error) {
      console.error('Pause recording error:', error);
    }
  }, [pauseTimer, dispatch]);

  const handleResumeRecording = useCallback(async () => {
    dispatch(setIsPaused(false));
    resumeTimer();
    try {
      await cameraRef.current?.resumeRecording();
    } catch (error) {
      console.error('Resume recording error:', error);
    }
  }, [resumeTimer, dispatch]);

  const handleRecordPress = useCallback(() => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  }, [isRecording, handleStartRecording, handleStopRecording]);

  const handlePausePress = useCallback(() => {
    if (isPaused) {
      handleResumeRecording();
    } else {
      handlePauseRecording();
    }
  }, [isPaused, handlePauseRecording, handleResumeRecording]);

  // ── Helpers ─────────────────────────────────────────────

  const formatDuration = (ms: number): string => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m.toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  };

  // ── Permission denied fallback ──────────────────────────

  if (!allGranted) {
    return (
      <View className="flex-1 bg-[#0A0A0F] items-center justify-center px-8">
        <StatusBar hidden />
        <Text className="text-[#F1F5F9] text-base text-center mb-2">
          Camera and microphone access are needed to record video.
        </Text>
        <Text className="text-[#94A3B8] text-sm text-center">
          Please grant permissions in your device settings.
        </Text>
      </View>
    );
  }

  // ── Render ──────────────────────────────────────────────

  return (
    <View className="flex-1 bg-black">
      <StatusBar hidden />

      {/* Full-screen camera preview */}
      <CameraView ref={cameraRef} />

      {/* Recording progress bar (top edge) */}
      <RecordingProgress />

      {/* Top controls overlay */}
      <CameraControls />

      {/* Rule-of-thirds grid */}
      <GridOverlay />

      {/* Countdown overlay */}
      {showCountdown && (
        <CountdownOverlay seconds={countdownDuration} onComplete={handleCountdownComplete} />
      )}

      {/* Recording duration badge */}
      {isRecording && (
        <View
          className="absolute left-0 right-0 items-center z-10"
          style={{ top: insets.top + 60 }}
        >
          <View className="flex-row items-center bg-black/50 px-3 py-1 rounded-full gap-2">
            <View className="w-2 h-2 rounded-full bg-[#EF4444]" />
            <Text className="text-[#F1F5F9] text-sm">
              {formatDuration(recordingDurationMs)}
            </Text>
            {isPaused && (
              <Text className="text-[#F59E0B] text-xs font-semibold">PAUSED</Text>
            )}
          </View>
        </View>
      )}

      {/* Bottom area: duration selector + record button + pause */}
      <View
        className="absolute bottom-0 left-0 right-0 items-center"
        style={{ paddingBottom: insets.bottom + SPACING.xl }}
      >
        {/* Duration selector (hidden during recording) */}
        <View className="mb-4">
          <DurationSelector />
        </View>

        {/* Record & pause buttons row */}
        <View className="flex-row items-center gap-6">
          {/* Pause button (only visible during recording) */}
          {isRecording ? (
            <Pressable
              onPress={handlePausePress}
              className="w-11 h-11 rounded-full bg-white/15 items-center justify-center border border-white/20"
            >
              <Ionicons
                name={isPaused ? 'play' : 'pause'}
                size={20}
                color={COLORS.textPrimary}
              />
            </Pressable>
          ) : (
            <View className="w-11" />
          )}

          {/* Record button */}
          <RecordButton onPress={handleRecordPress} disabled={!allGranted || showCountdown} />

          {/* Spacer for symmetry */}
          <View className="w-11" />
        </View>
      </View>
    </View>
  );
}
