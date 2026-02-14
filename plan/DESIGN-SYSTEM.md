# Design System -- Premium UI Specification

> Every component in this app must feel premium, creative, and unique. No flat/generic layouts. Think CapCut, VN Editor, Instagram Reels editor level polish.

---

## Table of Contents
- [Design Philosophy](#design-philosophy)
- [Color Palette](#color-palette)
- [Gradient Presets](#gradient-presets)
- [Glassmorphism Specification](#glassmorphism-specification)
- [Typography](#typography)
- [Spacing and Layout](#spacing-and-layout)
- [Component Visual Rules](#component-visual-rules)
- [Premium UI Components](#premium-ui-components)
- [Screen-by-Screen Design](#screen-by-screen-design)
- [Animation Specifications](#animation-specifications)
- [Required Libraries](#required-libraries)

---

## Design Philosophy

1. **Gradient Everything** -- No flat solid buttons or cards. All interactive elements use gradient backgrounds.
2. **Glassmorphism Surfaces** -- Panels, sheets, and overlays use frosted glass effects.
3. **Micro-Interactions on Everything** -- Every tap has spring animation + haptic feedback.
4. **Glowing Active States** -- Selected/active items have a colored outer glow.
5. **Gradient Text for Headings** -- Eye-catching gradient text via MaskedView.
6. **Generous Spacing** -- Nothing cramped. 16-24px padding, breathing room everywhere.
7. **Dark-First** -- Pure dark backgrounds with layered depth through purple/navy tints.

---

## Color Palette

### Backgrounds (Layered Depth)

| Token | Hex | Usage |
|-------|-----|-------|
| `BACKGROUND_PRIMARY` | `#0A0A0F` | Main app background (near-black with blue tint) |
| `BACKGROUND_SECONDARY` | `#12121A` | Slightly elevated surfaces |
| `BACKGROUND_TERTIARY` | `#1A1A2E` | Cards, panels (dark navy) |
| `BACKGROUND_ELEVATED` | `#2D1B4E` | Modals, popovers (dark purple) |

### Text Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `TEXT_PRIMARY` | `#F1F5F9` | Primary text (off-white, NOT pure white) |
| `TEXT_SECONDARY` | `#94A3B8` | Secondary text, labels (slate gray) |
| `TEXT_TERTIARY` | `#64748B` | Disabled text, hints (muted gray) |
| `TEXT_ON_GRADIENT` | `#FFFFFF` | Text on gradient backgrounds (pure white) |

### Brand / Accent

| Token | Hex | Usage |
|-------|-----|-------|
| `ACCENT_PRIMARY` | `#6366F1` | Indigo -- primary brand color |
| `ACCENT_SECONDARY` | `#A855F7` | Purple -- secondary accent |
| `ACCENT_TERTIARY` | `#EC4899` | Pink -- tertiary accent |

### Semantic Colors

| Token | Start | End | Usage |
|-------|-------|-----|-------|
| `SUCCESS` | `#10B981` | `#34D399` | Success states, completion |
| `WARNING` | `#F59E0B` | `#FBBF24` | Warnings, caution |
| `ERROR` | `#EF4444` | `#F87171` | Errors, destructive actions |
| `RECORDING` | `#EF4444` | -- | Solid red pulse during recording |

---

## Gradient Presets

All gradients are defined in `constants/theme.ts` and used via `expo-linear-gradient`.

### Primary Gradients

| Name | Colors | Direction | Usage |
|------|--------|-----------|-------|
| `GRADIENT_PRIMARY` | `#6366F1` -> `#A855F7` | left-to-right | Primary buttons, CTAs, active tabs |
| `GRADIENT_ACCENT` | `#A855F7` -> `#EC4899` | left-to-right | Secondary buttons, highlights |
| `GRADIENT_ENERGETIC` | `#6366F1` -> `#06B6D4` | left-to-right | Special actions, energetic states |
| `GRADIENT_WARM` | `#F59E0B` -> `#EF4444` | top-to-bottom | Record button, warm accents |
| `GRADIENT_SURFACE` | `#1A1A2E` -> `#2D1B4E` | top-to-bottom | Card backgrounds, elevated surfaces |

### Text Gradients

| Name | Colors | Usage |
|------|--------|-------|
| `GRADIENT_TEXT_HEADING` | `#A78BFA` -> `#C4B5FD` | Section headings (lavender) |
| `GRADIENT_TEXT_ACCENT` | `#6366F1` -> `#EC4899` | Highlighted text (indigo to pink) |

### Progress Gradients

| Name | Colors | Usage |
|------|--------|-------|
| `GRADIENT_PROGRESS` | `#6366F1` -> `#A855F7` -> `#EC4899` | Export progress ring |
| `GRADIENT_RECORDING` | `#EF4444` -> `#F97316` | Recording progress bar |

---

## Glassmorphism Specification

### Properties

```
Background:   rgba(26, 26, 46, 0.6)      -- Semi-transparent dark navy
Border:       rgba(99, 102, 241, 0.15)    -- Indigo at 15% opacity (1px solid)
Blur:         20 intensity (expo-blur)
Highlight:    rgba(255, 255, 255, 0.05)   -- Subtle inner glow (top edge)
Shadow:       0 8px 32px rgba(0, 0, 0, 0.3) -- Soft elevation shadow
```

### Where to Use Glass
- Tool panels (editor bottom panels)
- Bottom sheets (text editor, audio controls)
- Camera control bar overlay
- Tab bars (editor tool tabs)
- Modal overlays
- Clip selector timeline area
- Share sheet

### Where NOT to Use Glass
- Main background (use solid dark colors)
- Tiny elements like icons or text (glass on small areas looks messy)
- Video preview area (no filters on top of video player)

---

## Typography

### Font Scale

| Size Token | Value | Usage |
|------------|-------|-------|
| `TEXT_XS` | 10px | Timestamps, badges |
| `TEXT_SM` | 12px | Captions, tool labels |
| `TEXT_BASE` | 14px | Body text, descriptions |
| `TEXT_MD` | 16px | Prominent body text |
| `TEXT_LG` | 20px | Section titles |
| `TEXT_XL` | 24px | Screen titles |
| `TEXT_2XL` | 32px | Hero text, countdown numbers |
| `TEXT_3XL` | 48px | Countdown overlay numbers |

### Font Weights
- **Regular (400):** Body text, descriptions
- **Medium (500):** Labels, buttons
- **Semibold (600):** Section titles, active states
- **Bold (700):** Screen titles, emphasis

### Text Overlay Fonts (Editor)
| Key | Display Name | Family |
|-----|-------------|--------|
| `SANS` | Sans | System (default) |
| `SERIF` | Serif | Custom serif font |
| `MONO` | Mono | Custom monospace font |
| `BOLD_SANS` | Bold | Custom bold sans font |

---

## Spacing and Layout

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `SPACE_XS` | 4px | Tight spacing, icon gaps |
| `SPACE_SM` | 8px | Compact element spacing |
| `SPACE_MD` | 12px | Standard inner padding |
| `SPACE_BASE` | 16px | Default section padding |
| `SPACE_LG` | 20px | Generous padding |
| `SPACE_XL` | 24px | Section gaps |
| `SPACE_2XL` | 32px | Large section separation |
| `SPACE_3XL` | 48px | Major visual breaks |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `RADIUS_SM` | 8px | Small buttons, pills |
| `RADIUS_MD` | 12px | Buttons, inputs |
| `RADIUS_LG` | 16px | Cards, panels |
| `RADIUS_XL` | 20px | Large cards |
| `RADIUS_2XL` | 24px | Modals, bottom sheets |
| `RADIUS_FULL` | 9999px | Circles, fully rounded pills |

### Screen Layout Constants
- **Video preview height:** ~60% of screen in editor
- **Timeline height:** ~100px
- **Tool tab bar height:** 56px
- **Bottom sheet max height:** 40% of screen
- **Safe area:** Always respect safe area insets (notch, home indicator)

---

## Component Visual Rules

### Every Button Must Have:
1. Gradient background (not solid color)
2. Spring press animation: `withSpring({ scale: 0.95 }, { stiffness: 400, damping: 15 })`
3. Opacity shift on press: 0.8
4. Haptic feedback: `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)`
5. Rounded corners: minimum `RADIUS_MD` (12px)

### Every Card Must Have:
1. Glass background OR gradient surface background
2. 1px border with `GLASS_BORDER` color
3. Inner highlight (top edge subtle white line at 5% opacity)
4. `RADIUS_LG` (16px) or larger border radius
5. Soft shadow for elevation

### Every Active/Selected State Must Have:
1. Gradient background (not just color change)
2. Subtle outer glow: `shadowColor: '#6366F1', shadowOpacity: 0.3, shadowRadius: 12`
3. Scale animation on selection change

### Every Slider Must Have:
1. Gradient-filled track (from accent color)
2. Glass thumb with subtle glow
3. Value tooltip appearing above thumb on drag
4. Haptic feedback at start/end boundaries

### Every Bottom Sheet Must Have:
1. Glass background (frosted blur)
2. Drag handle: small gradient pill at top center (40px wide, 4px tall)
3. Animated entrance: slide up with spring physics
4. Backdrop: semi-transparent black overlay (50% opacity)

---

## Premium UI Components

### `GradientButton`
```
Visual:  expo-linear-gradient background (GRADIENT_PRIMARY)
Shape:   rounded-xl (RADIUS_MD), min-height 48px
Press:   withSpring scale 0.95, opacity 0.8, haptic light
Text:    TEXT_ON_GRADIENT (#FFFFFF), font-medium
Shadow:  0 4px 12px rgba(99, 102, 241, 0.3)
Variant: 'primary' | 'accent' | 'energetic' | 'outline'
```

### `GlassCard`
```
Visual:  expo-blur (intensity 20) + GLASS_BG overlay
Border:  1px solid GLASS_BORDER
Shape:   rounded-2xl (RADIUS_XL)
Shadow:  0 8px 32px rgba(0, 0, 0, 0.3)
Inner:   Top edge highlight (GLASS_HIGHLIGHT, 1px)
Press:   withSpring scale 0.98 (if pressable)
```

### `GlassBottomSheet`
```
Visual:  expo-blur (intensity 25) + GLASS_BG overlay
Shape:   rounded-t-3xl (top corners only, RADIUS_2XL)
Handle:  40x4px gradient pill centered at top (GRADIENT_PRIMARY)
Entry:   Reanimated translateY spring from below
Exit:    Animate down + fade backdrop
Backdrop: rgba(0, 0, 0, 0.5) with tap-to-dismiss
Max-h:   40% of screen height
```

### `GradientText`
```
Render:  MaskedView + LinearGradient
Colors:  GRADIENT_TEXT_HEADING or GRADIENT_TEXT_ACCENT
Weight:  semibold or bold
Size:    TEXT_LG or larger only (small gradient text is unreadable)
```

### `GlowIconButton`
```
Visual:  Circular, 44x44px default
Background: expo-linear-gradient (GRADIENT_PRIMARY) when active, transparent when inactive
Icon:    @expo/vector-icons Ionicons, 22px, white
Active:  Outer glow ring (shadowColor: ACCENT_PRIMARY, shadowRadius: 12)
Press:   withSpring scale 0.9, haptic medium
```

### `PremiumSlider`
```
Track:   6px tall, rounded-full
Fill:    expo-linear-gradient (GRADIENT_PRIMARY) from left to thumb position
Unfilled: BACKGROUND_TERTIARY
Thumb:   20x20px circle, glass background, 2px gradient border, glow when dragging
Tooltip: Appears above thumb during drag, glass background, shows value
Haptic:  At min/max boundaries
```

### `AnimatedPill`
```
Inactive: BACKGROUND_TERTIARY background, TEXT_SECONDARY text
Active:   expo-linear-gradient (GRADIENT_PRIMARY), TEXT_ON_GRADIENT, outer glow
Shape:    rounded-full (RADIUS_FULL), paddingH 16px, paddingV 8px
Switch:   Reanimated layout transition with spring physics
```

### `ShimmerLoader`
```
Visual:   Animated linear gradient sweeping left-to-right
Colors:   BACKGROUND_TERTIARY -> BACKGROUND_ELEVATED -> BACKGROUND_TERTIARY
Speed:    1.5 second loop
Shape:    Matches the element it's replacing (rounded corners, same dimensions)
```

---

## Screen-by-Screen Design

### Home Screen
```
Layout:
  - Full screen BACKGROUND_PRIMARY
  - Subtle radial gradient center glow (BACKGROUND_ELEVATED at 10% opacity, 200px radius)
  - Top: App logo (gradient text) + tagline
  - Center: Two large GlassCards stacked vertically
    - "Record Video" -- Camera icon (gradient glow) + description
    - "Import Video" -- Gallery icon (gradient glow) + description
  - Both cards: withSpring press + haptic + gradient border shimmer animation
  - Bottom: subtle version text (TEXT_TERTIARY)
```

### Camera Screen
```
Layout:
  - Full screen camera preview (edge-to-edge)
  - Top bar: Glass overlay strip
    - Close (X) button -- left
    - Flash toggle -- GlowIconButton
    - Camera flip -- GlowIconButton
    - Grid toggle -- GlowIconButton
    - Timer selector -- GlowIconButton
  - Center: Grid overlay (when enabled) -- subtle white lines at 30% opacity
  - Bottom area:
    - Duration selector: 3 AnimatedPills (10s, 30s, 60s) in a row
    - Record button: 72px outer ring + 64px inner gradient circle
      - Idle: white ring, red gradient center
      - Recording: ring animates as progress (GRADIENT_RECORDING fill), inner pulses
      - Paused: ring shows segments, inner shows pause icon
  - Countdown overlay: Full-screen semi-transparent, large TEXT_3XL gradient numbers
    with scale-in + fade-out Reanimated sequence
```

### Clip Selector Screen
```
Layout:
  - Top 55%: Video preview player (ClipPreview)
  - Bottom 45%: Glass panel containing:
    - Duration indicator: "32s selected" -- gradient text if valid, ERROR color if >60s
    - Timeline strip: horizontal scrollable thumbnail images
    - Left handle: gradient vertical bar (GRADIENT_PRIMARY), draggable
    - Right handle: same gradient bar, draggable
    - Selected region: brighter thumbnails
    - Unselected region: dimmed with dark overlay (50% black)
    - "Confirm" GradientButton at bottom
```

### Editor Screen
```
Layout:
  - Top ~55%: VideoPreview in 9:16 container
    - Text overlays rendered as React Native views on top
    - Play/Pause button overlay (center, semi-transparent circle)
  - Middle: Playback controls bar
    - Play/Pause GlowIconButton
    - Current time / Total duration (gradient text)
  - Below: Timeline component (~100px height)
    - ThumbnailStrip in scrollable container
    - TrimHandles: gradient bars on left/right edges
    - Playhead: bright vertical line with diamond top, glowing
    - Dimmed regions outside trim range
  - Bottom: ToolTabBar (56px glass bar)
    - Icons: Trim, Split, Crop, Speed, Filters, Adjust, Audio, Text
    - Active tab: gradient underline (3px, GRADIENT_PRIMARY)
    - Inactive: TEXT_TERTIARY icon color
  - Tool panel: GlassBottomSheet slides up when tab is selected
```

### Export Screen
```
Layout:
  - BACKGROUND_PRIMARY full screen
  - Top: Video thumbnail preview (small, rounded, with glass border)
  - Center: Circular progress ring (120px diameter)
    - Ring stroke: animated gradient (GRADIENT_PROGRESS) rotating
    - Center: large percentage text (gradient text, TEXT_2XL)
    - Below ring: stage label ("Encoding video..." -- TEXT_SECONDARY, subtle pulse)
    - Below label: "Estimated time: 15s" (TEXT_TERTIARY)
  - Cancel button (outline style, TEXT_SECONDARY)
  - On Complete:
    - Ring fills fully, transforms into checkmark icon
    - Particle burst animation (small circles radiating outward, Reanimated)
    - "Video Ready!" gradient text
    - Resolution selector pills (720p / 1080p) -- AnimatedPill
    - Action buttons: "Save to Gallery" (GradientButton primary)
    - Share row: GlassCards per platform (Instagram, WhatsApp, YouTube icons)
      each with platform-specific accent color tint
    - "Share More..." text button opens system share sheet
```

---

## Animation Specifications

### Spring Physics Defaults
```typescript
// Button press
withSpring(0.95, { stiffness: 400, damping: 15 })

// Bottom sheet entrance
withSpring(0, { stiffness: 300, damping: 25 })  // translateY to 0

// Pill selection switch
withSpring(newX, { stiffness: 350, damping: 20 }) // layout animation

// Playhead position
// Uses shared values directly -- NO withSpring (must be real-time, not springy)
```

### Timing Animations
```typescript
// Countdown numbers: scale in + fade out
withSequence(
  withTiming(1, { duration: 200 }),    // scale to 1
  withDelay(600, withTiming(0, { duration: 200 }))  // fade out
)

// Shimmer sweep
withRepeat(
  withTiming(1, { duration: 1500, easing: Easing.linear }),
  -1  // infinite
)

// Recording pulse
withRepeat(
  withSequence(
    withTiming(1.1, { duration: 500 }),
    withTiming(1.0, { duration: 500 })
  ),
  -1
)
```

### Haptic Feedback Map
| Action | Style |
|--------|-------|
| Button press | `ImpactFeedbackStyle.Light` |
| Record start/stop | `ImpactFeedbackStyle.Heavy` |
| Handle snap | `ImpactFeedbackStyle.Medium` |
| Tab switch | `ImpactFeedbackStyle.Light` |
| Slider boundary | `NotificationFeedbackType.Warning` |
| Export complete | `NotificationFeedbackType.Success` |
| Error | `NotificationFeedbackType.Error` |

---

## Required Libraries

| Library | Purpose |
|---------|---------|
| `expo-linear-gradient` | All gradient backgrounds, buttons, progress fills |
| `expo-blur` | Glassmorphism/frosted glass on surfaces |
| `@react-native-masked-view/masked-view` | Gradient text rendering |
| `expo-haptics` | Tactile feedback on every interaction |
| `react-native-reanimated` | Spring animations, shared values, layout transitions |
| `react-native-gesture-handler` | Pan, pinch, tap gestures for timeline and overlays |
| `react-native-svg` | Custom shapes (progress ring, waveforms) |
| `@expo/vector-icons` | Ionicons and MaterialIcons for tool icons |
