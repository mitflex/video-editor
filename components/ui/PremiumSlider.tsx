/**
 * ============================================================
 *  PremiumSlider
 *  Custom slider with gradient track fill, glass thumb with
 *  glow, and value tooltip on drag. Used for brightness,
 *  contrast, saturation, volume controls.
 *
 *  Usage:
 *    <PremiumSlider
 *      value={brightness}
 *      min={-100}
 *      max={100}
 *      label="Brightness"
 *      onValueChange={setBrightness}
 *    />
 * ============================================================
 */

import React, { useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  useAnimatedReaction,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { COLORS, GRADIENTS, RADIUS, SPACING, FONT_SIZE, ANIMATION } from '@/constants/theme';

// ─── Types ─────────────────────────────────────────────────
type GradientKey = keyof typeof GRADIENTS;

interface PremiumSliderProps {
  /** Current value */
  value: number;
  /** Minimum value (default: 0) */
  min?: number;
  /** Maximum value (default: 100) */
  max?: number;
  /** Step increment (default: 1) */
  step?: number;
  /** Label shown above slider */
  label?: string;
  /** Whether to show the value display */
  showValue?: boolean;
  /** Value format function */
  formatValue?: (value: number) => string;
  /** Called when value changes during drag */
  onValueChange: (value: number) => void;
  /** Called when drag ends */
  onSlidingComplete?: (value: number) => void;
  /** Gradient for filled track (default: 'primary') */
  gradient?: GradientKey;
  /** Track width */
  trackWidth?: number;
  /** Additional container styles */
  style?: ViewStyle;
}

const TRACK_HEIGHT = 6;
const THUMB_SIZE = 24;
const TOOLTIP_HEIGHT = 28;
const DEFAULT_TRACK_WIDTH = 280;

// ─── Component ─────────────────────────────────────────────
export function PremiumSlider({
  value,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = true,
  formatValue = (v) => Math.round(v).toString(),
  onValueChange,
  onSlidingComplete,
  gradient = 'primary',
  trackWidth = DEFAULT_TRACK_WIDTH,
  style,
}: PremiumSliderProps) {
  const gradientColors = GRADIENTS[gradient] as unknown as [string, string, ...string[]];

  const range = max - min;
  const initialProgress = (value - min) / range;

  const thumbX = useSharedValue(initialProgress * trackWidth);
  const thumbScale = useSharedValue(1);
  const tooltipOpacity = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const currentValue = useSharedValue(value);

  // Sync external value changes
  useAnimatedReaction(
    () => value,
    (newVal) => {
      if (!isDragging.value) {
        thumbX.value = withTiming(((newVal - min) / range) * trackWidth, {
          duration: ANIMATION.duration.fast,
        });
        currentValue.value = newVal;
      }
    },
    [value]
  );

  const snapToStep = useCallback(
    (rawValue: number): number => {
      const stepped = Math.round(rawValue / step) * step;
      return Math.max(min, Math.min(max, stepped));
    },
    [min, max, step]
  );

  const triggerHaptic = useCallback(() => {
    Haptics.selectionAsync();
  }, []);

  const handleChange = useCallback(
    (val: number) => {
      onValueChange(val);
    },
    [onValueChange]
  );

  const handleComplete = useCallback(
    (val: number) => {
      onSlidingComplete?.(val);
    },
    [onSlidingComplete]
  );

  const startX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      isDragging.value = true;
      startX.value = thumbX.value;
      thumbScale.value = withSpring(1.3, ANIMATION.spring.button);
      tooltipOpacity.value = withTiming(1, { duration: ANIMATION.duration.fast });
      runOnJS(triggerHaptic)();
    })
    .onUpdate((event) => {
      const clampedX = Math.max(0, Math.min(trackWidth, startX.value + event.translationX));
      thumbX.value = clampedX;
      const progress = clampedX / trackWidth;
      const rawValue = min + progress * range;
      const snapped = Math.round(rawValue / step) * step;
      const clamped = Math.max(min, Math.min(max, snapped));
      currentValue.value = clamped;
      runOnJS(handleChange)(clamped);
    })
    .onEnd(() => {
      isDragging.value = false;
      thumbScale.value = withSpring(1, ANIMATION.spring.button);
      tooltipOpacity.value = withTiming(0, { duration: ANIMATION.duration.normal });
      runOnJS(handleComplete)(currentValue.value);
    });

  const thumbAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: thumbX.value - THUMB_SIZE / 2 },
      { scale: thumbScale.value },
    ],
  }));

  const fillAnimatedStyle = useAnimatedStyle(() => ({
    width: thumbX.value,
  }));

  const tooltipAnimatedStyle = useAnimatedStyle(() => ({
    opacity: tooltipOpacity.value,
    transform: [{ translateX: thumbX.value - 20 }],
  }));

  return (
    <View style={[styles.container, style]}>
      {/* Label + value row */}
      {(label || showValue) && (
        <View style={styles.labelRow}>
          {label && <Text style={styles.label}>{label}</Text>}
          {showValue && (
            <Text style={styles.valueText}>{formatValue(value)}</Text>
          )}
        </View>
      )}

      {/* Slider track area */}
      <View style={[styles.trackContainer, { width: trackWidth }]}>
        {/* Tooltip */}
        <Animated.View style={[styles.tooltip, tooltipAnimatedStyle]}>
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.tooltipBg}
          >
            <Text style={styles.tooltipText}>{formatValue(currentValue.value)}</Text>
          </LinearGradient>
        </Animated.View>

        {/* Track background */}
        <View style={styles.trackBg} />

        {/* Gradient fill */}
        <Animated.View style={[styles.trackFillContainer, fillAnimatedStyle]}>
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.trackFill}
          />
        </Animated.View>

        {/* Thumb */}
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.thumb, thumbAnimatedStyle]}>
            <View style={styles.thumbInner} />
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.sm,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
  },
  valueText: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
  trackContainer: {
    height: THUMB_SIZE + TOOLTIP_HEIGHT + SPACING.sm,
    justifyContent: 'flex-end',
    paddingBottom: (THUMB_SIZE - TRACK_HEIGHT) / 2,
  },
  tooltip: {
    position: 'absolute',
    top: 0,
    width: 40,
  },
  tooltipBg: {
    height: TOOLTIP_HEIGHT,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltipText: {
    color: COLORS.textOnGradient,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
  },
  trackBg: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: COLORS.bgTertiary,
  },
  trackFillContainer: {
    position: 'absolute',
    bottom: (THUMB_SIZE - TRACK_HEIGHT) / 2,
    left: 0,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    overflow: 'hidden',
  },
  trackFill: {
    flex: 1,
  },
  thumb: {
    position: 'absolute',
    bottom: 0,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: COLORS.glassBg,
    borderWidth: 2,
    borderColor: COLORS.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    // Glow
    shadowColor: COLORS.accentPrimary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  thumbInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accentPrimary,
  },
});

export default PremiumSlider;
