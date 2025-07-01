import Button from "@/components/common/Button";
import Dialog from "@/components/common/Dialog";
import DropDownCard from "@/components/common/DropDownCard";
import MaterialIcon from "@/components/common/MaterialIcon";
import NumberInput from "@/components/common/NumberInput";
import SegmentedGroup from "@/components/common/SegmentedGroup";
import TextInput from "@/components/common/TextInput";
import { AnimatePresence } from "motion/react";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

const MarkdownPage = () => {
  const [language, setLanguage] = useState("th");
  const [theme, setTheme] = useState("auto");
  const [alphabet, setAlphabet] = useState("a");
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [count, setCount] = useState(0);
  const [textInput, setTextInput] = useState("");
  const [classroom, setClassroom] = useState("");
  const [classNo, setClassNo] = useState("");

  return (
    <>
      <Head>
        <title>Printing Facility</title>
      </Head>
      <main className="m-3">
        <p className="m-3">
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
          <DropDownCard
            header={"Title"}
            footer={["2 orders pending", "Total 38 THB"]}
            isCollapsible={true}
          >
            order stuff you think about it idk
          </DropDownCard>
        </div>

        <div className="flex flex-col gap-2 mx-auto my-4 [&>*]:!w-full max-w-96">
          <SegmentedGroup className="bg-surface-container">
            <div>Range</div>
            <TextInput
              value={textInput}
              setValue={setTextInput}
              placeholder="Range"
              error={
                textInput
                  ? !/^(\s*\d+\s*(-\s*\d+\s*)?)(,\s*\d+\s*(-\s*\d+\s*)?)*$/.test(
                      textInput,
                    )
                  : false
              }
              showErrorIcon={true}
              className="w-full !p-0 !h-10"
            />
            <div className="h-10 w-10">
              <MaterialIcon icon="hexagon" />
            </div>
          </SegmentedGroup>

          <TextInput
            value={textInput}
            setValue={setTextInput}
            placeholder="Range"
            error={true}
            errorText="Invalid"
            showErrorIcon={false}
          />
          <TextInput
            value={textInput}
            setValue={setTextInput}
            placeholder="Range"
            error={false}
            errorText="Invalid"
            showErrorIcon={false}
          />
          <p>{textInput}</p>

          <p>Normal Buttons</p>
          <Button
            appearance={"filled"}
            icon={"shopping_bag_speed"}
            onClick={() => setShowPopup((prev) => !prev)}
          >
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
          {/* <GoogleSignInButton /> */}

          <p>Segmented Buttons</p>
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
          <SegmentedGroup>
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
          </SegmentedGroup>
          <SegmentedGroup>
            <Button
              selected={alphabet == "a"}
              appearance={"tonal"}
              onClick={() => {
                setAlphabet("a");
              }}
            >
              A
            </Button>
            <Button
              selected={alphabet == "b"}
              appearance={"tonal"}
              onClick={() => {
                setAlphabet("b");
              }}
            >
              B
            </Button>
            <Button
              selected={alphabet == "c"}
              appearance={"tonal"}
              onClick={() => {
                setAlphabet("c");
              }}
            >
              C
            </Button>
            <Button
              selected={alphabet == "d"}
              appearance={"tonal"}
              onClick={() => {
                setAlphabet("d");
              }}
            >
              D
            </Button>
            <Button
              selected={alphabet == "e"}
              appearance={"tonal"}
              onClick={() => {
                setAlphabet("e");
              }}
            >
              E
            </Button>
          </SegmentedGroup>

          <NumberInput count={count} setCount={setCount} min={-99} max={99} />
          <p className="text-body-sm">{count} copies</p>

          <SegmentedGroup>
            <div className="text-body-md flex items-center justify-center p-2 h-10 aspect-square bg-surface-container border border-outline">
              <p>M.</p>
            </div>
            <input
              value={classroom}
              onChange={(e) => {
                setClassroom(e.target.value);
              }}
              type="text"
              className="w-full p-2"
            />
            <div className="text-body-md flex items-center justify-center p-2 h-10 aspect-square bg-surface-container border border-outline">
              <p>No.</p>
            </div>
            <input
              value={classNo}
              onChange={(e) => {
                setClassNo(e.target.value);
              }}
              type="text"
              className="w-full p-2"
            />
          </SegmentedGroup>
          <p className="text-body-sm">
            M.{classroom} No.{classNo}
          </p>
        </div>

        <AnimatePresence>
          {showPopup && (
            <Dialog
              title="Fail Task"
              desc="If proceed, the task will fail successfully."
              setClickOutside={setShowPopup}
            >
              <Button appearance="tonal" onClick={() => setShowPopup(false)}>
                No
              </Button>
              <Button
                appearance="filled"
                busy={isLoading}
                busyWithText={false}
                onClick={() => {
                  setIsLoading(true);
                  setTimeout(() => {
                    setShowPopup(false);
                    setIsLoading(false);
                  }, 1500);
                }}
              >
                Yes
              </Button>
            </Dialog>
          )}
        </AnimatePresence>
      </main>
    </>
  );
};

export default MarkdownPage;
