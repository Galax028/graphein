// Navigation Bar
interface BaseNavigationBarProps {
  title: string;
  description?: string;
  className?: string;
  style?: string;
  children?: React.ReactNode;
}
interface BackEnabledProps extends BaseNavigationBarProps {
  backEnabled: true;
  backContextURL: string;
}
interface BackDisabledProps extends BaseNavigationBarProps {
  backEnabled?: false;
  backContextURL?: never;
}

export type NavigationBarProps = BackEnabledProps | BackDisabledProps;
