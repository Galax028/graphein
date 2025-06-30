/**
 * Gets the initials of each word in a string seperated by a space,
 * combines it up, and return as a string.
 *
 * (ex. "Jane Doe" => "JD")
 *
 * @param string The string to initialize.
 * @returns The initialized string.
 */

const getInitialsOfString = (string: string) => {
  return string
    .split(" ")
    .map((substring) => substring.charAt(0))
    .join("");
};

export default getInitialsOfString;
