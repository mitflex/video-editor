import React, { useState } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../constants/theme';
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
    <SafeAreaView className="flex-1 bg-bg-primary">
      <StatusBar style="light" />
      <ScrollView contentContainerClassName="p-5 pb-10">
        {/* Header */}
        <View className="mb-12">
          <GradientText text="UI Showcase" size="3xl" />
          <Text className="mt-1 text-base text-text-secondary">Premium Components Library</Text>
        </View>

        {/* Gradient Buttons */}
        <View className="mb-12">
          <View className="mb-3">
            <GradientText text="Gradient Buttons" size="xl" />
          </View>
          <View className="mb-2 flex-row flex-wrap items-center gap-3">
            <GradientButton title="Primary" onPress={() => {}} />
            <GradientButton title="Accent" gradient="accent" onPress={() => {}} />
          </View>
          <View className="mb-2 flex-row flex-wrap items-center gap-3">
            <GradientButton title="Small" size="sm" onPress={() => {}} />
            <GradientButton title="Large Glow" size="lg" glow onPress={() => {}} />
          </View>
          <View className="mb-2 flex-row flex-wrap items-center gap-3">
            <GradientButton title="Loading" loading onPress={() => {}} />
            <GradientButton title="Disabled" disabled onPress={() => {}} />
          </View>
          <GradientButton
            title="Full Width Button"
            fullWidth
            gradient="success"
            icon={<Ionicons name="checkmark-circle" size={20} color="white" />}
            onPress={() => {}}
            style={{ marginTop: 12 }}
          />
        </View>

        {/* Glow Icon Buttons */}
        <View className="mb-12">
          <View className="mb-3">
            <GradientText text="Glow Icon Buttons" size="xl" />
          </View>
          <View className="mb-2 flex-row flex-wrap items-center gap-3">
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
          <View className="mb-2 mt-3 flex-row flex-wrap items-center gap-3">
            <GlowIconButton icon="flash" transparent onPress={() => {}} />
            <GlowIconButton icon="camera-reverse" transparent onPress={() => {}} />
            <GlowIconButton icon="settings" transparent onPress={() => {}} />
          </View>
        </View>

        {/* Animated Pills */}
        <View className="mb-12">
          <View className="mb-3">
            <GradientText text="Animated Pills" size="xl" />
          </View>
          <View className="flex-row flex-wrap gap-2 self-start rounded-full bg-bg-tertiary p-2">
            {['0.5x', '1x', '2x', '4x'].map((speed) => (
              <AnimatedPill
                key={speed}
                label={speed}
                active={activePill === speed}
                onPress={() => setActivePill(speed)}
              />
            ))}
          </View>
          <View className="mt-3 flex-row flex-wrap gap-2 self-start rounded-full bg-bg-tertiary p-2">
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
        <View className="mb-12">
          <View className="mb-3">
            <GradientText text="Premium Slider" size="xl" />
          </View>
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
              style={{ marginTop: 12 }}
            />
          </GlassCard>
        </View>

        {/* Glass Cards */}
        <View className="mb-12">
          <View className="mb-3">
            <GradientText text="Glass Cards" size="xl" />
          </View>
          <GlassCard style={{ marginBottom: 8 }}>
            <Text className="text-base font-semibold text-text-primary">Standard Glass Card</Text>
            <Text className="mt-1 text-sm text-text-secondary">
              Blur intensity and border handling.
            </Text>
          </GlassCard>

          <GlassCard glow onPress={() => {}}>
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-base font-semibold text-text-primary">
                  Interactive & Glowing
                </Text>
                <Text className="mt-1 text-sm text-text-secondary">
                  Tap me to see press animation.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
            </View>
          </GlassCard>
        </View>

        {/* Shimmer Loaders */}
        <View className="mb-12">
          <View className="mb-3">
            <GradientText text="Shimmer Loaders" size="xl" />
          </View>
          <View className="mb-2 flex-row flex-wrap items-center gap-3">
            <ShimmerLoader width={60} height={60} borderRadius={30} />
            <View style={{ flex: 1, marginLeft: 16 }}>
              <ShimmerLoader width="80%" height={20} style={{ marginBottom: 8 }} />
              <ShimmerLoader width="40%" height={16} />
            </View>
          </View>
          <ShimmerLoader width="100%" height={120} borderRadius={16} style={{ marginTop: 12 }} />
        </View>

        <View className="my-6 items-center">
          <Text className="text-xs text-text-tertiary">Video Editor UI Kit v1.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
