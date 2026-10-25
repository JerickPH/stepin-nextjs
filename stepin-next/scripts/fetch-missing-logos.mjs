// One-off: copies the 6 client-logo SVGs (lazy-loaded in the home page carousel) from the
// WordPress staging site into public/uploads/2026/09/. Run once while staging is still online:
//   node scripts/fetch-missing-logos.mjs
import { writeFile, mkdir } from "node:fs/promises";
const base = "https://1276382.us18.myftpupload.com/wp-content/uploads/2026/09/";
const files = ["Frame.svg", "Logo-2.svg", "Logo-3.svg", "Logo.svg", "logo-1.svg", "logotype.svg"];
await mkdir("public/uploads/2026/09", { recursive: true });
for (const f of files) {
  const res = await fetch(base + f);
  if (!res.ok) { console.error("failed", f, res.status); continue; }
  await writeFile("public/uploads/2026/09/" + f, Buffer.from(await res.arrayBuffer()));
  console.log("saved", f);
}
