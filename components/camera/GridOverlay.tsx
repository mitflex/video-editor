/**
 * ============================================================
 *  GridOverlay
 *  Rule-of-thirds grid overlay for the camera viewfinder.
 *  Renders 2 horizontal + 2 vertical lines dividing the
 *  screen into a 3x3 grid. Only visible when showGrid is true.
 * ============================================================
 */

import React from 'react';
import { View } from 'react-native';

import { useAppSelector } from '@/store/hooks';

// ─── Component ──────────────────────────────────────────────

export function GridOverlay() {
  const showGrid = useAppSelector((s) => s.camera.showGrid);

  if (!showGrid) return null;

  return (
    <View className="absolute inset-0 z-5" pointerEvents="none">
      {/* Horizontal lines at 1/3 and 2/3 */}
      <View className="absolute left-0 right-0 h-px bg-white/25" style={{ top: '33.33%' }} />
      <View className="absolute left-0 right-0 h-px bg-white/25" style={{ top: '66.66%' }} />

      {/* Vertical lines at 1/3 and 2/3 */}
      <View className="absolute top-0 bottom-0 w-px bg-white/25" style={{ left: '33.33%' }} />
      <View className="absolute top-0 bottom-0 w-px bg-white/25" style={{ left: '66.66%' }} />
    </View>
  );
}

export default GridOverlay;
