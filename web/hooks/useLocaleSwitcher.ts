import type { Locale } from "next-intl";
import { useRouter } from "next/router";
import { type Dispatch, useCallback } from "react";

/**
 * A hook that provides a memoized function to switch the application's locale.
 *
 * It uses the Next.js router to update the language query parameter, triggering
 * a locale change without a full page reload.
 *
 * @returns  A callback function that accepts a locale string to switch the
 *           application's language.
 */
const useLocaleSwitcher = (): Dispatch<Locale> => {
  const router = useRouter();
  const switchLocale = useCallback(
    (locale: Locale) => {
      router.query.lang = locale;
      router.replace(router);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return switchLocale;
};

export default useLocaleSwitcher;
