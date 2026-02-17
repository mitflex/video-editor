/**
 * ============================================================
 *  Camera Preview Screen
 *  Shows the recorded video with "Retake" and "Use Video"
 *  action buttons. The video loops automatically.
 * ============================================================
 */

import React, { useCallback } from 'react';
import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CameraPreview } from '@/components/camera/CameraPreview';
import { GradientButton } from '@/components/ui/GradientButton';
import { SPACING, COLORS } from '@/constants/theme';
import { ROUTES } from '@/constants/routes';

// ─── Screen ─────────────────────────────────────────────────

export default function PreviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { videoPath } = useLocalSearchParams<{ videoPath: string }>();

  const handleRetake = useCallback(() => {
    router.back();
  }, [router]);

  const handleUseVideo = useCallback(() => {
    router.replace({
      pathname: ROUTES.EDITOR,
      params: { videoPath },
    });
  }, [router, videoPath]);

  if (!videoPath) {
    return (
      <View className="flex-1 bg-[#0A0A0F] items-center justify-center">
        <StatusBar hidden />
        <Text className="text-[#94A3B8] text-base">No video to preview.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <StatusBar hidden />

      {/* Video playback */}
      <CameraPreview videoPath={videoPath} />

      {/* Bottom action bar */}
      <View
        className="absolute bottom-0 left-0 right-0 flex-row justify-between items-center px-6"
        style={{ paddingBottom: insets.bottom + SPACING.lg }}
      >
        <GradientButton
          title="Retake"
          onPress={handleRetake}
          size="md"
          gradient="surface"
        />
        <GradientButton
          title="Use Video"
          onPress={handleUseVideo}
          size="md"
          gradient="primary"
          glow
        />
      </View>
    </View>
  );
}
