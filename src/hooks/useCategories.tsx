// hooks/useCategories.ts
import { useCallback } from "react";
import { useBreadcrumb } from "@/context/BreadcrumbContext";
import type { BreadcrumbItem } from "@/context/BreadcrumbContext";

// Mock category data - replace with your actual data structure
export const categoriesData: Record<
  string,
  {
    id: string;
    name: string;
    parentId: string | null;
    path: string;
  }
> = {
  "1": {
    id: "1",
    name: "Fashion & Apparel",
    parentId: null,
    path: "/category",
  },
  "2": {
    id: "2",
    name: "Men's Fashion",
    parentId: "1",
    path: "/category/sub-category/2",
  },
  "3": {
    id: "3",
    name: "Trousers",
    parentId: "2",
    path: "/category/sub-category/3",
  },
  "4": {
    id: "4",
    name: "Casual Trousers",
    parentId: "3",
    path: "/category/sub-category/3/type",
  },
};

export const useCategories = () => {
  const { breadcrumbs, setBreadcrumbs } = useBreadcrumb();

  const getCategoryBreadcrumbs = useCallback(
    (categoryId: string): BreadcrumbItem[] => {
      const breadcrumbItems: BreadcrumbItem[] = [{ label: "Home", path: "/" }];
      let currentCategory =
        categoriesData[categoryId as keyof typeof categoriesData];

      const categoryChain: BreadcrumbItem[] = [];
      while (currentCategory) {
        categoryChain.unshift({
          label: currentCategory.name,
          path: currentCategory.path,
        });

        if (currentCategory.parentId) {
          currentCategory =
            categoriesData[
              currentCategory.parentId as keyof typeof categoriesData
            ];
        } else {
          currentCategory = null as any;
        }
      }

      return [...breadcrumbItems, ...categoryChain];
    },
    []
  );

  const setCategoryBreadcrumbs = useCallback(
    (categoryId: string) => {
      const newBreadcrumbs = getCategoryBreadcrumbs(categoryId);

      // Only update if breadcrumbs have actually changed
      const currentBreadcrumbs = breadcrumbs;

      // Check if breadcrumbs are the same
      const hasChanged = !(
        currentBreadcrumbs.length === newBreadcrumbs.length &&
        currentBreadcrumbs.every(
          (item: BreadcrumbItem, index: number) =>
            item.label === newBreadcrumbs[index]?.label &&
            item.path === newBreadcrumbs[index]?.path
        )
      );

      if (hasChanged) {
        setBreadcrumbs(newBreadcrumbs);
      }
    },
    [getCategoryBreadcrumbs, breadcrumbs, setBreadcrumbs]
  );

  const addCategoryBreadcrumb = useCallback(
    (item: BreadcrumbItem) => {
      // Check if the breadcrumb already exists to avoid duplicates
      const exists = breadcrumbs.some(
        (bc: BreadcrumbItem) => bc.label === item.label
      );
      if (exists) return;

      setBreadcrumbs([...breadcrumbs, item]);
    },
    [breadcrumbs, setBreadcrumbs]
  );

  const resetCategoryBreadcrumbs = useCallback(() => {
    setBreadcrumbs([{ label: "Home", path: "/" }]);
  }, [setBreadcrumbs]);

  return {
    breadcrumbs,
    setCategoryBreadcrumbs,
    addCategoryBreadcrumb,
    resetCategoryBreadcrumbs,
    getCategoryBreadcrumbs,
  };
};
