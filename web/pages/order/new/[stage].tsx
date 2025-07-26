import Button from "@/components/common/Button";
import Dialog from "@/components/common/Dialog";
import PageLoadTransition from "@/components/common/layout/PageLoadTransition";
import NavigationBar from "@/components/common/NavigationBar";
import cn from "@/utils/helpers/cn";
import getFormattedFilesize from "@/utils/helpers/order/details/getFormattedFilesize";
import checkBuildingOrderExpired from "@/utils/helpers/order/new/checkBuildingOrderExpired";
import generateFileUploadURL from "@/utils/helpers/order/new/generateFileUploadURL";
import type { PageProps } from "@/utils/types/common";
import useUserContext from "@/utils/useUserContext";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { type FC, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

const BuildOrderPage: FC<PageProps> = () => {
  const router = useRouter();
  const user = useUserContext();

  const [orderStage, setOrderStage] = useState("upload");
  const [orderId, setOrderId] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setOrderCreated] = useState<string | null>(null);
  const [timeDiff, setTimeDiff] = useState<number | null>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [showFileLimitExceedDialog] = useState(files.length > 6);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 6,
    onDrop: (acceptedFiles) => {
      if (files.length <= 6) {
        setFiles((files) => [...files, ...acceptedFiles]);
      }
    },
  });

  useEffect(() => {
    // Creates a request for new order, set returned UUID to 'orderId'
    const postOrders = async () => {
      console.warn("[SKPF] FETCH : POST /orders");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/orders`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();
      setOrderId(data.data);
      setOrderCreated(data.timestamp);

      if (res.ok) {
        localStorage.setItem("skpf-buildingOrderId", data.data);
        localStorage.setItem("skpf-buildingOrderCreated", data.timestamp);
      } else {
        console.error(`[${res.status}] ${data.message}`);
        console.warn(`Continuing by getting OrderID from localStorage.`);
        setOrderId(localStorage.getItem("skpf-buildingOrderId"));
      }
    };

    const storedOrderId = localStorage.getItem("skpf-buildingOrderId");
    const storedOrderCreated = localStorage.getItem(
      "skpf-buildingOrderCreated",
    );
    const isOrderExpired = storedOrderCreated && checkBuildingOrderExpired();

    if (storedOrderId && !isOrderExpired) {
      setOrderId(storedOrderId);
      setOrderCreated(storedOrderCreated);
    } else {
      localStorage.removeItem("skpf-buildingOrderId");
      localStorage.removeItem("skpf-buildingOrderCreated");
      postOrders();
    }

    // Set timeDiff after orderCreated is set
    if (storedOrderCreated) {
      setTimeDiff(
        new Date().getTime() - new Date(storedOrderCreated).getTime(),
      );
    } else {
      setTimeDiff(null);
    }

    console.error(orderId, timeDiff);

    if (orderId != null) {
      generateFileUploadURL(orderId, "TestFile_Draft01", "pdf", 123456);
    }
  }, []);

  // Update stage state upon URL change.
  useEffect(() => {
    if (typeof router.query.stage === "string") {
      setOrderStage(router.query.stage);
    } else {
      setOrderStage("upload");
    }
  }, [router.query.stage]);

  const defineURL: {
    [key: string]: { title: string; context: string; future: string };
  } = {
    upload: {
      title: "Upload files",
      context: "/glance",
      future: "/order/new/configure",
    },
    configure: {
      title: "Configure order",
      context: "/order/new/upload",
      future: "/order/new/service",
    },
    service: {
      title: "Add services",
      context: "/order/new/configure",
      future: "/order/new/review",
    },
    review: {
      title: "Review order",
      context: "/order/new/service",
      future: "/order/new/review",
    },
  };

  return (
    <div className="flex flex-col h-dvh overflow-hidden">
      <NavigationBar
        user={user}
        title={defineURL[orderStage].title}
        backEnabled={true}
        backContextURL={defineURL[orderStage].context}
      />
      <PageLoadTransition className="flex flex-col w-full h-full overflow-auto gap-3 font-mono">
        <div
          className={cn(
            `flex flex-col p-3 gap-2 [&>div]:w-full h-full overflow-auto pb-16`,
          )}
        >
          {{
            upload: (
              <>
                {/* No files uploaded */}
                <div className="flex flex-col gap-1">
                  {files.map((file, idx) => (
                    <motion.div
                      initial={{ opacity: 0, y: 64 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 64 }}
                      transition={{
                        delay: idx * 0.1,
                        y: { type: "spring", bounce: 0 },
                      }}
                      className="border border-outline p-3 rounded-lg bg-surface-container"
                      key={idx}
                    >
                      <div className="flex flex-col gap-1">
                        <p className="text-body-sm text-warning">Uploading</p>
                        <p>{file.name}</p>
                        <p className="text-body-sm opacity-50">
                          {file.type} • {getFormattedFilesize(file.size)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div {...getRootProps()}>
                  {files.length == 0 ? (
                    <div className="flex flex-col gap-2 justify-center items-center border border-outline p-3 h-96 rounded-lg cursor-pointer">
                      <input
                        {...getInputProps({ className: "dropzone" })}
                        disabled={files.length >= 6}
                      />
                      <>
                        <Button
                          appearance="tonal"
                          icon="upload"
                          disabled={files.length >= 6}
                        >
                          Upload
                        </Button>
                        <div>
                          <p className="text-body-md text-center">
                            Drop a file here, or click to browse files.
                          </p>
                          <p className="text-body-sm opacity-50 text-center">
                            PDF, PNG, JPEG • 6 files • 50 MB max
                          </p>
                        </div>
                      </>
                    </div>
                  ) : (
                    <Button
                      appearance="tonal"
                      icon={"upload"}
                      className="w-full"
                    >
                      Upload files
                    </Button>
                  )}
                </div>

                {/* When files are uploaded */}
                {/* <div className="flex flex-col gap-1">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="w-full h-20.5 border border-dashed border-outline rounded-lg px-2 py-1"
                    >
                      <span className="text-body-sm opacity-50">
                        File {i + 1}
                      </span>
                    </div>
                  ))}
                </div>
                <Button appearance="tonal" icon="upload">
                  Upload File(s)
                </Button> */}
              </>
            ),
            configure: <>Configure Order</>,
            service: <>Add Services</>,
            review: <>Review Order</>,
          }[orderStage] || null}
        </div>

        <div className="fixed p-3 bottom-0 w-full flex flex-col h-16 max-w-lg">
          <Link href={defineURL[orderStage].future}>
            <Button
              appearance="filled"
              icon={orderStage === "review" ? "shopping_bag_speed" : undefined}
              className="w-full"
            >
              {orderStage != "review" ? "Next" : "Send Order"}
            </Button>
          </Link>
        </div>
      </PageLoadTransition>

      {showFileLimitExceedDialog && (
        <Dialog
          title={"You can only upload 6 files per order."}
          desc={
            "To minimize wait time for others, you can only upload a maximum of 6 files per order. To upload more, visit the storefront, or start another order after this one."
          }
        >
          <Button
            appearance="filled"
            onClick={() => {
              setFiles(files.slice(0, 5));
            }}
          >
            OK
          </Button>
        </Dialog>
      )}
    </div>
  );
};

export default BuildOrderPage;
