import Button from "@/components/common/Button";
import Checkbox from "@/components/common/Checkbox";
import LabelGroup from "@/components/common/LabelGroup";
import MerchantLayout from "@/components/common/layout/MerchantLayout";
import SegmentedGroup from "@/components/common/SegmentedGroup";
import SelectInput from "@/components/common/SelectInput";
import TextInput from "@/components/common/TextInput";
import { prefetchUser } from "@/query/fetchUser";
import getServerSideTranslations from "@/utils/helpers/serverSideTranslations";
import type { PageProps } from "@/utils/types/common";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import type { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import { useState, type FC } from "react";

const MerchantDashboardPage: FC<PageProps> = () => {
  const t = useTranslations("management");

  const [checked, setChecked] = useState(false);

  return (
    <MerchantLayout page="management" translationNamespace="management">
      <div className="col-span-1 grid grid-rows-2 gap-3">
        <div className="flex flex-col gap-px border border-outline rounded-lg *:first:rounded-t-lg *:last:rounded-b-lg bg-outline">
          <div className="bg-surface-container p-2 pl-3">
            {t("shopOperation.title")}
          </div>
          <div className="flex-grow flex flex-col bg-surface-container p-3 gap-2">
            <LabelGroup
              header={t("shopOperation.openingHours.header")}
              footer={t("shopOperation.openingHours.footer")}
            >
              <SegmentedGroup>
                <TextInput
                  className="w-full"
                  type="time"
                  value=""
                  setValue={() => {}}
                />
                <div className="flex justify-center items-center !p-2.5 select-none">
                  {t("shopOperation.openingHours.to")}
                </div>
                <TextInput
                  className="w-full"
                  type="time"
                  value=""
                  setValue={() => {}}
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
        <div className="flex flex-col gap-px border border-outline rounded-lg *:first:rounded-t-lg *:last:rounded-b-lg bg-outline">
          <div className="bg-surface-container p-2 pl-3">
            {t("defaults.title")}
          </div>
          <div className="flex-grow flex flex-col bg-surface-container p-3 gap-2">
            <LabelGroup
              header={t("defaults.paper.header")}
              footer={t("defaults.paper.footer")}
            >
              <SelectInput
                value={0}
                setValue={() => {}}
                options={["A4", "A3"]}
              />
            </LabelGroup>
          </div>
        </div>
      </div>
      <div className="col-span-3 flex flex-col gap-px rounded-lg overflow-scroll border border-outline bg-outline">
        <div className="bg-surface-container p-2 pl-3">
          {t("serviceManagement.title")}
        </div>
        <div className="flex-grow flex gap-px">
          <div className="min-w-60 bg-surface-container p-3">
            <span className="text-body-sm opacity-50 block mb-1 select-none">
              {t("serviceManagement.sidebarLabel")}
            </span>
            <Button
              appearance="filled"
              className="justify-start w-full !border-none"
            >
              {t("serviceManagement.paper.title")}
            </Button>
          </div>
          <div className="flex-grow flex flex-col gap-px">
            <div className="bg-surface-container p-2 pl-3">
              {t("serviceManagement.paper.title")}
            </div>
            <div className="flex-grow flex gap-px">
              <div className="min-w-60 bg-surface-container p-3">
                <span className="text-body-sm opacity-50 block mb-1 select-none">
                  {t("serviceManagement.paper.sidebarLabel")}
                </span>
                <Button
                  appearance="filled"
                  className="justify-start w-full !border-none"
                >
                  A4
                </Button>
                <Button
                  appearance="tonal"
                  className="justify-start w-full !border-none"
                >
                  A3
                </Button>
              </div>
              <div className="flex-grow flex flex-col gap-3 bg-surface-container p-3">
                <div className="flex gap-2">
                  <LabelGroup
                    className="flex-grow"
                    header={t("serviceManagement.paper.name.header")}
                    footer={t("serviceManagement.paper.name.footer")}
                  >
                    <TextInput value="" setValue={() => {}} />
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
                        setValue={() => {}}
                      />
                      <div className="flex justify-center items-center !p-2.5 select-none">
                        &times;
                      </div>
                      <TextInput
                        prefixText={t("serviceManagement.paper.size.width")}
                        suffixText={t("serviceManagement.paper.size.unit")}
                        value=""
                        setValue={() => {}}
                      />
                    </SegmentedGroup>
                  </LabelGroup>
                </div>
                <div>
                  <span className="block text-body-sm opacity-50 select-none">
                    {t("serviceManagement.paper.variants.title")}
                  </span>
                  <div className="flex justify-between py-1 text-body-xs opacity-50 select-none">
                    <span>{t("serviceManagement.paper.variants.inStock")}</span>
                    <span>
                      {t("serviceManagement.paper.variants.variantName")}
                    </span>
                    <span>{t("serviceManagement.paper.variants.delete")}</span>
                  </div>
                  <div className="flex gap-2 my-1">
                    <div className="flex justify-center items-center border border-outline rounded-lg p-2">
                      <Checkbox checked={checked} setValue={setChecked} />
                    </div>
                    <SegmentedGroup className="flex-grow">
                      <div className="flex justify-center items-center">
                        <Checkbox checked={checked} setValue={setChecked} />
                      </div>
                      <TextInput
                        className="w-full"
                        value=""
                        setValue={() => {}}
                      />
                    </SegmentedGroup>
                    <Button
                      className="text-error"
                      appearance="tonal"
                      icon="delete"
                    />
                  </div>
                  <Button
                    className="border border-outline w-full"
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
    </MerchantLayout>
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
