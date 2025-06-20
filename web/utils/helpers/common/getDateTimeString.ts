export default function getDateTimeString(
  date: Date,
  options?: Partial<{
    returnDate: boolean;
    returnTime: boolean;
  }>
) {
  const showDate = options?.returnDate ?? true;
  const showTime = options?.returnTime ?? true;

  let dateString = "";
  let timeString = "";

  if (showDate) {
    dateString = date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  if (showTime) {
    timeString = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  if (showDate && showTime) {
    return `${dateString}, ${timeString}`;
  }
  return dateString || timeString;
}
