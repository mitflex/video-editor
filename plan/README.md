# Video Editor App -- Project Plan

> A modern short-video editing mobile app for creating 60-second videos optimized for Instagram Reels, YouTube Shorts, and WhatsApp Status. Built with React Native (Expo), targeting a premium CapCut/VN Editor level experience.

---

## Quick Links

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Tech stack, navigation, state management, services, folder structure |
| [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) | Color palette, gradients, glassmorphism, component specs, screen designs |
| [SPRINT-PLAN.md](./SPRINT-PLAN.md) | Detailed 11-sprint breakdown with tasks, files, and dependencies |
| [PROGRESS.md](./PROGRESS.md) | Current development progress and completion status |

---

## Product Goal

Create a mobile app where users can **record OR upload a video, edit it, and export a ready-to-share 60-second reel** -- all within 60 seconds of editing time.

### Hard Rules
- Final video duration must **NEVER exceed 60 seconds**
- Videos longer than 60s **must be trimmed** before entering the editor
- Output format: **9:16 vertical** (720p or 1080p)

---

## Development Phases

### Phase 1 -- MVP (This Plan)
**Focus:** Stability, performance, working editing pipeline. No AI features.

Core flow: `Record/Upload -> Edit -> Export -> Share`

| Feature | Scope |
|---------|-------|
| Video Input | Record (10s/30s/60s, pause/resume, countdown, flash, focus, grid) + Upload from gallery with mandatory clip selector |
| Core Editing | Trim, Split, Crop (9:16 default), Rotate, Flip, Speed (0.5x-4x), Preview playback |
| Audio | Background music from device, volume controls, mute/replace audio, voiceover recording |
| Visual Tools | 4 filters (Warm, Cool, Vintage, B&W) + Brightness/Contrast/Saturation sliders |
| Text Overlay | Add text, 3-4 fonts, color picker, drag to position, pinch to resize |
| Export | 720p/1080p, save to gallery, share to Instagram/WhatsApp/YouTube |
| Technical | Redux store, RTK Query base, crash-safe export, loading indicators |

### Phase 2 -- Advanced (Future)
Multi-clip timeline, transitions, animated text, keyframes, PiP, reverse, chroma key, beauty filters, LUT/cinematic filters, stickers, GIFs, AI captions, AI music suggestion, AI highlight clip, AI background removal, templates, monetization.

**Phase 2 is NOT in scope for this plan.**

---

## Tech Stack

### Already Installed
| Package | Version | Purpose |
|---------|---------|---------|
| Expo | 54.0.0 | Framework |
| React Native | 0.81.5 | Runtime |
| React | 19.1.0 | UI library |
| Expo Router | 6.0.23 | File-based navigation |
| Redux Toolkit | 2.11.2 | State management |
| React-Redux | 9.2.0 | React bindings for Redux |
| NativeWind | 4.2.1 | Tailwind CSS styling |
| Reanimated | 4.1.1 | 60fps animations |
| Gesture Handler | 2.28.0 | Native gesture system |
| TypeScript | 5.9.2 | Type safety |

### To Be Installed (Sprint 0)
| Package | Purpose |
|---------|---------|
| react-native-vision-camera | Camera with pause/resume, focus, flash |
| expo-video | Video playback/preview |
| expo-video-thumbnails | Timeline thumbnails |
| ffmpeg-kit-react-native | Video processing engine |
| expo-linear-gradient | Gradient UI effects |
| expo-blur | Glassmorphism/frosted glass |
| @react-native-masked-view/masked-view | Gradient text |
| expo-file-system | File management |
| expo-media-library | Save to gallery |
| expo-image-picker | Gallery import |
| expo-sharing | Social sharing |
| expo-document-picker | Audio file picker |
| expo-av | Audio recording |
| react-native-compressor | Video compression |
| expo-haptics | Haptic feedback |
| react-native-svg | SVG rendering |

> **Important:** This project requires a **Development Build** (`npx expo prebuild`). Expo Go is NOT sufficient because FFmpeg and VisionCamera need native modules.

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Camera library | react-native-vision-camera | Supports pause/resume, tap-to-focus, flash -- expo-camera does not |
| Video playback | expo-video | expo-av is deprecated; expo-video is the official replacement |
| Video processing | ffmpeg-kit-react-native | Industry standard for trim, crop, rotate, filter, audio mixing, export |
| Primary platform | iOS first | VisionCamera + FFmpeg more stable on iOS; verify Android after |
| UI theme | Dark-only, premium | Gradient-rich, glassmorphism, spring animations, haptic feedback |
| Brand color | Purple/Indigo #6366F1 | Modern, creative, stands out on dark backgrounds |
| Export strategy | Single-pass FFmpeg | All edits (trim, crop, speed, filter, text, audio) in ONE command -- no intermediate files |
| Editing model | Non-destructive | Edits stored as metadata in Redux; only applied during export |

---

## Getting Started (For New Developers)

### Prerequisites
- Node.js 18+
- Yarn (classic)
- Xcode 15+ (for iOS development)
- iOS Simulator or physical device
- EAS CLI (`npm install -g eas-cli`)

### Setup
```bash
# Clone the repo
git clone <repo-url>
cd video-editor

# Install dependencies
yarn install

# Generate native projects (required -- NOT using Expo Go)
npx expo prebuild --clean

# Run on iOS Simulator
yarn ios

# Run on Android Emulator
yarn android
```

### Project Structure
```
video-editor/
  app/                 # Routes (Expo Router -- file-based navigation)
  components/          # React components organized by feature
    ui/                # Reusable premium UI primitives
    home/              # Home screen components
    camera/            # Camera recording components
    import/            # Video import components
    timeline/          # Timeline editing components
    editor/            # Editor workspace components
    export/            # Export & share components
  store/               # Redux Toolkit state management
    slices/            # Feature-specific Redux slices
    api/               # RTK Query API definitions
  services/            # Business logic & native integrations
    ffmpeg/            # FFmpeg command builder & executor
    video/             # Video metadata, thumbnails, transforms
    audio/             # Audio mixing & recording
    export/            # Export pipeline, recovery, sharing
    file/              # File system utilities
  constants/           # App-wide constants (routes, assets, theme, filters)
  types/               # TypeScript type definitions
  hooks/               # Custom React hooks
  utils/               # Pure utility functions
  assets/              # Static assets (images, fonts)
  plan/                # This documentation
```

### Key Files to Read First
1. `plan/ARCHITECTURE.md` -- Understand the full system design
2. `plan/DESIGN-SYSTEM.md` -- Understand the premium UI requirements
3. `plan/SPRINT-PLAN.md` -- See what's being built and in what order
4. `plan/PROGRESS.md` -- See what's done and what's next
5. `constants/routes.ts` -- All app routes
6. `constants/assets.ts` -- All asset registrations
7. `store/index.ts` -- Redux store configuration
8. `app/_layout.tsx` -- Root navigation layout

---

## Estimated Timeline

**~33 working days (6-7 weeks)** across 11 sprints.

See [SPRINT-PLAN.md](./SPRINT-PLAN.md) for the full breakdown.
