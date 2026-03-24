import { appIcons, type AppIconName } from "../../../app/appIcons";

interface AppIconProps {
  name: AppIconName;
  className?: string;
  size?: number;
}

const AppIcon = ({ name, className, size = 20 }: AppIconProps) => {
  const Icon = appIcons[name];
  return <Icon aria-hidden="true" className={className} size={size} />;
};

export default AppIcon;
