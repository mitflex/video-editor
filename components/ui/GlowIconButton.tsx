/**
 * ============================================================
 *  GlowIconButton
 *  Circular button with gradient background, active glow ring
 *  (animated pulse), and centered icon. Used for camera controls,
 *  toolbars, and floating actions.
 *
 *  Usage:
 *    <GlowIconButton icon="camera-reverse" onPress={flipCamera} />
 *    <GlowIconButton icon="flash" active onPress={toggleFlash} />
 * ============================================================
 */

import React, { useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  cancelAnimation,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { COLORS, GRADIENTS, RADIUS, ANIMATION, LAYOUT } from '@/constants/theme';

// ─── Types ─────────────────────────────────────────────────
type GradientKey = keyof typeof GRADIENTS;

interface GlowIconButtonProps {
  /** Ionicons icon name */
  icon: keyof typeof Ionicons.glyphMap;
  /** Press handler */
  onPress: () => void;
  /** Active/selected state (shows glow) */
  active?: boolean;
  /** Button size in pixels (default: 44) */
  size?: number;
  /** Icon size (default: 22) */
  iconSize?: number;
  /** Icon color override */
  iconColor?: string;
  /** Gradient for background (default: 'primary') */
  gradient?: GradientKey;
  /** Use transparent background (icon-only mode) */
  transparent?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Additional styles */
  style?: ViewStyle;
}

// ─── Component ─────────────────────────────────────────────
export function GlowIconButton({
  icon,
  onPress,
  active = false,
  size = LAYOUT.controlButtonSize,
  iconSize = LAYOUT.iconSize,
  iconColor = COLORS.textPrimary,
  gradient = 'primary',
  transparent = false,
  disabled = false,
  style,
}: GlowIconButtonProps) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  const gradientColors = GRADIENTS[gradient] as unknown as [string, string, ...string[]];

  // Animate glow ring when active
  useEffect(() => {
    if (active) {
      glowOpacity.value = withRepeat(
        withTiming(0.6, { duration: 1200 }),
        -1, // infinite
        true  // reverse
      );
    } else {
      cancelAnimation(glowOpacity);
      glowOpacity.value = withTiming(0, { duration: ANIMATION.duration.fast });
    }
  }, [active, glowOpacity]);

  const animatedScale = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedGlow = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handlePress = useCallback(() => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [disabled, onPress]);

  const tapGesture = Gesture.Tap()
    .enabled(!disabled)
    .onBegin(() => {
      scale.value = withSpring(ANIMATION.pressScaleSmall, ANIMATION.spring.button);
    })
    .onFinalize(() => {
      scale.value = withSpring(1, ANIMATION.spring.button);
    })
    .onEnd(() => {
      runOnJS(handlePress)();
    });

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View
        style={[
          styles.wrapper,
          { width: size + 12, height: size + 12 },
          disabled && styles.disabled,
          style,
          animatedScale,
        ]}
      >
        {/* Glow ring (visible when active) */}
        <Animated.View
          style={[
            styles.glowRing,
            {
              width: size + 12,
              height: size + 12,
              borderRadius: (size + 12) / 2,
              borderColor: COLORS.accentPrimary,
            },
            animatedGlow,
          ]}
        />

        {/* Button body */}
        {transparent ? (
          <View
            style={[
              styles.buttonBody,
              styles.transparentBg,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
              },
            ]}
          >
            <Ionicons name={icon} size={iconSize} color={active ? COLORS.accentPrimary : iconColor} />
          </View>
        ) : (
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.buttonBody,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
              },
            ]}
          >
            <Ionicons name={icon} size={iconSize} color={iconColor} />
          </LinearGradient>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

// ─── Styles ────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
  glowRing: {
    position: 'absolute',
    borderWidth: 2,
    opacity: 0,
  },
  buttonBody: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  transparentBg: {
    backgroundColor: 'rgba(26, 26, 46, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.15)',
  },
});

export default GlowIconButton;
