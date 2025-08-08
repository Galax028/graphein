import Button from "@/components/common/Button";
import Dialog from "@/components/common/Dialog";
import LabelGroup from "@/components/common/LabelGroup";
import PageLoadTransition from "@/components/layout/PageLoadTransition";
import NavigationBar from "@/components/common/NavigationBar";
import SegmentedGroup from "@/components/common/SegmentedGroup";
import UserProfileSettings from "@/components/settings/UserProfileSettings";
import { prefetchUser } from "@/query/fetchUser";
import getServerSideTranslations from "@/utils/helpers/serverSideTranslations";
import type { PageProps } from "@/utils/types/common";
import useUserContext from "@/hooks/useUserContext";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "motion/react";
import type { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect, type FC } from "react";
import useToggle from "@/hooks/useToggle";
import useNavbarContext from "@/hooks/useNavbarContext";

const SettingsPage: FC<PageProps> = ({ locale }) => {
  const router = useRouter();
  const tx = useTranslations("common");
  const t = useTranslations("settings");
  const { setNavbarTitle } = useNavbarContext();
  const user = useUserContext();

  const [showSignOutDialog, toggleShowSignOutDialog] = useToggle();
  const [isSigningOut, toggleIsSigningOut] = useToggle();

  useEffect(() => setNavbarTitle(t("navigationBar")), [t, setNavbarTitle]);

  const changeLanguage = (lang: string) =>
    router.replace(`${router.asPath}?lang=${lang}`);

  const handleSignOut = async () => {
    toggleIsSigningOut(true);

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
        // title={t("navigationBar")}
        backEnabled={true}
      />
      <PageLoadTransition>
        <UserProfileSettings user={user} />
        <LabelGroup header={t("appearanceSettings.title")}>
          <div
            className={`
              flex flex-col gap-3 rounded-lg border border-outline
              bg-surface-container p-3
            `}
          >
            <LabelGroup header={t("appearanceSettings.language")}>
              <SegmentedGroup>
                <Button
                  selected={locale === "th"}
                  appearance="tonal"
                  onClick={() => changeLanguage("th")}
                >
                  ไทย
                </Button>
                <Button
                  selected={locale === "en"}
                  appearance="tonal"
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
          onClick={() => toggleShowSignOutDialog(true)}
          className="w-full text-error"
          icon="logout"
        >
          {t("signOut.title")}
        </Button>
      </PageLoadTransition>
      <AnimatePresence>
        {showSignOutDialog && (
          <Dialog
            title={t("signOut.title")}
            desc={t("signOut.description")}
            setClickOutside={toggleShowSignOutDialog}
          >
            <Button
              appearance="tonal"
              onClick={() => toggleShowSignOutDialog(false)}
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
  const user = await prefetchUser(queryClient, sessionToken, {
    returnUser: true,
  });
  if (user) {
    if (user.role === "merchant")
      return {
        redirect: { destination: "/merchant/dashboard", permanent: false },
      };

    return {
      props: { locale, translations, dehydratedState: dehydrate(queryClient) },
    };
  }

  return { redirect: { destination: "/", permanent: false } };
};

export default SettingsPage;
