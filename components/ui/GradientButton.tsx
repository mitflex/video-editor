/**
 * ============================================================
 *  GradientButton
 *  Premium CTA button with linear gradient background,
 *  spring press animation, haptic feedback, and optional glow.
 *
 *  Usage:
 *    <GradientButton title="Record" onPress={handleRecord} />
 *    <GradientButton title="Export" gradient="accent" size="lg" />
 * ============================================================
 */

import React, { useCallback } from 'react';
import {
  StyleSheet,
  Text,
  type ViewStyle,
  type TextStyle,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { GRADIENTS, COLORS, RADIUS, SPACING, FONT_SIZE, ANIMATION, SHADOWS } from '@/constants/theme';

// ─── Types ─────────────────────────────────────────────────
type GradientKey = keyof typeof GRADIENTS;
type ButtonSize = 'sm' | 'md' | 'lg';

interface GradientButtonProps {
  /** Button label */
  title: string;
  /** Press handler */
  onPress: () => void;
  /** Gradient preset key (default: 'primary') */
  gradient?: GradientKey;
  /** Button size (default: 'md') */
  size?: ButtonSize;
  /** Full width button */
  fullWidth?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state (shows spinner) */
  loading?: boolean;
  /** Icon component to render left of title */
  icon?: React.ReactNode;
  /** Enable outer glow effect (default: false) */
  glow?: boolean;
  /** Additional container styles */
  style?: ViewStyle;
  /** Additional text styles */
  textStyle?: TextStyle;
}

// ─── Size Config ───────────────────────────────────────────
const SIZE_CONFIG: Record<ButtonSize, { height: number; paddingH: number; fontSize: number; borderRadius: number }> = {
  sm: { height: 36, paddingH: SPACING.md, fontSize: FONT_SIZE.sm, borderRadius: RADIUS.sm },
  md: { height: 48, paddingH: SPACING.xl, fontSize: FONT_SIZE.base, borderRadius: RADIUS.md },
  lg: { height: 56, paddingH: SPACING['2xl'], fontSize: FONT_SIZE.md, borderRadius: RADIUS.lg },
};

// ─── Component ─────────────────────────────────────────────
export function GradientButton({
  title,
  onPress,
  gradient = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  glow = false,
  style,
  textStyle,
}: GradientButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const config = SIZE_CONFIG[size];
  const gradientColors = GRADIENTS[gradient] as unknown as [string, string, ...string[]];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePress = useCallback(() => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  }, [disabled, loading, onPress]);

  const tapGesture = Gesture.Tap()
    .enabled(!disabled && !loading)
    .onBegin(() => {
      scale.value = withSpring(ANIMATION.pressScale, ANIMATION.spring.button);
      opacity.value = withSpring(ANIMATION.pressOpacity, ANIMATION.spring.button);
    })
    .onFinalize(() => {
      scale.value = withSpring(1, ANIMATION.spring.button);
      opacity.value = withSpring(1, ANIMATION.spring.button);
    })
    .onEnd(() => {
      runOnJS(handlePress)();
    });

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View
        style={[
          styles.wrapper,
          glow && SHADOWS.glow,
          fullWidth && styles.fullWidth,
          disabled && styles.disabled,
          style,
          animatedStyle,
        ]}
      >
        <LinearGradient
          colors={disabled ? ['#374151', '#4B5563'] : gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.gradient,
            {
              height: config.height,
              paddingHorizontal: config.paddingH,
              borderRadius: config.borderRadius,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.textOnGradient} size="small" />
          ) : (
            <>
              {icon && <>{icon}</>}
              <Text
                style={[
                  styles.title,
                  {
                    fontSize: config.fontSize,
                    marginLeft: icon ? SPACING.sm : 0,
                  },
                  textStyle,
                ]}
              >
                {title}
              </Text>
            </>
          )}
        </LinearGradient>
      </Animated.View>
    </GestureDetector>
  );
}

// ─── Styles ────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'center',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  disabled: {
    opacity: 0.5,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: COLORS.textOnGradient,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default GradientButton;
