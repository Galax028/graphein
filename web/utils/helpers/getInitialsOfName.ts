/**
 * Gets the initials of the first and last name from a fullname.
 *
 * (ex. `"Jane Doe"` => `"JD"`)
 *
 * @param name The string to initialize.
 * @returns The initialized string.
 */
const getInitialsOfName = (name: string): string => {
  return name
    .split(" ")
    .map((substring) => substring.charAt(0))
    .join("");
};

export default getInitialsOfName;
