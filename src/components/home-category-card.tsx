import { Card } from "./ui/card";
import { useNavigate } from "react-router-dom";
import { useCategories } from "@/hooks/useCategories";

interface Category {
    id: number;
    image: string;
    name: string;
}

export function HomeCategoryCard( category: Category ) {
  const navigate = useNavigate();
  const { setCategoryBreadcrumbs } = useCategories();

  const handleClick = () => {
    setCategoryBreadcrumbs(category.id.toString());
    navigate(`/category/sub-category/${category.id}`);
  };

  return (
    <Card 
      className="w-50 shadow-none rounded-sm bg-transparent p-0 border-none cursor-pointer group overflow-hidden"
      onClick={handleClick}
    >
      <div className="relative rounded-full overflow-hidden w-50">
        <div className="overflow-hidden">
          <img
            src={category.image}
            alt={category.name}
            className="object-cover object-center w-50 h-50 rounded-full transition-transform duration-300 ease-in-out group-hover:scale-105"
          />
        </div>
        
        {/* Optional overlay effect */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-sm" />
      </div>

      <div className="px-2 -mt-3 pb-4 transition-transform duration-300">
        <p className="line-clamp-1 text-md text-center group-hover:text-primary transition-colors duration-300">
          {category.name}
        </p>
      </div>
    </Card>
  );
}