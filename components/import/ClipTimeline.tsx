/**
 * ============================================================
 *  ClipTimeline
 *  Horizontal thumbnail strip with draggable gradient handles
 *  for selecting a clip range. Thumbnails inside the selection
 *  are bright; outside is dimmed with a dark overlay.
 *
 *  Uses react-native-gesture-handler for drag gestures and
 *  Reanimated shared values for smooth 60fps handle positioning.
 *
 *  Gesture architecture:
 *    - onBegin: snapshot handle position into a drag-start shared value
 *    - onUpdate: compute newPx = dragStart + translationX (all on UI thread)
 *    - onEnd: final sync to React state via runOnJS
 *    - Throttled runOnJS during drag (~60ms) to update hook state
 * ============================================================
 */

import React, { useCallback, useRef } from 'react';
import { StyleSheet, View, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { COLORS, GRADIENTS, SPACING, RADIUS } from '@/constants/theme';

// ─── Constants ──────────────────────────────────────────────

const SCREEN_WIDTH = Dimensions.get('window').width;
const TIMELINE_PADDING = SPACING.base;
const TIMELINE_WIDTH = SCREEN_WIDTH - TIMELINE_PADDING * 2;
const HANDLE_WIDTH = 16;
const THUMBNAIL_HEIGHT = 56;
/** Minimum gap between handles in pixels (prevents overlap) */
const MIN_HANDLE_GAP = HANDLE_WIDTH * 2;
/** Minimum ms between runOnJS syncs during drag */
const SYNC_THROTTLE_MS = 60;

// ─── Props ──────────────────────────────────────────────────

interface ClipTimelineProps {
  /** Array of thumbnail URIs */
  thumbnails: string[];
  /** Start handle position in pixels */
  startPx: number;
  /** End handle position in pixels */
  endPx: number;
  /** Called when start handle moves */
  onStartChange: (px: number) => void;
  /** Called when end handle moves */
  onEndChange: (px: number) => void;
  /** Whether selection exceeds max duration */
  isOverLimit: boolean;
}

// ─── Component ──────────────────────────────────────────────

export function ClipTimeline({
  thumbnails,
  startPx,
  endPx,
  onStartChange,
  onEndChange,
  isOverLimit,
}: ClipTimelineProps) {
  // ── Shared values for 60fps animation ──────────────────────
  const startOffset = useSharedValue(startPx);
  const endOffset = useSharedValue(endPx);

  // Drag-start snapshots (captured in onBegin, used in onUpdate)
  const startDragOrigin = useSharedValue(0);
  const endDragOrigin = useSharedValue(0);

  // Throttle refs for runOnJS sync
  const lastStartSync = useRef(0);
  const lastEndSync = useRef(0);

  // Keep shared values in sync with prop changes (e.g. from reset)
  // Only sync when NOT actively dragging (drag sets values directly)
  React.useEffect(() => {
    startOffset.value = startPx;
  }, [startPx, startOffset]);

  React.useEffect(() => {
    endOffset.value = endPx;
  }, [endPx, endOffset]);

  // ── Callbacks (JS thread) ─────────────────────────────────

  const syncStart = useCallback(
    (px: number) => {
      onStartChange(px);
    },
    [onStartChange]
  );

  const syncEnd = useCallback(
    (px: number) => {
      onEndChange(px);
    },
    [onEndChange]
  );

  const triggerHaptic = useCallback(() => {
    Haptics.selectionAsync();
  }, []);

  // ── Start handle gesture ─────────────────────────────────

  const startGesture = Gesture.Pan()
    .onBegin(() => {
      // Snapshot current position at drag start
      startDragOrigin.value = startOffset.value;
      runOnJS(triggerHaptic)();
    })
    .onUpdate((e) => {
      // Calculate new position from drag origin + translation (all shared values)
      const newPx = Math.max(
        0,
        Math.min(
          startDragOrigin.value + e.translationX,
          endOffset.value - MIN_HANDLE_GAP
        )
      );
      startOffset.value = newPx;

      // Throttled sync to React state
      const now = Date.now();
      if (now - lastStartSync.current > SYNC_THROTTLE_MS) {
        lastStartSync.current = now;
        runOnJS(syncStart)(newPx);
      }
    })
    .onEnd(() => {
      // Final sync to ensure React state matches final position
      runOnJS(syncStart)(startOffset.value);
    });

  // ── End handle gesture ───────────────────────────────────

  const endGesture = Gesture.Pan()
    .onBegin(() => {
      endDragOrigin.value = endOffset.value;
      runOnJS(triggerHaptic)();
    })
    .onUpdate((e) => {
      const newPx = Math.max(
        startOffset.value + MIN_HANDLE_GAP,
        Math.min(endDragOrigin.value + e.translationX, TIMELINE_WIDTH)
      );
      endOffset.value = newPx;

      const now = Date.now();
      if (now - lastEndSync.current > SYNC_THROTTLE_MS) {
        lastEndSync.current = now;
        runOnJS(syncEnd)(newPx);
      }
    })
    .onEnd(() => {
      runOnJS(syncEnd)(endOffset.value);
    });

  // ── Animated styles ───────────────────────────────────────

  const startHandleStyle = useAnimatedStyle(() => ({
    left: startOffset.value,
  }));

  const endHandleStyle = useAnimatedStyle(() => ({
    left: endOffset.value - HANDLE_WIDTH,
  }));

  // ── Dimmed overlays ──────────────────────────────────────

  const leftDimStyle = useAnimatedStyle(() => ({
    width: startOffset.value,
  }));

  const rightDimStyle = useAnimatedStyle(() => ({
    left: endOffset.value,
    right: 0,
  }));

  // ── Selection border (animated to match handles in real-time) ──

  const selectionBorderStyle = useAnimatedStyle(() => ({
    left: startOffset.value,
    width: endOffset.value - startOffset.value,
  }));

  const gradientColors = (isOverLimit ? GRADIENTS.error : GRADIENTS.primary) as unknown as [string, string, ...string[]];

  // ── Thumbnail width calculation ──────────────────────────

  const thumbWidth = thumbnails.length > 0
    ? TIMELINE_WIDTH / thumbnails.length
    : TIMELINE_WIDTH;

  return (
    <View style={styles.container}>
      {/* Thumbnail strip */}
      <View style={styles.thumbnailStrip}>
        {thumbnails.map((uri, index) => (
          <Image
            key={index}
            source={{ uri }}
            style={[styles.thumbnail, { width: thumbWidth }]}
            resizeMode="cover"
          />
        ))}
      </View>

      {/* Left dimmed region */}
      <Animated.View style={[styles.dimOverlay, leftDimStyle]} />

      {/* Right dimmed region */}
      <Animated.View style={[styles.dimOverlay, rightDimStyle]} />

      {/* Start handle */}
      <GestureDetector gesture={startGesture}>
        <Animated.View style={[styles.handle, startHandleStyle]}>
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.handleGradient}
          >
            <View style={styles.handleBar} />
          </LinearGradient>
        </Animated.View>
      </GestureDetector>

      {/* End handle */}
      <GestureDetector gesture={endGesture}>
        <Animated.View style={[styles.handle, endHandleStyle]}>
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.handleGradient}
          >
            <View style={styles.handleBar} />
          </LinearGradient>
        </Animated.View>
      </GestureDetector>

      {/* Selection border (top + bottom) — animated to track handles */}
      <Animated.View
        style={[
          styles.selectionBorder,
          selectionBorderStyle,
          { borderColor: isOverLimit ? COLORS.error : COLORS.accentPrimary },
        ]}
        pointerEvents="none"
      />
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    height: THUMBNAIL_HEIGHT,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnailStrip: {
    flexDirection: 'row',
    height: THUMBNAIL_HEIGHT,
  },
  thumbnail: {
    height: THUMBNAIL_HEIGHT,
  },
  dimOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  handle: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: HANDLE_WIDTH,
    zIndex: 10,
  },
  handleGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  handleBar: {
    width: 3,
    height: 20,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  selectionBorder: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    zIndex: 5,
  },
});

export { TIMELINE_WIDTH, TIMELINE_PADDING };
export default ClipTimeline;
