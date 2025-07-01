import Button from "@/components/common/Button";
import LabelGroup from "@/components/common/LabelGroup";
import NavigationBar from "@/components/common/NavigationBar";
import SegmentedGroup from "@/components/common/SegmentedGroup";
import SignInButton from "@/components/landing/SignInButton";
import { fetchUser } from "@/query/fetchUser";
import cn from "@/utils/helpers/cn";
import getServerSideTranslations from "@/utils/helpers/serverSideTranslations";
import type { PageProps } from "@/utils/types/common";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import type { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/router";
import { type FC, useState } from "react";

const LandingPage: FC<PageProps> = (props: { locale: string }) => {
  const router = useRouter();
  const t = useTranslations();

  const [language, setLanguage] = useState(props.locale);

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    router.replace(`${router.asPath}?lang=${lang}`);
  };

  return (
    <div className="flex flex-col h-dvh">
      <NavigationBar
        title={t("navigationBar", {
          appName: process.env.NEXT_PUBLIC_APP_NAME ?? "",
        })}
      />
      <div className="flex flex-col justify-between flex-grow p-3 md:p-0">
        <div className="md:grid md:place-items-center md:flex-grow md:w-[24rem] md:m-auto">
          <div
            className={cn(
              `flex flex-col gap-3 md:border md:border-outline 
                md:bg-surface-container md:p-6 md:rounded-xl`,
            )}
          >
            <div className="flex flex-col gap-1">
              <h1 className="text-title-md">{t("container.title")}</h1>
              <p className="opacity-50">{t("container.description")}</p>
            </div>
            <SignInButton />
          </div>
        </div>
        <div className="flex flex-col gap-3 md:w-[24rem] md:my-4 md:m-auto">
          <LabelGroup header={t("language")}>
            <SegmentedGroup>
              <Button
                selected={language == "th"}
                appearance={"tonal"}
                onClick={() => changeLanguage("th")}
              >
                ไทย
              </Button>
              <Button
                selected={language == "en"}
                appearance={"tonal"}
                onClick={() => changeLanguage("en")}
              >
                English
              </Button>
            </SegmentedGroup>
          </LabelGroup>
          <p className="text-xs opacity-50">
            <Link className="underline" href={"/about"} />
            <Link className="underline" href={"/legal/privacy-policy"} />
            <Link className="underline" href={"/legal/terms-of-service"} />
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
  const user = await queryClient.fetchQuery({
    queryKey: ["user"],
    queryFn: () => fetchUser({ headers: { Cookie: sessionToken } }),
  });

  if (user) {
    return {
      redirect: {
        destination: user.role === "merchant" ? "/merchant" : "/glance",
        permanent: false,
      },
    };
  } else
    return {
      props: { locale, translations, dehydratedState: dehydrate(queryClient) },
    };
};

export default LandingPage;
