# Sprint Plan -- Detailed Task Breakdown

> 11 sprints across ~33 working days (6-7 weeks). Each sprint lists deliverables, files to create/modify, libraries involved, dependencies, and acceptance criteria.

---

## Sprint Dependency Graph

```
SPRINT 0  (Foundation + Design System)
    |
    v
SPRINT 1  (FFmpeg Video Processing Pipeline)
    |
    +---------------+---------------+
    |                               |
    v                               v
SPRINT 2  (Camera)           SPRINT 3  (Import + Clip Selector)
    |                               |
    +---------------+---------------+
                    |
                    v
             SPRINT 4  (Editor + Timeline)
                    |
          +---------+---------+
          |         |         |
          v         v         v
      SPRINT 5  SPRINT 6  SPRINT 7
     (Transform)(Filters) (Audio)
          |         |         |
          +---------+---------+
                    |
                    v
             SPRINT 8  (Text Overlay)
                    |
                    v
             SPRINT 9  (Export UI + Share)
                    |
                    v
             SPRINT 10 (Home Screen + Polish)
```

> Sprints 2 & 3 can run **in parallel**.
> Sprints 5, 6 & 7 can run **in parallel**.

---

## SPRINT 0: Foundation & Premium Design System

**Days:** 1-3
**Goal:** Clean project, install deps, dev build, dark theme, premium UI primitives.

### Tasks

| # | Task | Files | Status |
|---|------|-------|--------|
| 0.1 | Delete demo/placeholder code | Remove: `components/SampleComponent.tsx`, `components/ScreenContent.tsx`, `app/details/[id].tsx`, `store/api/sampleApi.ts`. Clean: `store/slices/uiSlice.ts` (remove counter), `store/index.ts` (remove sampleApi), `app/index.tsx` (remove SampleComponent import) | Pending |
| 0.2 | Create route & asset constants | `constants/routes.ts`, `constants/assets.ts` | **Done** |
| 0.3 | Create theme constants | `constants/theme.ts` -- Full color palette, gradients, glass params, typography, spacing | Pending |
| 0.4 | Create filter constants | `constants/filters.ts` -- FFmpeg filter preset strings (warm, cool, vintage, b&w) | Pending |
| 0.5 | Create TypeScript types | `types/video.ts` (VideoMetadata, TrimRange, CropRect, ExportConfig), `types/project.ts` (Project, ProjectState), `types/overlay.ts` (TextOverlay, FontOption) | Pending |
| 0.6 | Update app.json | Set `userInterfaceStyle: "dark"`, add permissions (camera, microphone, media-library, audio), add plugins (vision-camera, ffmpeg) | Pending |
| 0.7 | Fix tsconfig path alias | Change `@/*` mapping from `src/*` to `./*` | Pending |
| 0.8 | Update tailwind config | Add `services/`, `hooks/`, `store/`, `constants/` to content paths | Pending |
| 0.9 | Install ALL dependencies | Single batch `yarn add` for all 17 libraries | Pending |
| 0.10 | Run expo prebuild | `npx expo prebuild --clean` -- generate ios/ and android/ | Pending |
| 0.11 | Verify dev build | Build and run on iOS Simulator | Pending |
| 0.12 | Build GradientButton | `components/ui/GradientButton.tsx` | Pending |
| 0.13 | Build GlassCard | `components/ui/GlassCard.tsx` | Pending |
| 0.14 | Build GlassBottomSheet | `components/ui/GlassBottomSheet.tsx` | Pending |
| 0.15 | Build GradientText | `components/ui/GradientText.tsx` | Pending |
| 0.16 | Build GlowIconButton | `components/ui/GlowIconButton.tsx` | Pending |
| 0.17 | Build PremiumSlider | `components/ui/PremiumSlider.tsx` | Pending |
| 0.18 | Build AnimatedPill | `components/ui/AnimatedPill.tsx` | Pending |
| 0.19 | Build ShimmerLoader | `components/ui/ShimmerLoader.tsx` | Pending |

**Acceptance:** Dev build compiles on iOS. All 8 UI primitives render correctly with gradients + glassmorphism + spring animations.

**Risk Gate:** If dev build fails with FFmpeg or VisionCamera, resolve before proceeding to Sprint 1.

---

## SPRINT 1: Video Processing Pipeline

**Days:** 4-7
**Depends on:** Sprint 0
**Goal:** FFmpeg service layer -- the foundation everything depends on.

### Tasks

