import RawHtml from "./RawHtml";
import { readFragment } from "@/lib/site";

/** Elementor popups (#1100 menu/off-canvas, #2076 search) used on every page. */
export default function Popups() {
  return <RawHtml html={readFragment("partials", "popups.html")} />;
}
