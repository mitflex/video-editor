/**
 * ============================================================
 *  ClipPreview
 *  Video preview that syncs playback position with the clip
 *  selector handles. Loops within the selected range.
 *  Uses expo-video for playback.
 * ============================================================
 */

import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

// ─── Props ──────────────────────────────────────────────────

interface ClipPreviewProps {
  /** Source video URI */
  videoPath: string;
  /** Start of selected range in seconds */
  startSec: number;
  /** End of selected range in seconds */
  endSec: number;
}

// ─── Component ──────────────────────────────────────────────

export function ClipPreview({ videoPath, startSec, endSec }: ClipPreviewProps) {
  const player = useVideoPlayer(videoPath, (p) => {
    p.loop = true;
    p.currentTime = startSec;
    p.play();
  });

  // Sync playback to selection range
  useEffect(() => {
    if (!player) return;

    // Seek to start when handles change
    player.currentTime = startSec;

    // Set up loop boundary check (100ms for tighter boundary detection)
    const interval = setInterval(() => {
      if (player.currentTime >= endSec) {
        player.currentTime = startSec;
      }
    }, 100);

    return () => clearInterval(interval);
  }, [player, startSec, endSec]);

  return (
    <View className="flex-1 bg-black">
      <VideoView
        player={player}
        style={{ flex: 1 }}
        contentFit="contain"
        nativeControls={false}
      />
    </View>
  );
}

export default ClipPreview;
