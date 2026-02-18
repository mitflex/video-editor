/**
 * ============================================================
 *  ClipSelector
 *  Container component that composes ClipPreview, ClipTimeline,
 *  duration indicator, and confirm button. Orchestrates the
 *  useClipSelector hook with the visual components.
 *
 *  Layout:
 *    Top ~55%: ClipPreview (video playback)
 *    Bottom ~45%: Glass panel with timeline + controls
 * ============================================================
 */

import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { ClipPreview } from './ClipPreview';
import { ClipTimeline, TIMELINE_WIDTH } from './ClipTimeline';
import { GradientButton } from '@/components/ui/GradientButton';
import { useClipSelector } from '@/hooks/useClipSelector';
import { COLORS, GRADIENTS, GLASS, SPACING, RADIUS } from '@/constants/theme';

// ─── Constants ──────────────────────────────────────────────

const SCREEN_HEIGHT = Dimensions.get('window').height;
const PREVIEW_RATIO = 0.55;

// ─── Props ──────────────────────────────────────────────────

interface ClipSelectorProps {
  /** Source video URI */
  videoPath: string;
  /** Total video duration in ms */
  durationMs: number;
  /** Generated thumbnail URIs */
  thumbnails: string[];
  /** Called when user confirms selection */
  onConfirm: (startMs: number, endMs: number) => void;
}

// ─── Component ──────────────────────────────────────────────

export function ClipSelector({
  videoPath,
  durationMs,
  thumbnails,
  onConfirm,
}: ClipSelectorProps) {
  const clip = useClipSelector({
    durationMs,
    timelineWidth: TIMELINE_WIDTH,
  });

  const handleConfirm = useCallback(() => {
    if (clip.isValid) {
      onConfirm(clip.startMs, clip.endMs);
    }
  }, [clip.isValid, clip.startMs, clip.endMs, onConfirm]);

  // ── Format duration for display ──────────────────────────

  const formattedDuration = useMemo(() => {
    const totalSec = Math.round(clip.selectedDurationMs / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    if (min > 0) {
      return `${min}m ${sec}s`;
    }
    return `${sec}s`;
  }, [clip.selectedDurationMs]);

  const durationColor = clip.isOverLimit
    ? COLORS.error
    : COLORS.accentPrimary;

  return (
    <View className="flex-1 bg-[#0A0A0F]">
      {/* Video preview — top 55% */}
      <View style={{ height: SCREEN_HEIGHT * PREVIEW_RATIO }}>
        <ClipPreview
          videoPath={videoPath}
          startSec={clip.startMs / 1000}
          endSec={clip.endMs / 1000}
        />
      </View>

      {/* Glass panel — bottom 45% */}
      <View style={styles.panelContainer}>
        <BlurView intensity={GLASS.blurIntensity} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.panelOverlay} />

        {/* Drag handle */}
        <View className="items-center pt-3 pb-4">
          <LinearGradient
            colors={GRADIENTS.primary as unknown as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.dragHandle}
          />
        </View>

        {/* Duration indicator */}
        <View className="items-center mb-4">
          <Text
            style={[styles.durationText, { color: durationColor }]}
          >
            {formattedDuration} selected
          </Text>
          {clip.isOverLimit && (
            <Text className="text-[#EF4444] text-xs mt-1">
              Maximum duration is 60 seconds
            </Text>
          )}
        </View>

        {/* Timeline */}
        <View style={styles.timelineContainer}>
          <ClipTimeline
            thumbnails={thumbnails}
            startPx={clip.startPx}
            endPx={clip.endPx}
            onStartChange={clip.setStartPx}
            onEndChange={clip.setEndPx}
            isOverLimit={clip.isOverLimit}
          />
        </View>

        {/* Time labels */}
        <View className="flex-row justify-between px-4 mt-2">
          <Text className="text-[#64748B] text-xs">
            {formatTime(clip.startMs)}
          </Text>
          <Text className="text-[#64748B] text-xs">
            {formatTime(clip.endMs)}
          </Text>
        </View>

        {/* Confirm button */}
        <View className="items-center mt-6 px-6">
          <GradientButton
            title="Confirm Selection"
            onPress={handleConfirm}
            gradient={clip.isOverLimit ? 'error' : 'primary'}
            disabled={!clip.isValid}
            fullWidth
            glow={clip.isValid}
          />
        </View>
      </View>
    </View>
  );
}

// ─── Helpers ────────────────────────────────────────────────

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

// ─── Styles ─────────────────────────────────────────────────

const styles = StyleSheet.create({
  panelContainer: {
    flex: 1,
    borderTopLeftRadius: RADIUS['2xl'],
    borderTopRightRadius: RADIUS['2xl'],
    overflow: 'hidden',
    borderWidth: GLASS.borderWidth,
    borderBottomWidth: 0,
    borderColor: COLORS.glassBorder,
  },
  panelOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.glassBg,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  durationText: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  timelineContainer: {
    marginHorizontal: SPACING.base,
  },
});

export default ClipSelector;
