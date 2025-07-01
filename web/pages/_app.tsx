import "@/styles/globals.css";
import "@material-symbols/font-300/outlined.css";
import { NextIntlClientProvider } from "next-intl";
import type { AppProps } from "next/app";

const App = ({ Component, pageProps }: AppProps) => {
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
