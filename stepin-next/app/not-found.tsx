export default function NotFound() {
  return (
    <main style={{ minHeight: "70vh", display: "grid", placeItems: "center", textAlign: "center", padding: "4rem 1rem", fontFamily: "Inter, sans-serif" }}>
      <div>
        <h1 style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>Page not found</h1>
        <p style={{ marginBottom: "1.5rem" }}>The page you are looking for doesn&apos;t exist.</p>
        <a href="/" style={{ textDecoration: "underline" }}>Back to home</a>
      </div>
    </main>
  );
}
