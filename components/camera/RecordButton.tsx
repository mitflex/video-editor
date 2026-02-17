/**
 * ============================================================
 *  RecordButton
 *  Animated record button with warm gradient, scale spring,
 *  and SVG progress ring showing elapsed vs max duration.
 *
 *  States:
 *    Idle      → Gradient circle, press to start
 *    Recording → Inner circle shrinks to stop square,
 *                outer ring shows progress
 * ============================================================
 */

import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Circle } from 'react-native-svg';

import { COLORS, GRADIENTS, ANIMATION, LAYOUT } from '@/constants/theme';
import { useAppSelector } from '@/store/hooks';

// ─── Constants ──────────────────────────────────────────────

const OUTER_SIZE = LAYOUT.recordButtonSize;       // 72
const INNER_SIZE = LAYOUT.recordButtonInnerSize;  // 64
const RING_PADDING = 6;
const RING_SIZE = OUTER_SIZE + RING_PADDING * 2;  // 84
const RING_STROKE = 3;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// ─── Props ──────────────────────────────────────────────────

interface RecordButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

// ─── Component ──────────────────────────────────────────────

export function RecordButton({ onPress, disabled = false }: RecordButtonProps) {
  const isRecording = useAppSelector((s) => s.camera.isRecording);
  const recordingDurationMs = useAppSelector((s) => s.camera.recordingDurationMs);
  const maxDuration = useAppSelector((s) => s.camera.maxDuration);

  const scale = useSharedValue(1);

  // ── Progress calculation ────────────────────────────────

  const progress = useMemo(() => {
    if (!isRecording) return 0;
    return Math.min(recordingDurationMs / (maxDuration * 1000), 1);
  }, [isRecording, recordingDurationMs, maxDuration]);

  const strokeDashoffset = RING_CIRCUMFERENCE * (1 - progress);

  // ── Animations ──────────────────────────────────────────

  const animatedWrapperStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.4 : 1,
  }));

  // Morphs the inner shape: idle = circle, recording = rounded square
  const innerAnimatedStyle = useAnimatedStyle(() => {
    const recordingProgress = isRecording ? 1 : 0;
    const size = interpolate(recordingProgress, [0, 1], [INNER_SIZE, INNER_SIZE * 0.45]);
    const borderRadius = interpolate(recordingProgress, [0, 1], [INNER_SIZE / 2, 8]);
    return { width: size, height: size, borderRadius };
  });

  // ── Gesture ─────────────────────────────────────────────

  const handlePress = useCallback(() => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  }, [disabled, onPress]);

  const tapGesture = Gesture.Tap()
    .enabled(!disabled)
    .onBegin(() => {
      scale.value = withSpring(ANIMATION.pressScale, ANIMATION.spring.button);
    })
    .onFinalize(() => {
      scale.value = withSpring(1, ANIMATION.spring.button);
    })
    .onEnd(() => {
      runOnJS(handlePress)();
    });

  // ── Render ──────────────────────────────────────────────

  const gradientColors = GRADIENTS.warm as unknown as [string, string, ...string[]];

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View style={[styles.wrapper, animatedWrapperStyle]}>

        {/* SVG progress ring — absolute behind the button */}
        <Svg width={RING_SIZE} height={RING_SIZE} style={StyleSheet.absoluteFill}>
          {/* Track */}
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={RING_STROKE}
            fill="none"
          />
          {/* Progress arc */}
          {isRecording && (
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              stroke={COLORS.recording}
              strokeWidth={RING_STROKE}
              fill="none"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              rotation={-90}
              origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
            />
          )}
        </Svg>

        {/* Outer white border ring */}
        <View style={styles.outerRing}>
          {/* Warm gradient body */}
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBody}
          >
            {/* Morphing inner shape (circle → stop square) */}
            <Animated.View style={[styles.innerShape, innerAnimatedStyle]} />
          </LinearGradient>
        </View>

      </Animated.View>
    </GestureDetector>
  );
}

// ─── Styles ─────────────────────────────────────────────────
// NOTE: StyleSheet is kept here only for values that can't be
// expressed as Tailwind classes — computed pixel dimensions,
// border-radius derived from constants, and Animated style bases.

const styles = StyleSheet.create({
  wrapper: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    width: OUTER_SIZE,
    height: OUTER_SIZE,
    borderRadius: OUTER_SIZE / 2,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  gradientBody: {
    width: INNER_SIZE,
    height: INNER_SIZE,
    borderRadius: INNER_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerShape: {
    backgroundColor: '#FFFFFF',
  },
});

export default RecordButton;
