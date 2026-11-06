import { useRef } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  id: string;
  value: string;
  placeholder: string;
  onValueChange: (value: string) => void;
};

export function SearchField({ id, value, placeholder, onValueChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" />
      <Input
        ref={inputRef}
        id={id}
        className="h-10 bg-card pl-9 pr-10"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        autoComplete="off"
      />
      {value.length > 0 && (
        <Button
          size="icon"
          type="button"
          variant="ghost"
          className="absolute right-1 top-1 size-8"
          aria-label="Clear search"
          onClick={() => {
            onValueChange("");
            inputRef.current?.focus({ preventScroll: true });
          }}
        >
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
}
