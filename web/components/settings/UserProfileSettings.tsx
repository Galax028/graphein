import LabelGroup from "@/components/common/LabelGroup";
import PersonAvatar from "@/components/common/PersonAvatar";
import SegmentedGroup from "@/components/common/SegmentedGroup";
import type { User } from "@/utils/types/backend";
import { useTranslations } from "next-intl";
import type { FC } from "react";

type UserProfileSettingsProps = {
  user: User;
  withHeader?: boolean;
};

const UserProfileSettings: FC<UserProfileSettingsProps> = ({
  user,
  withHeader = true,
}) => {
  const tx = useTranslations("common");

  return (
    <LabelGroup
      header={withHeader ? tx("userSettings.title") : undefined}
      footer={tx("userSettings.description")}
    >
      <div className="flex flex-col gap-3 p-3 bg-surface-container border border-outline rounded-lg">
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
            className="w-full p-2 bg-background border border-outline rounded-lg text-body-md h-10 text-on-background-disabled"
            disabled
          />
        </LabelGroup>
        <LabelGroup header={tx("userSettings.email")}>
          <input
            value={user.email}
            className="w-full p-2 bg-background border border-outline rounded-lg text-body-md h-10 text-on-background-disabled"
            disabled
          />
        </LabelGroup>
        <LabelGroup header={tx("userSettings.tel")}>
          <input
            value={user.role === "student" ? (user.tel ?? "") : ""}
            className="w-full p-2 bg-background border border-outline rounded-lg text-body-md h-10"
            // onChange={(e) => setPhone(e.target.value)}
          />
        </LabelGroup>
        <LabelGroup header={tx("userSettings.classAndNo")}>
          <SegmentedGroup>
            <div className="text-body-md flex items-center justify-center p-2 h-10 aspect-square bg-surface-container border border-outline">
              <p>{tx("userSettings.class")}</p>
            </div>
            <input
              value={user.role === "student" ? (user.class ?? "") : ""}
              // onChange={(e) => setClassroom(e.target.value)}
              type="text"
              className="w-full p-2 bg-background text-body-md"
            />
            <div className="text-body-md flex items-center justify-center p-2 h-10 aspect-square bg-surface-container border border-outline">
              <p>{tx("userSettings.no")}</p>
            </div>
            <input
              value={user.role === "student" ? (user.classNo ?? "") : ""}
              // onChange={(e) => setClassroomNo(e.target.value)}
              type="text"
              className="w-full p-2 bg-background text-body-md"
            />
          </SegmentedGroup>
        </LabelGroup>
        {/* <Button
          appearance="filled"
          onClick={handleUpdateProfileSettings}
          className="w-full"
          icon="save"
          busy={busy}
        >
          {tx("userSettings.save")}
        </Button> */}
      </div>
    </LabelGroup>
  );
};

export default UserProfileSettings;
