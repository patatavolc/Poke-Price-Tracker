import { Search } from "lucide-react";

export default function Input({ placeholder, type = "text", className = "" }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 text-gray-400" />
      <input
        type={type}
        placeholder={placeholder}
        className={`pl-10 pr-4 py-2 border border-ui-border rounded-full bg-card-bg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-highlight ${className}`}
      />
    </div>
  );
}
