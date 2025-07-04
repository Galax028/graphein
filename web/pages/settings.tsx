import Button from "@/components/common/Button";
import Dialog from "@/components/common/Dialog";
import LabelGroup from "@/components/common/LabelGroup";
import PageLoadTransition from "@/components/common/layout/PageLoadTransition";
import NavigationBar from "@/components/common/NavigationBar";
import SegmentedGroup from "@/components/common/SegmentedGroup";
import UserProfileSettings from "@/components/settings/UserProfileSettings";
import { prefetchUser } from "@/query/fetchUser";
import getServerSideTranslations from "@/utils/helpers/serverSideTranslations";
import type { PageProps } from "@/utils/types/common";
import useUserContext from "@/utils/useUserContext";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "motion/react";
import type { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { type FC, useState } from "react";

const SettingsPage: FC<PageProps> = ({ locale }) => {
  const router = useRouter();
  const tx = useTranslations("common");
  const t = useTranslations("settings");
  const user = useUserContext();

  const [showSignOutDialog, setShowSignOutDialog] = useState<boolean>(false);
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);

  const changeLanguage = (lang: string) =>
    router.replace(`${router.asPath}?lang=${lang}`);

  const handleSignOut = async () => {
    setIsSigningOut(true);

    const res = await fetch(
      process.env.NEXT_PUBLIC_API_PATH + "/auth/signout",
      { method: "POST", credentials: "include" },
    );

    if (res.ok) {
      return router.push("/");
    }
  };

  return (
    <div className="flex flex-col items-center">
      <NavigationBar
        user={user}
        title={t("navigationBar")}
        backEnabled={true}
      />
      <PageLoadTransition className="flex flex-col gap-3 p-3">
        <UserProfileSettings user={user} />
        <LabelGroup header={t("appearanceSettings.title")}>
          <div className="flex flex-col gap-3 p-3 bg-surface-container border border-outline rounded-lg">
            <LabelGroup header={t("appearanceSettings.language")}>
              <SegmentedGroup>
                <Button
                  selected={locale === "th"}
                  appearance={"tonal"}
                  onClick={() => changeLanguage("th")}
                >
                  ไทย
                </Button>
                <Button
                  selected={locale == "en"}
                  appearance={"tonal"}
                  onClick={() => changeLanguage("en")}
                >
                  English
                </Button>
              </SegmentedGroup>
            </LabelGroup>
          </div>
        </LabelGroup>
        <Button
          appearance="tonal"
          onClick={() => setShowSignOutDialog(true)}
          className="w-full text-error"
          icon={"logout"}
        >
          {tx("action.signOut")}
        </Button>
        <LabelGroup header="Developer Log">
          <div className="p-3 text-body-sm bg-surface-container border border-outline rounded-lg">
            <b>
              <a
                className="!font-mono break-all"
                href={process.env.NEXT_PUBLIC_API_PATH + "/user"}
                target="_blank"
              >
                {process.env.NEXT_PUBLIC_API_PATH + "/user"}
              </a>
            </b>
            <br />
            <span className="!font-mono break-all">{JSON.stringify(user)}</span>
          </div>
        </LabelGroup>
      </PageLoadTransition>
      <AnimatePresence>
        {showSignOutDialog && (
          <Dialog
            title={t("signOut.title")}
            desc={t("signOut.description")}
            setClickOutside={setShowSignOutDialog}
          >
            <Button
              appearance="tonal"
              onClick={() => setShowSignOutDialog(false)}
              disabled={isSigningOut}
            >
              {tx("action.nevermind")}
            </Button>
            <Button
              appearance="filled"
              onClick={handleSignOut}
              busy={isSigningOut}
              busyWithText={false}
            >
              {t("signOut.title")}
            </Button>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const [locale, translations] = await getServerSideTranslations(context.req, [
    "common",
    "settings",
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

export default SettingsPage;
