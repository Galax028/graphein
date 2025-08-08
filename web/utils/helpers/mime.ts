import type { FileType } from "@/utils/types/common";

/**
 * Converts a MIME type string to a file extension.
 *
 * @param {string} mime The MIME type to convert.
 * @returns {FileType} The corresponding file extension.
 * @throws {Error} Throws an error if the MIME type is not supported.
 */
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

/**
 * Converts a file extension to its corresponding MIME type string.
 *
 * @param {FileType} ext The file extension to convert.
 * @returns {string} The corresponding MIME type.
 */
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
