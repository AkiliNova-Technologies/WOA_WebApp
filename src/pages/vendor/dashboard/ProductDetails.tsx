import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Pencil, MoreVertical, Trash2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";

export default function VendorProductDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock product data
  const product = {
    id: "1",
    name: "African made sandals",
    status: "active" as const,
    category: "Fashion & Apparel",
    subCategory: "Women's Fashion",
    subCategoryType: "Sandals",
    description:
      "Handcrafted African sandals made with authentic local materials, blending comfort, durability, and cultural artistry. Each pair reflects traditional craftsmanship and modern style, perfect for everyday wear or special occasions.",
    images: [
      "/placeholder-product.jpg",
      "/placeholder-product-2.jpg",
      "/placeholder-product-3.jpg",
      "/placeholder-product-4.jpg",
      "/placeholder-product-5.jpg",
    ],
    story: {
      title: "How it all started.",
      text: "Handcrafted African sandals made with authentic local materials, blending comfort, durability, and cultural artistry. Each pair reflects traditional craftsmanship and modern style, perfect for everyday wear or special occasions.",
      images: ["/placeholder-story.jpg"],
      endingTitle: "How it ended",
      endingImages: ["/placeholder-ending.jpg"],
    },
    specifications: `• Handcrafted from genuine African leather
• Durable rubber sole (recycled tire option available)
• Breathable open-toe design for all-day comfort
• Unisex sizing (EU 39–46 / US 6–12)
• Available in natural brown, black, and tan
• Slip-on style with optional adjustable strap
• Locally made by artisans in Uganda
• Lightweight and travel-friendly
• Ethically sourced and eco-conscious materials`,
    careInstructions: `• Keep dry when possible – If sandals get wet, air-dry them in a shaded area. Avoid direct sunlight or heat sources.
• Clean gently – Wipe with a soft, damp cloth. Avoid soaking or using harsh detergents.
• Condition occasionally – Use a natural leather conditioner to maintain softness and prevent cracking.
• Store thoughtfully – Keep in a cool, dry place. Use a cloth bag or box to protect from dust and moisture.
• Avoid prolonged sun exposure – Extended sunlight can fade colors and dry out the leather.
• Check soles regularly – For long-term use, inspect for wear and consider resoling if needed.`,
    variants: [
      {
        id: "1",
        size: "L",
        options: [{ id: "1", color: "Red", quantity: 10, price: "Price" }],
        totalStock: 10,
        lowStockUnit: 5,
      },
    ],
  };

  const handleEdit = () => {
    navigate(`/vendor/products/${id}/edit`);
  };

  return (
    <>
    <SiteHeader label="Product Management"/>
      <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a]">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 dark:bg-[#303030] dark:border-gray-700 sticky top-0 z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => navigate("/vendor/products")}
              className="flex items-center gap-2 text-gray-900 dark:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-xl font-semibold">Back</span>
            </button>
            <Badge
              variant="outline"
              className="bg-teal-50 text-teal-700 border-teal-200 font-medium"
            >
              Product is Active
            </Badge>
          </div>
        </div>

        {/* Hero Section with Product Name */}
        <div className="relative bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative px-6 py-12">
            <h1 className="text-4xl font-bold">{product.name}</h1>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="px-6 py-6">
          <Card className="dark:bg-[#303030]">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                <TabsTrigger
                  value="overview"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent dark:data-[state=active]:border-white px-6 py-4"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="details"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent dark:data-[state=active]:border-white px-6 py-4"
                >
                  Product Details
                </TabsTrigger>
                <TabsTrigger
                  value="wishlist"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent dark:data-[state=active]:border-white px-6 py-4"
                >
                  Wishlist
                </TabsTrigger>
                <TabsTrigger
                  value="cart"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent dark:data-[state=active]:border-white px-6 py-4"
                >
                  Cart
                </TabsTrigger>
                <TabsTrigger
                  value="orders"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent dark:data-[state=active]:border-white px-6 py-4"
                >
                  Orders
                </TabsTrigger>
                <TabsTrigger
                  value="compliance"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent dark:data-[state=active]:border-white px-6 py-4"
                >
                  Compliance
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="p-6 space-y-6">
                {/* Basic Information */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Basic Information</h2>
                    <Button variant="ghost" size="sm" onClick={handleEdit}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        Product name
                      </p>
                      <p className="font-medium">{product.name}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                          Category
                        </p>
                        <p className="font-medium">{product.category}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                          Sub category
                        </p>
                        <p className="font-medium">{product.subCategory}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                          Sub category type
                        </p>
                        <p className="font-medium">{product.subCategoryType}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        Product description
                      </p>
                      <p>{product.description}</p>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-200 dark:border-gray-700" />

                {/* Product Images */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Product Images</h2>
                    <Button variant="ghost" size="sm" onClick={handleEdit}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>

                  <div className="grid grid-cols-5 gap-4">
                    {product.images.map((image, index) => (
                      <div
                        key={index}
                        className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden"
                      >
                        <img
                          src={image}
                          alt={`Product ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <hr className="border-gray-200 dark:border-gray-700" />

                {/* Product Story */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Product story</h2>
                    <Button variant="ghost" size="sm" onClick={handleEdit}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>

                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <h3 className="font-semibold mb-3">
                      {product.story.title}
                    </h3>

                    <div className="flex gap-4 mb-4">
                      {product.story.images.map((img, index) => (
                        <div
                          key={index}
                          className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0"
                        >
                          <img
                            src={img}
                            alt={`Story ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>

                    <p className="text-sm mb-6">{product.story.text}</p>

                    <h3 className="font-semibold mb-3">
                      {product.story.endingTitle}
                    </h3>
                    <div className="flex gap-4">
                      {product.story.endingImages.map((img, index) => (
                        <div
                          key={index}
                          className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0"
                        >
                          <img
                            src={img}
                            alt={`Ending ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <hr className="border-gray-200 dark:border-gray-700" />

                {/* Additional Details */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">
                      Additional details
                    </h2>
                    <Button variant="ghost" size="sm" onClick={handleEdit}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        Product Specifications
                      </p>
                      <div className="text-sm whitespace-pre-line">
                        {product.specifications}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        Care Instructions
                      </p>
                      <div className="text-sm whitespace-pre-line">
                        {product.careInstructions}
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-200 dark:border-gray-700" />

                {/* Variants */}
                <div>
                  <h2 className="text-xl font-semibold mb-6">Variants</h2>

                  {product.variants.map((variant) => (
                    <div key={variant.id} className="space-y-4">
                      <p className="font-medium">Size {variant.size}</p>

                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                              <th className="text-left py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                                Color
                              </th>
                              <th className="text-center py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                                Qty Available
                              </th>
                              <th className="text-center py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                                Price (USD)
                              </th>
                              <th className="text-center py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {variant.options.map((option) => (
                              <tr
                                key={option.id}
                                className="border-b border-gray-100 dark:border-gray-800"
                              >
                                <td className="py-3">{option.color}</td>
                                <td className="py-3 text-center">
                                  {option.quantity}
                                </td>
                                <td className="py-3 text-center">
                                  {option.price}
                                </td>
                                <td className="py-3 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                                      <Pencil className="w-4 h-4 text-gray-500" />
                                    </button>
                                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                                      <Trash2 className="w-4 h-4 text-gray-500" />
                                    </button>
                                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                                      <MoreVertical className="w-4 h-4 text-gray-500" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="grid grid-cols-2 gap-8 pt-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                            Total available stock
                          </p>
                          <p className="font-semibold">
                            {variant.totalStock} units
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                            Low stock unit
                          </p>
                          <p className="font-semibold">
                            {variant.lowStockUnit}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="overview" className="p-6">
                <div className="text-center py-12 text-gray-500">
                  Overview content coming soon...
                </div>
              </TabsContent>

              <TabsContent value="wishlist" className="p-6">
                <div className="text-center py-12 text-gray-500">
                  Wishlist content coming soon...
                </div>
              </TabsContent>

              <TabsContent value="cart" className="p-6">
                <div className="text-center py-12 text-gray-500">
                  Cart content coming soon...
                </div>
              </TabsContent>

              <TabsContent value="orders" className="p-6">
                <div className="text-center py-12 text-gray-500">
                  Orders content coming soon...
                </div>
              </TabsContent>

              <TabsContent value="compliance" className="p-6">
                <div className="text-center py-12 text-gray-500">
                  Compliance content coming soon...
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </>
  );
}
