/**
 * ============================================================
 *  SHARE SERVICE
 *  Save exported videos to the device gallery and share
 *  to external apps via the native share sheet.
 * ============================================================
 */

import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

// ─── Save to Gallery ────────────────────────────────────────

/**
 * Saves a video file to the device's photo/video gallery.
 * Requests media library permissions if not already granted.
 *
 * @param uri - Path to the video file to save.
 * @throws If permission is denied or the save operation fails.
 */
export async function saveToGallery(uri: string): Promise<void> {
  const { status } = await MediaLibrary.requestPermissionsAsync(
    false,
    ['video'],
  );

  if (status !== 'granted') {
    throw new Error(
      'Media library permission is required to save videos to your gallery.',
    );
  }

  await MediaLibrary.saveToLibraryAsync(uri);
}

// ─── Share to App ───────────────────────────────────────────

/**
 * Opens the native share sheet to share a video file.
 *
 * @param uri - Path to the video file to share.
 * @throws If sharing is not available on this device.
 */
export async function shareToApp(uri: string): Promise<void> {
  const isAvailable = await Sharing.isAvailableAsync();

  if (!isAvailable) {
    throw new Error('Sharing is not available on this device.');
  }

  await Sharing.shareAsync(uri, {
    mimeType: 'video/mp4',
    dialogTitle: 'Share Video',
  });
}
