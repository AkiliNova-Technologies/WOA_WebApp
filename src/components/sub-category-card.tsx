import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubCategory {
  id: string;
  name: string;
  image: string;
}

interface SubCategoryCardProps {
  subCategory: SubCategory;
  onRemove: (id: string) => void;
}

export function SubCategoryCard({ subCategory, onRemove }: SubCategoryCardProps) {
  return (
    <div className="border rounded-lg overflow-hidden group hover:shadow-md transition-shadow">
      <div className="relative h-40 bg-gray-100">
        <img
          src={subCategory.image}
          alt={subCategory.name}
          className="w-full h-full object-cover"
        />
        
        {/* Desktop hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 hidden sm:flex items-center justify-center">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onRemove(subCategory.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <X className="size-4 mr-1" />
            Remove
          </Button>
        </div>
        
        {/* Mobile remove button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onRemove(subCategory.id)}
          className="absolute top-2 right-2 sm:hidden bg-white/90 backdrop-blur-sm"
        >
          <X className="size-4" />
        </Button>
      </div>
      
      <div className="p-3">
        <p className="font-medium text-center">{subCategory.name}</p>
      </div>
    </div>
  );
}