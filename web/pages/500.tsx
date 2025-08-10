import useNavbar from "@/hooks/useNavbarContext";
import type { PageProps } from "@/utils/types/common";
import type { GetStaticProps } from "next";
import { useCallback, type FC } from "react";

const ServerErrorPage: FC<PageProps> = () => {
  useNavbar(
    useCallback(() => ({ title: process.env.NEXT_PUBLIC_APP_NAME ?? "" }), []),
  );

  return (
    <>
      <h1>500</h1>
      <span>Internal Server Error</span>
    </>
  );
};

export const getStaticProps: GetStaticProps<PageProps> = () => ({
  props: {
    locale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "en",
    translations: {},
  },
});

export default ServerErrorPage;
