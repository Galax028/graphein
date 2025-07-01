import "@/styles/globals.css";
import type { PageProps } from "@/utils/types/common";
import "@material-symbols/font-300/outlined.css";
import { NextIntlClientProvider } from "next-intl";
import type { AppProps } from "next/app";
import type { FC } from "react";

const App: FC<AppProps<PageProps>> = ({ Component, pageProps }) => {
  return (
    <NextIntlClientProvider
      locale={
        pageProps.locale ?? process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "en"
      }
      messages={pageProps.translations}
    >
      <Component {...pageProps} />
    </NextIntlClientProvider>
  );
};

export default App;
