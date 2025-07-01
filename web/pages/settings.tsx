import Button from "@/components/common/Button";
import Dialog from "@/components/common/Dialog";
import LabelGroup from "@/components/common/LabelGroup";
import PageLoadTransition from "@/components/common/layout/PageLoadTransition";
import NavigationBar from "@/components/common/NavigationBar";
import PersonAvatar from "@/components/common/PersonAvatar";
import SegmentedGroup from "@/components/common/SegmentedGroup";
import getServerSideTranslations from "@/utils/helpers/serverSideTranslations";
import type { PageProps } from "@/utils/types/common";
import useUserContext from "@/utils/useUserContext";
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

  const [busy, setBusy] = useState<boolean>(false);

  const [phone, setPhone] = useState<string | null>("");
  const [classroom, setClassroom] = useState<string | null>("");
  const [classroomNo, setClassroomNo] = useState<string | null>("");

  const [showSignOutDialog, setShowSignOutDialog] = useState<boolean>(false);

  const changeLanguage = (lang: string) =>
    router.replace(`${router.asPath}?lang=${lang}`);

  const handleUpdateProfileSettings = async () => {
    const res = await fetch(process.env.NEXT_PUBLIC_API_PATH + "/user", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tel: String(phone),
        class: Number(classroom),
        classNo: Number(classroomNo),
      }),
    });

    if (res.ok) {
      return location.reload();
    }
  };

  const handleSignOut = async () => {
    setBusy(true);

    const res = await fetch(
      process.env.NEXT_PUBLIC_API_PATH + "/auth/signout",
      {
        method: "POST",
        credentials: "include",
      },
    );

    if (res.ok) {
      return router.push("/");
    }
  };

  return (
    <>
      <NavigationBar
        user={user}
        title={t("navigationBar")}
        backEnabled={true}
      />
      <PageLoadTransition className="flex flex-col gap-3 p-3">
        <LabelGroup
          header={t("userSettings.title")}
          footer={t("userSettings.description")}
        >
          <div className="flex flex-col gap-3 p-3 bg-surface-container border border-outline rounded-lg">
            <LabelGroup header={t("userSettings.profile")}>
              <div className="m-auto">
                <PersonAvatar
                  profileUrl={user?.profileUrl}
                  personName={user?.name}
                  size={96}
                />
              </div>
            </LabelGroup>
            <LabelGroup header={t("userSettings.name")}>
              <input
                value={user?.name}
                className="w-full p-2 bg-background border border-outline rounded-lg text-body-md h-10 text-on-background-disabled"
                disabled
              />
            </LabelGroup>
            <LabelGroup header={t("userSettings.email")}>
              <input
                value={user?.email}
                className="w-full p-2 bg-background border border-outline rounded-lg text-body-md h-10 text-on-background-disabled"
                disabled
              />
            </LabelGroup>
            <LabelGroup header={t("userSettings.tel")}>
              <input
                value={phone ?? ""}
                className="w-full p-2 bg-background border border-outline rounded-lg text-body-md h-10"
                onChange={(e) => setPhone(e.target.value)}
              />
            </LabelGroup>
            <LabelGroup header={t("userSettings.classAndNo")}>
              <SegmentedGroup>
                <div className="text-body-md flex items-center justify-center p-2 h-10 aspect-square bg-surface-container border border-outline">
                  <p>{t("userSettings.class")}</p>
                </div>
                <input
                  value={classroom ?? ""}
                  onChange={(e) => setClassroom(e.target.value)}
                  type="text"
                  className="w-full p-2 bg-background text-body-md"
                />
                <div className="text-body-md flex items-center justify-center p-2 h-10 aspect-square bg-surface-container border border-outline">
                  <p>{t("userSettings.no")}</p>
                </div>
                <input
                  value={classroomNo ?? ""}
                  onChange={(e) => setClassroomNo(e.target.value)}
                  type="text"
                  className="w-full p-2 bg-background text-body-md"
                />
              </SegmentedGroup>
            </LabelGroup>
            <Button
              appearance="filled"
              onClick={handleUpdateProfileSettings}
              className="w-full"
              icon="save"
              busy={busy}
            >
              {t("userSettings.save")}
            </Button>
          </div>
        </LabelGroup>
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
          {t("signOut.button")}
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
            >
              {tx("action.nevermind")}
            </Button>
            <Button
              appearance="filled"
              onClick={handleSignOut}
              busy={busy}
              busyWithText={false}
            >
              {t("signOut.title")}
            </Button>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const [locale, translations] = await getServerSideTranslations(context.req, [
    "common",
    "settings",
  ]);

  return { props: { locale, translations } };
};

export default SettingsPage;
