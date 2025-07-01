/**
 * Joins and normalize segments of `className`.
 *
 * `cn` is needed when:
 * - `className` spans multiple lines in code.
 * - Some parts of `className` are only present when conditions are met.
 *
 * @returns A string to use in `className`.
 */
const cn = (...segments: unknown[]) => {
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
