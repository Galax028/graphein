import cn from "@/utils/helpers/cn";
import MaterialIcon from "@/components/common/MaterialIcon";
import PersonAvatar from "@/components/common/PersonAvatar";

interface NavigationBarProps {
  title: string;
  className?: string;
  style?: string;
}

const NavigationBar = ({ title, className, style }: NavigationBarProps) => {
  return (
    <nav
      className={cn(
        `flex justify-between items-center gap-2 bg-surfaceContainer border-b border-outline`,
        className
      )}
    >
      <div className="flex gap-3 p-3">
        <MaterialIcon icon="arrow_back" />
        {title}
      </div>
      <div className="flex gap-3 p-2">
        <PersonAvatar />
      </div>
    </nav>
  );
};

export default NavigationBar;
