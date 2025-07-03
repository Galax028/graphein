import type { Locale } from "next-intl";

const getFormattedDateTime = (
  locale: Locale,
  date: Date,
  {
    returnDate = true,
    returnTime = true,
  }: {
    returnDate?: boolean;
    returnTime?: boolean;
  },
) => {
  let dateString = "";
  let timeString = "";

  if (returnDate)
    dateString = date.toLocaleDateString(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  if (returnTime)
    timeString = date.toLocaleTimeString(locale === "en" ? "en-GB" : locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  if (returnDate && returnTime) return `${dateString}, ${timeString}`;
  return dateString || timeString;
};

export default getFormattedDateTime;
