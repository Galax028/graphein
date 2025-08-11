import Button from "@/components/common/Button";
import Checkbox from "@/components/common/input/Checkbox";
import LabelGroup from "@/components/common/LabelGroup";
import SegmentedGroup from "@/components/common/SegmentedGroup";
import TextInput from "@/components/common/input/TextInput";
import useToggle from "@/hooks/useToggle";
import { prefetchUser } from "@/query/fetchUser";
import getServerSideTranslations from "@/utils/helpers/serverSideTranslations";
import type { PageProps } from "@/utils/types/common";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import type { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import type { FC } from "react";
import SelectInput from "@/components/common/input/SelectInput";

const MerchantDashboardPage: FC<PageProps> = () => {
  const t = useTranslations("management");

  const [checked, toggleChecked] = useToggle();

  return (
    <>
      <div className="col-span-1 grid grid-rows-2 gap-3">
        <div
          className={`
            flex flex-col gap-px rounded-lg border border-outline bg-outline
            *:bg-surface-container *:first:rounded-t-lg *:last:rounded-b-lg
          `}
        >
          <div className="p-2 pl-3">{t("shopOperation.title")}</div>
          <div className="flex flex-grow flex-col gap-2 p-3">
            <LabelGroup
              header={t("shopOperation.openingHours.header")}
              footer={t("shopOperation.openingHours.footer")}
            >
              <SegmentedGroup>
                <TextInput
                  className="w-full"
                  type="time"
                  value=""
                  onChange={() => {}}
                />
                <div
                  className={`
                    flex items-center justify-center !p-2.5 select-none
                  `}
                >
                  {t("shopOperation.openingHours.to")}
                </div>
                <TextInput
                  className="w-full"
                  type="time"
                  value=""
                  onChange={() => {}}
                />
              </SegmentedGroup>
            </LabelGroup>
            <LabelGroup
              header={t("shopOperation.acceptingOrders.header")}
              footer={t("shopOperation.acceptingOrders.footer")}
            >
              <SegmentedGroup>
                <Button appearance="tonal">
                  {t("shopOperation.acceptingOrders.yes")}
                </Button>
                <Button appearance="tonal">
                  {t("shopOperation.acceptingOrders.no")}
                </Button>
              </SegmentedGroup>
            </LabelGroup>
          </div>
        </div>
        <div
          className={`
            flex flex-col gap-px rounded-lg border border-outline bg-outline
            *:bg-surface-container *:first:rounded-t-lg *:last:rounded-b-lg
          `}
        >
          <div className="p-2 pl-3">{t("defaults.title")}</div>
          <div className="flex flex-grow flex-col gap-2 p-3">
            <LabelGroup
              header={t("defaults.paper.header")}
              footer={t("defaults.paper.footer")}
            >
              <SelectInput
                value={{ name: "A4" }}
                onChange={() => {}}
                displayKey="name"
                matchKey="name"
                options={[{ name: "A4" }, { name: "A3" }]}
              />
            </LabelGroup>
          </div>
        </div>
      </div>
      <div
        className={`
          col-span-3 flex flex-col gap-px overflow-scroll rounded-lg border
          border-outline bg-outline
        `}
      >
        <div className="bg-surface-container p-2 pl-3">
          {t("serviceManagement.title")}
        </div>
        <div className="flex flex-grow gap-px">
          <div className="min-w-60 bg-surface-container p-3">
            <span className="mb-1 block text-body-sm opacity-50 select-none">
              {t("serviceManagement.sidebarLabel")}
            </span>
            <Button
              appearance="filled"
              className="w-full justify-start !border-none"
            >
              {t("serviceManagement.paper.title")}
            </Button>
          </div>
          <div className="flex flex-grow flex-col gap-px">
            <div className="bg-surface-container p-2 pl-3">
              {t("serviceManagement.paper.title")}
            </div>
            <div className="flex flex-grow gap-px">
              <div className="min-w-60 bg-surface-container p-3">
                <span className="mb-1 block text-body-sm opacity-50 select-none">
                  {t("serviceManagement.paper.sidebarLabel")}
                </span>
                <Button
                  appearance="filled"
                  className="w-full justify-start !border-none"
                >
                  A4
                </Button>
                <Button
                  appearance="tonal"
                  className="w-full justify-start !border-none"
                >
                  A3
                </Button>
              </div>
              <div
                className={`
                  flex flex-grow flex-col gap-3 bg-surface-container p-3
                `}
              >
                <div className="flex gap-2">
                  <LabelGroup
                    className="flex-grow"
                    header={t("serviceManagement.paper.name.header")}
                    footer={t("serviceManagement.paper.name.footer")}
                  >
                    <TextInput value="" onChange={() => {}} />
                  </LabelGroup>
                  <LabelGroup
                    header={t("serviceManagement.paper.size.header")}
                    footer={t("serviceManagement.paper.size.footer")}
                  >
                    <SegmentedGroup>
                      <TextInput
                        prefixText={t("serviceManagement.paper.size.length")}
                        suffixText={t("serviceManagement.paper.size.unit")}
                        value=""
                        onChange={() => {}}
                      />
                      <div
                        className={`
                          flex items-center justify-center !p-2.5 select-none
                        `}
                      >
                        &times;
                      </div>
                      <TextInput
                        prefixText={t("serviceManagement.paper.size.width")}
                        suffixText={t("serviceManagement.paper.size.unit")}
                        value=""
                        onChange={() => {}}
                      />
                    </SegmentedGroup>
                  </LabelGroup>
                </div>
                <div>
                  <span className="block text-body-sm opacity-50 select-none">
                    {t("serviceManagement.paper.variants.title")}
                  </span>
                  <div
                    className={`
                      flex justify-between py-1 text-body-xs opacity-50
                      select-none
                    `}
                  >
                    <span>{t("serviceManagement.paper.variants.inStock")}</span>
                    <span>
                      {t("serviceManagement.paper.variants.variantName")}
                    </span>
                    <span>{t("serviceManagement.paper.variants.delete")}</span>
                  </div>
                  <div className="my-1 flex gap-2">
                    <div
                      className={`
                        flex items-center justify-center rounded-lg border
                        border-outline p-2
                      `}
                    >
                      <Checkbox
                        checked={checked}
                        setValue={() => toggleChecked()}
                      />
                    </div>
                    <SegmentedGroup className="flex-grow">
                      <div className="flex items-center justify-center">
                        <Checkbox
                          checked={checked}
                          setValue={() => toggleChecked()}
                        />
                      </div>
                      <TextInput
                        className="w-full"
                        value=""
                        onChange={() => {}}
                      />
                    </SegmentedGroup>
                    <Button
                      className="text-error"
                      appearance="tonal"
                      icon="delete"
                    />
                  </div>
                  <Button
                    className="w-full border border-outline"
                    appearance="tonal"
                    icon="add"
                  >
                    {t("serviceManagement.paper.variants.addVariant")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<PageProps> = async (
  context,
) => {
  const [locale, translations] = await getServerSideTranslations(context.req, [
    "common",
    "management",
  ]);

  const queryClient = new QueryClient();
  const sessionToken = `session_token=${context.req.cookies["session_token"]}`;
  const user = await prefetchUser(queryClient, sessionToken, {
    returnUser: true,
  });
  if (user) {
    if (!user.isOnboarded)
      return { redirect: { destination: "/onboard", permanent: false } };
    if (user.role !== "merchant")
      return { redirect: { destination: "/", permanent: false } };

    return {
      props: { locale, translations, dehydratedState: dehydrate(queryClient) },
    };
  }

  return { redirect: { destination: "/", permanent: false } };
};

export default MerchantDashboardPage;