| # | Task | Files |
|---|------|-------|
| 1.1 | File service | `services/file/fileService.ts` -- createProjectDir, createTempFile, cleanupProject, getFileSize, fileExists |
| 1.2 | FFmpeg service core | `services/ffmpeg/ffmpegService.ts` -- executeCommand with progress, cancelExecution, getMediaInfo |
| 1.3 | FFmpeg types | `services/ffmpeg/types.ts` -- FFmpegResult, MediaInfo, FFmpegProgress, FFmpegError |
| 1.4 | Command builder | `services/ffmpeg/commandBuilder.ts` -- Fluent API: .input().trim().crop().rotate().flip().speed().filter().adjustments().overlayText().mixAudio().setResolution().setCodec().output().build() |
| 1.5 | Metadata service | `services/video/metadataService.ts` -- getVideoMetadata, validateVideoConstraints |
| 1.6 | Thumbnail service | `services/video/thumbnailService.ts` -- generateTimelineThumbnails, generateSingleThumbnail |
| 1.7 | Trim service | `services/video/trimService.ts` -- trimVideo(uri, startMs, endMs) |
| 1.8 | Transform service | `services/video/transformService.ts` -- cropVideo, rotateVideo, flipVideo, changeSpeed |
| 1.9 | Filter service | `services/video/filterService.ts` -- applyFilter, applyAdjustments |
| 1.10 | Audio service | `services/audio/audioService.ts` -- mixAudioTracks, replaceAudio, muteVideo, overlayVoiceover |
| 1.11 | Export pipeline | `services/export/exportPipeline.ts` -- buildExportCommand, executeExport, cancelExport |
| 1.12 | Export recovery | `services/export/exportRecovery.ts` -- saveCheckpoint, loadCheckpoint, clearCheckpoint |
| 1.13 | Share service | `services/export/shareService.ts` -- saveToGallery, shareToApp |
| 1.14 | Export slice | `store/slices/exportSlice.ts` |

**Acceptance:** Can trim a sample video file via FFmpeg, get metadata, generate thumbnails. Export pipeline builds valid command strings.

---

## SPRINT 2: Camera Recording

**Days:** 8-10
**Depends on:** Sprint 0, Sprint 1 (FFmpeg for segment concatenation)
**Goal:** Full camera screen with record, pause/resume, countdown, flash, focus, grid.

### Tasks

| # | Task | Files |
|---|------|-------|
| 2.1 | Camera slice | `store/slices/cameraSlice.ts` |
| 2.2 | Permission hook | `hooks/useCameraPermissions.ts` |
| 2.3 | Camera layout | `app/camera/_layout.tsx`, `app/camera/index.tsx` |
| 2.4 | CameraView | `components/camera/CameraView.tsx` -- VisionCamera wrapper |
| 2.5 | RecordButton | `components/camera/RecordButton.tsx` -- Gradient circle + animated progress ring |
| 2.6 | CameraControls | `components/camera/CameraControls.tsx` -- Flash, flip, grid, timer, close (glass pills) |
| 2.7 | DurationSelector | `components/camera/DurationSelector.tsx` -- 10s/30s/60s AnimatedPills |
| 2.8 | CountdownOverlay | `components/camera/CountdownOverlay.tsx` -- 3-2-1-GO Reanimated animation |
| 2.9 | GridOverlay | `components/camera/GridOverlay.tsx` -- Rule-of-thirds |
| 2.10 | RecordingProgress | `components/camera/RecordingProgress.tsx` -- Segmented progress bar |
| 2.11 | Pause/resume logic | Segment saving + FFmpeg concatenation on stop |
| 2.12 | Preview screen | `app/camera/preview.tsx`, `components/camera/CameraPreview.tsx` |

**Acceptance:** Record a 10s video with pause/resume. Countdown animation plays. Preview screen shows recorded video. "Use Video" navigates forward.

---

## SPRINT 3: Video Import & Clip Selector

**Days:** 11-13
**Depends on:** Sprint 0, Sprint 1
**Goal:** Import from gallery + mandatory clip selector for videos > 60s.

### Tasks

| # | Task | Files |
|---|------|-------|
| 3.1 | Project slice | `store/slices/projectSlice.ts` |
| 3.2 | Import layout | `app/import/_layout.tsx`, `app/import/index.tsx` |
| 3.3 | GalleryPicker | `components/import/GalleryPicker.tsx` -- expo-image-picker integration |
| 3.4 | Clip selector route | `app/import/clip-selector.tsx` |
| 3.5 | ClipSelector container | `components/import/ClipSelector.tsx` |
| 3.6 | ClipTimeline | `components/import/ClipTimeline.tsx` -- Thumbnail strip + gradient drag handles |
| 3.7 | ClipPreview | `components/import/ClipPreview.tsx` -- Live preview synced to handles |
| 3.8 | Clip selector hook | `hooks/useClipSelector.ts` -- Pixel-to-time conversion, handle constraints |
| 3.9 | Duration validation | Prevent selection > 60s, red indicator |
| 3.10 | Trim + navigate | On confirm: FFmpeg trim, navigate to editor |

