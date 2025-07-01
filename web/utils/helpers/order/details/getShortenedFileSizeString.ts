export function getShortenedFileSizeString(i: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let index = 0;
  let size = i;

  while (size >= 1000 && index < units.length - 1) {
    size /= 1000;
    index++;
  }

  return `${Math.floor(size * 10) / 10} ${units[index]}`;
}
