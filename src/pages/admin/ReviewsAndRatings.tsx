import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DataTable,
  type TableAction,
  type TableField,
} from "@/components/data-table";
import { SectionCards, type CardData } from "@/components/section-cards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Search } from "@/components/ui/search";
import { ListFilter, Download, Eye } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import images from "@/assets/images";

type ReviewStatus = "open" | "cleared" | "flagged" | "closed";
type ReviewTab = "all" | "open" | "cleared" | "flagged" | "closed";
type DateRange = "last-7-days" | "last-30-days" | "all-time";

interface ReviewData {
  id: string;
  productName: string;
  variant: string;
  reviewedOn: string;
  customerName: string;
  productRating: number;
  status: ReviewStatus;
  reviewText?: string;
  orderId?: string;
  orderDate?: string;
  receivedOn?: string;
  reviewedDate?: string;
  productImage?: string;
  productSpecs?: string[];
  buyerFullName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  sellerFullName?: string;
  sellerShopName?: string;
  sellerLocation?: string;
  sellerEmail?: string;
  replies?: number;
  [key: string]: any;
}

interface ReviewStats {
  avgProductRating: number;
  lowRatedProducts: number;
  openReviews: number;
  flaggedReviews: number;
  avgRatingChange?: { trend: "up" | "down"; value: string };
  lowRatedChange?: { trend: "up" | "down"; value: string };
  openReviewsChange?: { trend: "up" | "down"; value: string };
  flaggedReviewsChange?: { trend: "up" | "down"; value: string };
}

