/**
 * ============================================================
 *  AnimatedPill
 *  Selector pill with gradient active state and spring layout
 *  animation when switching. Used for speed selectors, duration
 *  options, tab pills, etc.
 *
 *  Usage:
 *    <AnimatedPill
 *      label="1x"
 *      active={speed === 1}
 *      onPress={() => setSpeed(1)}
 *    />
 * ============================================================
 */

import React, { useCallback, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { COLORS, GRADIENTS, RADIUS, SPACING, FONT_SIZE, ANIMATION } from '@/constants/theme';

// ─── Types ─────────────────────────────────────────────────
type GradientKey = keyof typeof GRADIENTS;

interface AnimatedPillProps {
  /** Pill label */
  label: string;
  /** Whether this pill is currently selected */
  active: boolean;
  /** Press handler */
  onPress: () => void;
  /** Gradient for active state (default: 'primary') */
  gradient?: GradientKey;
  /** Pill size variant */
  size?: 'sm' | 'md';
  /** Additional container styles */
  style?: ViewStyle;
  /** Additional text styles */
  textStyle?: TextStyle;
}

// ─── Component ─────────────────────────────────────────────
export function AnimatedPill({
  label,
  active,
  onPress,
  gradient = 'primary',
  size = 'md',
  style,
  textStyle,
}: AnimatedPillProps) {
  const scale = useSharedValue(1);
  const activeProgress = useSharedValue(active ? 1 : 0);

  const gradientColors = GRADIENTS[gradient] as unknown as [string, string, ...string[]];

  const isSm = size === 'sm';
  const height = isSm ? 32 : 38;
  const paddingH = isSm ? SPACING.md : SPACING.base;
  const fontSize = isSm ? FONT_SIZE.xs : FONT_SIZE.sm;

  useEffect(() => {
    activeProgress.value = withSpring(active ? 1 : 0, ANIMATION.spring.pill);
  }, [active, activeProgress]);

  const animatedContainer = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedInactiveStyle = useAnimatedStyle(() => ({
    opacity: 1 - activeProgress.value,
  }));

  const animatedActiveStyle = useAnimatedStyle(() => ({
    opacity: activeProgress.value,
  }));

  const handlePress = useCallback(() => {
    Haptics.selectionAsync();
    onPress();
  }, [onPress]);

  const tapGesture = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(ANIMATION.pressScale, ANIMATION.spring.pill);
    })
    .onFinalize(() => {
      scale.value = withSpring(1, ANIMATION.spring.pill);
    })
    .onEnd(() => {
      handlePress();
    });

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View
        style={[
          styles.container,
          {
            height,
            paddingHorizontal: paddingH,
            borderRadius: height / 2,
          },
          style,
          animatedContainer,
        ]}
      >
        {/* Inactive background */}
        <Animated.View
          style={[
            styles.backgroundLayer,
            styles.inactiveBg,
            { borderRadius: height / 2 },
            animatedInactiveStyle,
          ]}
        />

        {/* Active gradient background */}
        <Animated.View
          style={[
            styles.backgroundLayer,
            { borderRadius: height / 2 },
            animatedActiveStyle,
          ]}
        >
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[StyleSheet.absoluteFill, { borderRadius: height / 2 }]}
          />
        </Animated.View>

        {/* Label */}
        <Text
          style={[
            styles.label,
            {
              fontSize,
              color: active ? COLORS.textOnGradient : COLORS.textSecondary,
            },
            textStyle,
          ]}
        >
          {label}
        </Text>
      </Animated.View>
    </GestureDetector>
  );
}

// ─── Styles ────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  inactiveBg: {
    backgroundColor: COLORS.bgTertiary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: {
    fontWeight: '600',
    letterSpacing: 0.2,
    zIndex: 1,
  },
});

export default AnimatedPill;
