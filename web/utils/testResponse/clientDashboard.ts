import { OrderCardProps } from "@/utils/types/client"

export const testOrdersGlance = {
  success: true,
  OrdersGlance: {
    ongoing: [
      {
        id: "smthsmth",
        createdAt: "2022-09-27 18:00:00.000",
        orderNumber: "C-024",
        status: "review",
        filesCount: 1
      },
      {
        id: "smthsmth",
        createdAt: "2022-09-27 18:00:00.000",
        orderNumber: "C-024",
        status: "printing",
        filesCount: 3
      },
      {
        id: "smthsmth",
        createdAt: "2022-09-27 18:00:00.000",
        orderNumber: "C-024",
        status: "pickup",
        filesCount: 3
      },
    ] as OrderCardProps[],
    finished: [
      {
        id: "smthsmth",
        createdAt: "2022-09-27 18:00:00.000",
        orderNumber: "C-024",
        status: "complete",
        filesCount: 1
      },
      {
        id: "smthsmth",
        createdAt: "2022-09-27 18:00:00.000",
        orderNumber: "C-024",
        status: "reject",
        filesCount: 3
      },
      {
        id: "smthsmth",
        createdAt: "2022-09-27 18:00:00.000",
        orderNumber: "C-024",
        status: "cancel",
        filesCount: 2
      },
    ] as OrderCardProps[]
  }
}