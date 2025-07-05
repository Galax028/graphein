import type { Locale } from "next-intl";

const getFormattedDateTime = (
  locale: Locale,
  date: Date,
  options: {
    returnDate?: boolean;
    returnTime?: boolean;
  } = { returnDate: true, returnTime: true },
) => {
  let dateString = "";
  let timeString = "";

  if (options.returnDate)
    dateString = date.toLocaleDateString(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  if (options.returnTime)
    timeString = date.toLocaleTimeString(locale === "en" ? "en-GB" : locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  if (options.returnDate && options.returnTime) return `${dateString}, ${timeString}`;
  return dateString || timeString;
};

export default getFormattedDateTime;
