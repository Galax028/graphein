import Button from "@/components/common/Button";
import PageLoadTransition from "@/components/common/layout/PageLoadTransition";
import NavigationBar from "@/components/common/NavigationBar";
import UserProfileSettings from "@/components/settings/UserProfileSettings";
import { prefetchUser } from "@/query/fetchUser";
import getServerSideTranslations from "@/utils/helpers/serverSideTranslations";
import type { PageProps } from "@/utils/types/common";
import useUserContext from "@/utils/useUserContext";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import type { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import Link from "next/link";
import type { FC } from "react";

const OnboardPage: FC<PageProps> = () => {
  const user = useUserContext();
  const tx = useTranslations("common");
  const t = useTranslations("onboard");

  return (
    <div className="flex flex-col h-dvh">
      <NavigationBar user={user} title={t("navigationBar")} />
      <PageLoadTransition className="relative">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="text-title-md">{t("title")}</h1>
            <p className="opacity-50">{t("description")}</p>
          </div>
          <UserProfileSettings user={user} withHeader={false} />
          <div className="fixed left-0 right-0 bottom-0 flex flex-col gap-3 p-3 bg-surface-container border-t border-outline z-10">
            <div className="flex flex-col gap-2">
              <p className="text-body-sm">
                {t.rich("disclaimer", {
                  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "",
                  a1: (children) => (
                    <Link href="/about/terms-of-service" target="_blank">
                      <span className="underline">{children}</span>
                    </Link>
                  ),
                  a2: (children) => (
                    <Link href="/about/privacy-policy" target="_blank">
                      <span className="underline">{children}</span>
                    </Link>
                  ),
                })}
              </p>
              <Button appearance="filled">{tx("action.next")}</Button>
              <Button className="text-error" appearance="tonal">
                {tx("action.signOut")}
              </Button>
            </div>
          </div>
        </div>
      </PageLoadTransition>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<PageProps> = async (
  context,
) => {
  const [locale, translations] = await getServerSideTranslations(context.req, [
    "common",
    "onboard",
  ]);

  const queryClient = new QueryClient();
  const sessionToken = `session_token=${context.req.cookies["session_token"]}`;
  const signedIn = await prefetchUser(queryClient, sessionToken);
  if (signedIn)
    return {
      props: { locale, translations, dehydratedState: dehydrate(queryClient) },
    };

  return { redirect: { destination: "/", permanent: false } };
};

export default OnboardPage;
