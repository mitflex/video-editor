/**
 * ============================================================
 *  Camera Recording Screen
 *  Full-screen camera with record button, controls, and
 *  permission handling. Composes CameraView, RecordButton,
 *  and CameraControls.
 *
 *  Recording flow:
 *    1. User presses record → startRecording
 *    2. Timer ticks every 100ms → dispatch setRecordingDuration
 *    3. Auto-stops at maxDuration OR user presses stop
 *    4. onRecordingFinished → navigate to preview
 * ============================================================
 */

import React, { useCallback, useEffect, useRef } from 'react';
import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { VideoFile } from 'react-native-vision-camera';

import { CameraView, type CameraViewHandle } from '@/components/camera/CameraView';
import { RecordButton } from '@/components/camera/RecordButton';
import { CameraControls } from '@/components/camera/CameraControls';
import { useCameraPermissions } from '@/hooks/useCameraPermissions';
import { SPACING } from '@/constants/theme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setIsRecording,
  setRecordingDuration,
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

  const { allGranted, requestPermissions } = useCameraPermissions();

  const isRecording = useAppSelector((s) => s.camera.isRecording);
  const maxDuration = useAppSelector((s) => s.camera.maxDuration);
  const recordingDurationMs = useAppSelector((s) => s.camera.recordingDurationMs);

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
  }, [dispatch]);

  // ── Timer logic ─────────────────────────────────────────

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current + accumulatedRef.current;
      dispatch(setRecordingDuration(elapsed));
    }, 100);
  }, [dispatch]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // ── Auto-stop when hitting max duration ─────────────────

  useEffect(() => {
    if (isRecording && recordingDurationMs >= maxDuration * 1000) {
      handleStopRecording();
    }
  }, [isRecording, recordingDurationMs, maxDuration]);

  // ── Recording callbacks ─────────────────────────────────

  const handleRecordingFinished = useCallback(
    (video: VideoFile) => {
      dispatch(setIsRecording(false));
      stopTimer();
      accumulatedRef.current = 0;

      router.push({
        pathname: '/camera/preview',
        params: { videoPath: video.path },
      });
    },
    [dispatch, router, stopTimer],
  );

  const handleRecordingError = useCallback(
    (error: unknown) => {
      console.error('Recording error:', error);
      dispatch(setIsRecording(false));
      stopTimer();
      accumulatedRef.current = 0;
    },
    [dispatch, stopTimer],
  );

  // ── Start / Stop recording ──────────────────────────────

  const handleStartRecording = useCallback(() => {
    dispatch(setIsRecording(true));
    dispatch(setRecordingDuration(0));
    accumulatedRef.current = 0;
    startTimer();

    cameraRef.current?.startRecording({
      onRecordingFinished: handleRecordingFinished,
      onRecordingError: handleRecordingError,
    });
  }, [dispatch, startTimer, handleRecordingFinished, handleRecordingError]);

  const handleStopRecording = useCallback(async () => {
    stopTimer();
    await cameraRef.current?.stopRecording();
  }, [stopTimer]);

  // ── Toggle record (single button press) ─────────────────

  const handleRecordPress = useCallback(() => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  }, [isRecording, handleStartRecording, handleStopRecording]);

  // ── Format duration for display ─────────────────────────

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

      {/* Top controls overlay */}
      <CameraControls />

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
          </View>
        </View>
      )}

      {/* Bottom record button */}
      <View
        className="absolute bottom-0 left-0 right-0 items-center pt-5"
        style={{ paddingBottom: insets.bottom + SPACING.xl }}
      >
        <RecordButton onPress={handleRecordPress} disabled={!allGranted} />
      </View>
    </View>
  );
}
