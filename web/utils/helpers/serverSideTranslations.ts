import { IncomingMessage } from "http";
import { NextApiRequestCookies } from "next/dist/server/api-utils";

const getServerSideTranslations = async (
  req: IncomingMessage & {
    cookies: NextApiRequestCookies;
  },
  routes: string | string[],
): Promise<[string, Record<string, any>]> => {
  const locale =
    req.cookies["NEXT_LOCALE"] ??
    process.env.NEXT_PUBLIC_DEFAULT_LOCALE ??
    "en";

  let translations: Record<string, any> = {};

  if (Array.isArray(routes)) {
    for (const route of routes) {
      translations[route] = (
        await import(`@/translations/${locale}/${route}.json`)
      ).default;
    }
  } else {
    translations = (await import(`@/translations/${locale}/${routes}.json`))
      .default;
  }

  return [locale, translations];
};

export default getServerSideTranslations;
