export interface FileToStore {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
}

export interface StoredFile {
  url: string;
  path: string;
}

export interface StorageService {
  save(file: FileToStore, folder: string): Promise<StoredFile>;
  delete(path: string): Promise<void>;
}
