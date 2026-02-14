import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, SPACING, RADIUS } from '../constants/theme';
import {
  GradientText,
  GradientButton,
  GlowIconButton,
  AnimatedPill,
  PremiumSlider,
  GlassCard,
  ShimmerLoader,
} from '../components/ui';

export default function Home() {
  const [activePill, setActivePill] = useState<string>('1x');
  const [sliderValue, setSliderValue] = useState<number>(50);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.section}>
          <GradientText text="UI Showcase" size="3xl" />
          <Text style={styles.subtitle}>Premium Components Library</Text>
        </View>

        {/* Gradient Buttons */}
        <View style={styles.section}>
          <GradientText text="Gradient Buttons" size="xl" style={styles.sectionTitle} />
          <View style={styles.row}>
            <GradientButton title="Primary" onPress={() => {}} />
            <GradientButton title="Accent" gradient="accent" onPress={() => {}} />
          </View>
          <View style={styles.row}>
            <GradientButton title="Small" size="sm" onPress={() => {}} />
            <GradientButton title="Large Glow" size="lg" glow onPress={() => {}} />
          </View>
          <View style={styles.row}>
            <GradientButton title="Loading" loading onPress={() => {}} />
            <GradientButton title="Disabled" disabled onPress={() => {}} />
          </View>
          <GradientButton
            title="Full Width Button"
            fullWidth
            gradient="success"
            icon={<Ionicons name="checkmark-circle" size={20} color="white" />}
            onPress={() => {}}
            style={styles.marginTop}
          />
        </View>

        {/* Glow Icon Buttons */}
        <View style={styles.section}>
          <GradientText text="Glow Icon Buttons" size="xl" style={styles.sectionTitle} />
          <View style={styles.row}>
            <GlowIconButton icon="camera" onPress={() => {}} />
            <GlowIconButton
              icon="radio-button-on"
              active={isRecording}
              gradient="error"
              onPress={() => setIsRecording(!isRecording)}
            />
            <GlowIconButton icon="videocam" gradient="accent" onPress={() => {}} />
            <GlowIconButton icon="mic-off" disabled onPress={() => {}} />
          </View>
          <View style={[styles.row, styles.marginTop]}>
            <GlowIconButton icon="flash" transparent onPress={() => {}} />
            <GlowIconButton icon="camera-reverse" transparent onPress={() => {}} />
            <GlowIconButton icon="settings" transparent onPress={() => {}} />
          </View>
        </View>

        {/* Animated Pills */}
        <View style={styles.section}>
          <GradientText text="Animated Pills" size="xl" style={styles.sectionTitle} />
          <View style={styles.pillContainer}>
            {['0.5x', '1x', '2x', '4x'].map((speed) => (
              <AnimatedPill
                key={speed}
                label={speed}
                active={activePill === speed}
                onPress={() => setActivePill(speed)}
                style={styles.pill}
              />
            ))}
          </View>
          <View style={[styles.pillContainer, styles.marginTop]}>
            <AnimatedPill label="Small" size="sm" active={false} onPress={() => {}} />
            <AnimatedPill
              label="Active"
              size="sm"
              active={true}
              gradient="accent"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Premium Slider */}
        <View style={styles.section}>
          <GradientText text="Premium Slider" size="xl" style={styles.sectionTitle} />
          <GlassCard>
            <PremiumSlider
              label="Brightness"
              value={sliderValue}
              min={0}
              max={100}
              onValueChange={setSliderValue}
              gradient="primary"
            />
            <PremiumSlider
              label="Contrast"
              value={75}
              min={0}
              max={100}
              onValueChange={() => {}}
              gradient="accent"
              style={styles.marginTop}
            />
          </GlassCard>
        </View>

        {/* Glass Cards */}
        <View style={styles.section}>
          <GradientText text="Glass Cards" size="xl" style={styles.sectionTitle} />
          <GlassCard style={styles.marginBottom}>
            <Text style={styles.cardText}>Standard Glass Card</Text>
            <Text style={styles.cardSubtext}>Blur intensity and border handling.</Text>
          </GlassCard>

          <GlassCard glow onPress={() => {}}>
            <View style={styles.cardRow}>
              <View>
                <Text style={styles.cardText}>Interactive & Glowing</Text>
                <Text style={styles.cardSubtext}>Tap me to see press animation.</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
            </View>
          </GlassCard>
        </View>

        {/* Shimmer Loaders */}
        <View style={styles.section}>
          <GradientText text="Shimmer Loaders" size="xl" style={styles.sectionTitle} />
          <View style={styles.row}>
            <ShimmerLoader width={60} height={60} borderRadius={30} />
            <View style={{ flex: 1, marginLeft: 16 }}>
              <ShimmerLoader width="80%" height={20} style={styles.marginBottom} />
              <ShimmerLoader width="40%" height={16} />
            </View>
          </View>
          <ShimmerLoader width="100%" height={120} borderRadius={16} style={styles.marginTop} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Video Editor UI Kit v1.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  section: {
    marginBottom: SPACING['3xl'],
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginTop: SPACING.xs,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  marginTop: {
    marginTop: SPACING.md,
  },
  marginBottom: {
    marginBottom: SPACING.sm,
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    backgroundColor: COLORS.bgTertiary,
    padding: SPACING.sm,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  pill: {
    // marginBottom: SPACING.xs,
  },
  cardText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  cardSubtext: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footer: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  footerText: {
    color: COLORS.textTertiary,
    fontSize: 12,
  },
});
