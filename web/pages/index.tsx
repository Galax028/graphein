import Button from "@/components/common/Button";
import InputLabel from "@/components/common/InputLabel";
import NavigationBar from "@/components/common/NavigationBar";
import SegmentedGroup from "@/components/common/SegmentedGroup";
import SignInButton from "@/components/landing/SignInButton";
import cn from "@/utils/helpers/cn";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { GetServerSideProps } from "next";
import { Trans, useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { LangCode } from "@/utils/types/common";

const LandingPage = () => {
  const { t } = useTranslation("common");

  const [language, setLanguage] = useState("en");

  return (
    <>
      <Head>
        <title>Printer Facility</title>
      </Head>
      <div className="flex flex-col h-dvh">
        <NavigationBar title={"Welcome to Printer Facility"} />
        <div className="flex flex-col justify-between flex-grow p-3 md:p-0">
          <div className="md:grid md:place-items-center md:flex-grow">
            <div
              className={cn(
                `flex flex-col gap-3 md:border md:border-outline 
                md:bg-surfaceContainer md:p-6 md:rounded-xl`
              )}
            >
              <div className="flex flex-col gap-1">
                <h1 className="text-titleMedium">Sign in</h1>
                <p className="opacity-50">
                  Use the email ending in sk.ac.th to continue.
                </p>
              </div>
              <SignInButton />
            </div>
          </div>
          <div className="flex flex-col gap-3 md:w-[24rem] md:my-4 md:m-auto">
            <InputLabel label="Dev Links">
              <div
                className={cn(
                  `flex gap-2 m-auto w-full px-4 py-2 h-10 border border-outline 
                  bg-surfaceContainer rounded-lg`
                )}
              >
                <Link href={"/client"}>
                  <p className="text-bodyMedium">/client</p>
                </Link>
                <Link href={"/merchant"}>
                  <p className="text-bodyMedium">/merchant</p>
                </Link>
                <Link href={"/markdown"}>
                  <p className="text-bodyMedium">/markdown</p>
                </Link>
              </div>
            </InputLabel>
            <InputLabel label="Language">
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
            </InputLabel>
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
