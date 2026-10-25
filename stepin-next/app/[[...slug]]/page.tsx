import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RawHtml from "@/components/RawHtml";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Popups from "@/components/Popups";
import { getPage, pages, readFragment } from "@/lib/site";
import { JOBS_CAROUSEL_MARKER, renderJobsCarousel } from "@/lib/jobsCarousel";

export const dynamicParams = false;

type Props = { params: Promise<{ slug?: string[] }> };

export function generateStaticParams() {
  return Object.values(pages).map((p) => ({ slug: p.slug ? [p.slug] : [] }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug = [] } = await params;
  const page = getPage(slug.join("/"));
  if (!page) return {};
  return { title: { absolute: page.title }, alternates: { canonical: page.slug ? `/${page.slug}/` : "/" } };
}

export default async function SitePage({ params }: Props) {
  const { slug = [] } = await params;
  const page = getPage(slug.join("/"));
  if (!page) notFound();

  // Runs before any content paints: apply the WordPress body classes Elementor's CSS/JS expect.
  // Shortcode equivalent: swap the marker for the JobAdder carousel markup.
  let main = readFragment("pages", `${page.key}.html`);
  const hasJobs = main.includes(JOBS_CAROUSEL_MARKER);
  if (hasJobs) main = main.replace(JOBS_CAROUSEL_MARKER, renderJobsCarousel());

  const bodyInit = `document.body.className=${JSON.stringify(page.bodyClass)};`;

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: bodyInit }} />
      <script src="/js/jquery.js" />
      <SiteHeader />
      <RawHtml html={main} />
      {/* Must load AFTER site.css (like WordPress did) so the card styles win over theme button styles */}
      {hasJobs && <RawHtml html={'<link rel="stylesheet" href="/css/ja-jobs-carousel.css">'} />}
      <SiteFooter variant={page.footer} />
      <Popups />
      {/* Per-page Elementor config (post id, AJAX url) followed by the shared script bundle */}
      <RawHtml html={readFragment("scripts", `${page.key}.html`)} />
      <script src="/js/site.js" />
      {hasJobs && <script src="/js/ja-jobs-carousel.js" />}
      <script src="/js/stepin.js" />
    </>
  );
}
