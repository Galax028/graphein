import type { FileType } from "@/utils/types/common";

export const mimeToExt = (mime: string): FileType => {
  switch (mime) {
    case "application/pdf":
      return "pdf";
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    default:
      throw new Error("Invalid MIME type");
  }
};

export const extToMime = (ext: FileType): string => {
  switch (ext) {
    case "pdf":
      return "application/pdf";
    case "png":
      return "image/png";
    case "jpg":
      return "image/jpeg";
  }
};
