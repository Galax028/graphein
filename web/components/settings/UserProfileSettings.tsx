import TextInput from "@/components/common/input/TextInput";
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
        onSubmit={(event) =>
          isOnboarding ? handleSubmit(onSubmit)(event) : event.preventDefault()
        }
        onChange={(event) =>
          !isOnboarding
            ? handleSubmit(() => console.log("formed"))(event)
            : event.preventDefault()
        }
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
          <TextInput value={user.name} disabled />
        </LabelGroup>
        <LabelGroup header={tx("userSettings.email")}>
          <TextInput value={user.email} disabled />
        </LabelGroup>
        <LabelGroup
          className="[&>p]:last:text-error [&>p]:last:opacity-100!"
          header={tx("userSettings.tel")}
        >
          <TextInput
            type="tel"
            error={errors.tel}
            errorMessage={tx("userSettings.error")}
            {...register("tel")}
          />
        </LabelGroup>
        <LabelGroup
          className={cn(
            "[&>p]:last:text-error [&>p]:last:opacity-100!",
            user.role !== "student" && "hidden",
          )}
          header={tx("userSettings.classAndNo")}
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
            <TextInput
              type="number"
              error={errors.class}
              showErrorIcon={true}
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
            <TextInput
              type="number"
              error={errors.classNo}
              showErrorIcon={true}
              {...register("classNo", {
                valueAsNumber: true,
                disabled: user.role !== "student",
              })}
            />
          </SegmentedGroup>
        </LabelGroup>
      </form>
    </LabelGroup>
  );
};

export default UserProfileSettings;
