import { useState } from "react";
import {
  ShoppingBag,
  CreditCard,
  Share2,
  RotateCcw,
  Star,
  Plus,
  Minus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import TestimonialSphere from "@/components/testimonial-sphere";

export default function BecomeSellerPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Updated testimonials with real Unsplash images
  const testimonials = [
    {
      id: "1",
      name: "Becky Lydia",
      role: "Artisan & Designer",
      company: "Nubian Crafts Collective",
      quote:
        "Finally, a marketplace that values authenticity. The tools for managing inventory and payments make selling stress-free.",
      rating: 5,
      image:
        "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop",
    },
    {
      id: "2",
      name: "James Okonkwo",
      role: "Founder",
      company: "Igbo Heritage Woodworks",
      quote:
        "World of Afrika helped me turn my craft into a thriving business. The global audience is incredible.",
      rating: 5,
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    },
    {
      id: "3",
      name: "Amara Nwosu",
      role: "Creative Director",
      company: "Adire Textile Studio",
      quote:
        "The platform celebrates our heritage while providing modern tools. It's the perfect bridge between tradition and technology.",
      rating: 5,
      image:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
    },
    {
      id: "4",
      name: "Kwame Asante",
      role: "Jewelry Maker",
      company: "Gold Coast Creations",
      quote:
        "The analytics dashboard helped me understand my customers better. Sales have tripled since joining.",
      rating: 4,
      image:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
    },
    {
      id: "5",
      name: "Fatima Zahra",
      role: "Ceramic Artist",
      company: "Berber Pottery Co.",
      quote:
        "Shipping was always my biggest challenge. Now I just create, and World of Africa handles the rest.",
      rating: 5,
      image:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop",
    },
    {
      id: "6",
      name: "Chinedu Obi",
      role: "Fashion Designer",
      company: "Lagos Modern Wear",
      quote:
        "The community features helped me connect with other African designers. We're stronger together.",
      rating: 4,
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    },
    {
      id: "7",
      name: "Zainab Hassan",
      role: "Textile Artist",
      company: "Kano Weavers Guild",
      quote:
        "I love how the platform highlights the story behind each piece. Customers truly appreciate the craftsmanship.",
      rating: 5,
      image:
        "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&h=400&fit=crop",
    },
    {
      id: "8",
      name: "Kofi Mensah",
      role: "Wood Sculptor",
      company: "Ashanti Arts Collective",
      quote:
        "The seller dashboard is intuitive and powerful. I can manage everything from one place.",
      rating: 5,
      image:
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop",
    },
  ];

  const faqs = [
    {
      question: "What products can I sell on World of Africa?",
      answer:
        "We are a curated marketplace exclusively for authentic African products that are designed, crafted, or inspired by African culture and heritage. Our goal is to showcase the best of the Africa's creativity and craftsmanship.\n\nAll products must be of high quality and align with our brand's mission of celebrating authentic stories.",
    },
    {
      question: "How and when do I get paid for my sales?",
      answer:
        "Our payment system is fully automated. When a customer purchases your product, the funds are securely held by our payment gateway. To protect both you and the customer, the funds become available for transfer after our 5-day return window has passed. Once cleared, the payment (your net earning after our commission) is automatically transferred to the bank account you connected during onboarding.",
    },
    {
      question: "Who handles shipping and delivery?",
      answer:
        "You focus on what you do best: creating. We handle the complex logistics. Your responsibility is to prepare your sold items and dispatch them to our central warehouse. From there, our dedicated logistics network takes over, managing the final delivery to the customer's doorstep or a nearby pickup point.",
    },
    {
      question: "Do I need to be a registered business to sell?",
      answer:
        "While we welcome both individuals and registered businesses, having proper documentation helps us verify your identity and ensures smooth payment processing. We'll guide you through the requirements during the onboarding process.",
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#F3F8FF] py-20 px-6">
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
            Share your craft with
            <br />
            the world
          </h1>
          <button
            className="bg-[#0011661A] hover:bg-[#0011661A]/80 text-primary px-8 py-4 rounded-full text-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-xs hover:shadow-xl"
            onClick={() => navigate("/kyc")}
          >
            Become a Seller
          </button>
        </div>
      </section>

      <section>
        {/* Wave separator */}
        <div className="bottom-0 left-0 w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path
              fill="#F3F8FF"
              fillOpacity="1"
              d="M0,192L26.7,165.3C53.3,139,107,85,160,69.3C213.3,53,267,75,320,90.7C373.3,107,427,117,480,106.7C533.3,96,587,64,640,74.7C693.3,85,747,139,800,138.7C853.3,139,907,85,960,64C1013.3,43,1067,53,1120,69.3C1173.3,85,1227,107,1280,112C1333.3,117,1387,107,1413,101.3L1440,96L1440,0L1413.3,0C1386.7,0,1333,0,1280,0C1226.7,0,1173,0,1120,0C1066.7,0,1013,0,960,0C906.7,0,853,0,800,0C746.7,0,693,0,640,0C586.7,0,533,0,480,0C426.7,0,373,0,320,0C266.7,0,213,0,160,0C106.7,0,53,0,27,0L0,0Z"
            ></path>
          </svg>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-20 px-6 -mt-60">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-slate-900 text-center mb-6">
            The value we give
          </h2>
          <p className="text-xl text-slate-600 text-center max-w-3xl mx-auto mb-16">
            On World of Afrika, every product tells a story, every seller gains
            a community, and every transaction builds opportunity.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Value Card 1 */}
            <div className="group relative space-y-8 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border-slate-100 hover:border-orange-200">
              <div className="relative flex items-center">
                <h1 className="text-primary text-5xl font-bold ">01</h1>
                <div className="absolute w-16 h-16 left-6 bg-[#CC5500]/10 rounded-full flex items-center justify-center  transition-transform duration-300" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4 mt-12">
                Global Audience
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Connect with customers worldwide who are passionate about
                authentic African craftsmanship and stories.
              </p>
            </div>

            {/* Value Card 2 */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-xl shadow-[#E8E8E8]/80 hover:shadow-xl transition-all duration-300 border-slate-100 hover:border-orange-200">
              <div className="relative flex items-center">
                <h1 className="text-primary text-5xl font-bold ">02</h1>
                <div className="absolute w-16 h-16 left-6 bg-[#CC5500]/10 rounded-full flex items-center justify-center  transition-transform duration-300" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4 mt-12">
                We Handle Logistics
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Focus on Your Craft, We'll Handle the Rest. From secure payments
                to our streamlined shipping and delivery network.
              </p>
            </div>

            {/* Value Card 3 */}
            <div className="group relative rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border-slate-100 hover:border-orange-200">
              <div className="relative flex items-center">
                <h1 className="text-primary text-5xl font-bold ">03</h1>
                <div className="absolute w-16 h-16 left-6 bg-[#CC5500]/10 rounded-full flex items-center justify-center  transition-transform duration-300" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4 mt-12">
                Your Story, Your Brand
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Our unique storefronts and product pages are designed to put
                your brand narrative and personal story front and center.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Seller Toolkit Section */}
      <section className="py-20 px-6 bg-[#CC55000D]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-slate-900 text-center mb-6">
            Your Seller Toolkit
          </h2>
          <p className="text-xl text-slate-600 text-center max-w-3xl mx-auto mb-16">
            To showcase the tangible, feature-rich dashboard and analytics we
            provide, positioning our platform as a serious business partner, not
            just a simple listing site.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Analytics Card */}
            <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl">
              <h3 className="text-2xl font-bold mb-4">
                Real-time Sales & Performance Analytics
              </h3>
              <p className="text-slate-300 mb-6 leading-relaxed">
                Track your business health with a glance. Your main dashboard
                features a clear sales performance chart, a list of your
                top-performing products, and a live feed of your most recent
                orders.
              </p>

              {/* Mock Analytics */}
              <div className="bg-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">
                      New inbound conversations
                    </p>
                    <p className="text-3xl font-bold">5,757</p>
                  </div>
                  <div className="text-red-400 flex items-center gap-1">
                    <span className="text-sm">↓ 874 from previous 7 days</span>
                  </div>
                </div>

                {/* Simple bar chart representation */}
                <div className="flex items-end justify-between gap-2 h-32">
                  {[15, 20, 28, 25, 32, 28, 22].map((height, idx) => (
                    <div
                      key={idx}
                      className="flex-1 bg-blue-500 rounded-t"
                      style={{ height: `${height * 3}px` }}
                    ></div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-slate-400">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>
            </div>

            {/* Customer Insights Card */}
            <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl">
              <h3 className="text-2xl font-bold mb-4">
                Actionable Customer Insights
              </h3>
              <p className="text-slate-300 mb-6 leading-relaxed">
                Get a direct view of your product reviews and ratings, and the
                'Wishlist Adds' metric on each product gives to signal of
                customer interest before they even buy.
              </p>

              {/* Mock Reviews */}
              <div className="space-y-4">
                {[
                  {
                    name: "Amina Nash",
                    rating: 5,
                    text: "Solid build, sleek design. Feels premium and elevated my space.",
                  },
                  {
                    name: "Sophia L.",
                    rating: 4,
                    text: "Comfortable from day one. True to size and great for everyday wear.",
                  },
                  {
                    name: "Emma B.",
                    rating: 5,
                    text: "The Ankara shirt is vibrant and breathable, and I love the cultural touch...",
                  },
                ].map((review, idx) => (
                  <div key={idx} className="bg-slate-800 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-slate-700 rounded-full"></div>
                      <div>
                        <p className="font-semibold text-sm">{review.name}</p>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < review.rating
                                  ? "fill-orange-400 text-orange-400"
                                  : "text-slate-600"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-400 text-sm">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-slate-900 rounded-xl p-6 text-white">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4">
                <ShoppingBag className="w-6 h-6 text-slate-900" />
              </div>
              <h4 className="text-lg font-bold mb-2">Order Management</h4>
              <p className="text-slate-400 text-sm">
                Stay on top of your orders with instant notifications, and
                efficiently manage fulfillment, all within our streamlined
                system.
              </p>
            </div>

            <div className="bg-slate-900 rounded-xl p-6 text-white">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4">
                <CreditCard className="w-6 h-6 text-slate-900" />
              </div>
              <h4 className="text-lg font-bold mb-2">
                Global Payment Processing
              </h4>
              <p className="text-slate-400 text-sm">
                We ensure a secure checkout, accepting major credit cards and
                payment methods globally.
              </p>
            </div>

            <div className="bg-slate-900 rounded-xl p-6 text-white">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4">
                <Share2 className="w-6 h-6 text-slate-900" />
              </div>
              <h4 className="text-lg font-bold mb-2">Promotional Tools</h4>
              <p className="text-slate-400 text-sm">
                Our intuitive pricing allows you to run your own sales and
                display eye-catching discounts instantly, without needing
                approval.
              </p>
            </div>

            <div className="bg-slate-900 rounded-xl p-6 text-white">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4">
                <RotateCcw className="w-6 h-6 text-slate-900" />
              </div>
              <h4 className="text-lg font-bold mb-2">Community Building</h4>
              <p className="text-slate-400 text-sm">
                Turn one-time buyer into a loyal customer and build a beloved
                brand on our community-driven marketplace.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="max-w-2xl">
            <p className="text-orange-600 font-semibold uppercase tracking-wider text-sm mb-3">
              The Simple Steps
            </p>

            <h2 className="text-5xl font-bold text-slate-900 leading-tight mb-6">
              Getting Started is Simple.
            </h2>

            <p className="text-xl text-slate-600 mb-8">
              Follow these four easy steps to launch your brand on World of
              Africa and start sharing your craft with a global audience.
            </p>

            <button className="inline-flex items-center bg-[#CC5500] hover:bg-[#CC5500]/80 text-white px-8 py-4 rounded-full text-lg font-medium transition-all shadow-lg hover:shadow-xl" onClick={()=> navigate("/kyc")}>
              Get Started
            </button>
          </div>

          {/* Timeline */}
          <div className="relative mt-28">
            {/* Curved Line */}
            <svg
              viewBox="0 0 1200 300"
              className="absolute top-0 left-0 w-full hidden lg:block"
              fill="none"
            >
              <path
                d="M0 200 C 300 50, 600 350, 900 150 S 1200 100, 1400 50"
                stroke="#EA580C"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>

            {/* Steps */}
            <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-y-24 gap-x-20">
              {/* Step 1 */}
              <div className="relative">
                <span className="absolute -top-24 -left-8 text-[180px] font-bold text-slate-100 select-none">
                  1
                </span>

                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white rounded-full shadow flex items-center justify-center mb-6">
                    <div className="w-3 h-3 bg-orange-600 rounded-full" />
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 mb-4">
                    Create Your Storefront
                  </h3>

                  <p className="text-lg text-slate-600 leading-relaxed">
                    Tell us about your business, upload your verification
                    documents, and most importantly, share your unique brand
                    story.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative lg:mt-20">
                <span className="absolute -top-28 -left-8 text-[180px] font-bold text-slate-100 select-none">
                  2
                </span>

                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white rounded-full shadow flex items-center justify-center mb-6">
                    <div className="w-3 h-3 bg-orange-600 rounded-full" />
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 mb-4">
                    Undergo Curation Review
                  </h3>

                  <p className="text-lg text-slate-600 leading-relaxed">
                    Our team will carefully review your application to ensure
                    your brand is a great fit for our curated marketplace.
                    You'll be notified once the review is complete.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative lg:mt-6">
                <span className="absolute -top-28 -left-8 text-[180px] font-bold text-slate-100 select-none">
                  3
                </span>

                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white rounded-full shadow flex items-center justify-center mb-6">
                    <div className="w-3 h-3 bg-orange-600 rounded-full" />
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 mb-4">
                    List Your Products & Go Live
                  </h3>

                  <p className="text-lg text-slate-600 leading-relaxed">
                    Once approved, upload your products, photos, and stories
                    using the Seller Dashboard. As soon as items are curated,
                    they go live to a global audience and you can start
                    receiving orders.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 bg-[#FFCCD51A]">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-5xl font-bold text-slate-900 mb-4">
              What Our Vendors Say
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Our clients send us bunch of smiles with our services and we love
              them.
            </p>
          </div>

          {/* Testimonial Sphere Component */}
          <TestimonialSphere
            testimonials={testimonials}
            autoRotate={true}
            rotationSpeed={5000}
          />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            {/* Left Side */}
            <div className="sticky top-8">
              <h2 className="text-5xl font-bold text-slate-900 mb-6">
                Any questions?
                <br />
                We got you.
              </h2>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                We believe in transparency. Here's everything you need to know
                about selling on World of Africa and how we partner with you for
                success.
              </p>
              <a
                href="#"
                className="text-orange-600 hover:text-orange-700 font-semibold text-lg flex items-center gap-2 group"
              >
                More FAQs
                <svg
                  className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            </div>

            {/* Right Side - FAQ Accordion */}
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl border-slate-200 overflow-hidden transition-all duration-200 hover:shadow-sm"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-6 text-left"
                  >
                    <span className="text-lg font-semibold text-slate-900 pr-4">
                      {faq.question}
                    </span>
                    {openFaq === index ? (
                      <Minus className="w-5 h-5 text-slate-500 flex-shrink-0" />
                    ) : (
                      <Plus className="w-5 h-5 text-slate-500 flex-shrink-0" />
                    )}
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openFaq === index ? "max-h-96" : "max-h-0"
                    }`}
                  >
                    <div className="px-6 pb-6 text-slate-600 leading-relaxed whitespace-pre-line border-t border-slate-100 pt-4">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
