import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import images from "@/assets/images";
import { AreaChartComponent } from "@/components/charts/area-chart";
import { PieDonutChartComponent } from "@/components/charts/pie-chart";
import type { ChartConfig } from "@/components/ui/chart";

type DetailsTab = "overview" | "variants";
type StockStatus = "in-stock" | "limited-stock" | "out-of-stock";

interface ProductDetails {
  id: string;
  productName: string;
  productImage?: string;
  status: StockStatus;
  category: string;
  basePrice: number;
  totalWishlists: number;
  dateAdded: string;
}

interface VariantDetail {
  id: string;
  color: string;
  qtyAvailable: number;
  qtySaved: number;
  stockStatus: StockStatus;
  priceUSD: number;
}

interface VariantGroup {
  size: string;
  variants: VariantDetail[];
}

interface CountryData {
  name: string;
  value: number;
  fill: string;
}

export default function WishlistDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<DetailsTab>("overview");
  const [timeFilter, setTimeFilter] = useState("12-months");
  const [locationFilter, setLocationFilter] = useState("all-locations");
  const [countryTimeFilter, setCountryTimeFilter] = useState("12-months");

  // Mock product data
  const productDetails: ProductDetails = {
    id: id || "1",
    productName: "African made sandals",
    productImage: "/products/sandals.jpg",
    status: "in-stock",
    category: "Fashion & Apparel",
    basePrice: 20,
    totalWishlists: 150,
    dateAdded: "11/12/2025",
  };

  // Mock wishlist overview chart data
  const wishlistOverviewData = [
    { month: "Jan 11", wishlists: 65 },
    { month: "Feb 11", wishlists: 45 },
    { month: "Mar 11", wishlists: 52 },
    { month: "Apr 11", wishlists: 25 },
    { month: "May 11", wishlists: 75 },
    { month: "Jun", wishlists: 55 },
    { month: "Jul", wishlists: 52 },
    { month: "Aug", wishlists: 70 },
    { month: "Sep", wishlists: 45 },
    { month: "Oct", wishlists: 40 },
    { month: "Nov", wishlists: 20 },
    { month: "Dec", wishlists: 55 },
  ];

  const wishlistOverviewConfig = {
    wishlists: {
      label: "Wishlists",
      color: "#1B84FF",
    },
  } satisfies ChartConfig;

  // Mock saves by country data
  const savesByCountryData: CountryData[] = [
    { name: "United Kingdom", value: 35, fill: "#1B84FF" },
    { name: "Netherlands", value: 25, fill: "#FF6F1E" },
    { name: "United Arab Emirates", value: 20, fill: "#17C653" },
    { name: "Russia", value: 10, fill: "#7239EA" },
    { name: "Uganda", value: 10, fill: "#F6B100" },
  ];

  const savesByCountryConfig = {
    "united-kingdom": {
      label: "United Kingdom",
      color: "#1B84FF",
    },
    netherlands: {
      label: "Netherlands",
      color: "#FF6F1E",
    },
    "united-arab-emirates": {
      label: "United Arab Emirates",
      color: "#17C653",
    },
    russia: {
      label: "Russia",
      color: "#7239EA",
    },
    uganda: {
      label: "Uganda",
      color: "#F6B100",
    },
  } satisfies ChartConfig;

  // Mock variant data grouped by size
  const variantGroups: VariantGroup[] = [
    {
      size: "L",
      variants: [
        {
          id: "1",
          color: "Red",
          qtyAvailable: 10,
          qtySaved: 6,
          stockStatus: "in-stock",
          priceUSD: 10,
        },
        {
          id: "2",
          color: "Red",
          qtyAvailable: 5,
          qtySaved: 2,
          stockStatus: "limited-stock",
          priceUSD: 12,
        },
      ],
    },
  ];

  const handleTabClick = (tab: DetailsTab) => {
    setActiveTab(tab);
  };

  const getTabButtonClass = (tab: DetailsTab) => {
    const baseClass = "px-4 py-4 text-sm font-medium whitespace-nowrap";

    if (activeTab === tab) {
      return `${baseClass} text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white font-semibold`;
    }

    return `${baseClass} text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white`;
  };

  // Status configuration
  const statusConfig = {
    "in-stock": {
      label: "Product is in stock",
      className: "bg-green-100 text-green-700 border-green-300",
    },
    "limited-stock": {
      label: "Limited stock",
      className: "bg-yellow-100 text-yellow-700 border-yellow-300",
    },
    "out-of-stock": {
      label: "Out of stock",
      className: "bg-red-100 text-red-700 border-red-300",
    },
  } as const;

  return (
    <>
      <SiteHeader label="Wishlist Management" />
      <div className="min-h-screen px-6">
        {/* Header */}
        <div className="bg-white rounded-md mb-6 dark:bg-[#303030]">
          <div className="mx-auto px-10 py-4 flex items-center justify-between">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant={"ghost"}
                className="p-0 hover:bg-transparent"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  Back
                </span>
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className={statusConfig[productDetails.status].className}
              >
                {statusConfig[productDetails.status].label}
              </Badge>
            </div>
          </div>
        </div>

        {/* Hero Section with Cover Image */}
        <div className="relative w-full h-[380px] overflow-hidden rounded-2xl mb-6">
          <img
            src={images.Placeholder}
            alt="Cover"
            className="object-cover w-full h-full"
          />
        </div>

        {/* Content */}
        <div className="max-w-8xl -mt-32 mx-6 relative">
          <Card className="p-0 rounded-b-none border-b-0">
            <div className="p-6 rounded-lg rounded-b-none border-b-0">
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">
                  {productDetails.productName}
                </h1>
              </div>

              {/* Tab Navigation */}
              <div className="border-b border-gray-200 dark:border-gray-700 -mx-6 px-6">
                <div className="flex gap-0 overflow-x-auto">
                  <button
                    className={getTabButtonClass("overview")}
                    onClick={() => handleTabClick("overview")}
                  >
                    Overview
                  </button>
                  <button
                    className={getTabButtonClass("variants")}
                    onClick={() => handleTabClick("variants")}
                  >
                    Variants Saved
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Tab Content */}
          <div className="p-0">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6 mb-8">
                {/* Wishlist Overview Chart */}
                <Card className="p-6 rounded-t-none border-t-0">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold">
                      Wishlist Overview
                    </h2>
                    <div className="flex items-center gap-3">
                      <Select
                        value={timeFilter}
                        onValueChange={setTimeFilter}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="12 months" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12-months">12 months</SelectItem>
                          <SelectItem value="6-months">6 months</SelectItem>
                          <SelectItem value="3-months">3 months</SelectItem>
                          <SelectItem value="1-month">1 month</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={locationFilter}
                        onValueChange={setLocationFilter}
                      >
                        <SelectTrigger className="w-[160px]">
                          <SelectValue placeholder="All Locations" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all-locations">
                            All Locations
                          </SelectItem>
                          <SelectItem value="uganda">Uganda</SelectItem>
                          <SelectItem value="kenya">Kenya</SelectItem>
                          <SelectItem value="tanzania">Tanzania</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <AreaChartComponent
                    data={wishlistOverviewData}
                    config={wishlistOverviewConfig}
                    title=""
                    chartHeight="300px"
                    showYAxis={true}
                    yAxisWidth={50}
                    yAxisTickCount={5}
                  />
                </Card>

                {/* Saves by Country Chart */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold">Saves by Country</h2>
                    <Select
                      value={countryTimeFilter}
                      onValueChange={setCountryTimeFilter}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="12 months" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12-months">12 months</SelectItem>
                        <SelectItem value="6-months">6 months</SelectItem>
                        <SelectItem value="3-months">3 months</SelectItem>
                        <SelectItem value="1-month">1 month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <PieDonutChartComponent
                    data={savesByCountryData}
                    config={savesByCountryConfig}
                    title=""
                    chartHeight="350px"
                    showKey={true}
                    keyPosition="right"
                    keyOrientation="vertical"
                    keyAlignment="center"
                    keyItemGap={30}
                    innerRadius="60%"
                    outerRadius="80%"
                    className="p-0"
                  />
                </Card>
              </div>
            )}

            {/* Label Tab */}
            {activeTab === "variants" && (
              <div className="space-y-6 mb-8">
                {/* Variants Saved Section */}
                <Card className="p-6 rounded-t-none border-t-0">
                  <h2 className="text-2xl font-semibold mb-2">All Variants</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    View all variants wished for of the product
                  </p>

                  {variantGroups.map((group, index) => (
                    <div key={index} className="mb-8">
                      <h3 className="text-lg font-semibold mb-4">
                        Size {group.size}
                      </h3>

                      {/* Variant Table */}
                      <div className="overflow-x-auto border rounded-lg">
                        <table className="w-full">
                          <thead className="bg-gray-50 dark:bg-[#303030]">
                            <tr>
                              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                                Color
                              </th>
                              <th className="px-6 py-3 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                                Qty Available
                              </th>
                              <th className="px-6 py-3 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                                Qty saved
                              </th>
                              <th className="px-6 py-3 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                                Stock status
                              </th>
                              <th className="px-6 py-3 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                                Price (USD)
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-[#303030] divide-y divide-gray-200 dark:divide-gray-700">
                            {group.variants.map((variant) => (
                              <tr key={variant.id}>
                                <td className="px-6 py-4 text-sm">
                                  {variant.color}
                                </td>
                                <td className="px-6 py-4 text-sm text-center">
                                  {variant.qtyAvailable}
                                </td>
                                <td className="px-6 py-4 text-sm text-center">
                                  {variant.qtySaved}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <Badge
                                    variant="outline"
                                    className={`${
                                      statusConfig[variant.stockStatus]
                                        .className
                                    } text-xs`}
                                  >
                                    {
                                      statusConfig[variant.stockStatus].label
                                    }
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 text-sm text-center">
                                  {variant.priceUSD}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}

                  {/* More about the product link */}
                  <div className="flex justify-between items-center border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                    <span className="font-medium">More about the product</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}