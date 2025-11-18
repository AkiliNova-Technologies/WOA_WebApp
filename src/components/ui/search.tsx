import * as React from "react";
import { cn } from "@/lib/utils";
import { Search as SearchIcon, X } from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  url: string;
  type?: string;
}

interface SearchProps {
  error?: string;
  results?: SearchResult[];
  onSearchChange?: (value: string) => void;
  onResultSelect?: (result: SearchResult) => void;
  isLoading?: boolean;
  maxResults?: number;
  placeholder?: string;
  value?: string;
  className?: string;
  // Basic input props
  disabled?: boolean;
  required?: boolean;
  name?: string;
}

const Search = React.forwardRef<HTMLInputElement, SearchProps>(
  ({ 
    className, 
    error, 
    results = [],
    onSearchChange,
    onResultSelect,
    isLoading = false,
    maxResults = 5,
    placeholder = "Search...",
    value = "",
    disabled,
    required,
    name,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState(value);
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    React.useEffect(() => {
      setInternalValue(value);
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);
      onSearchChange?.(newValue);
    };

    const handleResultClick = (result: SearchResult) => {
      onResultSelect?.(result);
      setIsFocused(false);
      setInternalValue(result.title);
    };

    const clearSearch = () => {
      setInternalValue("");
      onSearchChange?.("");
      inputRef.current?.focus();
    };

    const showResults = isFocused && internalValue.length > 0 && (results.length > 0 || isLoading);


    return (
      <div className="w-full relative">
        <div className="relative rounded-full">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          
          <input
            ref={inputRef}
            type="search"
            value={internalValue}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 150)}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            name={name}
            aria-invalid={!!error}
            className={cn(
              "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-11 w-full min-w-0 rounded-full border bg-transparent py-1 pr-10 pl-9 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              "focus-visible:border-ring focus-visible:ring-[#5014D0] focus-visible:ring-[1px]",
              error && "border-destructive ring-destructive/20",
              className
            )}
            {...props}
          />
          
          {internalValue.length > 0 && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {error && (
          <p className="mt-1 text-sm text-destructive flex items-start gap-1">
            <span className="h-1 w-1 rounded-full bg-destructive mt-1.5 shrink-0"></span>
            {error}
          </p>
        )}

        {/* Search Results Dropdown */}
        {showResults && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-popover shadow-lg">
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
              </div>
            ) : (
              <>
                {results.slice(0, maxResults).map((result) => (
                  <button
                    key={result.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()} // Prevent input blur
                    onClick={() => handleResultClick(result)}
                    className="w-full text-left p-3 hover:bg-accent hover:text-accent-foreground transition-colors border-b last:border-b-0"
                  >
                    <div className="font-medium text-sm">{result.title}</div>
                    {result.description && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {result.description}
                      </div>
                    )}
                    {result.type && (
                      <div className="text-xs text-primary mt-1 capitalize">
                        {result.type}
                      </div>
                    )}
                  </button>
                ))}
                
                {results.length === 0 && (
                  <div className="p-3 text-center text-sm text-muted-foreground">
                    No results found for "{internalValue}"
                  </div>
                )}
                
                {results.length > maxResults && (
                  <div className="p-3 text-center text-xs text-muted-foreground border-t">
                    Showing {maxResults} of {results.length} results
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    );
  }
);

Search.displayName = "Search";

export { Search };
export type { SearchResult };