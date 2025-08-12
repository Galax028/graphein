/**
 * Formats a file size in bytes into a human-readable string with appropriate
 * units.
 *
 * @param filesize  The file size in bytes.
 * @returns         A formatted string filesize string (e.g., "1.2 MB").
 * @example
 * // returns "500 B"
 * getFormattedFilesize(500);
 * // returns "1.5 KB"
 * getFormattedFilesize(1500);
 * // returns "2.5 MB"
 * getFormattedFilesize(2500000);
 */
const getFormattedFilesize = (filesize: number): string => {
  if (filesize < 1000) return `${filesize} B`;

  const units = ["B", "KB", "MB", "GB", "TB"] as const;
  const exp = Math.min(Math.floor(Math.log10(filesize) / 3), units.length - 2);
  const size = filesize / Math.pow(1000, exp);

  return `${size.toFixed(1)} ${units[exp]}`;
};

export default getFormattedFilesize;
