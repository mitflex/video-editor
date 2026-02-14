# Architecture Documentation

> Complete technical architecture for the Video Editor MVP.

---

## Table of Contents
- [System Overview](#system-overview)
- [Navigation Architecture](#navigation-architecture)
- [State Management](#state-management)
- [Service Layer](#service-layer)
- [Component Architecture](#component-architecture)
- [Data Flow](#data-flow)
- [FFmpeg Pipeline](#ffmpeg-pipeline)
- [File Management](#file-management)
- [Key Technical Decisions](#key-technical-decisions)
- [Constraints and Risks](#constraints-and-risks)

---

## System Overview

```
+------------------+     +------------------+     +------------------+
|   VIDEO INPUT    |     |   EDITOR CORE    |     |  EXPORT & SHARE  |
|                  |     |                  |     |                  |
| - Record (Camera)|---->| - Timeline       |---->| - Single-pass    |
| - Upload (Gallery)|    | - Trim/Split     |     |   FFmpeg render  |
| - Clip Selector  |     | - Crop/Rotate    |     | - Save to Gallery|
|                  |     | - Filters/Adjust |     | - Share to Social|
|                  |     | - Audio Mix      |     |                  |
|                  |     | - Text Overlay   |     |                  |
+------------------+     +------------------+     +------------------+
         |                        |                        |
         v                        v                        v
+---------------------------------------------------------------------+
|                        REDUX STORE                                   |
| project | timeline | transform | filter | audio | overlay | export  |
+---------------------------------------------------------------------+
         |                        |                        |
         v                        v                        v
+---------------------------------------------------------------------+
|                       SERVICE LAYER                                  |
| FFmpeg Engine | File System | Video Utils | Audio Utils | Share     |
+---------------------------------------------------------------------+
```

---

## Navigation Architecture

### Route Structure (Expo Router)

```
app/
  _layout.tsx                    # Root: Redux Provider + GestureHandlerRootView + StatusBar
  |
  +-- (tabs)/
  |     _layout.tsx              # Tab Navigator (single tab for MVP)
  |     index.tsx                # Home Screen -- Record / Import CTAs
  |
  +-- camera/
  |     _layout.tsx              # Stack Navigator (headerless)
  |     index.tsx                # Camera Recording Screen
  |     preview.tsx              # Post-Capture Review Screen
  |
  +-- import/
  |     _layout.tsx              # Stack Navigator
  |     index.tsx                # Gallery Video Picker
  |     clip-selector.tsx        # Mandatory Trim for >60s videos
  |
  +-- editor/
  |     _layout.tsx              # Stack Navigator (headerless)
  |     index.tsx                # Main Editing Workspace
  |
  +-- export/
        index.tsx                # Export Progress + Share Screen
```

### Navigation Flow

```
HOME --(tap "Record")--> CAMERA --> CAMERA_PREVIEW --(use video)--> EDITOR --> EXPORT
HOME --(tap "Import")--> IMPORT --(<=60s)---------> EDITOR --> EXPORT
                          IMPORT --(>60s)--> CLIP_SELECTOR --> EDITOR --> EXPORT
```

### Navigation Rules
- **Camera -> Editor:** Use `router.replace()` (cannot go back to camera from editor)
- **Import -> Editor:** Use `router.replace()` (cannot go back to import from editor)
- **Editor -> Export:** Use `router.push()` (CAN go back to editor if export not started)
- **Export complete -> Home:** Use `router.replace()` to reset the stack

### Route Constants

All routes are registered in `constants/routes.ts`:

```typescript
import { ROUTES } from '@/constants/routes';

router.push(ROUTES.CAMERA);        // '/camera'
router.push(ROUTES.EDITOR);        // '/editor'
router.replace(ROUTES.HOME);       // '/(tabs)'
```

---

## State Management

### Redux Store Structure

```
store/
  index.ts                # configureStore -- combines all reducers + middleware
  hooks.ts                # useAppDispatch, useAppSelector (typed hooks)
  slices/
    uiSlice.ts            # UI state (modals, active tool tab, theme)
    cameraSlice.ts        # Camera state (facing, flash, recording, countdown)
    projectSlice.ts       # Project state (source URI, metadata, thumbnails)
    timelineSlice.ts      # Timeline state (playhead, trim, splits, zoom, speed)
    transformSlice.ts     # Transform state (crop, rotate, flip)
    filterSlice.ts        # Filter state (preset, brightness, contrast, saturation)
    audioSlice.ts         # Audio state (volumes, music URI, voiceover, mute)
    overlaySlice.ts       # Text overlay state (array of text layers)
    exportSlice.ts        # Export state (status, progress, output URI, error)
```

### Slice Details

#### `uiSlice`
```typescript
{
  activeModal: string | null,     // Currently open modal name
  activeToolTab: string | null,   // Currently selected editor tool
  isLoading: boolean,             // Global loading state
}
```

#### `cameraSlice`
```typescript
{
  facing: 'front' | 'back',
  flashMode: 'off' | 'on',
  isRecording: boolean,
  isPaused: boolean,
  recordingDurationMs: number,
  maxDuration: 10 | 30 | 60,     // seconds
  countdownDuration: 0 | 3 | 5 | 10,
  countdownRemaining: number,
  showGrid: boolean,
  recordedSegments: string[],     // Array of temp file URIs (for pause/resume)
}
```

#### `projectSlice`
```typescript
{
  projectId: string,
  sourceUri: string | null,       // Original video file URI
  sourceMetadata: VideoMetadata | null,
  thumbnails: string[],           // Timeline thumbnail image URIs
  trimRange: { startMs: number; endMs: number } | null,
}
```

#### `timelineSlice`
```typescript
{
  playheadMs: number,             // Current position in milliseconds
  trimStart: number,              // Trim start in ms
  trimEnd: number,                // Trim end in ms
  splitPoints: number[],          // Split positions in ms
  zoomLevel: number,              // Timeline zoom (1 = default)
  speedMultiplier: 0.5 | 1 | 2 | 4,
  isPlaying: boolean,
}
```

#### `transformSlice`
```typescript
{
  cropRect: { x: number; y: number; w: number; h: number } | null,
  rotation: 0 | 90 | 180 | 270,
  flipHorizontal: boolean,
  flipVertical: boolean,
}
```

#### `filterSlice`
```typescript
{
  activeFilter: 'warm' | 'cool' | 'vintage' | 'bw' | null,
  brightness: number,             // -100 to +100 (default 0)
  contrast: number,               // -100 to +100 (default 0)
  saturation: number,             // -100 to +100 (default 0)
}
```

#### `audioSlice`
```typescript
{
  originalVolume: number,         // 0-100 (default 100)
  isMuted: boolean,
  backgroundMusicUri: string | null,
  backgroundMusicVolume: number,  // 0-100 (default 70)
  voiceoverUri: string | null,
  voiceoverVolume: number,        // 0-100 (default 100)
}
```

#### `overlaySlice`
```typescript
{
  textOverlays: Array<{
    id: string,
    text: string,
    x: number,                    // Position (0-1 relative)
    y: number,
    fontSize: number,
    fontFamily: string,           // Key from FONTS constant
    color: string,                // Hex color
    width: number,
    height: number,
  }>,
  activeOverlayId: string | null,
}
```

#### `exportSlice`
```typescript
{
  status: 'idle' | 'preparing' | 'processing' | 'compressing' | 'complete' | 'error',
  progress: number,               // 0 to 1
  resolution: '720p' | '1080p',
  outputUri: string | null,
  error: string | null,
}
```

### Non-Destructive Editing Model

All edits are stored as **metadata** in Redux slices. The original video file is NEVER modified. On export, ALL editing state is collected from the store and compiled into a single FFmpeg command that produces the final output in one pass.

```
User edits (trim + filter + text + audio)
         |
         v
Redux Store (metadata only)
         |
         v
Export Pipeline reads all slices
         |
         v
Builds ONE FFmpeg command
         |
         v
Single-pass render -> output.mp4
```

---

## Service Layer

### File Structure
```
services/
  file/
    fileService.ts              # Temp directory management, cleanup, file utils
  ffmpeg/
    ffmpegService.ts            # FFmpeg execution wrapper (progress, cancel, errors)
    commandBuilder.ts           # Fluent API for building FFmpeg command strings
    types.ts                    # FFmpegResult, MediaInfo, FFmpegProgress types
  video/
    metadataService.ts          # Extract video info (duration, dimensions, fps)
    thumbnailService.ts         # Generate timeline thumbnail frames
    trimService.ts              # Trim video (start/end)
    transformService.ts         # Crop, rotate, flip, speed change
    filterService.ts            # Apply color filter presets + adjustments
  audio/
    audioService.ts             # Mix audio tracks, replace, mute, voiceover overlay
  export/
    exportPipeline.ts           # Build + execute the final single-pass export
    exportRecovery.ts           # Crash-safe checkpoints (AsyncStorage)
    shareService.ts             # Save to gallery, share to social apps
```

### Service Responsibilities

| Service | Responsibility |
|---------|---------------|
| `fileService` | Create/delete temp directories, generate temp file paths, check file sizes, cleanup |
| `ffmpegService` | Execute FFmpeg commands, track progress (0-1), support cancellation, map errors |
| `commandBuilder` | Fluent API: `.input().trim().crop().speed().filter().text().audio().output().build()` |
| `metadataService` | Probe video for duration, dimensions, fps, codec, hasAudio |
| `thumbnailService` | Generate N thumbnails at even intervals using expo-video-thumbnails |
| `trimService` | Trim video to start/end timestamps |
| `transformService` | Crop, rotate (transpose), flip (hflip/vflip), speed (setpts+atempo) |
| `filterService` | Apply named filter presets or custom brightness/contrast/saturation |
| `audioService` | Mix background music, replace audio, mute, overlay voiceover |
| `exportPipeline` | Collect all Redux state, build single-pass FFmpeg command, execute with progress |
| `exportRecovery` | Save/load export checkpoints for crash recovery |
| `shareService` | `saveToGallery()` via expo-media-library, `shareTo()` via expo-sharing |

---

## Component Architecture

### Component Hierarchy

```
components/
  ui/                           # Reusable premium UI primitives
    GradientButton.tsx          # Gradient background + spring animation + haptic
    GlassCard.tsx               # Frosted glass card (expo-blur + semi-transparent)
    GlassBottomSheet.tsx        # Reanimated-powered glass bottom sheet
    GradientText.tsx            # MaskedView + LinearGradient text
    GlowIconButton.tsx          # Circular icon button with glow ring
    PremiumSlider.tsx           # Gradient-filled track + glass thumb
    AnimatedPill.tsx            # Selectable pill with gradient active state
    ShimmerLoader.tsx           # Animated shimmer loading effect

  home/
    HomeScreen.tsx              # Landing screen layout
    ActionCard.tsx              # Glass card for "Record" / "Import" CTAs

  camera/
    CameraView.tsx              # VisionCamera wrapper with recording ref
    RecordButton.tsx            # Gradient circle + animated progress ring
    CameraControls.tsx          # Top bar: flash, flip, grid, timer, close
    DurationSelector.tsx        # Bottom pills: 10s / 30s / 60s
    CountdownOverlay.tsx        # Full-screen 3-2-1-GO animation
    GridOverlay.tsx             # Rule-of-thirds grid lines
    RecordingProgress.tsx       # Progress bar with segment markers
    CameraPreview.tsx           # Post-capture video review

  import/
    GalleryPicker.tsx           # expo-image-picker integration
    ClipSelector.tsx            # Main clip selector container
    ClipTimeline.tsx            # Horizontal thumbnail strip + drag handles
    ClipPreview.tsx             # Live video preview synced to handles

  timeline/
    Timeline.tsx                # Main timeline container
    ThumbnailStrip.tsx          # FlatList of thumbnail images
    TrimHandles.tsx             # Left/right gradient drag handles
    Playhead.tsx                # Glowing vertical playhead line
    SplitMarker.tsx             # Split point markers on timeline
    TimeIndicator.tsx           # Current time / duration display

  editor/
    EditorLayout.tsx            # Overall editor layout (preview + timeline + tools)
    VideoPreview.tsx            # expo-video player in 9:16 container
    ToolTabBar.tsx              # Glass tab bar with gradient active indicator

  editor/tools/
    TrimPanel.tsx               # Trim controls
    SplitPanel.tsx              # Split management
    CropPanel.tsx               # Aspect ratio presets + crop overlay
    CropOverlay.tsx             # Draggable crop region on video
    RotateFlipPanel.tsx         # Rotate/flip buttons
    SpeedPanel.tsx              # Speed selector pills (0.5x-4x)
    FilterPanel.tsx             # Horizontal filter thumbnail list
    AdjustPanel.tsx             # Brightness/contrast/saturation sliders
    AudioPanel.tsx              # Volume controls + music + voiceover
    MusicPicker.tsx             # Audio file picker
    VoiceoverRecorder.tsx       # Record voiceover bottom sheet
    TextPanel.tsx               # Text overlay management
    TextEditor.tsx              # Text editing bottom sheet

  editor/overlays/
    TextOverlayRenderer.tsx     # Renders all text layers on video preview
    DraggableText.tsx           # Individual draggable/resizable text element

  export/
    ExportScreen.tsx            # Export screen layout
    ExportProgress.tsx          # Animated gradient progress ring
    ShareSheet.tsx              # Platform share buttons (glass cards)
```

---

## FFmpeg Pipeline

### Command Builder Pattern

The command builder creates a single FFmpeg command from all editing state:

```typescript
// Example: Trim + Speed + Filter + Text + Audio mix in ONE command
const command = new CommandBuilder()
  .input(sourceUri)
  .trim(trimStartMs, trimEndMs)
  .crop(cropRect)
  .rotate(90)
  .speed(2.0)
  .filter('warm')
  .adjustments({ brightness: 0.2, contrast: 1.1, saturation: 1.3 })
  .overlayText({ text: 'Hello', x: 100, y: 200, fontSize: 48, color: '#FFFFFF', fontFile: '/path/to/font.ttf' })
  .mixAudio(bgMusicUri, originalVolume, musicVolume)
  .setResolution(1080, 1920)    // 1080p at 9:16
  .setCodec('libx264', 'aac')
  .output(outputUri)
  .build();
```

### Filter Presets (FFmpeg Strings)

| Filter | FFmpeg Command |
|--------|----------------|
| Warm | `colortemperature=temperature=6500,colorbalance=rs=0.1:gs=0.05:bs=-0.1` |
| Cool | `colortemperature=temperature=9000,colorbalance=rs=-0.1:gs=0:bs=0.1` |
| Vintage | `curves=vintage,colorbalance=rs=0.15:gs=0.1:bs=0` |
| B&W | `hue=s=0` |

### Adjustment Mapping

| Adjustment | FFmpeg Filter | Range |
|------------|--------------|-------|
| Brightness | `eq=brightness=VALUE` | -1.0 to 1.0 |
| Contrast | `eq=contrast=VALUE` | 0.0 to 2.0 (1.0 = default) |
| Saturation | `eq=saturation=VALUE` | 0.0 to 3.0 (1.0 = default) |

### Export Pipeline Flow

```
1. Collect all editing state from Redux
2. Build single FFmpeg command via CommandBuilder
3. Save checkpoint (crash recovery)
4. Execute command with progress callback
5. On success: save output URI, mark complete
6. On failure: save error, offer retry
7. Clean up temp files
```

---

## File Management

### Directory Structure (Runtime)

```
{expo-file-system-cache}/
  video-editor/
    projects/
      {projectId}/
        source.mp4              # Copy of source video
        thumbnails/
          thumb_0000.jpg        # Timeline thumbnails
          thumb_0001.jpg
          ...
        segments/               # Camera pause/resume segments
          segment_0.mp4
          segment_1.mp4
        temp/
          trimmed.mp4           # Intermediate files (if needed)
        output/
          export_720p.mp4       # Final export
          export_1080p.mp4
```

### Cleanup Strategy
- On project open: create project directory
- On project close: delete temp files, keep output
- On export complete: cleanup everything except final output
- On app restart: cleanup orphaned project directories

---

## Key Technical Decisions

| Area | Decision | Reasoning |
|------|----------|-----------|
| Editing model | Non-destructive | Edits as metadata, single-pass export. No intermediate renders during editing. |
| Export strategy | Single-pass FFmpeg | More efficient than chaining operations. One decode-encode cycle. |
| Timeline performance | Reanimated shared values | Playhead position never goes through React state. 60fps guaranteed. |
| Thumbnail strategy | FlatList + getItemLayout | Lazy loading, fixed dimensions, no layout recalculation. |
| Video preview | expo-video | Official Expo replacement for deprecated expo-av. |
| Camera | react-native-vision-camera | Only library supporting pause/resume recording natively. |
| Processing model | Foreground with progress UI | Background processing unreliable on iOS. Users expect to see progress. |
| Crash recovery | AsyncStorage checkpoints | Export state saved at each stage. Resume on app restart. |

---

## Constraints and Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| FFmpeg + Expo 54 compatibility | Build failure | Verify in Sprint 0 before building anything else |
| Complex single-pass FFmpeg commands | Export bugs | Extensive testing of each filter combination |
| Timeline perf with 60+ thumbnails | Frame drops | Small thumbnails (80px), FlatList, Reanimated shared values |
| Memory pressure (video + thumbnails) | Crashes on old devices | Lazy loading, size constraints, cleanup on unmount |
| expo-video API changes | Breaking changes | All video interactions isolated in `useVideoPlayer` hook |
| Dev build complexity | Slower development | Set up dev build once in Sprint 0, use EAS for CI |
| Speed change + 60s limit | Invalid combinations | UI validates: warn if speed causes duration > 60s |
