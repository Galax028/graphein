import Button from "@/components/common/Button";
import LabelGroup from "@/components/common/LabelGroup";
import NavigationBar from "@/components/common/NavigationBar";
import SegmentedGroup from "@/components/common/SegmentedGroup";
import SignInButton from "@/components/landing/SignInButton";
import useToggle from "@/hooks/useToggle";
import { prefetchUser } from "@/query/fetchUser";
import { cn } from "@/utils";
import getServerSideTranslations from "@/utils/helpers/serverSideTranslations";
import type { PageProps } from "@/utils/types/common";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import type { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, type FC } from "react";

const LandingPage: FC<PageProps> = ({ locale }) => {
  const router = useRouter();
  const t = useTranslations();

  const [isSigningIn, toggleIsSigningIn] = useToggle();
  const [asMerchant, toggleAsMerchant] = useToggle();

  useEffect(
    () => {
      if (!router.isReady) return;

      toggleAsMerchant(router.query.asMerchant === "true");
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router.query.asMerchant, toggleAsMerchant],
  );

  const changeLanguage = (lang: string) => {
    router.query.lang = lang;
    router.replace(router);
  };

  return (
    <div className="flex h-dvh flex-col">
      <NavigationBar
        title={t("navigationBar", {
          appName: process.env.NEXT_PUBLIC_APP_NAME ?? "",
        })}
      />
      <div className="flex flex-grow flex-col justify-between p-3 md:p-0">
        <div className="md:m-auto md:grid md:flex-grow md:place-items-center">
          <div
            className={cn(
              `
                flex w-full flex-col gap-3
                md:max-w-lg md:rounded-xl md:border md:border-outline
                md:bg-surface-container md:p-6
              `,
            )}
          >
            <div className="flex flex-col gap-1">
              <h1 className="text-title-md">{t("container.title")}</h1>
              <p className="opacity-50">{t("container.description")}</p>
            </div>
            <SignInButton
              isSigningIn={isSigningIn}
              setIsSigningIn={() => toggleIsSigningIn()}
              asMerchant={asMerchant}
            />
          </div>
        </div>
        <div className="flex w-full flex-col gap-3 md:m-auto md:my-4 md:max-w-lg">
          <LabelGroup header={t("language")}>
            <SegmentedGroup>
              <Button
                selected={locale === "th"}
                appearance="tonal"
                disabled={isSigningIn}
                onClick={() => changeLanguage("th")}
              >
                ไทย
              </Button>
              <Button
                selected={locale === "en"}
                appearance="tonal"
                disabled={isSigningIn}
                onClick={() => changeLanguage("en")}
              >
                English
              </Button>
            </SegmentedGroup>
          </LabelGroup>
          <p className="text-xs opacity-50">
            <Link className="underline" href="/about" />
            <Link className="underline" href="/legal/privacy-policy" />
            <Link className="underline" href="/legal/terms-of-service" />
          </p>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<PageProps> = async (
  context,
) => {
  const [locale, translations] = await getServerSideTranslations(context.req, [
    "index",
  ]);

  const queryClient = new QueryClient();
  const sessionToken = `session_token=${context.req.cookies["session_token"]}`;
  const user = await prefetchUser(queryClient, sessionToken, {
    returnUser: true,
  });
  if (user) {
    if (!user.isOnboarded)
      return { redirect: { destination: "/onboard", permanent: false } };

    return {
      redirect: {
        destination:
          user.role === "merchant" ? "/merchant/dashboard" : "/glance",
        permanent: false,
      },
    };
  }

  return {
    props: { locale, translations, dehydratedState: dehydrate(queryClient) },
  };
};

export default LandingPage;
