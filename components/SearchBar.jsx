import { Search } from "lucide-react";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Cari...",
}) {
  return (
    <div className="mb-4 w-full sm:w-96 flex items-center gap-3 border border-gray-300 rounded-full px-4 py-2 shadow-sm">
      <Search size={18} className="text-gray-500" />

      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent outline-none text-sm"
      />
    </div>
  );
}