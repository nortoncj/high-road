import type { IconType } from "react-icons";
import { TbBellRinging, TbChartBar, TbMap2, TbShieldCheck, TbUsersGroup, TbWorldWww } from "react-icons/tb";
import type { ServiceIcon } from "@/content/services/types";

/** One icon per service, wherever it's listed: the hero menu, the cards, the other-services row. */
export const serviceIcons: Record<ServiceIcon, IconType> = {
  website: TbWorldWww,
  map: TbMap2,
  bell: TbBellRinging,
  users: TbUsersGroup,
  chart: TbChartBar,
  shield: TbShieldCheck,
};
