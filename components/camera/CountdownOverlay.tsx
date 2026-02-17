/**
 * ============================================================
 *  CountdownOverlay
 *  Full-screen 3-2-1-GO countdown animation using Reanimated.
 *  Each number scales up and fades out before the next appears.
 *  Calls onComplete when finished.
 * ============================================================
 */

import React, { useEffect, useCallback } from 'react';
import { View, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';

import { ANIMATION } from '@/constants/theme';

// ─── Props ──────────────────────────────────────────────────

interface CountdownOverlayProps {
  /** How many seconds to count down from (3 or 5 or 10) */
  seconds: number;
  /** Called when countdown reaches 0 */
  onComplete: () => void;
}

// ─── Component ──────────────────────────────────────────────

export function CountdownOverlay({ seconds, onComplete }: CountdownOverlayProps) {
  const currentNumber = useSharedValue(seconds);
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(1);

  const triggerHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const finish = useCallback(() => {
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    // Animate each number: scale up + fade out, then next
    const step = ANIMATION.duration.countdown; // 800ms per number

    for (let i = 0; i < seconds; i++) {
      const delay = i * step;
      const isLast = i === seconds - 1;

      // At each step: set current number, scale in, then fade out
      scale.value = withDelay(
        delay,
        withSequence(
          withTiming(0.5, { duration: 0 }),
          withTiming(1, { duration: step * 0.6, easing: Easing.out(Easing.back(1.5)) }),
          withTiming(1.5, { duration: step * 0.4, easing: Easing.in(Easing.ease) })
        )
      );

      opacity.value = withDelay(
        delay,
        withSequence(
          withTiming(1, { duration: 0 }),
          withTiming(1, { duration: step * 0.6 }),
          withTiming(0, { duration: step * 0.4 })
        )
      );

      currentNumber.value = withDelay(delay, withTiming(seconds - i, { duration: 0 }));

      // Haptic on each beat
      setTimeout(() => {
        triggerHaptic();
      }, delay);

      // Complete after last number
      if (isLast) {
        setTimeout(() => {
          finish();
        }, delay + step);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View className="absolute inset-0 items-center justify-center z-20 bg-black/40">
      <Animated.View style={animatedStyle}>
        <Text className="text-white text-7xl font-bold">
          {Math.ceil(seconds - (seconds - 1))}
        </Text>
      </Animated.View>
    </View>
  );
}

export default CountdownOverlay;
