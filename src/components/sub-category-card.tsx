import { Card } from "./ui/card";
import { useNavigate } from "react-router-dom";
import { useCategories } from "@/hooks/useCategories";

interface Category {
    id: number;
    image: string;
    name: string;
}

export function SubCategoryCard( category: Category ) {
  const navigate = useNavigate();
  const { setCategoryBreadcrumbs } = useCategories();

  const handleClick = () => {
    // Make sure the category ID is properly passed to breadcrumbs
    setCategoryBreadcrumbs(category.id.toString());
    // Navigate to the type page for this sub-category
    navigate(`/category/sub-category/${category.id}/type`);
  };

  return (
    <Card 
      className="w-4xs shadow-none bg-transparent p-0 border-none cursor-pointer hover:opacity-90 transition-opacity"
      onClick={handleClick}
    >
      <div className="relative rounded-sm overflow-hidden w-full">
        <img
          src={category.image}
          alt={category.name}
          className="object-cover object-center w-full h-50 rounded-sm"
        />
      </div>

      <div className="px-2 -mt-3">
        <p className="line-clamp-1 text-md text-center">{category.name}</p>
      </div>
    </Card>
  );
}