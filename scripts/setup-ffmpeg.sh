#!/bin/bash

# Target directory for the FFmpeg frameworks
TARGET_DIR="node_modules/@apescoding/ffmpeg-kit-react-native"
FRAMEWORK_DIR="$TARGET_DIR/ffmpeg-kit-ios-full"
ZIP_FILE="ffmpeg-kit-ios-full.zip"
DOWNLOAD_URL="https://github.com/luthviar/ffmpeg-kit-ios-full/releases/download/6.0/ffmpeg-kit-ios-full.zip"

# Check if the framework directory already exists
if [ -d "$FRAMEWORK_DIR" ]; then
  echo "✅ FFmpeg Kit iOS Full frameworks already installed."
  exit 0
fi

echo "⚠️  FFmpeg Kit frameworks missing. Downloading from community mirror..."

# Navigate to the target directory
if [ ! -d "$TARGET_DIR" ]; then
  echo "❌ Error: $TARGET_DIR does not exist. Run 'npm install' first."
  exit 1
fi

cd "$TARGET_DIR" || exit

# Download the zip file
echo "⬇️  Downloading $ZIP_FILE..."
curl -L -o "$ZIP_FILE" "$DOWNLOAD_URL"

if [ $? -ne 0 ]; then
    echo "❌ Download failed."
    exit 1
fi

# Unzip the file
echo "📦 Extracting..."
unzip -o -q "$ZIP_FILE"

if [ $? -ne 0 ]; then
    echo "❌ Extraction failed."
    rm "$ZIP_FILE"
    exit 1
fi

# Cleanup
rm "$ZIP_FILE"

echo "✅ FFmpeg Kit iOS Full installed successfully!"
