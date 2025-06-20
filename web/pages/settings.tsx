import Button from "@/components/common/Button";
import LabelGroup from "@/components/common/LabelGroup";
import NavigationBar from "@/components/common/NavigationBar";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import PersonAvatar from "@/components/common/PersonAvatar";
import SegmentedGroup from "@/components/common/SegmentedGroup";
import { UserTypes } from "@/utils/types/common";
import PageLoadTransition from "@/components/common/layout/PageLoadTransition";

const SettingsPage = () => {
  const router = useRouter();

  const [user, setUser] = useState<any>({});
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [busy, setBusy] = useState<boolean>(false);

  const [phone, setPhone] = useState<string>("");
  const [classroom, setClassroom] = useState<string>("");
  const [classroomNo, setClassroomNo] = useState<string>("");

  const handleUpdateProfileSettings = async (role: UserTypes) => {
    const res = await fetch(process.env.NEXT_PUBLIC_API_PATH + "/user", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tel: String(phone),
        class: Number(classroom),
        classNo: Number(classroomNo),
      }),
    });

    if (res.ok) {
      return location.reload();
    }
  };

  const handleSignOut = async () => {
    setBusy(true);

    const res = await fetch(
      process.env.NEXT_PUBLIC_API_PATH + "/auth/signout",
      {
        method: "POST",
        credentials: "include",
      }
    );

    if (res.ok) {
      return router.push("/");
    }
  };

  useEffect(() => {
    const getUser = async () => {
      const res = await fetch(process.env.NEXT_PUBLIC_API_PATH + "/user", {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        if (isSignedIn == false) {
          setIsSignedIn(true);
          setUser(data);

          setPhone(data.data.tel ?? "");
          setClassroom(data.data.class ? String(data.data.class) : "");
          setClassroomNo(data.data.classNo ? String(data.data.classNo) : "");
        }
      }
    };

    getUser();
  }, []);

  return (
    <>
      <NavigationBar title="Settings" backEnabled={true} />
      <PageLoadTransition className="flex flex-col gap-3 p-3">
        {isSignedIn && (
          <>
            <LabelGroup
              header="About You"
              footer="You cannot change your profile picture, name, or email here because they’re synced with your Google account—please update them in your Google account settings."
            >
              <div className="flex flex-col gap-3 p-3 bg-surface-container border border-outline rounded-lg">
                <LabelGroup header="Profile">
                  <div className="m-auto">
                    <PersonAvatar
                      profile_url={user.data.profileUrl}
                      person_name={user.data.name}
                      size={96}
                    />
                  </div>
                </LabelGroup>
                <LabelGroup header="Name">
                  <input
                    value={user.data.name}
                    className="w-full p-2 bg-background border border-outline rounded-lg text-body-md h-10 text-on-background-disabled"
                    disabled
                  />
                </LabelGroup>
                <LabelGroup header="Email">
                  <input
                    value={user.data.email}
                    className="w-full p-2 bg-background border border-outline rounded-lg text-body-md h-10 text-on-background-disabled"
                    disabled
                  />
                </LabelGroup>
                <LabelGroup header="Phone">
                  <input
                    value={phone}
                    className="w-full p-2 bg-background border border-outline rounded-lg text-body-md h-10"
                    onChange={(e) => {
                      setPhone(e.target.value);
                    }}
                  />
                </LabelGroup>
                <LabelGroup header="Class / No.">
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
                      className="w-full p-2 bg-background text-body-md"
                    />
                    <div className="text-body-md flex items-center justify-center p-2 h-10 aspect-square bg-surface-container border border-outline">
                      <p>No.</p>
                    </div>
                    <input
                      value={classroomNo}
                      onChange={(e) => {
                        setClassroomNo(e.target.value);
                      }}
                      type="text"
                      className="w-full p-2 bg-background text-body-md"
                    />
                  </SegmentedGroup>
                </LabelGroup>
                <Button
                  appearance="filled"
                  onClick={handleUpdateProfileSettings}
                  className="w-full"
                  icon={"save"}
                  busy={busy}
                >
                  Save
                </Button>
              </div>
            </LabelGroup>
          </>
        )}
        <Button
          appearance="tonal"
          onClick={handleSignOut}
          className="w-full text-error"
          icon={"logout"}
          busy={busy}
        >
          Sign Out
        </Button>
        <LabelGroup header="Developer Log">
          <div className="p-3 text-body-sm bg-surface-container border border-outline rounded-lg">
            <b>
              <a
                className="!font-mono break-all"
                href={process.env.NEXT_PUBLIC_API_PATH + "/user"}
                target="_blank"
              >
                {process.env.NEXT_PUBLIC_API_PATH + "/user"}
              </a>
            </b>
            <br />
            <span className="!font-mono break-all">{JSON.stringify(user)}</span>
          </div>
        </LabelGroup>
      </PageLoadTransition>
    </>
  );
};

export default SettingsPage;
