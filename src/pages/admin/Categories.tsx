import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DataTable,
  type TableAction,
  type TableField,
} from "@/components/data-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { FilterIcon, Plus } from "lucide-react";
import { PenIcon, Trash2Icon } from "lucide-react";
import { Search } from "@/components/ui/search";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data type for categories - replace with your actual type
interface Category {
  id: string;
  name: string;
  image: string;
  attributeCount: number;
  subCategoryCount: number;
  productCount: number;
  lastModified: string;
  status: "active" | "draft" | "deleted";
  [key: string]: any;
}

type CategoryStatus = "active" | "draft" | "deleted";

// Mock data - replace with your actual data source
const mockCategories: Category[] = [
  {
    id: "1",
    name: "Electronics",
    image: "/images/electronics.jpg",
    attributeCount: 5,
    subCategoryCount: 8,
    productCount: 120,
    lastModified: "2024-01-15",
    status: "active",
  },
  {
    id: "2",
    name: "Clothing",
    image: "/images/clothing.jpg",
    attributeCount: 3,
    subCategoryCount: 12,
    productCount: 85,
    lastModified: "2024-01-10",
    status: "active",
  },
  {
    id: "3",
    name: "Home & Garden",
    image: "/images/home-garden.jpg",
    attributeCount: 4,
    subCategoryCount: 6,
    productCount: 45,
    lastModified: "2024-01-12",
    status: "draft",
  },
  {
    id: "4",
    name: "Sports",
    image: "/images/sports.jpg",
    attributeCount: 2,
    subCategoryCount: 4,
    productCount: 67,
    lastModified: "2024-01-08",
    status: "deleted",
  },
];

export default function AdminCategoriesPage() {
  const navigate = useNavigate();
  const [categories] = useState<Category[]>(mockCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<CategoryStatus[]>([]);

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const statusOptions: { value: CategoryStatus; label: string }[] = [
    { value: "active", label: "Active" },
    { value: "draft", label: "Draft" },
    { value: "deleted", label: "Deleted" },
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
  };

  // Filter categories based on search and status filters
  const filteredCategories = categories.filter((category) => {
    const matchesSearch =
      searchQuery === "" ||
      category.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus =
      selectedStatuses.length === 0 ||
      selectedStatuses.includes(category.status);

    return matchesSearch && matchesStatus;
  });

  // Table fields for categories
  const categoryFields: TableField<Category>[] = [
    {
      key: "name",
      header: "Category Name",
      cell: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="aspect-square h-16 w-16 rounded-sm">
            <AvatarImage src={row.image} alt={row.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium rounded-sm">
              {getInitials(row.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-md">{row.name}</span>
          </div>
        </div>
      ),
      align: "left",
    },
    {
      key: "attributeCount",
      header: "Attribute Count",
      cell: (value) => <span className="font-medium">{value as number}</span>,
      align: "center",
      enableSorting: true,
    },
    {
      key: "subCategoryCount",
      header: "Sub Category Count",
      cell: (value) => <span className="font-medium">{value as number}</span>,
      align: "center",
      enableSorting: true,
    },
    {
      key: "productCount",
      header: "Product Count",
      cell: (value) => <span className="font-medium">{value as number}</span>,
      align: "center",
      enableSorting: true,
    },
    {
      key: "lastModified",
      header: "Last Modified",
      cell: (value) => (
        <span className="font-medium">{formatDate(value as string)}</span>
      ),
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
            dotColor: "bg-green-500",
            textColor: "text-green-700",
            bgColor: "bg-green-50",
          },
          draft: {
            label: "Draft",
            dotColor: "bg-yellow-500",
            textColor: "text-yellow-700",
            bgColor: "bg-yellow-50",
          },
          deleted: {
            label: "Deleted",
            dotColor: "bg-red-500",
            textColor: "text-red-700",
            bgColor: "bg-red-50",
          },
        };

        const config =
          statusConfig[value as keyof typeof statusConfig] ||
          statusConfig.draft;

        return (
          <Badge
            variant="outline"
            className="flex flex-row items-center py-2 w-24 gap-2 bg-muted/50"
          >
            <div className={`size-2 rounded-full ${config.dotColor}`} />
            {config.label}
          </Badge>
        );
      },
      align: "center",
      enableSorting: true,
    },
  ];

  const categoryActions: TableAction<Category>[] = [
    {
      type: "edit",
      label: "Edit Category",
      icon: <PenIcon className="size-5" />,
      onClick: (category) => {
        navigate(`/admin/categories/${category.id}/edit`);
      },
    },
    {
      type: "delete",
      label: "Delete Category",
      icon: <Trash2Icon className="size-5" />,
      onClick: (category) => {
        // Implement delete logic here
        console.log("Delete category:", category.id);
      },
    },
  ];

  return (
    <div className="min-h-screen">
      <SiteHeader
        label="Category Management"
        rightActions={
          <Button
            variant="secondary"
            className="h-11 bg-[#CC5500] text-white gap-2 hover:bg-[#CC5500]/90"
            onClick={() => navigate("/admin/categories/create-category")}
          >
            <Plus /> Create Category
          </Button>
        }
      />
      <div className="p-6">
        <div className="bg-white p-6 rounded-lg dark:bg-[#303030]">
          {/* Search and Filter Section */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-2">
            <div className="w-full sm:w-auto sm:flex-1">
              <Search
                placeholder="Search categories by name..."
                value={searchQuery}
                onSearchChange={setSearchQuery}
                className="rounded-full"
              />
            </div>

            <div className="flex flex-row items-center gap-4 w-full sm:w-auto">
              <div className="flex gap-2 items-center">
                {/* Status Filter Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 h-10"
                    >
                      <FilterIcon className="w-4 h-4" />
                      Status
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

                {/* Clear Filters Button */}
                {(selectedStatuses.length > 0 || searchQuery) && (
                  <Button
                    variant="ghost"
                    onClick={clearAllFilters}
                    className="text-sm"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div>
            <DataTable<Category>
              data={filteredCategories}
              fields={categoryFields}
              actions={categoryActions}
              enableSelection={true}
              enablePagination={true}
              pageSize={10}
            />
          </div>
        </div>
      </div>
    </div>
  );
}