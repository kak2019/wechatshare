export default function SovietRevivalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] overflow-hidden bg-[#080604]">{children}</div>
  );
}
