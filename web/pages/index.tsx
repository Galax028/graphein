import Button from "@/components/common/Button";
import LabelGroup from "@/components/common/LabelGroup";
import NavigationBar from "@/components/common/NavigationBar";
import SegmentedGroup from "@/components/common/SegmentedGroup";
import SignInButton from "@/components/landing/SignInButton";
import cn from "@/utils/helpers/cn";
import { LangCode } from "@/utils/types/common";
import { GetServerSideProps } from "next";
import { Trans } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { useState } from "react";

const LandingPage = () => {
  const [language, setLanguage] = useState("en");

  return (
    <>
      <div className="flex flex-col h-dvh">
        <NavigationBar
          title={`Welcome to ${process.env.NEXT_PUBLIC_APP_NAME}`}
        />
        <div className="flex flex-col justify-between flex-grow p-3 md:p-0">
          <div className="md:grid md:place-items-center md:flex-grow">
            <div
              className={cn(
                `flex flex-col gap-3 md:border md:border-outline 
                md:bg-surface-container md:p-6 md:rounded-xl`
              )}
            >
              <div className="flex flex-col gap-1">
                <h1 className="text-title-md">Sign in</h1>
                <p className="opacity-50">
                  Use the email ending in sk.ac.th to continue.
                </p>
              </div>
              <SignInButton />
            </div>
          </div>
          <div className="flex flex-col gap-3 md:w-[24rem] md:my-4 md:m-auto">
            <LabelGroup header="Dev Links">
              <div
                className={cn(
                  `flex gap-2 m-auto w-full px-4 py-2 h-10 border border-outline 
                  bg-surface-container rounded-lg`
                )}
              >
                <Link href={"/client"}>
                  <p className="text-body-md">/client</p>
                </Link>
                <Link href={"/merchant"}>
                  <p className="text-body-md">/merchant</p>
                </Link>
                <Link href={"/settings"}>
                  <p className="text-body-md">/settings</p>
                </Link>
                <Link href={"/markdown"}>
                  <p className="text-body-md">/markdown</p>
                </Link>
              </div>
            </LabelGroup>
            <LabelGroup header="Language">
              <SegmentedGroup>
                <Button
                  selected={language == "th"}
                  appearance={"tonal"}
                  onClick={() => {
                    setLanguage("th");
                  }}
                >
                  ไทย
                </Button>
                <Button
                  selected={language == "en"}
                  appearance={"tonal"}
                  onClick={() => {
                    setLanguage("en");
                  }}
                >
                  English
                </Button>
              </SegmentedGroup>
            </LabelGroup>
            <p className="text-xs opacity-50">
              <Trans i18nKey={"footer.disclaimer"}>
                <Link className="underline" href={"/about"} />
                <Link className="underline" href={"/legal/privacy-policy"} />
                <Link className="underline" href={"/legal/terms-of-service"} />
              </Trans>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: await serverSideTranslations(locale as LangCode, ["common"]),
  };
};

export default LandingPage;
