import Button from "@/components/common/Button";
import InputLabel from "@/components/common/InputLabel";
import NavigationBar from "@/components/common/NavigationBar";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import PersonAvatar from "@/components/common/PersonAvatar";
import SegmentedGroup from "@/components/common/SegmentedGroup";

const SettingsPage = () => {
  const router = useRouter();

  const [user, setUser] = useState<any>({});
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [busy, setBusy] = useState<boolean>(false);

  const [phone, setPhone] = useState<string>();
  const [classroom, setClassroom] = useState<string>("");
  const [classNo, setClassNo] = useState<string>("");

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
        }
      }
    };

    getUser();
  }, []);

  return (
    <>
      <NavigationBar title="Settings" backEnabled={true} />
      <div className="flex flex-col gap-3 p-3">
        {isSignedIn && (
          <>
            <InputLabel
              header="About you"
              footer="You cannot change your profile picture, name, or email here because they’re synced with your Google account—please update them in your Google account settings."
            >
              <div className="flex flex-col gap-3 p-3 bg-surface-container border border-outline rounded-lg">
                <InputLabel header="Profile">
                  <div className="m-auto">
                    <PersonAvatar
                      profile_url={user.data.profileUrl}
                      person_name={user.data.name}
                      size={96}
                    />
                  </div>
                </InputLabel>
                <InputLabel header="Name">
                  <input
                    value={user.data.name}
                    className="w-full p-2 bg-background border border-outline rounded-lg text-body-md h-10 text-on-background-disabled"
                    disabled
                  />
                </InputLabel>
                <InputLabel header="Email">
                  <input
                    value={user.data.email}
                    className="w-full p-2 bg-background border border-outline rounded-lg text-body-md h-10 text-on-background-disabled"
                    disabled
                  />
                </InputLabel>
                <InputLabel header="Phone">
                  <input
                    value={user.data.tel}
                    className="w-full p-2 bg-background border border-outline rounded-lg text-body-md h-10"
                  />
                </InputLabel>
                <InputLabel header="Class / No.">
                  <SegmentedGroup>
                    <div className="text-body-md flex items-center justify-center p-2 h-10 aspect-square bg-surface-container border border-outline">
                      <p>M.</p>
                    </div>
                    <input
                      value={user.data.class}
                      onChange={(e) => {
                        setClassroom(e.target.value);
                      }}
                      type="text"
                      className="w-full p-2 bg-background"
                    />
                    <div className="text-body-md flex items-center justify-center p-2 h-10 aspect-square bg-surface-container border border-outline">
                      <p>No.</p>
                    </div>
                    <input
                      value={user.data.classNo}
                      onChange={(e) => {
                        setClassNo(e.target.value);
                      }}
                      type="text"
                      className="w-full p-2 bg-background"
                    />
                  </SegmentedGroup>
                </InputLabel>
              </div>
            </InputLabel>
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
        <InputLabel header="Developer Log">
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
        </InputLabel>
      </div>
    </>
  );
};

export default SettingsPage;
