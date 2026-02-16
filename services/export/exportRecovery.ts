/**
 * ============================================================
 *  EXPORT RECOVERY
 *  Crash-safe export checkpoints using the file system.
 *  Saves/loads export state so a failed export can be
 *  detected and retried on app restart.
 * ============================================================
 */

import { Directory, File, Paths } from 'expo-file-system';

import type { ExportStatus } from '@/types/video';

// ─── Checkpoint Type ────────────────────────────────────────

export interface ExportCheckpoint {
  /** Project this export belongs to */
  projectId: string;
  /** Current export stage */
  stage: ExportStatus;
  /** Progress value 0-1 */
  progress: number;
  /** The FFmpeg command that was/will be executed */
  command: string;
  /** Path to the expected output file */
  outputUri: string;
  /** Timestamp when checkpoint was saved */
  timestamp: number;
}

// ─── Constants ──────────────────────────────────────────────

const CHECKPOINT_DIR = 'video-editor/checkpoints';

/** Returns the checkpoint file for a project */
function getCheckpointFile(projectId: string): File {
  return new File(Paths.cache, CHECKPOINT_DIR, `${projectId}.json`);
}

// ─── Save Checkpoint ────────────────────────────────────────

/**
 * Saves an export checkpoint to the file system.
 * Called before starting an FFmpeg export so we can recover on crash.
 */
export function saveCheckpoint(
  projectId: string,
  checkpoint: ExportCheckpoint,
): void {
  const dir = new Directory(Paths.cache, CHECKPOINT_DIR);
  if (!dir.exists) {
    dir.create({ intermediates: true, idempotent: true });
  }

  const file = getCheckpointFile(projectId);
  file.write(JSON.stringify(checkpoint));
}

// ─── Load Checkpoint ────────────────────────────────────────

/**
 * Loads an existing export checkpoint for a project.
 * Returns null if no checkpoint exists.
 */
export function loadCheckpoint(
  projectId: string,
): ExportCheckpoint | null {
  const file = getCheckpointFile(projectId);

  if (!file.exists) {
    return null;
  }

  try {
    const content = file.textSync();
    return JSON.parse(content) as ExportCheckpoint;
  } catch {
    // Corrupted checkpoint — discard it
    clearCheckpoint(projectId);
    return null;
  }
}

// ─── Clear Checkpoint ───────────────────────────────────────

/**
 * Removes the export checkpoint for a project.
 * Called after a successful export completes.
 */
export function clearCheckpoint(projectId: string): void {
  const file = getCheckpointFile(projectId);
  if (file.exists) {
    file.delete();
  }
}
