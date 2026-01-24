import { Card } from "./ui/card";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "./ui/skeleton";

interface HomeCategoryCardProps {
  id: string;
  image: string;
  name: string;
}

export function HomeCategoryCard({ id, image, name }: HomeCategoryCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    // ✅ Navigate to the correct route: /category/sub-category/{id}
    navigate(`/category/sub-category/${id}`);
    console.log(`Navigating to category: ${name} (ID: ${id})`);
  };

  return (
    <Card
      className="w-full max-w-[200px] mx-auto shadow-none rounded-sm bg-transparent p-0 border-none cursor-pointer group overflow-hidden"
      onClick={handleClick}
    >
      <div className="relative rounded-full overflow-hidden aspect-square">
        <div className="overflow-hidden w-full h-full">
          <img
            src={image}
            alt={name}
            className="object-cover object-center w-full h-full rounded-full transition-transform duration-300 ease-in-out group-hover:scale-105"
            onError={(e) => {
              // Fallback image if the category image fails to load
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400";
            }}
          />
        </div>
        {/* Optional overlay effect */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-full" />
      </div>
      <div className="px-2 mt-3 pb-4 transition-transform duration-300">
        <p className="line-clamp-1 text-sm sm:text-base text-center group-hover:text-primary transition-colors duration-300">
          {name}
        </p>
      </div>
    </Card>
  );
}

export function HomeCategoryCardSkeleton() {
  return (
    <div className="w-full max-w-[200px] mx-auto p-0">
      <Skeleton className="aspect-square rounded-full w-full" />
      <div className="px-2 mt-3 pb-4">
        <Skeleton className="h-4 w-3/4 mx-auto" />
      </div>
    </div>
  );
}