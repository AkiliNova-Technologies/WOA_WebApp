import { useState } from "react";
import { Minus, Plus, Heart, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProductCard } from "@/components/productCard";
import images from "@/assets/images";
import { useNavigate } from "react-router-dom";

// Mock cart data
const initialCartItems = [
  {
    id: 1,
    name: "Heritage Stitch African Print Shirt",
    size: "XL",
    price: 20,
    quantity: 1,
    limitedUnits: true,
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=300",
    inStock: true,
  },
  {
    id: 2,
    name: "African Shorts",
    size: "XL",
    price: 20,
    quantity: 1,
    limitedUnits: true,
    image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=300",
    inStock: true,
  },
];

const recentlyViewed = [
  {
    id: 1,
    name: "Authentic African Headwrap, Stylish Pr...",
    price: 35,
    rating: 4.5,
    reviews: 17,
    vendor: "African Chic Boutique",
    image: "https://images.unsplash.com/photo-1602810318660-67b3db9c7c7f?w=300",
  },
  {
    id: 2,
    name: "Vibrant Kente Cloth Headwrap, Handm...",
    price: 40,
    rating: 4.5,
    reviews: 48,
    vendor: "Heritage Styles",
    image: "https://images.unsplash.com/photo-1602810319428-019690571b5b?w=300",
  },
  {
    id: 3,
    name: "Handcrafted African Leather Sandals f...",
    price: 45,
    originalPrice: 50,
    discount: 10,
    rating: 4,
    reviews: 45,
    vendor: "Nairobi Footwear",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=300",
  },
  {
    id: 4,
    name: "Exquisite Beaded African Slippers, Eth...",
    price: 30,
    rating: 5,
    reviews: 8,
    vendor: "Accra Accessories",
    image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=300",
  },
];

const shippingOptions = [
  {
    id: "standard",
    name: "Standard Shipping",
    price: 6.0,
    description: "Estimated delivery: 3-5 business days",
  },
  {
    id: "express",
    name: "DHL EXPRESS",
    price: 40.0,
    description: "Estimated delivery: 3-5 business days",
  },
];

export default function CartPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [selectedShipping, setSelectedShipping] = useState("standard");

  const updateQuantity = (id: number, delta: number) => {
    setCartItems(
      cartItems.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const saveForLater = (id: number) => {
    console.log("Save for later:", id);
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const selectedShippingOption = shippingOptions.find(
    (opt) => opt.id === selectedShipping
  );
  const shipping = selectedShippingOption?.price || 0;
  const discount = 0;
  const total = subtotal + shipping - discount;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-[#F7F7F7]">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-semibold text-center">Your Cart</h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-16 ">
          <div className="bg-white flex flex-col justify-center items-center">
            <img
              src={images.EmptyCart}
              alt="Empty Cart Image"
              className="h-full w-full max-h-sm max-w-sm "
            />
            <h2 className="text-xl font-semibold mb-2">Empty Cart</h2>
            <p className="text-gray-600 mb-6">You have nothing in your cart</p>
            <Button
              className="h-11 min-w-2xs bg-[#CC5500] rounded-full hover:bg-[#CC5500]/90"
              onClick={() => navigate("/")}
            >
              Continue Shopping
            </Button>
          </div>

          {/* Recently Viewed */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Recently viewed</h2>
              <Button
                variant="ghost"
                className="text-[#CC5500] hover:text-[#CC5500]/80"
              >
                View more
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentlyViewed.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  rating={product.rating}
                  reviews={product.reviews}
                  price={product.price}
                  vendor={product.vendor}
                  image={product.image}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#F7F7F7]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-semibold text-center">Your Cart</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Cart Items */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                Cart <span className="font-normal text-gray-600">({cartItems.length})</span>
              </h2>
            </div>

            <div className="space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="p-4 shadow-none">
                  <div className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 md:w-38 md:h-44 object-cover rounded-lg shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <span>Size: {item.size}</span>
                            {/* <Badge
                              variant={item.inStock ? "default" : "secondary"}
                              className={
                                item.inStock
                                  ? "bg-green-100 text-green-800"
                                  : ""
                              }
                            >
                              {item.inStock ? "In Stock" : "Out of Stock"}
                            </Badge> */}
                          </div>

                          {item.limitedUnits && (
                            <Badge
                              variant="secondary"
                              className="bg-transparent p-0 text-orange-800 mb-2"
                            >
                              Limited units left
                            </Badge>
                          )}

                          <p className="text-xl font-bold text-[#303030]">
                            ${item.price}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-row justify-between items-center mt-4">
                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 text-gray-600 hover:text-gray-900"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Remove
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 text-gray-600 hover:text-gray-900"
                            onClick={() => saveForLater(item.id)}
                          >
                            <Heart className="h-3 w-3 mr-1" />
                            Save for later
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 text-gray-600 hover:text-gray-900"
                          >
                            <Edit2 className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 border border-gray-300 rounded-full p-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-full"
                              onClick={() => updateQuantity(item.id, -1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-full bg-[#CC5500] text-white hover:bg-[#CC5500]/80 hover:text-white"
                              onClick={() => updateQuantity(item.id, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Column - Shipping & Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4 shadow-none border-none rounded-lg">
              {/* Shipping Options */}
              <h3 className="font-semibold mb-4">Shipping Options</h3>

              <div className="space-y-3">
                {shippingOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedShipping === option.id
                        ? "border-[#CC5500] bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedShipping(option.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                            selectedShipping === option.id
                              ? "border-[#CC5500]"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedShipping === option.id && (
                            <div className="w-3 h-3 bg-[#CC5500] rounded-full" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {option.name}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {option.description}
                          </div>
                        </div>
                      </div>
                      <div className="font-semibold text-sm">
                        USD {option.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Order Summary */}
              <h3 className="font-semibold mb-4">
                Items <span className="font-normal text-gray-600">(a)</span> total
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">USD {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shop discount</span>
                  <span className="font-medium">USD {discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">USD {shipping.toFixed(2)}</span>
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between text-base">
                  <span className="text-gray-600">
                    Estimated total ({cartItems.length} items)
                  </span>
                  <span className="font-semibold text-[#303030]">
                    USD {total.toFixed(2)}
                  </span>
                </div>
              </div>

              <Button className="w-full h-11 bg-[#CC5500] hover:bg-[#CC5500]/90 rounded-full text-white font-semibold mt-6" onClick={()=> navigate("/cart/checkout")}>
                Proceed to Checkout
              </Button>
            </Card>
          </div>
        </div>

        {/* Recently Viewed */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recently viewed</h2>
            <Button
              variant="ghost"
              className="text-[#CC5500] hover:text-[#CC5500]/80"
            >
              View more
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentlyViewed.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                rating={product.rating}
                reviews={product.reviews}
                price={product.price}
                vendor={product.vendor}
                image={product.image}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}