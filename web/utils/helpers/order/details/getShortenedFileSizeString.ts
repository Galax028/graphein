export function getShortenedFileSizeString(i: number) {
  let number = i;
  if (i < 1000) {
    return `${number} B`;
  } else if (i < Math.pow(1000, 2)) {
    number = i / 1000;
    return `${Math.floor(number * 10) / 10} KB`;
  } else if (i < Math.pow(1000, 3)) {
    number = i / (1000 * 1000);
    return `${Math.floor(number * 10) / 10} MB`;
  } else if (i < Math.pow(1000, 4)) {
    number = i / (1000 * 1000);
    return `${Math.floor(number * 10) / 10} GB`;
  }
}
