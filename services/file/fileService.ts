/**
 * ============================================================
 *  FILE SERVICE
 *  Temp directory management, file path generation, and
 *  cleanup utilities for video processing projects.
 *
 *  Directory structure (runtime):
 *    {cacheDir}/video-editor/projects/{projectId}/
 *      thumbnails/
 *      segments/
 *      temp/
 *      output/
 * ============================================================
 */

import { Directory, File, Paths } from 'expo-file-system';

// ─── Constants ──────────────────────────────────────────────
const BASE_DIR_NAME = 'video-editor/projects';

const SUBDIRECTORIES = ['thumbnails', 'segments', 'temp', 'output'] as const;

// ─── Path Builders (Pure) ───────────────────────────────────

/** Returns the root directory for a project */
export function getProjectDir(projectId: string): Directory {
  return new Directory(Paths.cache, BASE_DIR_NAME, projectId);
}

/** Returns the thumbnails directory for a project */
export function getThumbnailDir(projectId: string): Directory {
  return new Directory(Paths.cache, BASE_DIR_NAME, projectId, 'thumbnails');
}

/** Returns the segments directory for a project */
export function getSegmentsDir(projectId: string): Directory {
  return new Directory(Paths.cache, BASE_DIR_NAME, projectId, 'segments');
}

/** Returns the temp directory for a project */
export function getTempDir(projectId: string): Directory {
  return new Directory(Paths.cache, BASE_DIR_NAME, projectId, 'temp');
}

/** Returns the output directory for a project */
export function getOutputDir(projectId: string): Directory {
  return new Directory(Paths.cache, BASE_DIR_NAME, projectId, 'output');
}

// ─── Directory Management ───────────────────────────────────

/**
 * Creates the full project directory tree.
 * Safe to call multiple times — creates only missing directories.
 * @returns The project root directory URI.
 */
export function createProjectDir(projectId: string): string {
  for (const subdir of SUBDIRECTORIES) {
    const dir = new Directory(Paths.cache, BASE_DIR_NAME, projectId, subdir);
    dir.create({ intermediates: true, idempotent: true });
  }

  return getProjectDir(projectId).uri;
}

/**
 * Deletes the entire project directory and all its contents.
 * Safe to call even if the directory does not exist.
 */
export function cleanupProject(projectId: string): void {
  const projectDir = getProjectDir(projectId);
  if (projectDir.exists) {
    projectDir.delete();
  }
}

/**
 * Deletes only the temp subdirectory for a project.
 * Used to clean up intermediate files while preserving outputs.
 */
export function cleanupTemp(projectId: string): void {
  const tempDir = getTempDir(projectId);
  if (tempDir.exists) {
    tempDir.delete();
  }
  // Recreate the empty temp directory
  tempDir.create({ intermediates: true, idempotent: true });
}

// ─── Temp File Generation ───────────────────────────────────

let tempFileCounter = 0;

/**
 * Generates a unique temp file path within the project's temp directory.
 * Does NOT create the file — the file is created when written to by FFmpeg.
 * @param extension File extension without the dot (e.g., 'mp4', 'jpg').
 * @returns The file URI string.
 */
export function createTempFile(projectId: string, extension: string): string {
  tempFileCounter += 1;
  const uniqueName = `${Date.now()}_${tempFileCounter}.${extension}`;
  const file = new File(getTempDir(projectId), uniqueName);
  return file.uri;
}

/**
 * Generates a unique output file path within the project's output directory.
 * @param extension File extension without the dot (e.g., 'mp4').
 * @returns The file URI string.
 */
export function createOutputFile(
  projectId: string,
  extension: string,
): string {
  tempFileCounter += 1;
  const uniqueName = `${Date.now()}_${tempFileCounter}.${extension}`;
  const file = new File(getOutputDir(projectId), uniqueName);
  return file.uri;
}

// ─── File Utilities ─────────────────────────────────────────

/**
 * Returns the file size in bytes.
 * @throws If the file does not exist.
 */
export function getFileSize(uri: string): number {
  const file = new File(uri);
  if (!file.exists) {
    throw new Error(`File not found: ${uri}`);
  }
  return file.size;
}

/** Returns true if the file or directory exists at the given URI */
export function fileExists(uri: string): boolean {
  const pathInfo = Paths.info(uri);
  return pathInfo.exists;
}
