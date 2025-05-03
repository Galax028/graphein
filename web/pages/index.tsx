import NavigationBar from "@/components/common/NavigationBar";
import SignInButton from "@/components/landing/SignInButton";
import cn from "@/utils/helpers/cn";
import Head from "next/head";

const LandingPage = () => {
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
                <h1 className="text-2xl font-semibold">Sign in</h1>
                <p className="opacity-50">
                  Use the email ending in sk.ac.th to continue.
                </p>
              </div>
              <SignInButton />
            </div>
          </div>
          <div>
            <p className="text-xs opacity-50 md:w-[24rem] md:my-4 m-auto">
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
