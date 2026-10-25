import RawHtml from "./RawHtml";
import { readFragment } from "@/lib/site";

/** Shared site footer. Two variants exist: #759 (default) and #1884 (candidate / build-your-team pages). */
export default function SiteFooter({ variant }: { variant: string }) {
  return <RawHtml html={readFragment("partials", `footer-${variant}.html`)} />;
}
