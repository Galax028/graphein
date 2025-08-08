/**
 * Generates a string of initials from a full name.
 *
 * @param name  The full name to get initials from.
 * @returns     The initials of the provided name.
 * @example
 * // returns "JD"
 * getInitialsOfName("John Doe");
 */
const getInitialsOfName = (name: string): string => {
  return name
    .split(" ")
    .map((substring) => substring.charAt(0))
    .join("");
};

export default getInitialsOfName;
