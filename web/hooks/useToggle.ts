import { useCallback, useState } from "react";

/**
 * Defines the shape for a dispatch function that can either toggle a state or
 * set it to a specific value.
 *
 * @param value  The optional value to set the state to. If not provided, the
 *               state is typically toggled.
 */
export type ToggleDispatch = (value?: unknown) => void;

/**
 * Manages a boolean state, providing a function to toggle or set its value.
 *
 * @param initial  The initial state.
 * @returns        A tuple containing the current state and a function to update
 *                 it. The update function toggles the state if called without
 *                 an argument, or sets it to the provided boolean value.
 */
const useToggle = (initial: boolean = false): [boolean, ToggleDispatch] => {
  const [value, setValue] = useState(initial);
  const toggleValue = useCallback(
    (value?: unknown) =>
      typeof value === "boolean"
        ? setValue(value)
        : setValue((value) => !value),
    [],
  );

  return [value, toggleValue];
};

export default useToggle;
