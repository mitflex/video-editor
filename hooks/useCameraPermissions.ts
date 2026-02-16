/**
 * ============================================================
 *  USE CAMERA PERMISSIONS
 *  Wraps VisionCamera permission hooks for camera and microphone.
 *  Provides a single interface to check and request both permissions.
 * ============================================================
 */

import {
  useCameraPermission,
  useMicrophonePermission,
} from 'react-native-vision-camera';

export interface CameraPermissions {
  /** Whether camera permission is granted */
  cameraPermission: boolean;
  /** Whether microphone permission is granted */
  microphonePermission: boolean;
  /** Whether both camera and microphone are granted */
  allGranted: boolean;
  /** Requests both camera and microphone permissions. Returns true if both granted. */
  requestPermissions: () => Promise<boolean>;
}

/**
 * Hook that manages camera and microphone permissions.
 * Uses VisionCamera's built-in permission hooks.
 */
export function useCameraPermissions(): CameraPermissions {
  const {
    hasPermission: cameraPermission,
    requestPermission: requestCamera,
  } = useCameraPermission();

  const {
    hasPermission: microphonePermission,
    requestPermission: requestMicrophone,
  } = useMicrophonePermission();

  const allGranted = cameraPermission && microphonePermission;

  const requestPermissions = async (): Promise<boolean> => {
    const cameraResult = cameraPermission || (await requestCamera());
    const micResult = microphonePermission || (await requestMicrophone());
    return cameraResult && micResult;
  };

  return {
    cameraPermission,
    microphonePermission,
    allGranted,
    requestPermissions,
  };
}