**Acceptance:** Import a 2-minute video. Clip selector enforces 60s max. Gradient handles work. Trimmed output is correct duration.

---

## SPRINT 4: Editor Foundation & Timeline

**Days:** 14-18
**Depends on:** Sprint 2, Sprint 3 (both feed video into editor)
**Goal:** Main editor with video preview, interactive timeline, trim/split tools.

### Tasks

| # | Task | Files |
|---|------|-------|
| 4.1 | Timeline slice | `store/slices/timelineSlice.ts` |
| 4.2 | Editor layout | `app/editor/_layout.tsx`, `app/editor/index.tsx` |
| 4.3 | EditorLayout | `components/editor/EditorLayout.tsx` -- Preview + controls + timeline + tools |
| 4.4 | VideoPreview | `components/editor/VideoPreview.tsx` -- expo-video in 9:16 container |
| 4.5 | useVideoPlayer hook | `hooks/useVideoPlayer.ts` -- Play, pause, seek, time sync to Redux |
| 4.6 | ToolTabBar | `components/editor/ToolTabBar.tsx` -- Glass bar + gradient active underline |
| 4.7 | Timeline container | `components/timeline/Timeline.tsx` |
| 4.8 | ThumbnailStrip | `components/timeline/ThumbnailStrip.tsx` -- FlatList, getItemLayout |
| 4.9 | TrimHandles | `components/timeline/TrimHandles.tsx` -- Gradient drag handles |
| 4.10 | Playhead | `components/timeline/Playhead.tsx` -- Glowing line, Reanimated shared values |
| 4.11 | SplitMarker | `components/timeline/SplitMarker.tsx` |
| 4.12 | TimeIndicator | `components/timeline/TimeIndicator.tsx` |
| 4.13 | Timeline gestures | `hooks/useTimelineGestures.ts` -- Tap-to-seek, pinch-to-zoom |
| 4.14 | TrimPanel | `components/editor/tools/TrimPanel.tsx` |
| 4.15 | SplitPanel | `components/editor/tools/SplitPanel.tsx` |

**Acceptance:** Timeline renders thumbnails. Playhead scrubs at 60fps. Trim handles update preview. Tap-to-seek works. Pinch-to-zoom works.

---

## SPRINT 5: Crop, Rotate, Flip, Speed

**Days:** 19-20
**Depends on:** Sprint 4
**Goal:** Transform tools in the editor.

### Tasks

| # | Task | Files |
|---|------|-------|
| 5.1 | Transform slice | `store/slices/transformSlice.ts` |
| 5.2 | CropPanel | `components/editor/tools/CropPanel.tsx` -- Aspect ratio presets (9:16, 1:1, 4:5, 16:9) |
| 5.3 | CropOverlay | `components/editor/tools/CropOverlay.tsx` -- Draggable crop region |
| 5.4 | RotateFlipPanel | `components/editor/tools/RotateFlipPanel.tsx` -- Rotate CW/CCW, Flip H/V |
| 5.5 | SpeedPanel | `components/editor/tools/SpeedPanel.tsx` -- 0.5x/1x/2x/4x AnimatedPills |
| 5.6 | Speed validation | Warn if speed change makes duration > 60s |

**Acceptance:** Crop, rotate, flip update preview. Speed changes playback rate. Duration warning shows when needed.

---

## SPRINT 6: Filters & Adjustments

**Days:** 21-22
**Depends on:** Sprint 4
**Goal:** Color filter presets + brightness/contrast/saturation sliders.

### Tasks

| # | Task | Files |
|---|------|-------|
| 6.1 | Filter slice | `store/slices/filterSlice.ts` |
| 6.2 | FilterPanel | `components/editor/tools/FilterPanel.tsx` -- Horizontal scroll of filter thumbnails |
| 6.3 | Filter thumbnails | Generate preview thumbnails with each filter applied |
| 6.4 | AdjustPanel | `components/editor/tools/AdjustPanel.tsx` -- PremiumSliders for B/C/S |

**Acceptance:** Filter selection updates slice. Thumbnails show correct filter preview. Sliders update adjustment values.

---

## SPRINT 7: Audio Tools

**Days:** 23-25
**Depends on:** Sprint 4
**Goal:** Background music, volume controls, voiceover recording.

### Tasks

