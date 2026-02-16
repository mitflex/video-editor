/**
 * ============================================================
 *  CameraControls
 *  Top bar with flash toggle, flip camera, grid toggle,
 *  and close button. Uses GlowIconButton in transparent mode
 *  with safe area insets.
 * ============================================================
 */

import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { GlowIconButton } from '@/components/ui/GlowIconButton';
import { SPACING } from '@/constants/theme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleFacing, setFlashMode, toggleGrid } from '@/store/slices/cameraSlice';

// ─── Component ──────────────────────────────────────────────

export function CameraControls() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const facing = useAppSelector((s) => s.camera.facing);
  const flashMode = useAppSelector((s) => s.camera.flashMode);
  const showGrid = useAppSelector((s) => s.camera.showGrid);
  const isRecording = useAppSelector((s) => s.camera.isRecording);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const handleFlipCamera = useCallback(() => {
    dispatch(toggleFacing());
  }, [dispatch]);

  const handleToggleFlash = useCallback(() => {
    dispatch(setFlashMode(flashMode === 'off' ? 'on' : 'off'));
  }, [dispatch, flashMode]);

  const handleToggleGrid = useCallback(() => {
    dispatch(toggleGrid());
  }, [dispatch]);

  // Front cameras don't have flash
  const flashDisabled = facing === 'front';

  return (
    <View style={[styles.container, { paddingTop: insets.top + SPACING.sm }]}>
      {/* Close button */}
      <GlowIconButton icon="close" onPress={handleClose} transparent disabled={isRecording} />

      {/* Right-side controls */}
      <View style={styles.rightControls}>
        <GlowIconButton
          icon={flashMode === 'on' ? 'flash' : 'flash-outline'}
          onPress={handleToggleFlash}
          active={flashMode === 'on'}
          transparent
          disabled={flashDisabled || isRecording}
        />
        <GlowIconButton
          icon="camera-reverse-outline"
          onPress={handleFlipCamera}
          transparent
          disabled={isRecording}
        />
        <GlowIconButton
          icon="grid-outline"
          onPress={handleToggleGrid}
          active={showGrid}
          transparent
        />
      </View>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    zIndex: 10,
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
});

export default CameraControls;
