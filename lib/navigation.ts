import {
  CalendarDays,
  ChartNoAxesCombined,
  Footprints,
  SportShoe,
  Gauge,
  Home,
  Settings,
  Award,
  Bike,
  Waves,
} from "lucide-react";




export const ROUTES = 
{
  home: "/",
  runs: "/runs",
  progress: "/progress",
  records: "/records",
  calendar: "/calendar",
  cycling: "/cycling",
  swimming: "/swimming",
  walking: "/walking",
  settings: "/settings",
} as const;



export const NAVIGATION = 
[
  {
    label: "Overview",
    href: ROUTES.home,
    icon: Home,
  },
  {
    label: "Runs",
    href: ROUTES.runs,
    icon: SportShoe,
  },
  {
    label: "Progress",
    href: ROUTES.progress,
    icon: ChartNoAxesCombined,
  },
  {
    label: "Records",
    href: ROUTES.records,
    icon: Award,
  },
  {
    label: "Calendar",
    href: ROUTES.calendar,
    icon: CalendarDays,
  },
  {
    label: "Cycling",
    href: ROUTES.cycling,
    icon: Bike,
  },
  {
    label: "Swimming",
    href: ROUTES.swimming,
    icon: Waves,
  },
  {
    label: "Walking",
    href: ROUTES.walking,
    icon: Footprints,
  },
  {
    label: "More",
    href: ROUTES.settings,
    icon: Gauge,
  },
  {
    label: "Settings",
    href: ROUTES.settings,
    icon: Settings,
  },
] as const;