| # | Task | Files |
|---|------|-------|
| 7.1 | Audio slice | `store/slices/audioSlice.ts` |
| 7.2 | AudioPanel | `components/editor/tools/AudioPanel.tsx` -- Volume sliders + mute + sections |
| 7.3 | MusicPicker | `components/editor/tools/MusicPicker.tsx` -- expo-document-picker for audio |
| 7.4 | VoiceoverRecorder | `components/editor/tools/VoiceoverRecorder.tsx` -- Record with expo-av |
| 7.5 | useAudioRecorder | `hooks/useAudioRecorder.ts` -- Start, stop, play, delete recording |

**Acceptance:** Can add background music from device. Volume sliders work. Voiceover records and plays back.

---

## SPRINT 8: Text Overlay

**Days:** 26-27
**Depends on:** Sprint 4
**Goal:** Add, position, style, and resize text on the video.

### Tasks

| # | Task | Files |
|---|------|-------|
| 8.1 | Overlay slice | `store/slices/overlaySlice.ts` |
| 8.2 | TextOverlayRenderer | `components/editor/overlays/TextOverlayRenderer.tsx` |
| 8.3 | DraggableText | `components/editor/overlays/DraggableText.tsx` -- Pan + pinch gestures |
| 8.4 | TextPanel | `components/editor/tools/TextPanel.tsx` -- Add/edit/delete text |
| 8.5 | TextEditor | `components/editor/tools/TextEditor.tsx` -- Font, color, size bottom sheet |

**Acceptance:** Can add text, drag to position, pinch to resize. Font/color selection works. Text visible on video preview.

---

## SPRINT 9: Export & Sharing

**Days:** 28-30
**Depends on:** All editor sprints (5-8), Sprint 1 (export pipeline)
**Goal:** Full export UI with progress, crash safety, gallery save, social sharing.

### Tasks

| # | Task | Files |
|---|------|-------|
| 9.1 | Export screen | `app/export/index.tsx` |
| 9.2 | ExportScreen | `components/export/ExportScreen.tsx` -- Layout + resolution selector |
| 9.3 | ExportProgress | `components/export/ExportProgress.tsx` -- Animated gradient ring |
| 9.4 | Export thunk | Wire exportSlice to exportPipeline (collect all Redux state -> FFmpeg command) |
| 9.5 | ShareSheet | `components/export/ShareSheet.tsx` -- Glass cards per platform |
| 9.6 | Completion animation | Checkmark + particle burst on export complete |
| 9.7 | Crash recovery | Resume/retry export on app restart |

**Acceptance:** Export produces valid .mp4 with ALL edits (trim + filter + text + audio). Progress ring animates. Save to gallery works. Share sheet opens.

---

## SPRINT 10: Home Screen & Polish

**Days:** 31-33
**Depends on:** All previous sprints
**Goal:** Landing screen, navigation polish, error handling, E2E testing.

### Tasks

| # | Task | Files |
|---|------|-------|
| 10.1 | Tab layout | `app/(tabs)/_layout.tsx` |
| 10.2 | HomeScreen | `app/(tabs)/index.tsx`, `components/home/HomeScreen.tsx` |
| 10.3 | ActionCard | `components/home/ActionCard.tsx` -- Glass cards with gradient shimmer |
| 10.4 | Navigation polish | All `_layout.tsx` files -- transitions, back prevention |
| 10.5 | ErrorBoundary | `components/ui/ErrorBoundary.tsx` |
| 10.6 | Edge cases | Storage check, permission denial, corrupted video, min duration, speed+duration |
| 10.7 | Loading states | ShimmerLoaders for thumbnails, processing, export |
| 10.8 | E2E testing | Full flow: Record -> Edit -> Export -> Share |
| 10.9 | E2E testing | Full flow: Import -> Clip Select -> Edit -> Export -> Share |

**Acceptance:** Home screen looks premium. Full user flow works end-to-end without crashes. Edge cases handled gracefully.

---

## Summary Timeline

| Sprint | Name | Days | Duration |
|--------|------|------|----------|
| 0 | Foundation & Design System | 1-3 | 3 days |
| 1 | Video Processing Pipeline | 4-7 | 4 days |
| 2 | Camera Recording | 8-10 | 3 days |
| 3 | Video Import & Clip Selector | 11-13 | 3 days |
| 4 | Editor Foundation & Timeline | 14-18 | 5 days |
| 5 | Crop, Rotate, Flip, Speed | 19-20 | 2 days |
| 6 | Filters & Adjustments | 21-22 | 2 days |
| 7 | Audio Tools | 23-25 | 3 days |
| 8 | Text Overlay | 26-27 | 2 days |
| 9 | Export & Sharing | 28-30 | 3 days |
| 10 | Home Screen & Polish | 31-33 | 3 days |
| | **TOTAL** | | **~33 days** |
