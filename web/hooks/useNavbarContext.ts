import { createContext, type Dispatch, useContext, useEffect } from "react";

export type NavbarMeta = {
  title?: string;
  backEnabled: boolean;
  backContextURL?: string;
  showUser: boolean;
};

export const DEFAULT_NAVBAR_META: NavbarMeta = {
  title: undefined,
  backEnabled: false,
  backContextURL: undefined,
  showUser: true,
};

type NavbarContext = NavbarMeta & {
  setNavbar: Dispatch<NavbarMeta>;
};

export const NavbarContext = createContext<NavbarContext>({
  ...DEFAULT_NAVBAR_META,
  setNavbar: () => {},
});

export const useNavbarContext = (): NavbarContext => useContext(NavbarContext);

export const useNavbar = (
  cb: () => {
    title: string;
    backEnabled?: boolean;
    backContextURL?: string;
    showUser?: boolean;
  },
): void => {
  const { setNavbar } = useNavbarContext();

  useEffect(() => {
    const result = cb();
    setNavbar({
      title: result.title,
      backEnabled: result.backEnabled ?? false,
      backContextURL: result.backContextURL,
      showUser: result.showUser ?? true,
    });
  }, [cb, setNavbar]);
};

export default useNavbar;
