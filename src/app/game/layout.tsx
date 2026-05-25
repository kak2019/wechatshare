export default function GameLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      {children}
    </div>
  );
}
