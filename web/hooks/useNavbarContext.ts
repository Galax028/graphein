import { createContext, type Dispatch, useContext } from "react";

type NavbarContext = {
  navbarTitle: string | null;
  setNavbarTitle: Dispatch<string>;
};

export const NavbarContext = createContext<NavbarContext>({
  navbarTitle: null,
  setNavbarTitle: () => {},
});

const useNavbarContext = (): NavbarContext => useContext(NavbarContext);

export default useNavbarContext;
