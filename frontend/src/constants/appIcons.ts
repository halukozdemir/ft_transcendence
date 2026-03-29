import type { IconType } from "react-icons";
import { MdAddCircleOutline, MdBolt, MdCampaign, MdChevronLeft, MdChevronRight, MdFilterList, MdHelpOutline, MdLock, MdLogin, MdMailOutline, MdNotificationsNone, MdSearch, MdSettings, MdSportsSoccer, MdVerifiedUser } from "react-icons/md";
export const appIcons = {
  brand: MdSportsSoccer,
  notifications: MdNotificationsNone,
  filter: MdFilterList,
  search: MdSearch,
  settings: MdSettings,
  support: MdHelpOutline,
  lock: MdLock,
  verified: MdVerifiedUser,
  quickMatch: MdBolt,
  createRoom: MdAddCircleOutline,
  join: MdLogin,
  message: MdMailOutline,
  campaign: MdCampaign,
  chevronLeft: MdChevronLeft,
  chevronRight: MdChevronRight,
} as const satisfies Record<string, IconType>;

export type AppIconName = keyof typeof appIcons;
