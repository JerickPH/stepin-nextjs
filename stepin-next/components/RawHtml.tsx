/**
 * Renders a pre-built HTML fragment exactly as it was on WordPress.
 * `display: contents` keeps the wrapper out of the layout so Elementor's CSS applies unchanged.
 * Scripts inside the fragment run on the initial page load (they are part of the server HTML).
 */
export default function RawHtml({ html }: { html: string }) {
  if (!html) return null;
  return <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: html }} />;
}
