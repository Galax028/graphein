/**
 * Conditionally joins class names together. It filters out any falsy values
 * (e.g., null, undefined, false) from the arguments.
 *
 * @param segments  A list of class names or conditions. Falsy values are
 *                  ignored.
 * @returns         A single string of concatenated class names.
 * @example
 * // returns "btn btn-primary active"
 * cn("btn", "btn-primary", true && "active", false && "disabled", null);
 */
const cn = (...segments: unknown[]): string => {
  return sift(segments)
    .map((segment) => (segment as string).replace(/\s+/g, " "))
    .join(" ");
};

const sift = <T>(
  list: readonly (T | null | undefined | false | "" | 0 | 0n)[],
): T[] => {
  return (list?.filter((x) => !!x) as T[]) ?? [];
};

export default cn;
