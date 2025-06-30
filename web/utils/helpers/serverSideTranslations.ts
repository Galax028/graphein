import { IncomingMessage } from "http";
import { NextApiRequestCookies } from "next/dist/server/api-utils";

const getServerSideTranslations = async (
  req: IncomingMessage & {
    cookies: NextApiRequestCookies;
  },
  route: string,
): Promise<[string, Record<string, string>]> => {
  const locale =
    req.cookies["NEXT_LOCALE"] ??
    process.env.NEXT_PUBLIC_DEFAULT_LOCALE ??
    "en";

  return [
    locale,
    (await import(`@/translations/${locale}/${route}.json`)).default,
  ];
};

export default getServerSideTranslations;
