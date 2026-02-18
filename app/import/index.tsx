/**
 * ============================================================
 *  Video Import Screen
 *  Launches the system gallery picker to select a video.
 *  After selection:
 *    - If video <= 60s → navigate directly to editor
 *    - If video > 60s  → navigate to clip selector
 *
 *  Uses expo-image-picker for gallery access.
 * ============================================================
 */

import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { GradientButton } from '@/components/ui/GradientButton';
import { ShimmerLoader } from '@/components/ui/ShimmerLoader';
import { COLORS, SPACING } from '@/constants/theme';
import { ROUTES } from '@/constants/routes';
import { MAX_VIDEO_DURATION_MS } from '@/constants/filters';
import { useAppDispatch } from '@/store/hooks';
import {
  createProject,
  setSourceMetadata,
  setLoadingMetadata,
  setError,
} from '@/store/slices/projectSlice';
import { getVideoMetadata } from '@/services/video/metadataService';
import { createProjectDir, resolveContentUri } from '@/services/file/fileService';

// ─── Screen ─────────────────────────────────────────────────

export default function ImportScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  // Launch picker immediately on mount
  useEffect(() => {
    launchPicker();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const launchPicker = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant media library access to import videos.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        quality: 1,
        allowsEditing: false,
      });

      if (result.canceled || !result.assets?.[0]) {
        // User cancelled — go back
        router.back();
        return;
      }

      const asset = result.assets[0];
      const rawVideoUri = asset.uri;

      setIsLoading(true);

      // Generate project ID upfront so we can create directories
      const projectId = `proj_${Date.now()}`;
      createProjectDir(projectId);

      // Resolve content:// URIs (Android gallery returns these)
      // FFmpeg cannot read content:// directly — copy to local file
      const videoUri = resolveContentUri(rawVideoUri, projectId);

      dispatch(createProject({ sourceUri: videoUri, source: 'gallery', id: projectId }));
      dispatch(setLoadingMetadata(true));

      // Extract metadata
      const metadata = await getVideoMetadata(videoUri);
      dispatch(setSourceMetadata(metadata));

      setIsLoading(false);

      // Route based on duration
      if (metadata.durationMs > MAX_VIDEO_DURATION_MS) {
        // Long video → clip selector
        router.replace({
          pathname: '/import/clip-selector',
          params: { videoPath: videoUri },
        });
      } else {
        // Short video → straight to editor
        router.replace({
          pathname: ROUTES.EDITOR,
          params: { videoPath: videoUri },
        });
      }
    } catch (error) {
      setIsLoading(false);
      const msg = error instanceof Error ? error.message : String(error);
      dispatch(setError(msg));
      Alert.alert('Import Error', msg, [{ text: 'OK', onPress: () => router.back() }]);
    }
  }, [dispatch, router]);

  // ── Loading state ──────────────────────────────────────────

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#0A0A0F] items-center justify-center px-8">
        <StatusBar style="light" />
        <ShimmerLoader width={200} height={200} borderRadius={16} />
        <Text className="text-[#94A3B8] text-base mt-6">Analyzing video...</Text>
      </View>
    );
  }

  // ── Fallback UI (visible briefly before picker launches) ───

  return (
    <View className="flex-1 bg-[#0A0A0F] items-center justify-center px-8">
      <StatusBar style="light" />
      <Text className="text-[#F1F5F9] text-xl font-bold mb-2">Import Video</Text>
      <Text className="text-[#94A3B8] text-sm text-center mb-8">
        Select a video from your gallery to start editing.
      </Text>
      <GradientButton
        title="Open Gallery"
        onPress={launchPicker}
        gradient="primary"
        glow
      />
    </View>
  );
}
