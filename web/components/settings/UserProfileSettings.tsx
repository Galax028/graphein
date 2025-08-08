import Button from "@/components/common/Button";
import LabelGroup from "@/components/common/LabelGroup";
import PersonAvatar from "@/components/common/PersonAvatar";
import SegmentedGroup from "@/components/common/SegmentedGroup";
import { cn } from "@/utils";
import type { User } from "@/utils/types/backend";
import { superstructResolver } from "@hookform/resolvers/superstruct";
import { useTranslations } from "next-intl";
import type { FC } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import * as s from "superstruct";

const formSchema = s.object({
  tel: s.pattern(s.string(), /^0[6-9][0-9]-?[0-9]{3}-?[0-9]{4}$/),
  class: s.nullable(s.min(s.integer(), 1)),
  classNo: s.nullable(s.max(s.min(s.integer(), 1), 99)),
});
export type UserProfileFormSchema = s.Infer<typeof formSchema>;

type UserProfileSettingsProps = {
  user: User;
  isOnboarding?: boolean;
  onSubmit?: SubmitHandler<UserProfileFormSchema>;
};

/**
 * A form component for viewing and editing user profile settings.
 *
 * This component handles user profile data like telephone number and, for
 * students, their class and class number.
 *
 * @param props.user          The user object containing the profile data to
 *                            display.
 * @param props.isOnboarding  A flag to adapt the component for an onboarding
 *                            flow. Defaults to false.
 * @param props.onSubmit      The callback function to execute upon successful
 *                            form submission.
 */
const UserProfileSettings: FC<UserProfileSettingsProps> = ({
  user,
  isOnboarding = false,
  onSubmit = () => {},
}) => {
  const tx = useTranslations("common");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    // @ts-expect-error This really shouldn't happen, TypeScript...
    resolver: superstructResolver(formSchema),
    defaultValues:
      // To allow for non-students to leave `class` and `classNo` fields as blank
      user.role === "student"
        ? {
            tel: user.tel,
            class: user.class,
            classNo: user.classNo,
          }
        : {
            tel: user.role === "teacher" ? user.tel : undefined,
            class: null,
            classNo: null,
          },
  });

  return (
    <LabelGroup
      header={!isOnboarding ? tx("userSettings.title") : undefined}
      footer={tx("userSettings.description")}
    >
      <form
        className={`
          flex flex-col gap-3 rounded-lg border border-outline
          bg-surface-container p-3
        `}
        id={isOnboarding ? "onboardingForm" : undefined}
        onSubmit={handleSubmit(onSubmit)}
      >
        <LabelGroup header={tx("userSettings.profile")}>
          <div className="m-auto">
            <PersonAvatar
              profileUrl={user.profileUrl}
              personName={user.name}
              size={96}
            />
          </div>
        </LabelGroup>
        <LabelGroup header={tx("userSettings.name")}>
          <input
            value={user.name}
            className={`
              h-10 w-full rounded-lg border border-outline bg-background p-2
              text-body-md text-on-background-disabled
            `}
            disabled
          />
        </LabelGroup>
        <LabelGroup header={tx("userSettings.email")}>
          <input
            value={user.email}
            className={`
              h-10 w-full rounded-lg border border-outline bg-background p-2
              text-body-md text-on-background-disabled
            `}
            disabled
          />
        </LabelGroup>
        <LabelGroup
          className="[&>p]:last:text-error [&>p]:last:opacity-100!"
          header={tx("userSettings.tel")}
          footer={errors.tel && tx("userSettings.telValidationError")}
        >
          <input
            className={`
              h-10 w-full rounded-lg border border-outline bg-background p-2
              text-body-md
            `}
            type="tel"
            {...register("tel")}
          />
        </LabelGroup>
        <LabelGroup
          className={cn(
            "[&>p]:last:text-error [&>p]:last:opacity-100!",
            user.role !== "student" && "hidden",
          )}
          header={tx("userSettings.classAndNo")}
          footer={
            (errors.class || errors.classNo) &&
            tx("userSettings.classOrClassNoValidationError")
          }
        >
          <SegmentedGroup>
            <div
              className={`
                flex aspect-square h-10 items-center justify-center border
                border-outline bg-surface-container p-2 text-body-md
              `}
            >
              <p>{tx("userSettings.class")}</p>
            </div>
            <input
              className="w-full bg-background p-2 text-body-md"
              type="number"
              {...register("class", {
                valueAsNumber: true,
                disabled: user.role !== "student",
              })}
            />
            <div
              className={`
                flex aspect-square h-10 items-center justify-center border
                border-outline bg-surface-container p-2 text-body-md
              `}
            >
              <p>{tx("userSettings.no")}</p>
            </div>
            <input
              className="w-full bg-background p-2 text-body-md"
              type="number"
              {...register("classNo", {
                valueAsNumber: true,
                disabled: user.role !== "student",
              })}
            />
          </SegmentedGroup>
        </LabelGroup>
        {!isOnboarding && (
          <Button type="submit" appearance="filled" className="w-full">
            {tx("userSettings.save")}
          </Button>
        )}
      </form>
    </LabelGroup>
  );
};

export default UserProfileSettings;
