import multer from "multer";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.MAX_UPLOAD_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      cb(ApiError.badRequest("Only PDF files are allowed"));
      return;
    }
    cb(null, true);
  },
});

export const uploadPdf = (fieldName: string) => upload.single(fieldName);
