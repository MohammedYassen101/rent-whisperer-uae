import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Unit } from "@/types/rent";
import { Search } from "lucide-react";

interface UnitSearchSelectProps {
  units: Unit[];
  value: string;
  onSelect: (unitId: string) => void;
  disabled?: boolean;
}

export default function UnitSearchSelect({ units, value, onSelect, disabled }: UnitSearchSelectProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedUnit = units.find((u) => u.id === value);

  const filtered = units.filter((u) =>
    u.unitNumber.toLowerCase().includes(search.toLowerCase()) ||
    u.type.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset search when value is cleared externally
  useEffect(() => {
    if (!value) setSearch("");
  }, [value]);

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder={disabled ? "Select a building first" : "Type to search unit..."}
          disabled={disabled}
          value={isOpen ? search : (selectedUnit ? `${selectedUnit.unitNumber} — ${selectedUnit.type}${selectedUnit.area ? ` (${selectedUnit.area} sqm)` : ""}` : search)}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
            if (value) onSelect("");
          }}
          onFocus={() => {
            setIsOpen(true);
            if (selectedUnit) {
              setSearch("");
            }
          }}
          className="pl-9"
        />
      </div>
      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">No units found</div>
          ) : (
            filtered.map((u) => (
              <button
                key={u.id}
                type="button"
                className={`w-full text-left px-3 py-2 text-sm hover:bg-accent/10 transition-colors cursor-pointer ${
                  u.id === value ? "bg-primary/10 font-semibold" : ""
                }`}
                onClick={() => {
                  onSelect(u.id);
                  setSearch(`${u.unitNumber} — ${u.type}${u.area ? ` (${u.area} sqm)` : ""}`);
                  setIsOpen(false);
                }}
              >
                <span className="font-medium">{u.unitNumber}</span>
                <span className="text-muted-foreground"> — {u.type}</span>
                {u.area ? <span className="text-muted-foreground"> ({u.area} sqm)</span> : null}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
