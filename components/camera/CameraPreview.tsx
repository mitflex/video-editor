/**
 * ============================================================
 *  CameraPreview
 *  Video playback component for the camera preview screen.
 *  Uses expo-video to play back the just-recorded video in a
 *  looping 9:16 player.
 * ============================================================
 */

import React, { useCallback } from 'react';
import { View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

// ─── Props ──────────────────────────────────────────────────

interface CameraPreviewProps {
  videoPath: string;
}

// ─── Component ──────────────────────────────────────────────

export function CameraPreview({ videoPath }: CameraPreviewProps) {
  const player = useVideoPlayer(videoPath, (p) => {
    p.loop = true;
    p.play();
  });

  return (
    <View className="flex-1 bg-black">
      <VideoView
        player={player}
        style={{ flex: 1 }}
        contentFit="cover"
        nativeControls={false}
      />
    </View>
  );
}

export default CameraPreview;
