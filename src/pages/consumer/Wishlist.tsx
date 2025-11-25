import images from "@/assets/images";
import { ProductCard } from "@/components/productCard";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
export default function WishListPage() {
  const navigate = useNavigate();
  const [wishlist] = useState([]);

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-[#F7F7F7]">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-semibold text-center">Whishlist</h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-16 ">
          <div className="bg-white flex flex-col justify-center items-center">
            <img
              src={images.EmptyWishlist}
              alt="Empty Wishlist Image"
              className="h-full w-full max-h-sm max-w-sm "
            />
            <h2 className="text-xl font-semibold mb-2">Empty Wishlist</h2>
            <p className="text-gray-600 mb-6">
              Found something you like? Tap on the heart shaped icon next to the
              item to add it to your wishlist!{" "}
            </p>
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
              <h2 className="text-2xl font-bold">Recently Viewed</h2>
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

          {/* Recently Viewed */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Recommended for you</h2>
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
    <div className="min-h-screen flex justify-center">
      <div className="p-6 md:p-10 w-full max-w-7xl">
        {/* Recently Viewed */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recently Viewed</h2>
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

        {/* Recently Viewed */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recommended for you</h2>
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
