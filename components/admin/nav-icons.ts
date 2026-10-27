import type { IconType } from "react-icons";
import {
  TbFolders,
  TbInbox,
  TbLayoutDashboard,
  TbListCheck,
  TbPalette,
  TbReportAnalytics,
  TbSettings,
  TbUsers,
} from "react-icons/tb";
import type { NavIcon } from "@/content/admin";

export const navIcons: Record<NavIcon, IconType> = {
  overview: TbLayoutDashboard,
  leads: TbInbox,
  clients: TbUsers,
  projects: TbFolders,
  tasks: TbListCheck,
  reports: TbReportAnalytics,
  studio: TbPalette,
  settings: TbSettings,
};
