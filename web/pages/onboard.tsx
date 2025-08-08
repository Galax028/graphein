import Button from "@/components/common/Button";
import PageLoadTransition from "@/components/layout/PageLoadTransition";
import NavigationBar from "@/components/common/NavigationBar";
import UserProfileSettings, {
  UserProfileFormSchema,
} from "@/components/settings/UserProfileSettings";
import { prefetchUser } from "@/query/fetchUser";
import getServerSideTranslations from "@/utils/helpers/serverSideTranslations";
import type { APIResponse, User } from "@/utils/types/backend";
import type { PageProps } from "@/utils/types/common";
import useUserContext from "@/hooks/useUserContext";
import {
  dehydrate,
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/router";
import type { FC } from "react";
import useToggle from "@/hooks/useToggle";

const OnboardPage: FC<PageProps> = () => {
  const router = useRouter();
  const user = useUserContext();
  const tx = useTranslations("common");
  const t = useTranslations("onboard");
  const queryClient = useQueryClient();

  const [isSigningOut, toggleIsSigningOut] = useToggle();

  const onboardingMutation = useMutation({
    mutationFn: async (formData: UserProfileFormSchema) => {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_PATH + "/user/onboard",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );

      const body = (await response.json()) as APIResponse<User>;
      if (body.success) return body.data;
      else
        throw new Error(`Uncaught API Error (${body.error}): ${body.message}`);
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["user"], user);
      router.push(user.role === "merchant" ? "/merchant" : "/glance");
    },
  });

  const handleSignOut = async () => {
    toggleIsSigningOut(true);

    const res = await fetch(
      process.env.NEXT_PUBLIC_API_PATH + "/auth/signout",
      { method: "POST", credentials: "include" },
    );

    if (res.ok) {
      return router.push("/");
    }
  };

  return (
    <div className="flex h-dvh flex-col">
      <NavigationBar title={t("navigationBar")} />
      <PageLoadTransition className="mx-auto">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="text-title-md">{t("title")}</h1>
            <p className="opacity-50">{t("description")}</p>
          </div>
          <UserProfileSettings
            user={user}
            isOnboarding={true}
            onSubmit={(formData) => onboardingMutation.mutate(formData)}
          />
          <div className={`
            fixed right-0 bottom-0 left-0 z-10 flex flex-col gap-3 border-t
            border-outline bg-surface-container p-3
          `}>
            <div className="flex flex-col gap-2">
              <p className="text-body-sm">
                {t.rich("disclaimer", {
                  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "",
                  a1: (children) => (
                    <Link href="/about/terms-of-service" target="_blank">
                      <span className="underline">{children}</span>
                    </Link>
                  ),
                  a2: (children) => (
                    <Link href="/about/privacy-policy" target="_blank">
                      <span className="underline">{children}</span>
                    </Link>
                  ),
                })}
              </p>
              <Button
                form="onboardingForm"
                type="submit"
                appearance="filled"
                busy={onboardingMutation.isPending}
                busyWithText={false}
                disabled={isSigningOut}
              >
                {tx("action.next")}
              </Button>
              <Button
                className="text-error"
                appearance="tonal"
                onClick={handleSignOut}
                busy={isSigningOut}
                busyWithText={false}
                disabled={onboardingMutation.isPending}
              >
                {tx("action.signOut")}
              </Button>
            </div>
          </div>
        </div>
      </PageLoadTransition>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<PageProps> = async (
  context,
) => {
  const [locale, translations] = await getServerSideTranslations(context.req, [
    "common",
    "onboard",
  ]);

  const queryClient = new QueryClient();
  const sessionToken = `session_token=${context.req.cookies["session_token"]}`;
  const user = await prefetchUser(queryClient, sessionToken, {
    returnUser: true,
  });
  if (user) {
    if (user.isOnboarded)
      return {
        redirect: {
          destination:
            user.role === "merchant" ? "/merchant/dashboard" : "/glance",
          permanent: false,
        },
      };

    return {
      props: { locale, translations, dehydratedState: dehydrate(queryClient) },
    };
  }

  return { redirect: { destination: "/", permanent: false } };
};

export default OnboardPage;
