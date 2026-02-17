/**
 * ============================================================
 *  Home Screen (Temporary Dev Launcher)
 *  Quick-access buttons to test Sprint 1 & 2 features.
 *  This will be replaced by the real Home Screen in Sprint 10.
 * ============================================================
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, SPACING } from '@/constants/theme';
import { GradientText, GradientButton, GlassCard } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { getFFmpegVersion } from '@/services/ffmpeg/ffmpegService';

export default function Home() {
  const router = useRouter();
  const [ffmpegStatus, setFfmpegStatus] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  // ── Navigate to Camera ────────────────────────────────

  const handleOpenCamera = () => {
    router.navigate(ROUTES.CAMERA);
  };

  // ── Sprint 1 Diagnostic ───────────────────────────────

  const handleCheckFFmpeg = async () => {
    setChecking(true);
    try {
      const version = await getFFmpegVersion();
      setFfmpegStatus(`FFmpeg OK: ${version}`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      setFfmpegStatus(`FFmpeg Error: ${msg}`);
    } finally {
      setChecking(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0F]">
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 60 }}>
        {/* Header */}
        <View className="mb-8">
          <GradientText text="Video Editor" size="3xl" />
          <Text className="mt-1 text-base text-[#94A3B8]">Dev Launcher — Sprint 1 & 2 Testing</Text>
        </View>

        {/* Sprint 2: Camera */}
        <View className="mb-8">
          <GradientText text="Sprint 2: Camera" size="xl" style={{ marginBottom: SPACING.md }} />
          <GlassCard>
            <View className="mb-3 flex-row items-center">
              <Ionicons name="videocam" size={24} color={COLORS.accentPrimary} />
              <Text className="ml-3 text-base font-semibold text-[#F1F5F9]">Record Video</Text>
            </View>
            <Text className="mb-4 text-sm text-[#94A3B8]">
              Opens full-screen camera with record button, duration selector, countdown, grid
              overlay, pause/resume, and progress bar.
            </Text>
            <GradientButton
              title="Open Camera"
              onPress={handleOpenCamera}
              fullWidth
              gradient="warm"
              icon={<Ionicons name="camera" size={18} color="white" />}
            />
          </GlassCard>
        </View>

        {/* Sprint 1: FFmpeg Check */}
        <View className="mb-8">
          <GradientText text="Sprint 1: Services" size="xl" style={{ marginBottom: SPACING.md }} />
          <GlassCard>
            <View className="mb-3 flex-row items-center">
              <Ionicons name="construct" size={24} color={COLORS.accentSecondary} />
              <Text className="ml-3 text-base font-semibold text-[#F1F5F9]">FFmpeg Diagnostic</Text>
            </View>
            <Text className="mb-4 text-sm text-[#94A3B8]">
              Verifies the FFmpeg native module is linked and responding.
            </Text>
            <GradientButton
              title={checking ? 'Checking...' : 'Run FFmpeg Check'}
              onPress={handleCheckFFmpeg}
              fullWidth
              gradient="primary"
              loading={checking}
              icon={!checking ? <Ionicons name="pulse" size={18} color="white" /> : undefined}
            />
            {ffmpegStatus && (
              <View className="mt-3 rounded-xl bg-white/5 p-3">
                <Text
                  className={`font-mono text-sm ${ffmpegStatus.startsWith('FFmpeg OK') ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                  {ffmpegStatus}
                </Text>
              </View>
            )}
          </GlassCard>
        </View>

        {/* Feature Checklist */}
        <View className="mb-8">
          <GradientText text="What to Test" size="xl" style={{ marginBottom: SPACING.md }} />
          <GlassCard>
            <CheckItem label="Camera opens full-screen (no header)" />
            <CheckItem label="Duration pills: 10s / 30s / 60s" />
            <CheckItem label="Record button: warm gradient, morphs to stop square" />
            <CheckItem label="Progress ring fills on record button" />
            <CheckItem label="Top progress bar (red→orange gradient)" />
            <CheckItem label="Flash / Flip / Grid / Close controls" />
            <CheckItem label="Grid overlay toggles on/off" />
            <CheckItem label="Pause button appears during recording" />
            <CheckItem label="Duration badge shows elapsed time" />
            <CheckItem label="PAUSED label when paused" />
            <CheckItem label="Auto-stop at max duration" />
            <CheckItem label="Preview screen with Retake / Use Video" />
          </GlassCard>
        </View>

        <View className="mb-6 mt-4 items-center">
          <Text className="text-xs text-[#64748B]">Video Editor — Dev Build</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Helper Component ─────────────────────────────────────

function CheckItem({ label }: { label: string }) {
  return (
    <View className="flex-row items-center py-1.5">
      <View className="mr-3 h-5 w-5 items-center justify-center rounded-full border border-[#6366F1]/30">
        <View className="h-2 w-2 rounded-full bg-[#6366F1]/50" />
      </View>
      <Text className="flex-1 text-sm text-[#94A3B8]">{label}</Text>
    </View>
  );
}
