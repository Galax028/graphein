const getFormattedFilesize = (filesize: number): string => {
  if (filesize < 1000) return `${filesize} B`;

  const units = ["B", "KB", "MB", "GB", "TB"] as const;
  const exp = Math.min(Math.floor(Math.log10(filesize) / 3), units.length - 2);
  const size = filesize / Math.pow(1000, exp);

  return `${size.toFixed(1)} ${units[exp]}`;
};

export default getFormattedFilesize;
