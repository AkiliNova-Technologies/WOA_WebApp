import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface SizeManagerProps {
  sizes: string[];
  onSizesChange: (sizes: string[]) => void;
}

export function SizeInput({ sizes, onSizesChange }: SizeManagerProps) {
  const [sizeInput, setSizeInput] = useState("");

  const handleAddSize = () => {
    if (sizeInput.trim() && !sizes.includes(sizeInput.trim().toUpperCase())) {
      const newSize = sizeInput.trim().toUpperCase();
      const newSizes = [...sizes, newSize];
      onSizesChange(newSizes);
      setSizeInput("");
    }
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    const newSizes = sizes.filter(size => size !== sizeToRemove);
    onSizesChange(newSizes);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSize();
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Size</Label>
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Add attribute values"
          className="flex-1 h-11"
          value={sizeInput}
          onChange={(e) => setSizeInput(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Button 
          onClick={handleAddSize}
          disabled={!sizeInput.trim()}
          className="bg-[#CC5500] hover:bg-[#B34D00] h-11 px-8"
        >
          Add
        </Button>
      </div>
      
      {/* Display added sizes */}
      {sizes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <Badge
              key={size}
              variant="secondary"
              className="px-4 py-2 bg-muted text-foreground border-border rounded-md flex items-center gap-1 group"
            >
              {size}
              <button
                type="button"
                onClick={() => handleRemoveSize(size)}
                className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted-foreground/20 rounded-sm"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}