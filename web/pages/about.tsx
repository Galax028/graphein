import LabelGroup from "@/components/common/LabelGroup";
import NavigationBar from "@/components/common/NavigationBar";
import cn from "@/utils/helpers/cn";
import Link from "next/link";
import Image from "next/image";

type DeveloperProfileProps = {
  name: string;
  role: string;
  image: string;
};

const DeveloperProfile = ({ name, role, image }: DeveloperProfileProps) => {
  return (
    <div
      className={cn(
        `flex gap-3 items-center px-3 py-2.5 rounded-lg bg-surface-container 
        border border-outline`
      )}
    >
      <Image
        src={image}
        width={32}
        height={32}
        alt={`Image of ${name}`}
        className="w-8 h-8 rounded-full"
      />
      <div className="flex flex-col">
        <p>{name}</p>
        <p className="text-body-sm opacity-50">{role}</p>
      </div>
    </div>
  );
};

const AboutPage = () => {
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
  ];

  return (
    <>
      <NavigationBar
        title={`About ${process.env.NEXT_PUBLIC_APP_NAME}`}
        backEnabled={true}
      />
      <main className="flex flex-col gap-3 p-3">
        <LabelGroup header="About">
          <div
            className={cn(
              `flex flex-col gap-2 p-3 rounded-lg bg-surface-container 
              border border-outline [&>p]:text-body-md`
            )}
          >
            <p>
              Printing Facility is a source-available research project by EPLUS+
              students at Suankularb Wittayalai, developed in collaboration with
              the Suankularb Wittayalai Student Committee.
            </p>
            <p>
              If you’re curious to see the magic behind this project, you’re
              warmly invited to explore the{" "}
              <Link
                href={String(process.env.NEXT_PUBLIC_SOURCE_PATH)}
                target="_blank"
              >
                <span className="underline">GitHub</span>
              </Link>{" "}
              repository.
            </p>
            <p>
              Printing Facility may collect data for analytics and research
              purposes, see our{" "}
              <Link href="/legal/privacy">
                <span className="underline">Privacy Policy</span>
              </Link>{" "}
              and{" "}
              <Link href="/legal/terms">
                <span className="underline">Terms of Service</span>
              </Link>{" "}
              for more information.
            </p>
            <p className="!text-body-sm opacity-50">Made with ❤️ by EPLUS+</p>
          </div>
        </LabelGroup>
        <LabelGroup header="Version">
          <div
            className={cn(
              `flex flex-col gap-2 p-3 rounded-lg bg-surface-container 
              border border-outline [&>p]:text-body-sm`
            )}
          >
            <div className="grid grid-cols-[4.5rem_1fr] gap-x-4 gap-y-2 items-center">
              <p className="w-18 text-body-sm opacity-50">Version</p>
              <p className="w-full text-body-md">
                {process.env.NEXT_PUBLIC_VERSION}
              </p>
            </div>
          </div>
        </LabelGroup>
        <LabelGroup header="Developers">
          {developers.map((i) => (
            <DeveloperProfile name={i.name} role={i.role} image={i.image} />
          ))}
        </LabelGroup>
      </main>
    </>
  );
};

export default AboutPage;
