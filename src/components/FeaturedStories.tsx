import { ArrowRight, Play, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";

interface Story {
  id: string;
  name: string;
  location: string;
  image: string;
  isVideo?: boolean;
}

interface FeaturedStoriesProps {
  stories: Story[];
}

export function FeaturedStories({ stories }: FeaturedStoriesProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Calculate how many slides to show based on screen size
  const [slidesToShow, setSlidesToShow] = useState(5);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setSlidesToShow(3);
      } else if (window.innerWidth < 1024) {
        setSlidesToShow(4);
      } else {
        setSlidesToShow(5);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % stories.length);
    setTimeout(() => setIsAnimating(false), 400);
  };

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + stories.length) % stories.length);
    setTimeout(() => setIsAnimating(false), 400);
  };

  const goToSlide = (index: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 400);
  };

  // Calculate position for each card
  const getCardStyle = (index: number) => {
    const totalCards = stories.length;
    let position = index - currentIndex;

    // Handle wrap around
    if (position > totalCards / 2) {
      position -= totalCards;
    } else if (position < -totalCards / 2) {
      position += totalCards;
    }

    const isCenter = position === 0;
    const absPosition = Math.abs(position);

    // Calculate transforms based on position
    const scale = isCenter ? 1.1 : Math.max(0.85, 1 - absPosition * 0.1);
    const translateX = position * (slidesToShow === 3 ? 85 : slidesToShow === 4 ? 90 : 95);
    const translateZ = isCenter ? 0 : -absPosition * 100;
    const opacity = absPosition > slidesToShow / 2 ? 0 : 1;
    const zIndex = isCenter ? 10 : Math.max(0, 10 - absPosition);

    return {
      transform: `translateX(${translateX}%) scale(${scale}) translateZ(${translateZ}px)`,
      opacity,
      zIndex,
      transition: isAnimating ? "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)" : "all 0.3s ease",
    };
  };

  return (
    <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-20 bg-white dark:bg-[#1A1A1A]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] dark:text-white">
              Featured Stories
            </h2>
          </div>
          <Button
            variant="ghost"
            className="text-[#1A1A1A] dark:text-white hover:text-[#C75A00] flex items-center gap-2"
          >
            View more
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Custom Carousel with Side Navigation */}
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={prevSlide}
            disabled={isAnimating}
            className="carousel-arrow-side carousel-arrow-left"
            aria-label="Previous slide"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>

          {/* Carousel Container */}
          <div className="carousel-container">
            <div className="carousel-wrapper">
              {stories.map((story, index) => (
                <div
                  key={story.id}
                  className="carousel-slide"
                  style={getCardStyle(index)}
                  onClick={() => index !== currentIndex && goToSlide(index)}
                >
                  <StoryCard {...story} isActive={index === currentIndex} />
                </div>
              ))}
            </div>
          </div>

          {/* Right Arrow */}
          <button
            onClick={nextSlide}
            disabled={isAnimating}
            className="carousel-arrow-side carousel-arrow-right"
            aria-label="Next slide"
          >
            <ArrowRight className="h-6 w-6" />
          </button>

          {/* Pagination Dots - Bottom Center */}
          {/* <div className="carousel-pagination-bottom">
            {stories.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`pagination-dot ${
                  index === currentIndex ? "active" : ""
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div> */}
        </div>
      </div>
    </section>
  );
}

// Story Card Component
function StoryCard({
  name,
  location,
  image,
  isVideo = false,
  isActive,
}: Story & { isActive: boolean }) {
  return (
    <div className={`custom-story-card ${isActive ? "is-active" : ""}`}>
      <img 
        src={image} 
        alt={name} 
        className="custom-story-image"
        draggable={false}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent rounded-2xl pointer-events-none" />

      {/* Video Play Button */}
      {isVideo && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="w-16 h-16 rounded-full bg-[#C75A00] flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer shadow-xl">
            <Play className="h-8 w-8 text-white fill-white ml-1" />
          </div>
        </div>
      )}

      {/* Story Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-10 pointer-events-none">
        <div className="story-info-card">
          <h3 className="text-[#C75A00] font-semibold text-base md:text-lg mb-1">
            {name}
          </h3>
          <p className="text-gray-700 dark:text-gray-300 text-xs md:text-sm">
            {location}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="absolute bottom-4 right-4 bg-[#C75A00] text-white hover:bg-[#C75A00]/90 hover:text-white rounded-full w-10 h-10 p-0 pointer-events-auto"
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}