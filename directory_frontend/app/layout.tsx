export const metadata = {
  title: "Resident Directory",
  description: "Resident directory web application"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#f9fafb", color: "#111827" }}>
        {children}
      </body>
    </html>
  );
}
