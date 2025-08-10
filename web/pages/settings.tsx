import Button from "@/components/common/Button";
import LabelGroup from "@/components/common/LabelGroup";
import SegmentedGroup from "@/components/common/SegmentedGroup";
import UserProfileSettings from "@/components/settings/UserProfileSettings";
import useDialog from "@/hooks/useDialogContext";
import { useNavbar } from "@/hooks/useNavbarContext";
import useToggle from "@/hooks/useToggle";
import useUserContext from "@/hooks/useUserContext";
import { prefetchUser } from "@/query/fetchUser";
import getServerSideTranslations from "@/utils/helpers/serverSideTranslations";
import type { PageProps } from "@/utils/types/common";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import type { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useCallback, type FC } from "react";

const SettingsPage: FC<PageProps> = ({ locale }) => {
  const router = useRouter();
  const tx = useTranslations("common");
  const t = useTranslations("settings");
  const dialog = useDialog();
  const user = useUserContext();

  const [isSigningOut, toggleSigningOut] = useToggle();

  useNavbar(
    useCallback(() => ({ title: t("navigationBar"), backEnabled: true }), [t]),
  );

  const changeLanguage = useCallback(
    (lang: string) => router.replace(`${router.asPath}?lang=${lang}`),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleSignOut = useCallback(
    async () => {
      toggleSigningOut(true);

      const res = await fetch(
        process.env.NEXT_PUBLIC_API_PATH + "/auth/signout",
        { method: "POST", credentials: "include" },
      );

      if (res.ok) {
        dialog.toggle(false);
        return router.push("/");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [toggleSigningOut],
  );

  const toggleSignOutDialog = useCallback(
    () =>
      dialog.setAndToggle({
        title: t("signOut.title"),
        description: t("signOut.description"),
        content: (
          <>
            <Button
              appearance="tonal"
              onClick={() => dialog.toggle(false)}
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
          </>
        ),
        allowClickOutside: true,
      }),
    [tx, t, dialog, isSigningOut, handleSignOut],
  );

  return (
    <>
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
        onClick={() => toggleSignOutDialog()}
        className="w-full text-error"
        icon="logout"
      >
        {t("signOut.title")}
      </Button>
    </>
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
