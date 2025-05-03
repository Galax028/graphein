// Navigation Bar
interface BaseNavigationBarProps {
  title: string;
  className?: string;
  style?: string;
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
