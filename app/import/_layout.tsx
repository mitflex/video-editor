/**
 * ============================================================
 *  Import Flow Layout
 *  Stack navigator for the video import flow:
 *    index  → Gallery picker
 *    clip-selector → Clip range selection for long videos
 * ============================================================
 */

import { Stack } from 'expo-router';

export default function ImportLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    />
  );
}
