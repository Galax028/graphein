import Head from "next/head";
import Image from "next/image";
import Button from "@/components/common/Button";

const Landing = () => {
  return (
    <>
      <Head>
        <title>Printing Facility</title>
      </Head>
      <main>
        <p>
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
        <div className="flex flex-col gap-2 p-4 [&>*]:!w-max">
          <Button appearance={"filled"} icon={"shopping_bag_speed"}>
            Send Order
          </Button>
          <Button appearance={"tonal"} icon={"shopping_bag_speed"}>
            Send Order
          </Button>

          <Button appearance={"filled"}>Cancel Order</Button>

          <Button appearance={"filled"} icon={"print"} />
          <Button appearance={"tonal"} icon={"print"} />

          <Button appearance={"tonal"}>
            <Image
              src={"/images/common/google-logo_light.svg"}
              width={18}
              height={18}
              alt="Google Logo"
              className="block aspect-square"
            />
            Sign in with Google
          </Button>
        </div>
      </main>
    </>
  );
};

export default Landing;
