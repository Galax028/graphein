export const RANGE_REGEX: RegExp = /(\d+)(?:\s*-\s*(\d+))?/g;

/**
 * Validates a string representing a series of numbers and ranges.
 *
 * This function checks for the following conditions to ensure the validity of
 * the range string:
 * 1. It ensures there are no extraneous characters or malformed hyphens.
 * 2. It verifies that in any range, the start is always less than end.
 * 3. It checks for any duplicate numbers across all single numbers and ranges.
 *
 * @param range  The string of numbers and ranges to validate.
 * @returns      A boolean indicating whether the range string is valid.
 * @example
 * // returns true
 * isValidRange("1-3, 5, 8-10");
 * // returns false (duplicate number)
 * isValidRange("1-4, 4-6");
 * // returns false (range out of bounds)
 * isValidRange("5-2");
 */
const isValidRange = (range: string): boolean => {
  // 1. We take into account that extra hyphens or negative numbers are invalid.
  const hyphens = range
    .replace(/\b\d+\b(?:\s*-\s*\b\d+\b)?/g, "")
    .replace(/,|\s/g, "");
  if (hyphens !== "" || range === "") return false;

  const parsedItems = [...range.matchAll(RANGE_REGEX)].map((match) => {
    const [start, endMatch] = [parseInt(match[1]), match[2]];
    // If the second group is undefined, then the item is a single number.
    if (endMatch === undefined) return { isValid: true, numbers: [start] };
    // Handle ranges.
    const end = parseInt(endMatch, 10);
    if (start >= end) return { isValid: false, numbers: [] };

    return {
      isValid: true,
      numbers: Array(end - start + 1)
        .fill(null)
        .map((_, idx) => start + idx),
    };
  });

  // 3. Check if any item was tagged as invalid.
  const allRangesAreValid = parsedItems.every((item) => item.isValid);
  if (!allRangesAreValid) return false;

  // 4. Check for duplicate numbers and/or ranges.
  const allNumbers = parsedItems.flatMap((item) => item.numbers);
  return new Set(allNumbers).size === allNumbers.length;
};

export default isValidRange;
