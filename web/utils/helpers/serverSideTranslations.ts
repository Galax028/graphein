import type { TranslationRecord } from "@/utils/types/common";
import type { IncomingMessage } from "http";
import type { NextApiRequestCookies } from "next/dist/server/api-utils";

const getServerSideTranslations = async (
  req: IncomingMessage & {
    cookies: NextApiRequestCookies;
  },
  routes: string[],
): Promise<[string, TranslationRecord]> => {
  const locale =
    req.cookies["NEXT_LOCALE"] ??
    process.env.NEXT_PUBLIC_DEFAULT_LOCALE ??
    "en";
  let translations = {} as TranslationRecord;

  if (routes.length === 1) {
    translations = (await import(`@/translations/${locale}/${routes}.json`))
      .default;
  } else {
    await Promise.all(
      routes.map(
        async (route) =>
          (translations[route] = (
            await import(`@/translations/${locale}/${route}.json`)
          ).default),
      ),
    );
  }

  return [locale, translations];
};

export default getServerSideTranslations;
