import Button from "@/components/common/Button";
import SegmentedButton from "@/components/common/SegmentedButton";
import GoogleSignInButton from "@/components/landing/SignInButton";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

const Markdown = () => {
  const [language, setLanguage] = useState("th");
  const [theme, setTheme] = useState("auto");

  return (
    <>
      <Head>
        <title>Printing Facility</title>
      </Head>
      <main className="m-4">
        <p className="m-4">
          The quick brown fox jumps over the lazy dog.
          <br />
          นายสังฆภัณฑ์ เฮงพิทักษ์ฝั่ง ผู้เฒ่าซึ่งมีอาชีพเป็นฅนขายฃวด
          ถูกตำรวจปฏิบัติการจับฟ้องศาล ฐานลักนาฬิกาคุณหญิงฉัตรชฎา ฌานสมาธิ
          <br />
          <b>The quick brown fox jumps over the lazy dog.</b>
          <br />
          <b>
            นายสังฆภัณฑ์ เฮงพิทักษ์ฝั่ง ผู้เฒ่าซึ่งมีอาชีพเป็นฅนขายฃวด
            ถูกตำรวจปฏิบัติการจับฟ้องศาล ฐานลักนาฬิกาคุณหญิงฉัตรชฎา ฌานสมาธิ
          </b>
        </p>
        <div className="m-4">
          <Link href="/">
            <Button appearance={"tonal"}>Go to main page (router test)</Button>
          </Link>
        </div>
        <div className="flex flex-col gap-2 mx-auto my-4 [&>*]:!w-full max-w-96">
          <p>Normal Buttons</p>
          <Button appearance={"filled"} icon={"shopping_bag_speed"}>
            Send Order
          </Button>
          <Button appearance={"tonal"} icon={"shopping_bag_speed"}>
            Send Order
          </Button>
          <Button appearance={"filled"}>Cancel Order</Button>
          <Button appearance={"tonal"}>Cancel Order</Button>

          <p>Disabled Buttons</p>
          <Button
            disabled={true}
            appearance={"filled"}
            icon={"shopping_bag_speed"}
          >
            Send Order
          </Button>
          <Button
            disabled={true}
            appearance={"tonal"}
            icon={"shopping_bag_speed"}
          >
            Send Order
          </Button>
          <Button disabled={true} appearance={"filled"}>
            Cancel Order
          </Button>
          <Button disabled={true} appearance={"tonal"}>
            Cancel Order
          </Button>

          <p>Busy Buttons</p>
          <Button busy={true} appearance={"filled"}>
            Next
          </Button>
          <Button busy={true} appearance={"tonal"}>
            Next
          </Button>
          <Button busy={true} busyWithText={false} appearance={"filled"}>
            Next
          </Button>
          <Button busy={true} busyWithText={false} appearance={"tonal"}>
            Next
          </Button>

          <p>Icon Buttons</p>
          <div className="flex gap-2">
            <Button appearance={"filled"} icon={"print"} />
            <Button appearance={"tonal"} icon={"print"} />
            <Button busy={true} appearance={"filled"} icon={"print"} />
            <Button busy={true} appearance={"tonal"} icon={"print"} />
          </div>

          <p>Google OAuth Button</p>
          <GoogleSignInButton />

          <p>Segmented Buttons</p>
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
          <SegmentedButton>
            <Button
              selected={theme == "light"}
              appearance={"tonal"}
              onClick={() => {
                setTheme("light");
              }}
            >
              Light
            </Button>
            <Button
              selected={theme == "dark"}
              appearance={"tonal"}
              onClick={() => {
                setTheme("dark");
              }}
            >
              Dark
            </Button>
            <Button
              selected={theme == "auto"}
              appearance={"tonal"}
              onClick={() => {
                setTheme("auto");
              }}
            >
              Auto
            </Button>
          </SegmentedButton>
        </div>
      </main>
    </>
  );
};

export default Markdown;
