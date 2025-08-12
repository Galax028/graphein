import {
  type Dispatch,
  type DispatchWithoutAction,
  type SetStateAction,
  useCallback,
  useState,
} from "react";

/**
 * A generic state hook that manages a value that can be null.
 *
 * This hook extends the functionality of `useState` by providing an additional,
 * memoized function specifically for setting the state back to `null`. It's
 * useful for managing state that can be explicitly cleared or unset.
 *
 * @template T  The type of the state when it is not null.
 * @returns     A tuple `[value, setValue, unsetValue]` where `value` is the
 *              current state, `setValue` is the standard state setter, and
 *              `unsetValue` is a function to reset the state to `null`.
 */
const useNullableState = <T>(): [
  T | null,
  Dispatch<SetStateAction<T | null>>,
  DispatchWithoutAction,
] => {
  const [value, setValue] = useState<T | null>(null);
  const unsetValue = useCallback(() => setValue(null), []);

  return [value, setValue, unsetValue];
};

export default useNullableState;
