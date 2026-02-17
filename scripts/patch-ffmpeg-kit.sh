#!/bin/bash
# ============================================================
#  patch-ffmpeg-kit.sh
#  1. Downloads FFmpegKit xcframeworks into the @apescoding/ffmpeg-kit-react-native
#     package directory (since the podspec's :http source doesn't work
#     when CocoaPods resolves the pod via local :path).
#  2. Patches the podspec to add libavdevice.xcframework, minimum
#     iOS version, and C++17 settings.
#
#  Run automatically via npm postinstall, or manually:
#    bash scripts/patch-ffmpeg-kit.sh
# ============================================================

set -e

PACKAGE_DIR="node_modules/@apescoding/ffmpeg-kit-react-native"
MARKER="$PACKAGE_DIR/ffmpegkit.xcframework"
PODSPEC="$PACKAGE_DIR/ffmpeg-kit-react-native.podspec"
ZIP_URL="https://github.com/userkr/ffmpeg-kit/releases/download/Latest/ffmpeg-kit-https-6.0-ios-xcframework.zip"

# ── Step 1: Download xcframeworks if not present ──────────────

if [ -d "$MARKER" ]; then
  echo "[patch-ffmpeg-kit] xcframeworks already present, skipping download."
else
  echo "[patch-ffmpeg-kit] Downloading FFmpegKit xcframeworks..."
  curl -L -o "$PACKAGE_DIR/ffmpeg-kit.zip" "$ZIP_URL"

  echo "[patch-ffmpeg-kit] Extracting xcframeworks..."
  unzip -o "$PACKAGE_DIR/ffmpeg-kit.zip" -d "$PACKAGE_DIR" > /dev/null

  rm -f "$PACKAGE_DIR/ffmpeg-kit.zip"
  echo "[patch-ffmpeg-kit] xcframeworks extracted to $PACKAGE_DIR/"
fi

# ── Step 2: Patch the podspec ─────────────────────────────────

if [ ! -f "$PODSPEC" ]; then
  echo "[patch-ffmpeg-kit] Warning: podspec not found at $PODSPEC, skipping patch."
  exit 0
fi

# 2a. Add libavdevice.xcframework to vendored_frameworks (if not already present)
if ! grep -q 'libavdevice.xcframework' "$PODSPEC"; then
  echo "[patch-ffmpeg-kit] Adding libavdevice.xcframework to vendored_frameworks..."
  sed -i '' 's/"libavfilter.xcframework"/"libavfilter.xcframework",\n      "libavdevice.xcframework"/' "$PODSPEC"
fi

# 2b. Set minimum iOS deployment target (if not already set)
if grep -q 's.platform          = :ios$' "$PODSPEC"; then
  echo "[patch-ffmpeg-kit] Setting iOS deployment target to 13.4..."
  sed -i '' 's/s.platform          = :ios$/s.platform          = :ios, "13.4"/' "$PODSPEC"
fi

# 2c. Add C++17 and preprocessor definitions to pod_target_xcconfig
if ! grep -q 'CLANG_CXX_LANGUAGE_STANDARD' "$PODSPEC"; then
  echo "[patch-ffmpeg-kit] Adding C++17 settings to pod_target_xcconfig..."
  sed -i '' "s/'OTHER_LDFLAGS' => '-framework ffmpegkit.*/'OTHER_LDFLAGS' => '-framework ffmpegkit -framework libavcodec -framework libavformat -framework libavutil -framework libswscale -framework libswresample -framework libavfilter -framework libavdevice',\n    'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',\n    'GCC_PREPROCESSOR_DEFINITIONS' => '\$(inherited) OS_OBJECT_USE_OBJC=1'/" "$PODSPEC"
fi

echo "[patch-ffmpeg-kit] Done."
