import path from 'node:path'
import fs from 'node:fs'

/**
 * Base storage directory.
 * - Local dev: ./storage (relative to cwd)
 * - Railway: set STORAGE_PATH=/data/storage (on a mounted Volume)
 *
 * Railway Volume setup:
 * 1. Railway dashboard → your service → Volumes → Add Volume
 * 2. Mount path: /data
 * 3. Set env var: STORAGE_PATH=/data/storage
 */
export function getStorageBase(): string {
  if (process.env.STORAGE_PATH) {
    return path.resolve(process.env.STORAGE_PATH)
  }
  return path.join(process.cwd(), 'storage')
}

export function getStoragePath(...segments: string[]): string {
  const fullPath = path.join(getStorageBase(), ...segments)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  return fullPath
}

export function getStorageDir(...segments: string[]): string {
  const dir = path.join(getStorageBase(), ...segments)
  fs.mkdirSync(dir, { recursive: true })
  return dir
}
