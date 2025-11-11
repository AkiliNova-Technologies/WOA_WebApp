import * as React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, Clock, TrendingUp, Sparkles, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

interface Suggestion {
  id: string;
  text: string;
  type: "product" | "category" | "brand" | "recent" | "trending";
  category?: string;
  image?: string;
  count?: number;
}

interface SearchInputProps
  extends Omit<React.ComponentProps<"input">, "onChange" | "value"> {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (query: string) => void;
  suggestions?: Suggestion[];
  isLoading?: boolean;
  maxSuggestions?: number;
  className?: string;
  showRecentSearches?: boolean;
  showTrendingSearches?: boolean;
}

function SearchInput({
  className,
  value = "",
  onChange,
  onSearch,
  suggestions = [],
  isLoading = false,
  maxSuggestions = 8,
  showRecentSearches = true,
  showTrendingSearches = true,
  ...props
}: SearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync local value with external value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("ecommerce-recent-searches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      } catch {
        setRecentSearches([]);
      }
    }
  }, []);

  // Save recent search
  const saveRecentSearch = useCallback(
    (query: string) => {
      if (!query.trim()) return;

      const updated = [
        query,
        ...recentSearches.filter((s) => s !== query),
      ].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem(
        "ecommerce-recent-searches",
        JSON.stringify(updated)
      );
    },
    [recentSearches]
  );

  // Handle input change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      onChange?.(newValue);
    },
    [onChange]
  );

  // Handle search submission
  const handleSearch = useCallback(
    (query: string = localValue) => {
      const trimmedQuery = query.trim();
      if (trimmedQuery) {
        saveRecentSearch(trimmedQuery);
        onSearch?.(trimmedQuery);
        setIsFocused(false);
      }
    },
    [localValue, onSearch, saveRecentSearch]
  );

  // Handle key events
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSearch();
      } else if (e.key === "Escape") {
        setIsFocused(false);
        inputRef.current?.blur();
      }
    },
    [handleSearch]
  );

  // Handle suggestion click
  const handleSuggestionClick = useCallback(
    (suggestion: Suggestion) => {
      const searchText = suggestion.text;
      setLocalValue(searchText);
      onChange?.(searchText);
      handleSearch(searchText);
    },
    [onChange, handleSearch]
  );

  // Handle recent search click
  const handleRecentSearchClick = useCallback(
    (search: string) => {
      setLocalValue(search);
      onChange?.(search);
      handleSearch(search);
    },
    [onChange, handleSearch]
  );

  // Clear recent searches
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem("ecommerce-recent-searches");
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current !== event.target
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter and group suggestions
  const filteredSuggestions = suggestions
    .filter(
      (suggestion) =>
        suggestion.text.toLowerCase().includes(localValue.toLowerCase()) ||
        localValue.toLowerCase().includes(suggestion.text.toLowerCase())
    )
    .slice(0, maxSuggestions);

  const hasSuggestions = filteredSuggestions.length > 0;
  const hasRecentSearches =
    showRecentSearches && recentSearches.length > 0 && !localValue;
  const showDropdown =
    isFocused && (hasSuggestions || hasRecentSearches || localValue);

  // Group suggestions by type
  const suggestionsByType = filteredSuggestions.reduce((acc, suggestion) => {
    if (!acc[suggestion.type]) {
      acc[suggestion.type] = [];
    }
    acc[suggestion.type].push(suggestion);
    return acc;
  }, {} as Record<string, Suggestion[]>);

  const getSuggestionIcon = (type: Suggestion["type"]) => {
    switch (type) {
      case "product":
        return <Sparkles className="h-4 w-4" />;
      case "category":
        return <div className="h-2 w-2 rounded-full bg-blue-500" />;
      case "brand":
        return <div className="h-2 w-2 rounded-full bg-green-500" />;
      case "recent":
        return <Clock className="h-4 w-4" />;
      case "trending":
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: Suggestion["type"]) => {
    switch (type) {
      case "product":
        return "Products";
      case "category":
        return "Categories";
      case "brand":
        return "Brands";
      case "recent":
        return "Recent Searches";
      case "trending":
        return "Trending";
      default:
        return "Suggestions";
    }
  };

  return (
    <div className="flex-1 max-w-3xl mx-8 flex relative">
      <div className="flex w-full rounded-full overflow-hidden shadow-sm bg-white dark:bg-gray-900">
        <button
          onClick={() => handleSearch()}
          className="bg-[#C75A00] px-8 flex items-center justify-center hover:bg-[#B35200] transition-colors"
          aria-label="Search"
        >
          <Search className="text-white h-5 w-5" />
        </button>
        <input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          placeholder="Search for products, brands, and categories..."
          data-slot="input"
          className={cn(
            "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 h-11 w-full min-w-0 rounded-none bg-transparent px-4 py-2 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            className
          )}
          {...props}
        />
        {localValue && (
          <button
            onClick={() => {
              setLocalValue("");
              onChange?.("");
              inputRef.current?.focus();
            }}
            className="px-3 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {/* Recent Searches */}
          {hasRecentSearches && (
            <div className="p-2 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Recent Searches
                </span>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  Clear all
                </button>
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearchClick(search)}
                  className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-md"
                >
                  <Clock className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {search}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {hasSuggestions && (
            <div className="p-2">
              {Object.entries(suggestionsByType).map(
                ([type, typeSuggestions]) => (
                  <div key={type} className="mb-2">
                    <div className="px-3 py-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {getTypeLabel(type as Suggestion["type"])}
                      </span>
                    </div>
                    {typeSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-md"
                      >
                        <div className="flex items-center justify-center w-5 h-5 mr-3">
                          {getSuggestionIcon(suggestion.type)}
                        </div>
                        <div className="flex flex-1 text-left flex-row">
                          <div>
                            <div className="text-gray-700 dark:text-gray-300">
                              {suggestion.text}
                            </div>
                            {suggestion.category && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                in {suggestion.category}
                              </div>
                            )}
                          </div>
                          {suggestion.count && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {suggestion.count} products
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )
              )}
            </div>
          )}

          {/* No Results */}
          {localValue && !hasSuggestions && !isLoading && (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No results found for "{localValue}"
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="p-4 text-center">
              {/* <div className="inline-block  border-b-2 border-[#C75A00]"></div> */}
              <Loader2 className="inline-block animate-spin h-6 w-6 text-[#C75A00]" />
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                Searching...
              </span>
            </div>
          )}

          {/* Quick Search Tips */}
          {!hasSuggestions && !hasRecentSearches && !localValue && (
            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <div>💡 Try searching for specific products or brands</div>
                <div>🔍 Use categories to narrow your search</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { SearchInput };
export type { Suggestion, SearchInputProps };
