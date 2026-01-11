import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  DataTable,
  type TableAction,
  type TableField,
} from "@/components/data-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { Filter, Plus, Download } from "lucide-react";
import { PenIcon, Trash2Icon } from "lucide-react";
import { Search } from "@/components/ui/search";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SectionCards, type CardData } from "@/components/section-cards";
import { useReduxCategories } from "@/hooks/useReduxCategories";
import type { Category as ReduxCategory } from "@/redux/slices/categoriesSlice";
import images from "@/assets/images";

type CategoryStatus = "active" | "draft" | "deleted";
type TabFilter = "all" | "active" | "draft";

const mapIsActiveToStatus = (isActive: boolean): CategoryStatus => {
  return isActive ? "active" : "draft";
};

interface TransformedCategory {
  id: string;
  name: string;
  status: CategoryStatus;
  productsListed: number;
  orderCount: number;
  wishlistCount: number;
  subCategoryCount: number;
  isActive: boolean;
  [key: string]: any; 
}

export default function AdminCategoriesPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<CategoryStatus[]>([]);
  const [activeTab, setActiveTab] = useState<TabFilter>("all");

  const {
    categories,
    getAdminCategories,
    removeCategory,
  } = useReduxCategories();

  useEffect(() => {
    getAdminCategories();
  }, [getAdminCategories]);

  const statusOptions: { value: CategoryStatus; label: string }[] = [
    { value: "active", label: "Active" },
    { value: "draft", label: "Draft" },
  ];

  const handleStatusFilterChange = (status: CategoryStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const clearAllFilters = () => {
    setSelectedStatuses([]);
    setSearchQuery("");
    setActiveTab("all");
  };

  const transformCategoryForTable = (category: ReduxCategory): TransformedCategory => ({
    ...category,
    status: mapIsActiveToStatus(category.isActive),
    productsListed: 0,
    orderCount: 0, 
    wishlistCount: 0, 
    subCategoryCount: category.subcategories?.length || 0,
  });

  const tableCategories: TransformedCategory[] = categories.map(transformCategoryForTable);

  
  const filteredCategories = tableCategories.filter((category) => {
   
    const matchesSearch =
      searchQuery === "" ||
      category.name.toLowerCase().includes(searchQuery.toLowerCase());

    
    const matchesStatusFilter =
      selectedStatuses.length === 0 ||
      selectedStatuses.includes(category.status);

   
    const matchesTabFilter = 
      activeTab === "all" ||
      (activeTab === "active" && category.isActive) ||
      (activeTab === "draft" && !category.isActive);

    return matchesSearch && matchesStatusFilter && matchesTabFilter;
  });

  // Calculate statistics for cards
  const activeCategories = categories.filter(cat => cat.isActive).length;
  // const draftCategories = categories.filter(cat => !cat.isActive).length;
  

  const totalProducts = tableCategories.reduce((sum, cat) => sum + cat.productsListed, 0);
  
  const avgProductsPerCategory = activeCategories > 0 
    ? Math.round(totalProducts / activeCategories).toString()
    : "0";
    
  const totalSubcategories = tableCategories.reduce((sum, cat) => sum + cat.subCategoryCount, 0);
  const avgSubcategoryDepth = activeCategories > 0 
    ? Math.round(totalSubcategories / activeCategories).toString()
    : "0";

  const statsCards: CardData[] = [
    {
      title: "Total active categories",
      value: activeCategories.toString(),
      change: {
        value: "10%",
        trend: "up",
        description: "",
      },
    },
    {
      title: "Avg. products per category",
      value: avgProductsPerCategory,
      change: {
        value: "5%",
        trend: "down",
        description: "",
      },
    },
    {
      title: "Avg. sub category depth",
      value: avgSubcategoryDepth,
      change: {
        value: "5%",
        trend: "down",
        description: "",
      },
    },
  ];

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await removeCategory(categoryId);
        console.log("Category deleted successfully");
      } catch (error) {
        console.error("Failed to delete category:", error);
      }
    }
  };

  const categoryFields: TableField<TransformedCategory>[] = [
    {
      key: "name",
      header: "Category name",
      cell: (_, row) => (
        <div className="flex items-center gap-3">
          <span className="font-medium text-md">{row.name}</span>
        </div>
      ),
      align: "left",
    },
    {
      key: "productsListed",
      header: "Products listed",
      cell: (value) => <span className="font-medium">{value as number}</span>,
      align: "center",
      enableSorting: true,
    },
    {
      key: "orderCount",
      header: "Order count",
      cell: (value) => <span className="font-medium">{value as number}</span>,
      align: "center",
      enableSorting: true,
    },
    {
      key: "wishlistCount",
      header: "Wishlist count",
      cell: (value) => <span className="font-medium">{value as number}</span>,
      align: "center",
      enableSorting: true,
    },
    {
      key: "subCategoryCount",
      header: "Sub category count",
      cell: (value) => <span className="font-medium">{value as number}</span>,
      align: "center",
      enableSorting: true,
    },
    {
      key: "status",
      header: "Status",
      cell: (value) => {
        const statusConfig = {
          active: {
            label: "Active",
            className: "bg-teal-50 text-teal-700 border-teal-200",
          },
          draft: {
            label: "Draft",
            className: "bg-gray-100 text-gray-700 border-gray-300",
          },
          archived: {
            label: "Archived",
            className: "bg-gray-100 text-gray-600 border-gray-300",
          },
        };

        const config =
          statusConfig[value as keyof typeof statusConfig] ||
          statusConfig.draft;

        return (
          <Badge
            variant="outline"
            className={`${config.className} font-medium`}
          >
            {config.label}
          </Badge>
        );
      },
      align: "center",
      enableSorting: true,
    },
  ];

  const categoryActions: TableAction<TransformedCategory>[] = [
    {
      type: "edit",
      label: "Edit Category",
      icon: <PenIcon className="size-5" />,
      onClick: (category) => {
        navigate(`/admin/products/categories/${category.id}/edit`);
      },
    },
    {
      type: "delete",
      label: "Delete Category",
      icon: <Trash2Icon className="size-5" />,
      onClick: (category) => {
        handleDeleteCategory(category.id);
      },
    },
  ];

  const handleTabClick = (tab: TabFilter) => {
    setActiveTab(tab);
    // Clear status filters when switching tabs (optional)
    if (tab !== "all") {
      setSelectedStatuses([]);
    }
  };

  const getTabButtonClass = (tab: TabFilter) => {
    const baseClass = "px-4 py-4 text-sm font-medium whitespace-nowrap";
    
    if (activeTab === tab) {
      return `${baseClass} text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white font-semibold`;
    }
    
    return `${baseClass} text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a]">
      <SiteHeader
        label="Category Management"
      />
      <div className="p-6 space-y-6">
        <SectionCards cards={statsCards} layout="1x3" />

        <div className="bg-white rounded-lg border border-gray-200 dark:bg-[#303030] dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">All Categories</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Manage and monitor all categories on the platform
                </p>
              </div>
              <Button
                className="bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-gray-100 gap-2"
                onClick={() => navigate("/admin/categories/create-category")}
              >
                <Plus className="w-4 h-4" /> Create Category
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="w-full sm:w-96">
                <Search
                  placeholder="Search"
                  value={searchQuery}
                  onSearchChange={setSearchQuery}
                  className="h-10"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#404040]">
                  <button className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-[#505050] rounded-l-lg">
                    Last 7 days
                  </button>
                  <button className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#484848]">
                    Last 30 days
                  </button>
                  <button className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#484848] rounded-r-lg">
                    All time
                  </button>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 h-10"
                    >
                      <Filter className="w-4 h-4" />
                      Filter
                      {selectedStatuses.length > 0 && (
                        <Badge variant="secondary" className="ml-1">
                          {selectedStatuses.length}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {statusOptions.map((status) => (
                      <DropdownMenuCheckboxItem
                        key={status.value}
                        checked={selectedStatuses.includes(status.value)}
                        onCheckedChange={() =>
                          handleStatusFilterChange(status.value)
                        }
                      >
                        {status.label}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="outline" className="gap-2 h-10">
                  <Download className="w-4 h-4" />
                  Export
                </Button>

                {(selectedStatuses.length > 0 || searchQuery || activeTab !== "all") && (
                  <Button
                    variant="ghost"
                    onClick={clearAllFilters}
                    className="text-sm h-10"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-0 px-6 overflow-x-auto">
              <button 
                className={getTabButtonClass("all")}
                onClick={() => handleTabClick("all")}
              >
                All Categories
              </button>
              <button 
                className={getTabButtonClass("active")}
                onClick={() => handleTabClick("active")}
              >
                Active
              </button>
              <button 
                className={getTabButtonClass("draft")}
                onClick={() => handleTabClick("draft")}
              >
                Drafts
              </button>
            </div>
          </div>

          <div className="p-6">
            {filteredCategories.length === 0 ? (
              <div className="flex flex-col items-center text-center py-12">
                <img src={images.EmptyFallback} alt="" className="h-60 mb-6"/>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Categories Found
                </h3>
              </div>
            ) : (
              <DataTable<TransformedCategory>
                data={filteredCategories}
                fields={categoryFields}
                actions={categoryActions}
                enableSelection={true}
                enablePagination={true}
                pageSize={10}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}