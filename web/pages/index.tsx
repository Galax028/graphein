import Button from "@/components/common/Button";
import NavigationBar from "@/components/common/NavigationBar";
import SegmentedButton from "@/components/common/SegmentedButton";
import SignInButton from "@/components/landing/SignInButton";
import cn from "@/utils/helpers/cn";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import InputLabel from "@/components/common/InputLabel";

const LandingPage = () => {
  const [language, setLanguage] = useState("th");

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
              <SegmentedButton>
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
              </SegmentedButton>
            </InputLabel>
            <p className="text-xs opacity-50">
              SK Printing Facility is a project powered by EPLUS+ students,
              visit About for more information. • SK Printing Facility may
              collect data for analytics and research purposes, see our Privacy
              Policy and Terms of Service for more information.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
