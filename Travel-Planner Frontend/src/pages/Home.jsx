import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useToursCatalog } from '../lib/toursCatalog';
import { submitContactMessage } from '../lib/contactMessages';
import { useAuth } from '../lib/useAuth';

const MotionDiv = motion.div;

// --- Data & Config ---

const galleryImages = [
  "https://images.unsplash.com/photo-1533094692971-5f4c56ec1339?auto=format&fit=crop&w=300",
  "https://images.unsplash.com/photo-1572830079160-c2622cb81ad4?auto=format&fit=crop&w=300",
  "https://images.unsplash.com/photo-1502003148287-a82ef80a6abc?auto=format&fit=crop&w=300",
  "https://images.unsplash.com/photo-1497373637916-e47a55e22d0a?auto=format&fit=crop&w=300",
  "https://images.unsplash.com/photo-1581259021841-a16d7c2a777d?auto=format&fit=crop&w=300",
  "https://images.unsplash.com/photo-1579455997916-663bf4d63e93?auto=format&fit=crop&w=300",
  "https://images.unsplash.com/photo-1586364781704-0902d5aaf8f5?auto=format&fit=crop&w=300",
  "https://images.unsplash.com/photo-1501114676295-bbbcc7a12466?auto=format&fit=crop&w=300"
];

const featuredHotels = [
  {
    name: 'Marina Bay Skyline Suites',
    location: 'Singapore',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900',
    price: 'From INR 48,000 / night',
  },
  {
    name: 'Swiss Alpine Grand Retreat',
    location: 'Interlaken, Switzerland',
    image: 'https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=900',
    price: 'From INR 62,000 / night',
  },
  {
    name: 'Santorini Cliff View Villas',
    location: 'Santorini, Greece',
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=900',
    price: 'From INR 73,000 / night',
  },
];

// --- Form Validation Schema ---
const schema = yup.object({
  firstName: yup.string().optional(),
  email: yup.string().email('Please enter a valid email').required('Email is required'),
  message: yup.string().required('Message is required'),
}).required();

// --- Components ---

const FadeIn = ({ children, delay = 0, className }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  return (
    <MotionDiv
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </MotionDiv>
  );
};

const HeroSection = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      <video 
        autoPlay muted loop playsInline 
        className="absolute inset-0 w-full h-full object-cover z-0"
        poster="https://images.pexels.com/videos/16506193/adventure-alberta-banff-canada-16506193.jpeg"
      >
        <source src="https://videos.pexels.com/video-files/16506193/16506193-uhd_2560_1440_30fps.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/50 z-10"></div>
      
      <div className="relative z-20 text-center px-4 max-w-4xl mx-auto mt-20">
        <FadeIn>
          <p className="text-white text-2xl md:text-3xl font-medium mb-4">★★★★★</p>
          <p className="text-white text-xl md:text-2xl font-secondary mb-8">Rated 5 stars by customers</p>
          <h1 className="text-white font-primary font-bold text-5xl md:text-7xl leading-tight mb-8">
            Explore Amazing Tours with Us
          </h1>
          <p className="text-white text-lg md:text-2xl max-w-2xl mx-auto mb-12">
            Find the best tours at unbeatable prices with stunning images and customer reviews.
          </p>
          <a 
            href="/tours" 
            className="inline-block bg-accent hover:bg-[#8B728E] text-white px-10 py-4 rounded-full font-medium transition-colors text-lg"
          >
            Discover
          </a>
        </FadeIn>
      </div>
    </section>
  );
};

