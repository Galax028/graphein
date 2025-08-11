import type { ToggleDispatch } from "@/hooks/useToggle";
import {
  type ActionDispatch,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
} from "react";

type DialogMeta = {
  title: string;
  description?: string;
  content?: ReactNode;
  allowClickOutside: boolean;
};

export const DEFAULT_DIALOG_META: DialogMeta = {
  title: "Alert",
  description: undefined,
  content: undefined,
  allowClickOutside: true,
};

type DialogDispatchAction =
  | ({ set: "all" } & DialogMeta)
  | { set: "title"; title: string }
  | { set: "description"; description?: string }
  | { set: "content"; content?: ReactNode }
  | { set: "clickOutside"; allowClickOutside: boolean };

export const dialogReducer = (
  dialog: DialogMeta,
  action: DialogDispatchAction,
): DialogMeta => {
  switch (action.set) {
    case "all":
      return {
        title: action.title,
        description: action.description,
        content: action.content,
        allowClickOutside: action.allowClickOutside,
      };
    case "title":
      return { ...dialog, title: action.title };
    case "description":
      return { ...dialog, description: action.description };
    case "content":
      return { ...dialog, content: action.content };
    case "clickOutside":
      return { ...dialog, allowClickOutside: action.allowClickOutside };
  }
};

type DialogContext = DialogMeta & {
  show: boolean;
  toggle: ToggleDispatch;
  dispatch: ActionDispatch<[action: DialogDispatchAction]>;
};

export const DialogContext = createContext<DialogContext>({
  ...DEFAULT_DIALOG_META,
  show: false,
  toggle: () => {},
  dispatch: () => {},
});

export const useDialogContext = (): DialogContext => useContext(DialogContext);

/**
 * A hook that provides a simplified API for controlling the dialog.
 *
 * It abstracts a dispatcher function from the `DialogContext` into a set of
 * memoized, easy-to-use setter functions for controlling the dialog's state and
 * visibility.
 *
 * @returns  An object containing functions to control the dialog.
 */
const useDialog = () => {
  const { show: isToggled, toggle, dispatch } = useDialogContext();
  const setAndToggle = useCallback(
    ({ title, description, content, allowClickOutside }: DialogMeta) => {
      dispatch({ set: "all", title, description, content, allowClickOutside });
      toggle(true);
    },
    [dispatch, toggle],
  );
  const setTitle = useCallback(
    (title: string) => dispatch({ set: "title", title }),
    [dispatch],
  );
  const setDescription = useCallback(
    (description: string | undefined = undefined) =>
      dispatch({ set: "description", description }),
    [dispatch],
  );
  const setContent = useCallback(
    (content: ReactNode = undefined) => dispatch({ set: "content", content }),
    [dispatch],
  );
  const setAllowClickOutside = useCallback(
    (allowClickOutside: boolean) =>
      dispatch({ set: "clickOutside", allowClickOutside }),
    [dispatch],
  );

  return {
    isToggled,
    toggle,
    setAndToggle,
    setTitle,
    setDescription,
    setContent,
    setAllowClickOutside,
  };
};

export default useDialog;
