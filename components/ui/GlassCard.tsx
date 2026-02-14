/**
 * ============================================================
 *  GlassCard
 *  Frosted glass card with backdrop blur, semi-transparent
 *  background, indigo border, and optional spring press animation.
 *
 *  Usage:
 *    <GlassCard onPress={handleTap}>
 *      <Text>Card Content</Text>
 *    </GlassCard>
 * ============================================================
 */

import React, { useCallback } from 'react';
import {
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { COLORS, GLASS, RADIUS, SPACING, ANIMATION, SHADOWS } from '@/constants/theme';

// ─── Types ─────────────────────────────────────────────────
interface GlassCardProps {
  /** Card content */
  children: React.ReactNode;
  /** Press handler (makes card tappable with press animation) */
  onPress?: () => void;
  /** Blur intensity override */
  blurIntensity?: number;
  /** Enable glow shadow */
  glow?: boolean;
  /** Additional container styles */
  style?: ViewStyle;
  /** Padding size (default: 'base') */
  padding?: keyof typeof SPACING;
}

// ─── Component ─────────────────────────────────────────────
export function GlassCard({
  children,
  onPress,
  blurIntensity = GLASS.blurIntensity,
  glow = false,
  style,
  padding = 'base',
}: GlassCardProps) {
  const scale = useSharedValue(1);
  const isInteractive = !!onPress;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = useCallback(() => {
    if (!onPress) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);

  const tapGesture = Gesture.Tap()
    .enabled(isInteractive)
    .onBegin(() => {
      scale.value = withSpring(ANIMATION.pressScale, ANIMATION.spring.button);
    })
    .onFinalize(() => {
      scale.value = withSpring(1, ANIMATION.spring.button);
    })
    .onEnd(() => {
      handlePress();
    });

  const content = (
    <View
      style={[
        styles.container,
        glow && SHADOWS.glow,
        { padding: SPACING[padding] },
        style,
      ]}
    >
      <BlurView
        intensity={blurIntensity}
        tint="dark"
        style={StyleSheet.absoluteFill}
      />
      {/* Subtle inner highlight at top */}
      <View style={styles.highlight} />
      {/* Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );

  if (isInteractive) {
    return (
      <GestureDetector gesture={tapGesture}>
        <Animated.View style={animatedStyle}>{content}</Animated.View>
      </GestureDetector>
    );
  }

  return content;
}

// ─── Styles ────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS['2xl'],
    borderWidth: GLASS.borderWidth,
    borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.glassBg,
    overflow: 'hidden',
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: COLORS.glassHighlight,
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
});

export default GlassCard;
