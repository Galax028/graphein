/**
 * Returns a greeting message key based on the current time of day. The returned
 * key is intended for use with a translation library.
 *
 * @returns {string} The translation key for the appropriate greeting.
 * @example
 * // If it's 10:00, returns "greeting.morning"
 * // If it's 15:00, returns "greeting.afternoon"
 */
const getGreetingMessage = (): string => {
  const hour = new Date().getHours();

  if (hour >= 19 || (hour >= 0 && hour <= 3)) {
    return "greeting.midnight";
  } else if (hour >= 16) {
    return "greeting.evening";
  } else if (hour >= 12) {
    return "greeting.afternoon";
  } else {
    return "greeting.morning";
  }
};

export default getGreetingMessage;
