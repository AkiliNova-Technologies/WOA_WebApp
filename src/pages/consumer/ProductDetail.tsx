import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Package,
  MapPin,
  ThumbsUp,
  Share,
  Plus,
  Minus,
  ShoppingCart,
  User,
} from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/productCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Rate } from "antd";

interface VendorInfo {
  id: string;
  name: string;
  title?: string;
  rating?: number;
  reviews?: number;
  itemsSold?: number;
  memberMonths?: number;
  avatar?: string;
}

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { getProductById, products } = useProducts();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [showCareInstructions, setShowCareInstructions] = useState(true);
  const [showProductDetails, setShowProductDetails] = useState(true);
  const [showReviews, setShowReviews] = useState(true);
  const [showShipping, setShowShipping] = useState(true);

  const product = getProductById(productId!);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <Button onClick={() => navigate("/")}>Return to Home</Button>
        </div>
      </div>
    );
  }

  // Get related products
  const relatedProducts = product.relatedProducts
    ? products.filter((p) => product.relatedProducts!.includes(p.id))
    : products
        .filter(
          (p) => p.categoryId === product.categoryId && p.id !== product.id
        )
        .slice(0, 4);

  // Get vendor's other products
  const vendorProducts = products
    .filter((p) => p.vendor === product.vendor && p.id !== product.id)
    .slice(0, 4);

  const ratingDistribution = [
    { stars: 5, percentage: 75 },
    { stars: 4, percentage: 14 },
    { stars: 3, percentage: 0 },
    { stars: 2, percentage: 11 },
    { stars: 1, percentage: 0 },
  ];

  // Handle vendor data safely
  const getVendorInfo = (): VendorInfo => {
    // If vendor is already an object, use it
    if (typeof product.vendor === "object" && product.vendor !== null) {
      return {
        id: product.vendor.id || "1",
        name: product.vendor.name || "Unknown Vendor",
        title:
          product.vendor.title ||
          `Owner of ${product.vendor.name || "Unknown"}`,
        rating: product.vendor.rating || 4.5,
        reviews: product.vendor.reviews || 12,
        itemsSold: product.vendor.itemsSold || 16,
        memberMonths: product.vendor.memberMonths || 8,
        avatar:
          product.vendor.avatar ||
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
      };
    }

    // If vendor is a string, create a basic vendor object
    return {
      id: "1",
      name: product.vendor || "Unknown Vendor",
      title: `Owner of ${product.vendor || "Unknown"}`,
      rating: 4.5,
      reviews: 12,
      itemsSold: 16,
      memberMonths: 8,
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    };
  };

  const vendor = getVendorInfo();

  // Mock shipping info
  const shippingInfo = product.shippingInfo || {
    arrives: "Nov 22 - Dec 5",
    from: "Uganda",
    cost: 5.99,
    freeShippingThreshold: 50,
  };

  // Mock reviews
  const reviews = product.productReviews || [
    {
      id: "1",
      author: "Annette Black",
      date: "Apr 11 2025",
      rating: 4.1,
      text: "I wore these every day on a trip. The leather is soft and durable, and the sole is sturdy. The design is also very sleek.",
      helpful: 125,
      verified: true,
    },
    {
      id: "2",
      author: "Emma Stone",
      date: "Jul 3 2025",
      rating: 5.0,
      text: "Absolutely love these! Extremely comfortable right out of the box. Perfect for both casual and formal occasions.",
      helpful: 98,
      verified: true,
    },
  ];

  // Get vendor name for ProductCard
  const getVendorName = (): string => {
    if (typeof product.vendor === "object" && product.vendor !== null) {
      return product.vendor.name || "Unknown Vendor";
    }
    return product.vendor || "Unknown Vendor";
  };

  const vendorName = getVendorName();

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-[#F7F7F7]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center gap-2 text-md text-[#999999]">
            <span>Fashion & Apparel</span>
            <span>/</span>
            <span>Men's fashion</span>
            <span>/</span>
            <span>T-shirts</span>
            <span>/</span>
            <span className="text-gray-900">T-shirts</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left Column - Images */}
          <div>
            <div className="relative bg-white rounded-lg overflow-hidden mb-4">
              <button className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100">
                <Heart className="w-5 h-5" />
              </button>
              <img
                src={product.images?.[selectedImage] || product.image}
                alt={product.name}
                className="w-full aspect-square object-cover"
              />
            </div>

            {/* Thumbnail Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedImage(Math.max(0, selectedImage - 1))}
                className="p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 disabled:opacity-50"
                disabled={selectedImage === 0}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex gap-2 overflow-x-auto flex-1">
                {(product.images || [product.image]).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === idx
                        ? "border-orange-500"
                        : "border-gray-200"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              <button
                onClick={() =>
                  setSelectedImage(
                    Math.min(
                      (product.images?.length || 1) - 1,
                      selectedImage + 1
                    )
                  )
                }
                className="p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 disabled:opacity-50"
                disabled={selectedImage === (product.images?.length || 1) - 1}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Product Reviews Section */}
            <Card className="p-6 mb-12 shadow-none border-none">
              <button
                onClick={() => setShowReviews(!showReviews)}
                className="flex items-center justify-between w-full mb-6"
              >
                <h2 className="text-2xl font-bold">Product Reviews</h2>
                <ChevronRight
                  className={`w-6 h-6 transform transition-transform ${
                    showReviews ? "rotate-90" : ""
                  }`}
                />
              </button>

              {showReviews && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-4">
                    <div className="text-center">
                      <div className="text-5xl font-bold mb-2">
                        {product.rating}
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        {reviews.length} reviews
                      </p>
                    </div>

                    <div className="col-span-5 space-y-2">
                      {ratingDistribution.map((item) => (
                        <div
                          key={item.stars}
                          className="flex items-center gap-1"
                        >
                          <div className="flex items-center gap-1 w-38">
                            <Rate
                              disabled
                              defaultValue={item.stars}
                              className="text-yellow-400 text-xl"
                            />
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-12 text-right">
                            {item.percentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-t pt-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-300 rounded-full" />
                            <div>
                              <h4 className="font-semibold">{review.author}</h4>
                              <p className="text-sm text-gray-600">
                                {review.date}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Rate
                              disabled
                              defaultValue={review.rating}
                              className="text-yellow-400"
                            />
                            <span className="text-sm font-semibold">
                              {review.rating}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-3">{review.text}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <button className="flex items-center gap-1 hover:text-orange-500">
                            <ThumbsUp className="w-4 h-4" />
                            Helpful ({review.helpful})
                          </button>
                          <button className="flex items-center gap-1 hover:text-orange-500">
                            <Share className="w-4 h-4" />
                            Share
                          </button>
                          {review.verified && (
                            <span className="text-green-600">
                              ✓ Verified stock
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" className="w-full mt-6">
                    Read all reviews
                  </Button>
                </>
              )}
            </Card>
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            {/* Rating and Title */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Rate
                  disabled
                  defaultValue={product.rating}
                  className="text-yellow-400"
                />
                <span className="text-sm font-semibold">
                  {product.rating} Star Rating
                </span>
                <span className="text-sm text-gray-600">
                  ({product.userFeedback || product.reviews} User feedback)
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>SKU: {product.sku || `PRD-${product.id}`}</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                  {product.productionMethod}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Category: {product.categoryId}
              </p>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold">${product.price}</span>
              {product.originalPrice && (
                <span className="text-xl text-gray-400 line-through">
                  ${product.originalPrice}
                </span>
              )}
              {product.discount && (
                <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-semibold">
                  -{product.discount}%
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <Select value={selectedColor} onValueChange={setSelectedColor}>
                  <SelectTrigger className="w-full min-h-11">
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {(product.colors || ["blue", "red", "green"]).map(
                      (color) => (
                        <SelectItem key={color} value={color}>
                          {color.charAt(0).toUpperCase() + color.slice(1)}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Size Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Size</label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="w-full min-h-11">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {(product.sizes || ["S", "M", "L", "XL"]).map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="flex gap-4">
              <div className="flex items-center border border-gray-200 rounded-full p-1">
                <Button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-10 w-10 hover:bg-gray-100 bg-[#F2F2F2] rounded-full text-[#303030]"
                >
                  <Minus />
                </Button>
                <Input
                  type="text"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-12 text-center border-none py-2 rounded-none"
                />
                <Button
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-10 w-10 hover:bg-gray-100 bg-[#F2F2F2] rounded-full text-[#303030]"
                >
                  <Plus />
                </Button>
              </div>
              <Button className="flex-1 h-12 bg-[#CC5500] rounded-full text-white py-3 font-semibold hover:bg-[#CC5500]/80 flex items-center justify-center gap-2">
                Add to Cart
                <ShoppingCart className="w-5 h-5" />
              </Button>
            </div>

            {/* Share Options */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Share product:</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="p-2">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Description */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3">Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
              <button className="text-orange-500 text-sm mt-2 hover:underline">
                Read more
              </button>
            </div>

            {/* Product Story Video Section */}
            <Card className="mt-6 bg-white rounded-lg py-4 shadow-none border-none">
              <h3 className="font-semibold">Product Story</h3>
              <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                <img
                  src="https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800"
                  alt="Product story"
                  className="w-full h-full object-cover opacity-70"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100">
                    <div className="w-0 h-0 border-l-20 border-l-gray-900 border-y-12 border-y-transparent ml-1" />
                  </button>
                </div>
              </div>
            </Card>

            {/* Care Instructions */}
            <div className="border-t pt-4">
              <button
                onClick={() => setShowCareInstructions(!showCareInstructions)}
                className="flex items-center justify-between w-full font-semibold"
              >
                <span>Care Instructions</span>
                <ChevronRight
                  className={`w-5 h-5 transform transition-transform ${
                    showCareInstructions ? "rotate-90" : ""
                  }`}
                />
              </button>
              {showCareInstructions && (
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  {(
                    product.careInstructions || [
                      "Keep dry when possible - If it gets wet, air-dry them in a shaded area.",
                      "Clean gently - Wipe with a soft, damp cloth.",
                      "Condition occasionally - Use natural conditioner to maintain quality.",
                    ]
                  ).map((instruction, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-orange-500">•</span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Product Details */}
            <div className="border-t pt-4">
              <button
                onClick={() => setShowProductDetails(!showProductDetails)}
                className="flex items-center justify-between w-full font-semibold"
              >
                <span>Product Details</span>
                <ChevronRight
                  className={`w-5 h-5 transform transition-transform ${
                    showProductDetails ? "rotate-90" : ""
                  }`}
                />
              </button>
              {showProductDetails && (
                <div className="mt-3 space-y-2 text-sm">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-600">Material:</span>
                    <span className="col-span-2">
                      {product.material ||
                        product.specifications?.material ||
                        "100% Cotton"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-600">Color:</span>
                    <span className="col-span-2">
                      Available in various colors including{" "}
                      {(product.colors || ["blue", "red", "green"]).join(", ")}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-600">Size:</span>
                    <span className="col-span-2">
                      {(product.sizes || ["S", "M", "L", "XL"]).join(", ")}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Shipping and Returns */}
            <div className="border-t pt-4">
              <button
                onClick={() => setShowShipping(!showShipping)}
                className="flex items-center justify-between w-full font-semibold"
              >
                <span>Shipping and Returns</span>
                <ChevronRight
                  className={`w-5 h-5 transform transition-transform ${
                    showShipping ? "rotate-90" : ""
                  }`}
                />
              </button>
              {showShipping && (
                <div className="mt-3 space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Package className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">
                        Arrives by {shippingInfo.arrives}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">
                        Shipped from {shippingInfo.from}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Meet Your Vendor */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Meet your vendor</h3>
                <button
                  className="text-orange-500 text-sm hover:underline"
                  onClick={() => navigate("/category/vendor-profile")}
                >
                  Check out the store
                </button>
              </div>
              <div className="flex items-center gap-4 mb-4">
                {vendor.avatar ? (
                  <img
                    src={vendor.avatar}
                    alt={vendor.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-500" />
                  </div>
                )}
                <div>
                  <h4 className="font-semibold">{vendor.name}</h4>
                  <p className="text-sm text-gray-600">{vendor.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Rate
                        disabled
                        defaultValue={vendor.rating || 4.5}
                        className="text-yellow-400 text-xs"
                      />
                      <span>({vendor.reviews || 0})</span>
                    </div>
                    <span>• {vendor.itemsSold || 0} Items sold</span>
                    <span>• Member for {vendor.memberMonths || 0} months</span>
                  </div>
                </div>
              </div>
              <Button className="w-full h-11 bg-[#CC5500] text-white py-2 rounded-full font-medium hover:bg-[#CC5500]/80">
                Follow
              </Button>
            </div>
          </div>
        </div>

        {/* More from the vendor */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">More from the vendor</h2>
            <button className="text-orange-500 hover:underline">
              View more
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {vendorProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={parseInt(product.id)}
                name={product.name}
                rating={product.rating}
                reviews={product.reviews}
                price={product.price}
                vendor={vendorName} // Use the extracted vendor name
                image={product.image}
              />
            ))}
          </div>
        </div>

        {/* More like this */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">More like this</h2>
            <button className="text-orange-500 hover:underline">
              View more
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={parseInt(product.id)}
                name={product.name}
                rating={product.rating}
                reviews={product.reviews}
                price={product.price}
                vendor={vendorName} // Use the extracted vendor name
                image={product.image}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
