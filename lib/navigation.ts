import {
  Award,
  Bike,
  CalendarDays,
  ChartNoAxesCombined,
  Ellipsis,
  Footprints,
  Home,
  Settings,
  SportShoe,
  Waves,
} from "lucide-react";

export const ROUTES = {
  home: "/",
  runs: "/runs",
  progress: "/progress",
  records: "/records",
  calendar: "/calendar",
  
  // Future activity pages
  cycling: "",
  swimming: "",
  walking: "",

  more: "/more",
  settings: "/settings",
} as const;

export const NAVIGATION = [
  {
    label: "Overview",
    href: ROUTES.home,
    icon: Home,
    enabled: true,
  },
  {
    label: "Runs",
    href: ROUTES.runs,
    icon: SportShoe,
    enabled: true,
  },
  {
    label: "Progress",
    href: ROUTES.progress,
    icon: ChartNoAxesCombined,
    enabled: true,
  },
  {
    label: "Records",
    href: ROUTES.records,
    icon: Award,
    enabled: true,
  },
  {
    label: "Calendar",
    href: ROUTES.calendar,
    icon: CalendarDays,
    enabled: true,
  },

  // Future activities
  {
    label: "Cycling",
    href: ROUTES.cycling,
    icon: Bike,
    enabled: false,
  },
  {
    label: "Swimming",
    href: ROUTES.swimming,
    icon: Waves,
    enabled: false,
  },
  {
    label: "Walking",
    href: ROUTES.walking,
    icon: Footprints,
    enabled: false,
  },

  {
    label: "More",
    href: ROUTES.more,
    icon: Ellipsis,
    enabled: true,
  },
  {
    label: "Settings",
    href: ROUTES.settings,
    icon: Settings,
    enabled: true,
  },
] as const;