import {
  type Dispatch,
  type DispatchWithoutAction,
  useCallback,
  useSyncExternalStore,
} from "react";

const subscribe = (onChange: () => void): (() => void) => {
  window.addEventListener("storage", onChange);

  return () => window.removeEventListener("storage", onChange);
};

const defaultDeserialize = <T>(value: string): T => JSON.parse(value);

/**
 * A specific deserializer for `useLocalStorage` that treats the stored value as
 * a plain string, bypassing JSON parsing.
 *
 * @template T   The type of the string value.
 * @param value  The raw string value from local storage.
 * @returns      The value cast as its specific string type.
 */
export const deserializeAsString = <T extends string>(value: string): T =>
  value as T;

const defaultSerialize = <T>(value: T): string =>
  typeof value === "string" ? value : JSON.stringify(value);

/**
 * A hook to synchronize component state with `localStorage`.
 *
 * This hook uses `useSyncExternalStore` to ensure that state changes are
 * reflected across all browser tabs or windows that share the same origin. It
 * allows for custom serialization and deserialization logic.
 *
 * @template T         The type of the data to be stored.
 * @param key          The key under which the value is stored in local
 * storage.
 * @param deserialize  A function to convert the stored string back into
 *                     the desired type. Defaults to `JSON.parse`.
 * @param serialize    A function to convert the value into a string for
 *                     storage. Defaults to `JSON.stringify`.
 * @returns            A tuple `[value, setStore, unsetStore]` where `value` is
 *                     the current state, `setStore` is a function to update the
 *                     state, and `unsetStore` is a function to remove it from
 *                     storage.
 */
const useLocalStorage = <T>(
  key: string,
  deserialize: (value: string) => T = defaultDeserialize,
  serialize: (value: T) => string = defaultSerialize,
): [T | null, Dispatch<T | null>, DispatchWithoutAction] => {
  const getSnapshot = () => window.localStorage.getItem(key);
  const getServerSnapshot = () => null;
  const store = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const setStore = useCallback(
    (value: T | null) => {
      if (value === null) return;

      const newValue = serialize(value);
      window.localStorage.setItem(key, newValue);
      window.dispatchEvent(new StorageEvent("storage", { key, newValue }));
    },
    [key, serialize],
  );
  const unsetStore = useCallback(() => {
    window.localStorage.removeItem(key);
    window.dispatchEvent(new StorageEvent("storage", { key, newValue: null }));
  }, [key]);

  return [
    typeof store === "string" ? deserialize(store) : null,
    setStore,
    unsetStore,
  ];
};

export default useLocalStorage;
