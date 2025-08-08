import type { TranslationRecord } from "@/utils/types/common";
import type { IncomingMessage } from "http";
import type { NextApiRequestCookies } from "next/dist/server/api-utils";

/**
 * Fetches server-side translations for a Next.js application. It determines the
 * locale from the request cookies or environment variables and dynamically
 * imports the corresponding translation JSON files.
 *
 * @async
 * @param {IncomingMessage & { cookies: NextApiRequestCookies }} req - The
 * Next.js request object, used for locale detection via cookies.
 * @param {string[]} routes - An array of translation file names to load
 * (without the .json extension).
 * @returns {Promise<[string, TranslationRecord]>} A promise that resolves to a
 * tuple containing the detected locale string and the loaded translation
 * records.
 */
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
