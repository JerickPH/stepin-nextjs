import RawHtml from "./RawHtml";
import { readFragment } from "@/lib/site";

/** Shared site header (Elementor header template #277). Active menu state is set client-side. */
export default function SiteHeader() {
  return <RawHtml html={readFragment("partials", "header.html")} />;
}
