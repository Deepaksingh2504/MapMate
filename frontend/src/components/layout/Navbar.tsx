import Input from "../ui/Input";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
      
      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">🧭</span>

        <h1 className="text-xl font-bold text-slate-900">
          MapMate
        </h1>
      </div>

      {/* Search */}
      <div className="w-[420px]">
        <Input placeholder="Search places..." />
      </div>

      {/* Profile */}
      <button className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white hover:bg-blue-700 transition">
        D
      </button>
    </header>
  );
}