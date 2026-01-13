import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Pencil, ExternalLink } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import images from "@/assets/images";

type DetailsTab = "overview" | "product-details";
type StockStatus = "in-stock" | "limited-stock" | "out-of-stock";

interface ProductDetails {
  id: string;
  productName: string;
  size: string;
  color: string;
  status: StockStatus;
  addedOn: string;
  lastRestock: string;
  category: string;
  basePrice: number;
  productImage?: string;
}

interface VariantDetail {
  id: string;
  size: string;
  color: string;
  qtyAvailable: number;
  lowStockUnit: number;
  priceUSD: number;
}

export default function VendorInventoryDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<DetailsTab>("product-details");

  // Mock product data
  const productDetails: ProductDetails = {
    id: id || "1",
    productName: "African made sandals",
    size: "XL",
    color: "Red",
    status: "limited-stock",
    addedOn: "11/12/2025",
    lastRestock: "21/12/2025",
    category: "Fashion & Apparel",
    basePrice: 20,
    productImage: "/products/sandals.jpg",
  };

  // Mock variant data
  const variants: VariantDetail[] = [
    {
      id: "1",
      size: "XL",
      color: "Red",
      qtyAvailable: 1,
      lowStockUnit: 2,
      priceUSD: 20,
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
      label: "In stock",
      className: "bg-green-100 text-green-700 border-green-300",
    },
    "limited-stock": {
      label: "Limited status",
      className: "bg-yellow-100 text-yellow-700 border-yellow-300",
    },
    "out-of-stock": {
      label: "Out of stock",
      className: "bg-red-100 text-red-700 border-red-300",
    },
  } as const;

  return (
    <>
      <SiteHeader label="Inventory Management" />
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
                <p className="text-gray-600 dark:text-gray-400">
                  Size: {productDetails.size} • Color: {productDetails.color}
                </p>
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
                    className={getTabButtonClass("product-details")}
                    onClick={() => handleTabClick("product-details")}
                  >
                    Product Details
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Tab Content */}
          <div className="p-0">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <Card className="px-6 pb-6 rounded-t-none border-t-0">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Item - 1</h2>
                  {/* Add overview content here */}
                </div>
              </Card>
            )}

            {/* Product Details Tab */}
            {activeTab === "product-details" && (
              <div className="space-y-6 mb-8">
                {/* History Section */}
                <Card className="p-6 rounded-t-none border-t-0">
                  <h2 className="text-2xl font-semibold mb-6">History</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Added on
                      </p>
                      <p className="text-lg font-semibold">
                        {productDetails.addedOn}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Last restock
                      </p>
                      <p className="text-lg font-semibold">
                        {productDetails.lastRestock}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Variant Details Section */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold">Variant details</h2>
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-black text-white hover:bg-black/90"
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>

                  {/* Variant Table */}
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-[#303030]">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                            Size
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                            Color
                          </th>
                          <th className="px-6 py-3 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                            QTY available
                          </th>
                          <th className="px-6 py-3 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                            Low stock unit
                          </th>
                          <th className="px-6 py-3 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                            Price (USD)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-[#303030] divide-y divide-gray-200 dark:divide-gray-700">
                        {variants.map((variant) => (
                          <tr key={variant.id}>
                            <td className="px-6 py-4 text-sm">
                              {variant.size}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {variant.color}
                            </td>
                            <td className="px-6 py-4 text-sm text-center">
                              {variant.qtyAvailable}
                            </td>
                            <td className="px-6 py-4 text-sm text-center">
                              {variant.lowStockUnit}
                            </td>
                            <td className="px-6 py-4 text-sm text-center">
                              {variant.priceUSD}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-between items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                    <span className="font-medium">More about the product</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
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
