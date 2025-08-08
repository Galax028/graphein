import NavigationBar from "@/components/common/NavigationBar";
import { useUserContextDangerously } from "@/hooks/useUserContext";
import { type FC } from "react";

const Layout: FC = () => {
  const user = useUserContextDangerously();

  return (
    <div className="flex h-dvh flex-col">
      <NavigationBar user={user ?? undefined} />
    </div>
  );
};
