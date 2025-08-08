import Button from "@/components/common/Button";
import Dialog from "@/components/common/Dialog";
import DropDownCard from "@/components/common/DropDownCard";
import Checkbox from "@/components/common/input/Checkbox";
import NumberInput from "@/components/common/input/NumberInput";
import SelectInput from "@/components/common/input/SelectInput";
import TextInput from "@/components/common/input/TextInput";
import MaterialIcon from "@/components/common/MaterialIcon";
import SegmentedGroup from "@/components/common/SegmentedGroup";
import TreeViewContainer from "@/components/common/tree/TreeViewContainer";
import TreeViewWrapper from "@/components/common/tree/TreeViewWrapper";
import FileDetailRange from "@/components/orders/FileDetailRange";
import useToggle from "@/hooks/useToggle";
import type { PageProps } from "@/utils/types/common";
import { AnimatePresence } from "motion/react";
import Head from "next/head";
import Link from "next/link";
import { type FC, useState } from "react";

const MarkdownPage: FC<PageProps> = () => {
  const [language, setLanguage] = useState("th");
  const [theme, setTheme] = useState("auto");
  const [alphabet, setAlphabet] = useState("a");
  const [showPopup, toggleShowPopup] = useToggle();
  const [isLoading, setIsLoading] = useState(false);
  const [checkbox, setCheckbox] = useState(false);
  const [selected, setSelected] = useState({ id: 1, name: "Option 1" });

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
        <Checkbox checked={checkbox} setValue={setCheckbox} />
        <Checkbox
          checked={checkbox}
          setValue={setCheckbox}
          appearance="indeterminate"
        />
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
            <Button appearance="tonal">Go to main page (router test)</Button>
          </Link>
        </div>

        <div className="m-auto w-max p-10">
          <MaterialIcon icon="progress_activity" className="animate-spin" />
        </div>

        <FileDetailRange
          label="page"
          value="2-4"
          details={[
            { title: "Paper Size", content: "A4" },
            { title: "Type", content: "Thick Paper (230 gsm.)" },
            { title: "Colorized", content: "Color" },
            { title: "Orientation", content: "Portrait" },
            { title: "Sides", content: "One-sided" },
            { title: "Copies", content: "1" },
          ]}
          expand={true}
        />

        <SelectInput
          value={selected}
          onChange={setSelected}
          displayKey="name"
          matchKey="id"
          options={Array(10)
            .fill(null)
            .map((_, idx) => ({
              id: idx + 1,
              name: `Option ${idx + 1}`,
            }))}
        />

        <div className="mx-auto my-4 flex max-w-96 flex-col gap-2 [&>*]:!w-full">
          <DropDownCard
            header="Title"
            footer={["2 orders pending", "Total 38 THB"]}
            isCollapsible={true}
          >
            order stuff you think about it idk
          </DropDownCard>
        </div>
        <div className="mx-auto my-4 flex max-w-96 flex-col gap-2 [&>*]:!w-full">
          <SegmentedGroup className="bg-surface-container">
            <div>Range</div>
            <TextInput
              value={textInput}
              onChange={(event) => {
                setTextInput(event.target.value);
              }}
              placeholder="Range"
              error={
                textInput
                  ? !/^(\s*\d+\s*(-\s*\d+\s*)?)(,\s*\d+\s*(-\s*\d+\s*)?)*$/.test(
                      textInput,
                    )
                  : false
              }
              showErrorIcon={true}
              className="!h-10 w-full !p-0"
            />
            <div className="h-10 w-10">
              <MaterialIcon icon="hexagon" />
            </div>
          </SegmentedGroup>

          {/* tree */}
          <div className="flex w-full flex-col">
            <TreeViewContainer isLast={false} index={0}>
              <FileDetailRange
                label="service"
                value="Binding"
                details={[
                  { title: "Type", content: "Plastic Rod Binding (Navy Blue)" },
                  {
                    title: "Note",
                    content: "report_cover.pdf เป็นหน้าปกหน้าหลัง",
                  },
                ]}
                expand={false}
              />
              <FileDetailRange
                label="service"
                value="Binding"
                details={[
                  {
                    title: "Typeings a",
                    content: "Plastic Rod Binding (Navy Blue)",
                  },
                  {
                    title: "Note",
                    content: "report_cover.pdf เป็นหน้าปกหน้าหลัง",
                  },
                ]}
                expand={false}
              />
            </TreeViewContainer>
            {/* Wrapper for level b */}
            <TreeViewWrapper index={1}>
              <TreeViewContainer isLast={false} index={1}>
                <FileDetailRange
                  label="page"
                  value="smth test test"
                  details={[{ title: "asd", content: "sdf" }]}
                  expand={false}
                />
              </TreeViewContainer>
              <TreeViewWrapper index={2}>
                <TreeViewContainer isLast={false} index={2}>
                  <FileDetailRange
                    label="page"
                    value="smth test test"
                    details={[{ title: "asd", content: "sdf" }]}
                    expand={false}
                  />
                </TreeViewContainer>
                <TreeViewContainer isLast={false} index={2}>
                  <FileDetailRange
                    label="page"
                    value="smth test test"
                    details={[{ title: "asd", content: "sdf" }]}
                    expand={false}
                  />
                </TreeViewContainer>
                <TreeViewContainer isLast={true} index={2}>
                  <FileDetailRange
                    label="page"
                    value="smth test test"
                    details={[{ title: "asd", content: "sdf" }]}
                    expand={false}
                  />
                </TreeViewContainer>
              </TreeViewWrapper>
              <TreeViewContainer isLast={true} index={1}>
                <FileDetailRange
                  label="page"
                  value="smth test test"
                  details={[{ title: "asd", content: "sdf" }]}
                  expand={false}
                />
              </TreeViewContainer>
            </TreeViewWrapper>
          </div>

          <TextInput
            value={textInput}
            onChange={(event) => {
              setTextInput(event.target.value);
            }}
            placeholder="Range"
            error={true}
            errorMessage="Invalid"
            showErrorIcon={false}
          />
          <TextInput
            value={textInput}
            onChange={(event) => {
              setTextInput(event.target.value);
            }}
            placeholder="Range"
            error={false}
            errorMessage="Invalid"
            showErrorIcon={false}
          />
          <p>{textInput}</p>

          <p>Normal Buttons</p>
          <Button
            appearance="filled"
            icon="shopping_bag_speed"
            onClick={() => toggleShowPopup()}
          >
            Send Order
          </Button>
          <Button appearance="tonal" icon="shopping_bag_speed">
            Send Order
          </Button>
          <Button appearance="filled">Cancel Order</Button>
          <Button appearance="tonal">Cancel Order</Button>

          <p>Disabled Buttons</p>
          <Button disabled={true} appearance="filled" icon="shopping_bag_speed">
            Send Order
          </Button>
          <Button disabled={true} appearance="tonal" icon="shopping_bag_speed">
            Send Order
          </Button>
          <Button disabled={true} appearance="filled">
            Cancel Order
          </Button>
          <Button disabled={true} appearance="tonal">
            Cancel Order
          </Button>

          <p>Busy Buttons</p>
          <Button busy={true} appearance="filled">
            Next
          </Button>
          <Button busy={true} appearance="tonal">
            Next
          </Button>
          <Button busy={true} busyWithText={false} appearance="filled">
            Next
          </Button>
          <Button busy={true} busyWithText={false} appearance="tonal">
            Next
          </Button>

          <p>Icon Buttons</p>
          <div className="flex gap-2">
            <Button appearance="filled" icon="print" />
            <Button appearance="tonal" icon="print" />
            <Button busy={true} appearance="filled" icon="print" />
            <Button busy={true} appearance="tonal" icon="print" />
          </div>

          <p>Google OAuth Button</p>
          {/* <GoogleSignInButton /> */}

          <p>Segmented Buttons</p>
          <SegmentedGroup>
            <Button
              selected={language === "th"}
              appearance="tonal"
              onClick={() => {
                setLanguage("th");
              }}
            >
              ไทย
            </Button>
            <Button
              selected={language === "en"}
              appearance="tonal"
              onClick={() => {
                setLanguage("en");
              }}
            >
              English
            </Button>
          </SegmentedGroup>
          <SegmentedGroup>
            <Button
              selected={theme === "light"}
              appearance="tonal"
              onClick={() => {
                setTheme("light");
              }}
            >
              Light
            </Button>
            <Button
              selected={theme === "dark"}
              appearance="tonal"
              onClick={() => {
                setTheme("dark");
              }}
            >
              Dark
            </Button>
            <Button
              selected={theme === "auto"}
              appearance="tonal"
              onClick={() => {
                setTheme("auto");
              }}
            >
              Auto
            </Button>
          </SegmentedGroup>
          <SegmentedGroup>
            <Button
              selected={alphabet === "a"}
              appearance="tonal"
              onClick={() => {
                setAlphabet("a");
              }}
            >
              A
            </Button>
            <Button
              selected={alphabet === "b"}
              appearance="tonal"
              onClick={() => {
                setAlphabet("b");
              }}
            >
              B
            </Button>
            <Button
              selected={alphabet === "c"}
              appearance="tonal"
              onClick={() => {
                setAlphabet("c");
              }}
            >
              C
            </Button>
            <Button
              selected={alphabet === "d"}
              appearance="tonal"
              onClick={() => {
                setAlphabet("d");
              }}
            >
              D
            </Button>
            <Button
              selected={alphabet === "e"}
              appearance="tonal"
              onClick={() => {
                setAlphabet("e");
              }}
            >
              E
            </Button>
          </SegmentedGroup>

          <NumberInput value={count} onChange={setCount} min={-99} max={99} />
          <p className="text-body-sm">{count} copies</p>

          <SegmentedGroup>
            <div
              className={`
                flex aspect-square h-10 items-center justify-center border
                border-outline bg-surface-container p-2 text-body-md
              `}
            >
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
            <div
              className={`
                flex aspect-square h-10 items-center justify-center border
                border-outline bg-surface-container p-2 text-body-md
              `}
            >
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
              setClickOutside={toggleShowPopup}
            >
              <Button appearance="tonal" onClick={() => toggleShowPopup(false)}>
                No
              </Button>
              <Button
                appearance="filled"
                busy={isLoading}
                busyWithText={false}
                onClick={() => {
                  setIsLoading(true);
                  setTimeout(() => {
                    toggleShowPopup(false);
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
