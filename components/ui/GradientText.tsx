/**
 * ============================================================
 *  GradientText
 *  Eye-catching gradient text using MaskedView + LinearGradient.
 *  Used for section headings and premium labels.
 *
 *  Usage:
 *    <GradientText text="Video Editor" size="xl" />
 *    <GradientText text="Filters" gradient="accent" />
 * ============================================================
 */

import React from 'react';
import { StyleSheet, Text, type TextStyle } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';

import { GRADIENTS, COLORS, FONT_SIZE } from '../../constants/theme';

// ─── Types ─────────────────────────────────────────────────
type GradientKey = keyof typeof GRADIENTS;
type TextSize = keyof typeof FONT_SIZE;

interface GradientTextProps {
  /** Text content */
  text: string;
  /** Gradient preset key (default: 'textHeading') */
  gradient?: GradientKey;
  /** Font size key (default: 'xl') */
  size?: TextSize;
  /** Font weight (default: '700') */
  weight?: TextStyle['fontWeight'];
  /** Additional text styles */
  style?: TextStyle;
  /** ClassName for NativeWind */
  className?: string;
}

// ─── Component ─────────────────────────────────────────────
export function GradientText({
  text,
  gradient = 'textHeading',
  size = 'xl',
  weight = '700',
  style,
}: GradientTextProps) {
  const gradientColors = GRADIENTS[gradient] as unknown as [string, string, ...string[]];
  const fontSize = FONT_SIZE[size];

  return (
    <MaskedView
      maskElement={
        <Text style={[styles.maskText, { fontSize, fontWeight: weight }, style]}>{text}</Text>
      }>
      <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        {/* Invisible text to provide correct dimensions */}
        <Text style={[styles.hiddenText, { fontSize, fontWeight: weight }, style]}>{text}</Text>
      </LinearGradient>
    </MaskedView>
  );
}

// ─── Styles ────────────────────────────────────────────────
const styles = StyleSheet.create({
  maskText: {
    color: COLORS.textPrimary, // Will be masked, color doesn't matter but needs to be opaque
    backgroundColor: 'transparent',
  },
  hiddenText: {
    opacity: 0,
  },
});

export default GradientText;
