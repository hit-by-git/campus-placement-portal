import { LocalStorageService } from "./localStorage.service";
import { StorageService } from "./storage.interface";

// Swap this line for a Cloudinary/S3 implementation of StorageService to change
// upload backends without touching any calling code.
export const storageService: StorageService = new LocalStorageService();

export type { StorageService, FileToStore, StoredFile } from "./storage.interface";
