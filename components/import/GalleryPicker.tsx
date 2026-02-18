/**
 * ============================================================
 *  GalleryPicker
 *  Wrapper around expo-image-picker that handles permissions,
 *  launches the system video picker, and returns the selected
 *  asset. Used by the import screen.
 * ============================================================
 */

import * as ImagePicker from 'expo-image-picker';

// ─── Types ──────────────────────────────────────────────────

export interface PickedVideo {
  uri: string;
  width: number;
  height: number;
  /** Duration in milliseconds (from picker, may be approximate) */
  durationMs: number;
  fileName: string | null;
  fileSize: number | null;
}

// ─── Utility Functions ──────────────────────────────────────

/**
 * Request media library permission.
 * @returns true if granted, false otherwise.
 */
export async function requestGalleryPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
}

/**
 * Launch the system video picker.
 * @returns The picked video info, or null if cancelled.
 */
export async function pickVideo(): Promise<PickedVideo | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['videos'],
    quality: 1,
    allowsEditing: false,
  });

  if (result.canceled || !result.assets?.[0]) {
    return null;
  }

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
    durationMs: (asset.duration ?? 0) * 1000, // expo returns seconds
    fileName: asset.fileName ?? null,
    fileSize: asset.fileSize ?? null,
  };
}
