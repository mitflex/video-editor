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
import { StyleSheet, View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { VideoFile } from 'react-native-vision-camera';

import { CameraView, type CameraViewHandle } from '@/components/camera/CameraView';
import { RecordButton } from '@/components/camera/RecordButton';
import { CameraControls } from '@/components/camera/CameraControls';
import { useCameraPermissions } from '@/hooks/useCameraPermissions';
import { COLORS, FONT_SIZE, SPACING } from '@/constants/theme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setIsRecording,
  setIsPaused,
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
  const isPaused = useAppSelector((s) => s.camera.isPaused);
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
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // ── Permission denied fallback ──────────────────────────

  if (!allGranted) {
    return (
      <View style={styles.permissionContainer}>
        <StatusBar hidden />
        <Text style={styles.permissionText}>
          Camera and microphone access are needed to record video.
        </Text>
        <Text style={styles.permissionSubtext}>
          Please grant permissions in your device settings.
        </Text>
      </View>
    );
  }

  // ── Render ──────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Camera preview (full screen) */}
      <CameraView ref={cameraRef} />

      {/* Top controls overlay */}
      <CameraControls />

      {/* Recording duration label */}
      {isRecording && (
        <View style={[styles.durationContainer, { top: insets.top + 60 }]}>
          <View style={styles.durationBadge}>
            <View style={styles.recordingDot} />
            <Text style={styles.durationText}>
              {formatDuration(recordingDurationMs)}
            </Text>
          </View>
        </View>
      )}

      {/* Bottom: Record button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + SPACING.xl }]}>
        <RecordButton onPress={handleRecordPress} disabled={!allGranted} />
      </View>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING['2xl'],
  },
  permissionText: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  permissionSubtext: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.base,
    textAlign: 'center',
  },
  durationContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    gap: SPACING.sm,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.recording,
  },
  durationText: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.base,
    fontVariant: ['tabular-nums'],
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingTop: SPACING.lg,
  },
});
