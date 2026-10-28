import { contactNav, nav } from "@/content/site";

// The nav label to mark: on the home page it follows the section in view
// (Home above the first section); elsewhere it follows the route.
export function activeNavLabel(pathname: string, section: string | null) {
  if (pathname !== "/") return nav.find((item) => item.match?.test(pathname))?.label ?? null;
  if (!section) return "Home";
  return [...nav, contactNav].find((item) => (item.sections as readonly string[]).includes(section))?.label ?? null;
}
