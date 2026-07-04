import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { env } from "../../config/env";
import { FileToStore, StorageService, StoredFile } from "./storage.interface";

const UPLOAD_ROOT = path.resolve(process.cwd(), env.UPLOAD_DIR);

export class LocalStorageService implements StorageService {
  async save(file: FileToStore, folder: string): Promise<StoredFile> {
    const ext = path.extname(file.originalName) || "";
    const filename = `${crypto.randomUUID()}${ext}`;
    const relativePath = path.posix.join(folder, filename);
    const absoluteDir = path.join(UPLOAD_ROOT, folder);

    await fs.mkdir(absoluteDir, { recursive: true });
    await fs.writeFile(path.join(absoluteDir, filename), file.buffer);

    return { url: `/uploads/${relativePath}`, path: relativePath };
  }

  async delete(relativePath: string): Promise<void> {
    await fs.rm(path.join(UPLOAD_ROOT, relativePath), { force: true });
  }
}