const HotDealsSection = ({ tours }) => {
  return (
    <section className="bg-white/70 backdrop-blur-sm py-20">
      <div className="max-w-[1240px] mx-auto px-4">
        <FadeIn>
          <h2 className="text-center font-primary font-semibold text-5xl text-accent mb-6">Hot Deals</h2>
          <p className="text-center font-secondary text-dark text-lg mb-16">Explore our Tours</p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tours.slice(0, 3).map((tour, idx) => (
            <FadeIn key={idx} delay={idx * 0.1} className="group flex flex-col overflow-hidden rounded-[20px] bg-white shadow-lg">
              <div className="relative overflow-hidden w-full aspect-[4/5] md:aspect-[400/424]">
                <img 
                  src={tour.img} 
                  alt={tour.destination} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6 flex flex-col items-center flex-grow">
                <h5 className="text-2xl font-primary font-semibold text-center mb-4 max-w-xs">{tour.destination}, {tour.country}</h5>
                {tour.description && (
                  <p className="text-center text-gray-600 mb-6 px-4">{tour.description}</p>
                )}
                <a 
                  href={`/tours/${tour.destination.toLowerCase().replace(/\s/g, "-")}`}
                  className="mt-auto px-8 py-3 rounded-full border border-dark text-dark hover:bg-dark hover:text-white transition-colors"
                >
                  See more
                </a>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

const HotelShowcaseSection = ({ hotelsPath, isTraveler }) => {
  return (
    <section className="bg-white/80 backdrop-blur-sm py-20">
      <div className="max-w-[1240px] mx-auto px-4">
        <FadeIn className="text-center mb-12">
          <h3 className="font-primary font-semibold text-5xl mb-6 text-accent">Recommended Hotels</h3>
          <p className="text-lg max-w-3xl mx-auto text-gray-700">
            Premium stays curated for your tour destination. Get personalized hotel suggestions, real-time prices in INR, and instant booking requests from your traveler dashboard.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {featuredHotels.map((hotel, idx) => (
            <FadeIn key={hotel.name} delay={idx * 0.1}>
              <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
                <img src={hotel.image} alt={hotel.name} className="h-52 w-full object-cover" />
                <div className="p-5">
                  <h4 className="font-primary text-2xl text-gray-900">{hotel.name}</h4>
                  <p className="text-sm text-gray-500 mt-2">{hotel.location}</p>
                  <p className="text-sm font-semibold text-blue-700 mt-4">{hotel.price}</p>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>

        <FadeIn className="text-center">
          <a
            href={hotelsPath}
            className="inline-block bg-primary hover:bg-[#8B728E] text-white px-10 py-4 rounded-full font-medium transition-colors text-lg"
          >
            {isTraveler ? 'Open Hotel Suggestions' : 'Login to View Hotel Recommendations'}
          </a>
        </FadeIn>
      </div>
    </section>
  );
};

const ExploreSection = () => {
  return (
    <section className="bg-white/70 backdrop-blur-sm py-20">
      <div className="max-w-[1240px] mx-auto px-4 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Left Text */}
        <div className="md:col-span-4 flex flex-col justify-center">
          <FadeIn>
            <h3 className="font-primary font-semibold text-4xl md:text-5xl mb-6">
              Explore Your Next Adventure With Us
            </h3>
            <p className="text-gray-600 mb-10 text-lg">
              At WanderWise, we offer a wide range of exciting tours, highlighted by special sales. Our user-friendly design ensures a seamless booking experience for every traveler.
            </p>
            <a href="/tours" className="inline-block border border-dark text-dark px-10 py-3 rounded-full hover:bg-dark hover:text-white transition-colors self-start">
              Explore
            </a>
          </FadeIn>
        </div>

        {/* Center Image */}
        <div className="md:col-span-4">
          <FadeIn delay={0.2}>
            <img 
              src="https://images.unsplash.com/photo-1558597879-04d6dfc5216d?auto=format&fit=crop&w=606" 
              alt="Road Trip" 
              className="rounded-[20px] w-full h-auto object-cover"
            />
          </FadeIn>
        </div>

        {/* Right Quote */}
        <div className="md:col-span-4 flex flex-col justify-center pl-8 relative">
          <FadeIn delay={0.4}>
            <div className="absolute top-0 left-0 bg-[#F0EEF2] w-full h-40 -z-10 rounded-lg transform -translate-x-4 translate-y-12 hidden md:block"></div>
            <span className="text-5xl font-primary text-dark block mb-4">"</span>
            <h6 className="font-primary font-semibold text-lg md:text-xl leading-relaxed mb-4">
              Our guide was a delight and so interesting to talk to. Very accommodating and had helpful tips and information for the area.
            </h6>
            <p className="text-gray-500 italic">— Viator review</p>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

const GallerySection = () => {
  return (
    <section className="bg-white/60 backdrop-blur-sm py-20">
      <div className="max-w-[1240px] mx-auto px-4">
        <FadeIn className="text-center mb-16">
          <h3 className="font-primary font-semibold text-5xl mb-6">Tour Highlights</h3>
          <p className="text-lg max-w-2xl mx-auto">
            A Visual Journey Through Our Unforgettable Tours – Discover Stunning Landscapes, Iconic Destinations, and Memorable Moments.
          </p>
        </FadeIn>

        {/* Masonry Layout using CSS columns */}
        <div className="columns-2 md:columns-4 gap-4 space-y-4">
          {galleryImages.map((src, idx) => (
            <FadeIn key={idx} delay={idx * 0.05}>
              <img 
                src={src} 
                alt={`Gallery ${idx}`} 
                className="w-full rounded-lg hover:opacity-90 transition-opacity cursor-pointer" 
              />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

const ReviewsSection = () => {
  return (
    <section className="bg-white/70 backdrop-blur-sm py-20">
      <div className="max-w-[1240px] mx-auto px-4">
        <FadeIn className="text-center mb-16">
          <h3 className="font-primary font-semibold text-5xl mb-6">Customer reviews</h3>
          <p className="text-lg">Discover what our clients think about our service</p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative">
          {/* Decorative Background Blocks */}
          <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-1/2 h-full bg-[#eceff3] -z-10 rounded-[40px] hidden md:block"></div>

          {/* Review 1 */}
          <FadeIn className="p-8 flex flex-col gap-4">
            <div className="text-accent text-xl">★★★★★</div>
            <p className="text-lg leading-relaxed">
              Harry was an amazing tour guide. It was below freezing all day, but he brought us to the best places and kept us warm. He has wide knowledge and is very invested in his clients having a great time.
            </p>
            <p className="text-gray-500 italic">Viator review</p>
          </FadeIn>

          {/* Review 2 */}
          <FadeIn delay={0.2} className="p-8 flex flex-col gap-4">
            <div className="text-accent text-xl">★★★★★</div>
            <p className="text-lg leading-relaxed">
              Our driver and guide Henry was excellent. He showed us 7 main sights and attractions in and around the town plus going to a restaurant for lunch. Henry was friendly and courteous.
            </p>
            <p className="text-gray-500 italic">Viator review</p>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

const ContactSection = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');
    try {
      const payload = {
        fullName: (data.firstName || '').trim() || 'Website Visitor',
        email: data.email.trim(),
        subject: 'Homepage Inquiry',
        message: data.message.trim(),
      };
      const response = await submitContactMessage(payload);
      setSubmitSuccess(response?.message || 'Thank you. Your inquiry has been sent.');
      reset();
    } catch (error) {
      setSubmitError(error?.message || 'Unable to submit your inquiry right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative py-24">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1565642899687-1c332fb7dc65?auto=format&fit=crop&w=1920" 
          alt="Contact Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
        <FadeIn>
          <h3 className="text-white font-primary font-semibold text-5xl mb-6">Contact Us</h3>
          <p className="text-white text-lg mb-12">Get in touch for inquiries about our exciting tour options.</p>
          
          <div className="glass-card rounded-[20px] p-8 md:p-12 shadow-2xl">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
              <div className="text-left">
                <label className="block text-sm font-medium text-dark mb-1">Your First Name</label>
                <input 
                  {...register("firstName")}
                  placeholder="Enter your first name" 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              
              <div className="text-left">
                <label className="block text-sm font-medium text-dark mb-1">Your Email Address*</label>
                <input 
                  {...register("email")}
                  placeholder="Enter your email address" 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-primary transition-colors"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>

              <div className="text-left">
                <label className="block text-sm font-medium text-dark mb-1">Your Message*</label>
                <textarea 
                  {...register("message")}
                  placeholder="Type your message here" 
                  rows="4"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-primary transition-colors resize-none"
                ></textarea>
                {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-primary hover:bg-[#8B728E] text-white font-medium py-4 rounded-full transition-colors mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Your Inquiry'}
              </button>
              {submitError ? (
                <p className="text-sm text-red-600 text-left">{submitError}</p>
              ) : null}
              {submitSuccess ? (
                <p className="text-sm text-green-700 text-left">{submitSuccess}</p>
              ) : null}
            </form>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

const Home = () => {
  const toursCatalog = useToursCatalog();
  const { isAuthenticated, user } = useAuth();
  const isTraveler = isAuthenticated && user?.role === 'USER';
  const hotelsPath = isTraveler ? '/user/dashboard/hotels' : '/login';

  return (
    <div className="page-shell overflow-hidden">
      <HeroSection />
      <HotDealsSection tours={toursCatalog} />
      <HotelShowcaseSection hotelsPath={hotelsPath} isTraveler={isTraveler} />
      <ExploreSection />
      <GallerySection />
      <ReviewsSection />
      <ContactSection />
    </div>
  );
};

export default Home;
