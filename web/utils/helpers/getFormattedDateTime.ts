import type { Locale } from "next-intl";

/**
 * Formats a Date object into a readable string with localization.
 *
 * @param locale              The locale to use for formatting.
 * @param date                The Date object to format.
 * @param options             Configuration to control the output format.
 * @param options.returnDate  Whether to include the date part
 *                            in the output.
 * @param options.returnTime  Whether to include the time part
 *                            in the output.
 * @returns                   A formatted string representing the date, time, or
 *                            both.
 * @example
 * const myDate = new Date('2023-10-27T14:30:00');
 * // returns "27 October 2023, 14:30"
 * getFormattedDateTime('en', myDate);
 * // returns "27 October 2023"
 * getFormattedDateTime('en', myDate, { returnDate: true, returnTime: false });
 * // returns "14:30"
 * getFormattedDateTime('en', myDate, { returnDate: false, returnTime: true });
 */
const getFormattedDateTime = (
  locale: Locale,
  date: Date,
  options: {
    returnDate?: boolean;
    returnTime?: boolean;
  } = { returnDate: true, returnTime: true },
): string => {
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

  if (options.returnDate && options.returnTime)
    return `${dateString}, ${timeString}`;
  return dateString || timeString;
};

export default getFormattedDateTime;
