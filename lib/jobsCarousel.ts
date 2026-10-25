/**
 * JA Jobs Carousel — Next.js equivalent of the WordPress `[ja_jobs_carousel]` shortcode
 * (child theme inc/ja-jobs-carousel.php, v2.1.0).
 *
 * Place the shortcode marker `<!--ja-jobs-carousel-->` in a page's HTML (content/pages/*.html).
 * At build time it is replaced with the markup below, and the page loads
 * /css/ja-jobs-carousel.css + /js/ja-jobs-carousel.js (carousel logic + empty-state fallback).
 *
 * Renders JobAdder off-screen, builds title+location cards into a Swiper carousel,
 * and opens each job's native detail view inside a modal popup.
 * Single instance per page (JobAdder's widget uses one global config).
 */

export const JOBS_CAROUSEL_MARKER = "<!--ja-jobs-carousel-->";

export type JobsCarouselOptions = {
  /** JobAdder widget key. */
  key: string;
  /** Slides on desktop (>=1024px). */
  perView: number;
  /** Slides on tablet (>=640px). */
  perViewMd: number;
  /** Slides on mobile (<640px). */
  perViewSm: number;
  /** Gap between slides, in px. */
  space: number;
  loop: boolean;
  /** Autoplay delay in ms (0 = off). */
  autoplay: number;
  /** Jobs fetched on one page (high = no "More.." pagination). */
  perPage: number;
  center: boolean;
  /** Which meta bullet is the location (0-based): 0=category, 1=sub, 2=location, 3=type. */
  locationIndex: number;
  /** Message shown when no jobs are available. */
  emptyText: string;
  /** Ms to wait for jobs before showing emptyText. */
  timeout: number;
};

export const JOBS_CAROUSEL_DEFAULTS: JobsCarouselOptions = {
  key: "AU6_on3jzehmrzauvadamsn6x3t3gm",
  perView: 3,
  perViewMd: 2,
  perViewSm: 1,
  space: 24,
  loop: true,
  autoplay: 0,
  perPage: 50,
  center: false,
  locationIndex: 2,
  emptyText: "No Available Jobs at the moment",
  timeout: 8000,
};

const escHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function renderJobsCarousel(options: Partial<JobsCarouselOptions> = {}): string {
  const o = { ...JOBS_CAROUSEL_DEFAULTS, ...options };
  const { emptyText, ...rest } = o;
  const config = { ...rest, scriptUrl: "https://apps.jobadder.com/widgets/v1/jobs.min.js" };
  const empty = escHtml(emptyText);

  return `<div class="ja-carousel" data-ja-config="${escHtml(JSON.stringify(config))}">
  <!-- JobAdder renders here, off-screen. Never remove this node. -->
  <div class="ja-carousel__staging" aria-hidden="true"><div id="ja-jobs-widget"></div></div>
  <!-- Our own carousel of title+location cards. -->
  <div class="swiper ja-carousel__swiper"><div class="swiper-wrapper"></div></div>
  <p class="ja-carousel__loading">Loading jobs&hellip;</p>
  <!-- Fallback: shown when no jobs load. -->
  <div class="ja-carousel__empty" role="status" hidden><p>${empty}</p></div>
  <noscript>
    <div class="ja-carousel__empty"><p>${empty}</p></div>
    <style>.ja-carousel__loading{display:none}</style>
  </noscript>
  <!-- Popup. The live widget's detail view is moved in here on click. -->
  <div class="ja-modal" hidden>
    <div class="ja-modal__backdrop" data-ja-close></div>
    <div class="ja-modal__dialog" role="dialog" aria-modal="true" aria-label="Job details">
      <button type="button" class="ja-modal__close" data-ja-close aria-label="Close">&times;</button>
      <div class="ja-modal__body"></div>
    </div>
  </div>
</div>`;
}
