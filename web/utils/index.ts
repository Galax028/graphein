import type { FileType } from "@/utils/types/common";

/**
 * Conditionally joins class names together. It filters out any falsy values
 * (e.g., null, undefined, false) from the arguments.
 *
 * @param segments  A list of class names or conditions. Falsy values are
 *                  ignored.
 * @returns         A single string of concatenated class names.
 * @example
 * // returns "btn btn-primary active"
 * cn("btn", "btn-primary", true && "active", false && "disabled", null);
 */
export const cn = (...segments: unknown[]): string => {
  return sift(segments)
    .map((segment) => (segment as string).replace(/\s+/g, " "))
    .join(" ");
};

const sift = <T>(
  list: readonly (T | null | undefined | false | "" | 0 | 0n)[],
): T[] => {
  return (list?.filter((x) => !!x) as T[]) ?? [];
};

/**
 * Converts a MIME type string to a file extension.
 *
 * @param mime  The MIME type to convert.
 * @returns     The corresponding file extension.
 * @throws      Throws an error if the MIME type is not supported.
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
 * @param ext  The file extension to convert.
 * @returns    The corresponding MIME type.
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
