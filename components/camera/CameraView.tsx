/**
 * ============================================================
 *  CameraView
 *  Wrapper around VisionCamera that provides the full-screen
 *  9:16 camera preview with recording capabilities.
 *
 *  Exposes a ref with startRecording / stopRecording /
 *  pauseRecording / resumeRecording methods.
 * ============================================================
 */

import React, { forwardRef, useImperativeHandle, useRef, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Camera,
  useCameraDevice,
  type VideoFile,
} from 'react-native-vision-camera';

import { useAppSelector } from '@/store/hooks';

// ─── Public Handle ──────────────────────────────────────────

export interface CameraViewHandle {
  startRecording: (options: {
    onRecordingFinished: (video: VideoFile) => void;
    onRecordingError: (error: unknown) => void;
  }) => void;
  stopRecording: () => Promise<void>;
  pauseRecording: () => Promise<void>;
  resumeRecording: () => Promise<void>;
}

// ─── Component ──────────────────────────────────────────────

export const CameraView = forwardRef<CameraViewHandle>(function CameraView(
  _props,
  ref,
) {
  const cameraRef = useRef<Camera>(null);

  const facing = useAppSelector((s) => s.camera.facing);
  const flashMode = useAppSelector((s) => s.camera.flashMode);

  const device = useCameraDevice(facing);

  // ── Imperative methods ──────────────────────────────────

  const startRecording = useCallback(
    (options: {
      onRecordingFinished: (video: VideoFile) => void;
      onRecordingError: (error: unknown) => void;
    }) => {
      cameraRef.current?.startRecording({
        flash: flashMode,
        fileType: 'mp4',
        onRecordingFinished: options.onRecordingFinished,
        onRecordingError: options.onRecordingError,
      });
    },
    [flashMode],
  );

  const stopRecording = useCallback(async () => {
    await cameraRef.current?.stopRecording();
  }, []);

  const pauseRecording = useCallback(async () => {
    await cameraRef.current?.pauseRecording();
  }, []);

  const resumeRecording = useCallback(async () => {
    await cameraRef.current?.resumeRecording();
  }, []);

  useImperativeHandle(ref, () => ({
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
  }));

  // ── Render ──────────────────────────────────────────────

  if (!device) {
    return <View className="flex-1 bg-black" />;
  }

  return (
    <View className="flex-1 bg-black">
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive
        video
        audio
        torch={flashMode}
      />
    </View>
  );
});

export default CameraView;
