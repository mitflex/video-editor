/**
 * ============================================================
 *  ShimmerLoader
 *  Animated gradient shimmer effect for loading states.
 *  Replaces boring spinners with a premium sweep animation.
 *
 *  Usage:
 *    <ShimmerLoader width={200} height={40} />
 *    <ShimmerLoader width="100%" height={120} borderRadius={16} />
 * ============================================================
 */

import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  type DimensionValue,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { COLORS, RADIUS, ANIMATION } from '@/constants/theme';

// ─── Types ─────────────────────────────────────────────────
interface ShimmerLoaderProps {
  /** Width of shimmer area */
  width: DimensionValue;
  /** Height of shimmer area */
  height: DimensionValue;
  /** Border radius (default: 12) */
  borderRadius?: number;
  /** Additional styles */
  style?: ViewStyle;
}

// ─── Shimmer Colors ────────────────────────────────────────
const SHIMMER_COLORS: [string, string, string, string, string] = [
  COLORS.bgTertiary,
  COLORS.bgTertiary,
  'rgba(99, 102, 241, 0.15)', // Indigo shimmer highlight
  COLORS.bgTertiary,
  COLORS.bgTertiary,
];

// ─── Component ─────────────────────────────────────────────
export function ShimmerLoader({
  width,
  height,
  borderRadius = RADIUS.md,
  style,
}: ShimmerLoaderProps) {
  const translateX = useSharedValue(-1);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(1, {
        duration: ANIMATION.duration.shimmer,
        easing: Easing.inOut(Easing.ease),
      }),
      -1, // infinite
      false // don't reverse
    );
  }, [translateX]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value * 200 }, // sweep 200px range
    ],
  }));

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius,
        },
        style,
      ]}
    >
      <Animated.View style={[styles.shimmer, shimmerStyle]}>
        <LinearGradient
          colors={SHIMMER_COLORS}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bgTertiary,
    overflow: 'hidden',
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    width: '200%',
  },
  gradient: {
    flex: 1,
  },
});

export default ShimmerLoader;
