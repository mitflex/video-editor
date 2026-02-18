/**
 * ============================================================
 *  Clip Selector Screen
 *  Shows the ClipSelector for videos longer than 60s.
 *  User must select a clip <= 60s, then on confirm:
 *    1. FFmpeg trims the video
 *    2. Navigate to editor with trimmed output
 * ============================================================
 */

import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { ClipSelector } from '@/components/import/ClipSelector';
import { ShimmerLoader } from '@/components/ui/ShimmerLoader';
import { ROUTES } from '@/constants/routes';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setTrimRange,
  setThumbnails,
  setGeneratingThumbnails,
} from '@/store/slices/projectSlice';
import { generateTimelineThumbnails } from '@/services/video/thumbnailService';
import { trimVideo } from '@/services/video/trimService';

// ─── Screen ─────────────────────────────────────────────────

export default function ClipSelectorScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { videoPath } = useLocalSearchParams<{ videoPath: string }>();

  const projectId = useAppSelector((s) => s.project.id);
  const sourceMetadata = useAppSelector((s) => s.project.sourceMetadata);
  const thumbnails = useAppSelector((s) => s.project.thumbnails);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingThumbs, setIsLoadingThumbs] = useState(true);

  // ── Generate thumbnails on mount ──────────────────────────

  useEffect(() => {
    if (!videoPath || !sourceMetadata || !projectId) return;

    const loadThumbnails = async () => {
      try {
        dispatch(setGeneratingThumbnails(true));
        setIsLoadingThumbs(true);
        const thumbs = await generateTimelineThumbnails(
          videoPath,
          sourceMetadata.durationMs,
          projectId,
        );
        dispatch(setThumbnails(thumbs));
      } catch (error) {
        console.error('Thumbnail generation error:', error);
      } finally {
        setIsLoadingThumbs(false);
      }
    };

    loadThumbnails();
  }, [videoPath, sourceMetadata, projectId, dispatch]);

  // ── Confirm selection → trim + navigate ───────────────────

  const handleConfirm = useCallback(
    async (startMs: number, endMs: number) => {
      if (!videoPath || !projectId) return;

      setIsProcessing(true);
      dispatch(setTrimRange({ startMs, endMs }));

      try {
        console.log('[ClipSelector] Trimming:', { videoPath, startMs, endMs, projectId });

        // Trim the video to the selected range
        const result = await trimVideo(videoPath, startMs, endMs, projectId);

        console.log('[ClipSelector] Trim result:', { isSuccess: result.isSuccess, outputUri: result.outputUri });

        if (result.isSuccess && result.outputUri) {
          // Navigate to editor with trimmed video
          router.replace({
            pathname: ROUTES.EDITOR,
            params: { videoPath: result.outputUri },
          });
        } else {
          Alert.alert('Trim Error', 'Failed to trim video. Please try again.');
          setIsProcessing(false);
        }
      } catch (error: unknown) {
        // Log full error details for debugging
        console.error('[ClipSelector] Trim error:', error);
        if (error && typeof error === 'object' && 'logs' in error) {
          console.error('[ClipSelector] FFmpeg logs:', (error as { logs?: string }).logs);
        }
        const msg = error instanceof Error ? error.message : String(error);
        Alert.alert('Error', msg);
        setIsProcessing(false);
      }
    },
    [videoPath, projectId, dispatch, router]
  );

  // ── Guards ────────────────────────────────────────────────

  if (!videoPath || !sourceMetadata) {
    return (
      <View className="flex-1 bg-[#0A0A0F] items-center justify-center">
        <StatusBar style="light" />
        <Text className="text-[#94A3B8] text-base">No video loaded.</Text>
      </View>
    );
  }

  // ── Processing overlay ────────────────────────────────────

  if (isProcessing) {
    return (
      <View className="flex-1 bg-[#0A0A0F] items-center justify-center px-8">
        <StatusBar style="light" />
        <ShimmerLoader width={120} height={120} borderRadius={60} />
        <Text className="text-[#F1F5F9] text-base font-semibold mt-6">
          Trimming video...
        </Text>
        <Text className="text-[#94A3B8] text-sm mt-2">
          This may take a moment.
        </Text>
      </View>
    );
  }

  // ── Loading thumbnails ────────────────────────────────────

  if (isLoadingThumbs) {
    return (
      <View className="flex-1 bg-[#0A0A0F] items-center justify-center px-8">
        <StatusBar style="light" />
        <ShimmerLoader width={200} height={56} borderRadius={8} />
        <Text className="text-[#94A3B8] text-sm mt-4">
          Generating preview...
        </Text>
      </View>
    );
  }

  // ── Main UI ───────────────────────────────────────────────

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <ClipSelector
        videoPath={videoPath}
        durationMs={sourceMetadata.durationMs}
        thumbnails={thumbnails}
        onConfirm={handleConfirm}
      />
    </View>
  );
}
