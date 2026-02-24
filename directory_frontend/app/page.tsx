export default function HomePage() {
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: 24 }}>
      <h1 style={{ margin: 0 }}>Resident Directory</h1>
      <p style={{ marginTop: 8, color: "#374151" }}>
        Frontend is running. Configure API base via <code>NEXT_PUBLIC_API_BASE</code>.
      </p>
    </main>
  );
}
