// components/type-card.tsx
import { Card } from "./ui/card";
import { useNavigate } from "react-router-dom";
import { useCategories } from "@/hooks/useCategories";

interface Type {
  id: number;
  name: string;
}

export function TypeCard(type: Type) {
  const navigate = useNavigate();
  const { setCategoryBreadcrumbs } = useCategories();

  const handleClick = () => {
    setCategoryBreadcrumbs(type.id.toString());
    navigate(`/category/type/${type.id}/products`);
  };

  return (
    <Card
      className="w-4xs shadow-none bg-transparent p-0 border-none cursor-pointer hover:opacity-90 transition-opacity"
      onClick={handleClick}
    >
      <div className="px-2 -mt-3">
        <p className="line-clamp-1 text-md text-center">{type.name}</p>
      </div>
    </Card>
  );
}
