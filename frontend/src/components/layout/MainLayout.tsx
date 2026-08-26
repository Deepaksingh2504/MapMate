

type MainLayoutProps = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-50">
      <main className="relative flex-1">
        {children}
      </main>
    </div>
  );
}