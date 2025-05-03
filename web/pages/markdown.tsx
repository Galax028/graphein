import Head from "next/head";
import Button from "@/components/common/Button";
import GoogleSignInButton from "@/components/landing/GoogleSignInButton";

const Markdown = () => {
  return (
    <>
      <Head>
        <title>Printing Facility</title>
      </Head>
      <main>
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
        <div className="flex flex-col gap-2 m-4 [&>*]:!w-full">
          <Button appearance={"filled"} icon={"shopping_bag_speed"}>
            Send Order
          </Button>
          <Button appearance={"tonal"} icon={"shopping_bag_speed"}>
            Send Order
          </Button>

          <Button appearance={"filled"}>Cancel Order</Button>

          <Button appearance={"filled"} icon={"print"} />
          <Button appearance={"tonal"} icon={"print"} />

          <GoogleSignInButton />
        </div>
      </main>
    </>
  );
};

export default Markdown;