export default function AdminReviewsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<ReviewStatus[]>([]);
  const [activeTab, setActiveTab] = useState<ReviewTab>("all");
  const [dateRange, setDateRange] = useState<DateRange>("last-7-days");

  // Mock reviews data
  const mockReviews: ReviewData[] = [
    {
      id: "1",
      productName: "African made sandals",
      variant: "L-Red",
      reviewedOn: "7 Jan 2025",
      customerName: "Alice Johnson",
      productRating: 3.0,
      status: "cleared",
      orderId: "#000001",
      orderDate: "11/12/2025",
      receivedOn: "15/12/2025",
      reviewedDate: "21/12/2025",
      reviewText:
        "Absolutely love these! Extremely comfortable right out of the box. Perfect for both casual and formal occasions.",
      productImage: "/product-images/sandals.jpg",
      productSpecs: [
        "Handcrafted from genuine African leather",
        "Durable rubber sole (recycled tire option available)",
        "Breathable open-toe design for all-day comfort",
        "Unisex sizing (EU 39-46 / US 6-12)",
        "Available in natural brown, black, and tan",
        "Slip-on style with optional adjustable strap",
        "Locally made by artisans in Uganda",
        "Lightweight and travel-friendly",
        "Ethically sourced and eco-conscious materials",
      ],
      buyerFullName: "Alice Johnson",
      buyerEmail: "alice.johnson@email.com",
      buyerPhone: "+447911123456",
      sellerFullName: "Joe Doe",
      sellerShopName: "Theatrix Shop",
      sellerLocation: "Nairobi, Kenya",
      sellerEmail: "j.doe@gmail.com",
      replies: 0,
    },
    {
      id: "2",
      productName: "Hand-crafted leather bag",
      variant: "M-Green",
      reviewedOn: "14 Feb 2025",
      customerName: "Robert Smith",
      productRating: 2.5,
      status: "open",
      orderId: "#000002",
      orderDate: "1/02/2025",
      receivedOn: "10/02/2025",
      reviewedDate: "14/02/2025",
      reviewText: "Good quality but the color was not exactly as shown in pictures.",
      buyerFullName: "Robert Smith",
      buyerEmail: "robert.smith@email.com",
      buyerPhone: "+447911123457",
      sellerFullName: "Jane Smith",
      sellerShopName: "Leather Crafts",
      sellerLocation: "Kampala, Uganda",
      sellerEmail: "jane@leathercrafts.com",
      replies: 0,
    },
    {
      id: "3",
      productName: "Eco-friendly Jewerly",
      variant: "S-Red",
      reviewedOn: "21 Mar 2025",
      customerName: "Maria Garcia",
      productRating: 4.5,
      status: "open",
      orderId: "#000003",
      orderDate: "15/03/2025",
      receivedOn: "18/03/2025",
      reviewedDate: "21/03/2025",
      reviewText: "Beautiful piece! Very elegant and well-made.",
      buyerFullName: "Maria Garcia",
      buyerEmail: "maria.garcia@email.com",
      buyerPhone: "+447911123458",
      sellerFullName: "Ahmed Ali",
      sellerShopName: "Eco Jewelry",
      sellerLocation: "Cairo, Egypt",
      sellerEmail: "ahmed@ecojewelry.com",
      replies: 0,
    },
    {
      id: "4",
      productName: "Artisan beaded necklace",
      variant: "L-Yellow",
      reviewedOn: "28 Apr 2025",
      customerName: "David Lee",
      productRating: 3.0,
      status: "closed",
      orderId: "#000004",
      orderDate: "20/04/2025",
      receivedOn: "25/04/2025",
      reviewedDate: "28/04/2025",
      reviewText: "Nice design but one bead came loose.",
      buyerFullName: "David Lee",
      buyerEmail: "david.lee@email.com",
      buyerPhone: "+447911123459",
      sellerFullName: "Mary Johnson",
      sellerShopName: "Beads & More",
      sellerLocation: "Accra, Ghana",
      sellerEmail: "mary@beadsandmore.com",
      replies: 0,
    },
    {
      id: "5",
      productName: "Handcrafted woven shirt",
      variant: "M-Black",
      reviewedOn: "5 May 2025",
      customerName: "Jessica Wong",
      productRating: 5.0,
      status: "closed",
      orderId: "#000005",
      orderDate: "28/04/2025",
      receivedOn: "2/05/2025",
      reviewedDate: "5/05/2025",
      reviewText: "Excellent quality! Will definitely order again.",
      buyerFullName: "Jessica Wong",
      buyerEmail: "jessica.wong@email.com",
      buyerPhone: "+447911123460",
      sellerFullName: "Peter Brown",
      sellerShopName: "Woven Wonders",
      sellerLocation: "Lagos, Nigeria",
      sellerEmail: "peter@wovenwonders.com",
      replies: 0,
    },
    {
      id: "6",
      productName: "Ghanian dress",
      variant: "XL-Red",
      reviewedOn: "12 Jun 2025",
      customerName: "Michael Brown",
      productRating: 2.5,
      status: "flagged",
      orderId: "#000006",
      orderDate: "5/06/2025",
      receivedOn: "9/06/2025",
      reviewedDate: "12/06/2025",
      reviewText: "Not what I expected. Quality could be better.",
      buyerFullName: "Michael Brown",
      buyerEmail: "michael.brown@email.com",
      buyerPhone: "+447911123461",
      sellerFullName: "Sarah Wilson",
      sellerShopName: "Ghana Fashion",
      sellerLocation: "Accra, Ghana",
      sellerEmail: "sarah@ghanafashion.com",
      replies: 0,
    },
  ];

  const [reviews] = useState<ReviewData[]>(mockReviews);

  // Calculate statistics
  const calculateStats = (): ReviewStats => {
    const totalRating = reviews.reduce((sum, r) => sum + r.productRating, 0);
    const avgProductRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    const lowRatedProducts = reviews.filter((r) => r.productRating < 3).length;
    const openReviews = reviews.filter((r) => r.status === "open").length;
    const flaggedReviews = reviews.filter((r) => r.status === "flagged").length;

    return {
      avgProductRating,
      lowRatedProducts,
      openReviews,
      flaggedReviews,
      avgRatingChange: { trend: "up", value: "10%" },
      lowRatedChange: { trend: "down", value: "10%" },
      openReviewsChange: { trend: "up", value: "5%" },
      flaggedReviewsChange: { trend: "up", value: "10%" },
    };
  };

  const stats = calculateStats();

  // Filter reviews based on tab, search, and status filters
  const filteredReviews = reviews.filter((review) => {
    // Tab filtering
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "open" && review.status === "open") ||
      (activeTab === "cleared" && review.status === "cleared") ||
      (activeTab === "flagged" && review.status === "flagged") ||
      (activeTab === "closed" && review.status === "closed");

    // Search filtering
    const matchesSearch =
      searchQuery === "" ||
      review.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.variant.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter (additional to tab filter)
    const matchesStatus =
      selectedStatuses.length === 0 || selectedStatuses.includes(review.status);

    return matchesTab && matchesSearch && matchesStatus;
  });

  const handleStatusFilterChange = (status: ReviewStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const handleTabClick = (tab: ReviewTab) => {
    setActiveTab(tab);
    if (tab !== "all") {
      setSelectedStatuses([]);
    }
  };

  const getTabButtonClass = (tab: ReviewTab) => {
    const baseClass = "px-4 py-4 text-sm font-medium whitespace-nowrap";

    if (activeTab === tab) {
      return `${baseClass} text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white font-semibold`;
    }

    return `${baseClass} text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white`;
  };

  const clearAllFilters = () => {
    setSelectedStatuses([]);
    setSearchQuery("");
  };

  // Review cards
  const reviewCards: CardData[] = [
    {
      title: "Avg. Product Rating",
      value: stats.avgProductRating.toFixed(1),
      change: stats.avgRatingChange && {
        trend: stats.avgRatingChange.trend,
        value: stats.avgRatingChange.value,
        description: "",
      },
    },
    {
      title: "Low rated products",
      value: stats.lowRatedProducts.toString(),
      change: stats.lowRatedChange && {
        trend: stats.lowRatedChange.trend,
        value: stats.lowRatedChange.value,
        description: "",
      },
    },
    {
      title: "Open Reviews",
      value: stats.openReviews.toString(),
      change: stats.openReviewsChange && {
        trend: stats.openReviewsChange.trend,
        value: stats.openReviewsChange.value,
        description: "",
      },
    },
    {
      title: "Flagged Reviews",
      value: stats.flaggedReviews.toString(),
      change: stats.flaggedReviewsChange && {
        trend: stats.flaggedReviewsChange.trend,
        value: stats.flaggedReviewsChange.value,
        description: "",
      },
    },
  ];

  // Status options for filter
  const statusOptions: { value: ReviewStatus; label: string }[] = [
    { value: "open", label: "Open" },
    { value: "cleared", label: "Cleared" },
    { value: "flagged", label: "Flagged" },
    { value: "closed", label: "Closed" },
  ];

  // Status configuration
  const statusConfig = {
    open: {
      label: "Open",
      className: "bg-yellow-100 text-yellow-700 border-yellow-300",
    },
    cleared: {
      label: "Cleared",
      className: "bg-green-100 text-green-700 border-green-300",
    },
    flagged: {
      label: "Flagged",
      className: "bg-red-100 text-red-700 border-red-300",
    },
    closed: {
      label: "Closed",
      className: "bg-blue-100 text-blue-700 border-blue-300",
    },
  } as const;

  // Table fields
  const reviewFields: TableField<ReviewData>[] = [
    {
      key: "productName",
      header: "Product name",
      cell: (value) => <span className="font-semibold">{value as string}</span>,
    },
    {
      key: "variant",
      header: "Variant",
      cell: (value) => <span>{value as string}</span>,
      align: "center",
    },
    {
      key: "reviewedOn",
      header: "Reviewed on",
      cell: (value) => <span>{value as string}</span>,
      align: "center",
    },
    {
      key: "customerName",
      header: "Customer name",
      cell: (value) => <span>{value as string}</span>,
      align: "center",
    },
    {
      key: "productRating",
      header: "Product rating",
      cell: (value) => <span>{value as number}</span>,
      align: "center",
    },
    {
      key: "status",
      header: "Status",
      cell: (_, row) => {
        const config = statusConfig[row.status];
        return (
          <Badge variant="outline" className={`${config.className} font-medium`}>
            {config.label}
          </Badge>
        );
      },
      align: "center",
      enableSorting: true,
    },
  ];

  const reviewActions: TableAction<ReviewData>[] = [
    {
      type: "custom",
      label: "View Details",
      icon: <Eye className="size-5" />,
      onClick: (review) => {
        navigate(`/admin/support/reviews/${review.id}/details`);
      },
    },
  ];

  // Empty state
  const EmptyState = () => (
    <div className="flex flex-col items-center text-center py-12">
      <div className="mb-6">
        <img src={images.EmptyFallback} alt="No reviews" className="w-80" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No Reviews</h3>
    </div>
  );

  return (
    <>
      <SiteHeader />
      <div className="min-h-screen">
        <main className="flex-1">
          <div className="space-y-6 p-6">
            <SectionCards cards={reviewCards} layout="1x4" />

            <div className="space-y-6">
              {/* Reviews Section */}
              <div className="rounded-lg border bg-white dark:bg-[#303030]">
                {/* Header */}
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h2 className="text-2xl font-bold">All reviews and ratings</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        Manage and monitor reviews and ratings on the platform.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Search and Filters */}
                <div className="p-6 border-b flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="w-full sm:w-96">
                    <Search
                      placeholder="Search"
                      value={searchQuery}
                      onSearchChange={setSearchQuery}
                      className="rounded-md"
                    />
                  </div>

                  <div className="flex flex-row items-center gap-3">
                    <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#404040]">
                      <button
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                          dateRange === "last-7-days"
                            ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-[#505050]"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#484848]"
                        } rounded-l-lg`}
                        onClick={() => setDateRange("last-7-days")}
                      >
                        Last 7 days
                      </button>
                      <button
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                          dateRange === "last-30-days"
                            ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-[#505050]"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#484848]"
                        }`}
                        onClick={() => setDateRange("last-30-days")}
                      >
                        Last 30 days
                      </button>
                      <button
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                          dateRange === "all-time"
                            ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-[#505050]"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#484848]"
                        } rounded-r-lg`}
                        onClick={() => setDateRange("all-time")}
                      >
                        All time
                      </button>
                    </div>

                    {/* Filter Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                          <ListFilter className="w-4 h-4" />
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
                            onCheckedChange={() => handleStatusFilterChange(status.value)}
                          >
                            {status.label}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Export Button */}
                    <Button variant="outline" className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Export
                    </Button>

                    {/* Clear Filters */}
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

                {/* Tab Navigation */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <div className="flex gap-0 px-6 overflow-x-auto">
                    <button
                      className={getTabButtonClass("all")}
                      onClick={() => handleTabClick("all")}
                    >
                      All ratings
                    </button>
                    <button
                      className={getTabButtonClass("open")}
                      onClick={() => handleTabClick("open")}
                    >
                      Open
                    </button>
                    <button
                      className={getTabButtonClass("cleared")}
                      onClick={() => handleTabClick("cleared")}
                    >
                      Cleared
                    </button>
                    <button
                      className={getTabButtonClass("flagged")}
                      onClick={() => handleTabClick("flagged")}
                    >
                      Flagged
                    </button>
                    <button
                      className={getTabButtonClass("closed")}
                      onClick={() => handleTabClick("closed")}
                    >
                      Closed
                    </button>
                  </div>
                </div>

                {/* Reviews Table/Empty State */}
                <div className="px-6 pb-6">
                  {filteredReviews.length > 0 ? (
                    <DataTable<ReviewData>
                      data={filteredReviews}
                      fields={reviewFields}
                      actions={reviewActions}
                      enableSelection={true}
                      enablePagination={true}
                      pageSize={10}
                    />
                  ) : (
                    <EmptyState />
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}