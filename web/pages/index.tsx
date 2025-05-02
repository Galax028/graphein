import Head from "next/head";
import Button from "@/components/common/Button";

const Landing = () => {
  return (
    <>
      <Head>
        <title>Shit</title>
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
          <Button appearance={"outlined"} icon={"shopping_bag_speed"}>
            Send Order
          </Button>

          <Button appearance={"filled"}>Cancel Order</Button>
          <Button appearance={"outlined"}>Cancel Order</Button>

          <Button appearance={"filled"} icon={"print"} />
          <Button appearance={"outlined"} icon={"print"} />
        </div>
      </main>
    </>
  );
};

export default Landing;
