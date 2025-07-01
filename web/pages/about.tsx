import LabelGroup from "@/components/common/LabelGroup";
import NavigationBar from "@/components/common/NavigationBar";
import cn from "@/utils/helpers/cn";
import getServerSideTranslations from "@/utils/helpers/serverSideTranslations";
import type { PageProps } from "@/utils/types/common";
import useUserContext from "@/utils/useUserContext";
import type { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import type { FC } from "react";

type DeveloperProfileProps = {
  name: string;
  role: string;
  image: string;
};

const DeveloperProfile: FC<DeveloperProfileProps> = ({ name, role, image }) => (
  <div
    className={cn(
      `flex gap-3 items-center px-3 py-2.5 rounded-lg bg-surface-container 
        border border-outline`,
    )}
  >
    <Image
      src={image}
      width={128}
      height={128}
      alt={`Image of ${name}`}
      className="w-16 h-16 rounded-full"
    />
    <div className="flex flex-col">
      <p>{name}</p>
      <p className="text-body-sm opacity-50">{role}</p>
    </div>
  </div>
);

const developers = [
  {
    name: "Metawat Rojniweth",
    role: "Head of Frontend & Head of Design",
    image: "/images/about/developers/metawat_r.jpg",
  },
  {
    name: "Aritouch Thammapitakporn",
    role: "Frontend & Design",
    image: "/images/about/developers/aritouch_t.png",
  },
  {
    name: "Phawat Suksiriwan",
    role: "Head of Backend & Head of Database",
    image: "/images/about/developers/phawat_s.png",
  },
] as readonly DeveloperProfileProps[];

const AboutPage: FC<PageProps> = () => {
  const t = useTranslations();
  const user = useUserContext();

  return (
    <>
      <NavigationBar
        user={user}
        title={t("navigationBar", {
          appName: process.env.NEXT_PUBLIC_APP_NAME ?? "",
        })}
        backEnabled={true}
      />
      <main className="flex flex-col gap-3 p-3">
        <LabelGroup header={t("about.title")}>
          <div
            className={cn(
              `flex flex-col gap-2 p-3 rounded-lg bg-surface-container 
              border border-outline [&>p]:text-body-md`,
            )}
          >
            <p>{t("about.p1")}</p>
            <p>
              {t.rich("about.p2", {
                a: (children) => (
                  <Link
                    href={String(process.env.NEXT_PUBLIC_SOURCE_PATH)}
                    target="_blank"
                  >
                    <span className="underline">{children}</span>
                  </Link>
                ),
              })}
            </p>
            <p>
              {t.rich("about.p3", {
                a1: (children) => (
                  <Link href="/legal/privacy">
                    <span className="underline">{children}</span>
                  </Link>
                ),
                a2: (children) => (
                  <Link href="/legal/terms">
                    <span className="underline">{children}</span>
                  </Link>
                ),
              })}
            </p>
            <p className="!text-body-sm opacity-50">{t("about.p4")}</p>
          </div>
        </LabelGroup>
        <LabelGroup header={t("version")}>
          <div
            className={cn(
              `flex flex-col gap-2 p-3 rounded-lg bg-surface-container 
              border border-outline [&>p]:text-body-sm`,
            )}
          >
            <div className="grid grid-cols-[4.5rem_1fr] gap-x-4 gap-y-2 items-center">
              <p className="w-18 text-body-sm opacity-50">{t("version")}</p>
              <p className="w-full text-body-md">
                {process.env.NEXT_PUBLIC_VERSION}
              </p>
            </div>
          </div>
        </LabelGroup>
        <LabelGroup header={t("developers")}>
          {developers.map((developer) => (
            <DeveloperProfile
              key={developer.name}
              name={developer.name}
              role={developer.role}
              image={developer.image}
            />
          ))}
        </LabelGroup>
      </main>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<PageProps> = async (
  context,
) => {
  const [locale, translations] = await getServerSideTranslations(context.req, [
    "about",
  ]);

  return { props: { locale, translations } };
};

export default AboutPage;
