/**
 * ============================================================
 *  GlassBottomSheet
 *  Full-width frosted glass panel that slides up from bottom
 *  with Reanimated, drag handle with gradient pill, and
 *  blurred backdrop.
 *
 *  Usage:
 *    <GlassBottomSheet visible={showPanel} onClose={hidePanel}>
 *      <FilterPanel />
 *    </GlassBottomSheet>
 * ============================================================
 */

import React, { useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Pressable,
  type ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { COLORS, GRADIENTS, GLASS, RADIUS, SPACING, ANIMATION, LAYOUT } from '@/constants/theme';

// ─── Types ─────────────────────────────────────────────────
interface GlassBottomSheetProps {
  /** Whether the sheet is visible */
  visible: boolean;
  /** Called when sheet should close */
  onClose: () => void;
  /** Sheet content */
  children: React.ReactNode;
  /** Max height ratio of screen (default: 0.4) */
  maxHeightRatio?: number;
  /** Additional container styles */
  style?: ViewStyle;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── Component ─────────────────────────────────────────────
export function GlassBottomSheet({
  visible,
  onClose,
  children,
  maxHeightRatio = LAYOUT.bottomSheetMaxRatio,
  style,
}: GlassBottomSheetProps) {
  const maxHeight = SCREEN_HEIGHT * maxHeightRatio;
  const translateY = useSharedValue(maxHeight);
  const backdropOpacity = useSharedValue(0);

  // Show/hide animation
  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, ANIMATION.spring.bottomSheet);
      backdropOpacity.value = withTiming(1, { duration: ANIMATION.duration.normal });
    } else {
      translateY.value = withSpring(maxHeight, ANIMATION.spring.bottomSheet);
      backdropOpacity.value = withTiming(0, { duration: ANIMATION.duration.fast });
    }
  }, [visible, maxHeight, translateY, backdropOpacity]);

  const close = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  }, [onClose]);

  // Pan gesture for drag-to-dismiss
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > maxHeight * 0.3 || event.velocityY > 500) {
        translateY.value = withSpring(maxHeight, ANIMATION.spring.bottomSheet);
        backdropOpacity.value = withTiming(0, { duration: ANIMATION.duration.fast });
        runOnJS(close)();
      } else {
        translateY.value = withSpring(0, ANIMATION.spring.bottomSheet);
      }
    });

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, backdropAnimatedStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      </Animated.View>

      {/* Sheet */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.sheet,
            { maxHeight },
            sheetAnimatedStyle,
            style,
          ]}
        >
          {/* Glass background */}
          <BlurView
            intensity={GLASS.blurIntensityStrong}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />

          {/* Top highlight */}
          <View style={styles.highlight} />

          {/* Drag handle */}
          <View style={styles.handleContainer}>
            <LinearGradient
              colors={GRADIENTS.primary as unknown as [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.handle}
            />
          </View>

          {/* Content */}
          <View style={styles.content}>{children}</View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.glassBackdrop,
  },
  sheet: {
    backgroundColor: COLORS.glassBg,
    borderTopLeftRadius: RADIUS['2xl'],
    borderTopRightRadius: RADIUS['2xl'],
    borderWidth: GLASS.borderWidth,
    borderBottomWidth: 0,
    borderColor: COLORS.glassBorder,
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
  handleContainer: {
    alignItems: 'center',
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  content: {
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING['2xl'],
    position: 'relative',
    zIndex: 1,
  },
});

export default GlassBottomSheet;
