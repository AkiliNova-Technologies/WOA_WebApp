import React, { useState, useEffect } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  rating: number;
  image: string;
  location?: string;
}

interface TestimonialSphereProps {
  testimonials?: Testimonial[];
  autoRotate?: boolean;
  rotationSpeed?: number;
}

const TestimonialSphere: React.FC<TestimonialSphereProps> = ({
  testimonials = [],
  autoRotate = true,
  rotationSpeed = 5000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Auto-rotation effect
  useEffect(() => {
    if (!autoRotate || testimonials.length === 0) return;

    const interval = setInterval(() => {
      handleNext();
    }, rotationSpeed);

    return () => clearInterval(interval);
  }, [autoRotate, rotationSpeed, currentIndex, testimonials.length]);

  const handleNext = () => {
    if (isAnimating || testimonials.length === 0) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handlePrev = () => {
    if (isAnimating || testimonials.length === 0) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleAvatarClick = (index: number) => {
    if (isAnimating || index === currentIndex) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 500);
  };

  if (testimonials.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400 text-center">
          <Quote className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No testimonials available</p>
        </div>
      </div>
    );
  }

  const currentTestimonial = testimonials[currentIndex];

  // Calculate positions for circular layout
  const getAvatarPosition = (index: number) => {
    const totalItems = testimonials.length;
    const angleStep = (2 * Math.PI) / totalItems;
    const angle = angleStep * index - Math.PI / 2; // Start from top
    
    // Radius for the circle
    const radius = 280;
    
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    
    // Scale based on position (items at bottom are slightly smaller)
    const scale = index === currentIndex ? 1.2 : 0.9 - (Math.abs(y) / radius) * 0.2;
    
    // Z-index based on position
    const zIndex = index === currentIndex ? 50 : Math.round((1 - Math.abs(y) / radius) * 10);
    
    return { x, y, scale, zIndex };
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1 justify-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${
              i < rating ? "fill-orange-500 text-orange-500" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="relative w-full py-16">
      {/* Main container */}
      <div className="relative max-w-7xl mx-auto px-6">
        {/* Avatars in circular layout */}
        <div className="relative h-[600px] flex items-center justify-center">
          {/* Center circle background */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[420px] h-[420px] rounded-full border-2 border-dashed border-gray-200"></div>
          </div>

          {/* Avatar circles */}
          {testimonials.map((testimonial, index) => {
            const position = getAvatarPosition(index);
            const isCurrent = index === currentIndex;

            return (
              <div
                key={testimonial.id}
                className={`absolute transition-all duration-700 ease-out cursor-pointer ${
                  isCurrent ? "z-50" : ""
                }`}
                style={{
                  transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${position.scale})`,
                  zIndex: position.zIndex,
                  left: "50%",
                  top: "50%",
                }}
                onClick={() => handleAvatarClick(index)}
              >
                <div
                  className={`relative rounded-full overflow-hidden transition-all duration-500 ${
                    isCurrent
                      ? "w-24 h-24 ring-3 ring-orange-500 ring-offset-4 shadow-2xl"
                      : "w-20 h-20 ring-2 ring-white ring-offset-2 shadow-lg opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            );
          })}

          {/* Center content - Testimonial display */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="max-w-lg w-full px-14">
              <div
                key={currentIndex}
                className="text-center transition-all duration-500 animate-fadeIn"
              >
                {/* Quote icon */}
                <Quote className="w-12 h-12 text-orange-500 mx-auto mb-6" />

                {/* Quote text */}
                <blockquote className="text-lg md:text-xl font-serif text-gray-700 italic mb-8 leading-relaxed">
                  "{currentTestimonial.quote}"
                </blockquote>

                {/* Author info */}
                <div className="space-y-3">
                  <h4 className="text-xl font-bold text-gray-900">
                    {currentTestimonial.name}
                  </h4>
                  <div className="flex items-center justify-center gap-1 text-gray-600">
                    {renderStars(currentTestimonial.rating)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation controls */}
        <div className="absolute w-full top-[45%] flex items-center justify-between gap-8">
          <button
            onClick={handlePrev}
            disabled={isAnimating}
            className="w-12 h-12 rounded-full bg-white text-primary flex items-center justify-center hover:bg-white/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:scale-110"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Counter
          <div className="bg-gray-900 text-white px-6 py-3 rounded-full font-medium">
            {currentIndex + 1} / {testimonials.length}
          </div> */}

          <button
            onClick={handleNext}
            disabled={isAnimating}
            className="w-12 h-12 rounded-full bg-white text-primary flex items-center justify-center hover:bg-white/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:scale-110"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default TestimonialSphere;