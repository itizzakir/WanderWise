import React from 'react';
import { motion } from 'framer-motion';
import { Map, ShieldCheck, CreditCard, Headphones, Plane, Hotel } from 'lucide-react';

const MotionDiv = motion.div;

const FadeIn = ({ children, delay = 0 }) => (
  <MotionDiv
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
  >
    {children}
  </MotionDiv>
);

const ServiceCard = ({ icon: Icon, title, description, delay }) => {
  const iconElement = Icon
    ? React.createElement(Icon, {
      className: 'w-7 h-7 text-primary group-hover:text-white transition-colors',
    })
    : null;

  return (
    <FadeIn delay={delay}>
      <div className="glass-card p-8 hover:shadow-xl transition-all duration-300 group">
        <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
          {iconElement}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </FadeIn>
  );
};

const OurServices = () => {
  const services = [
    {
      icon: Map,
      title: "Custom Itineraries",
      description: "We craft personalized travel plans tailored to your interests, budget, and pace, ensuring a unique experience."
    },
    {
      icon: Plane,
      title: "Flight Booking",
      description: "Get the best deals on flights worldwide. We handle all the complex logistics so you can fly stress-free."
    },
    {
      icon: Hotel,
      title: "Luxury Accommodations",
      description: "From boutique hotels to 5-star resorts, we secure the best stays with exclusive perks and upgrades."
    },
    {
      icon: Map,
      title: "Smart Hotel Recommendations",
      description: "Hotels are suggested according to your selected tour destination, so your stay planning is much faster."
    },
    {
      icon: Hotel,
      title: "Hotel Booking Workflow",
      description: "Send hotel booking requests directly from your dashboard and receive status updates when admins review them."
    },
    {
      icon: ShieldCheck,
      title: "Travel Insurance",
      description: "Comprehensive coverage options to keep you protected against unexpected events during your journey."
    },
    {
      icon: CreditCard,
      title: "Secure Payments",
      description: "Multiple secure payment options with transparent pricing and no hidden fees for your peace of mind."
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "Our dedicated support team is available round-the-clock to assist you with any query or emergency."
    }
  ];

  return (
    <div className="page-shell pt-32 pb-20">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
        <FadeIn>
          <h1 className="text-5xl md:text-6xl font-primary font-bold text-primary mb-6">
            Our Services
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need for a perfect trip. We offer a full range of travel services designed to make your experience seamless and memorable.
          </p>
        </FadeIn>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard 
              key={index}
              {...service}
              delay={index * 0.1}
            />
          ))}
        </div>
      </section>

      {/* Hotel Services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <FadeIn>
          <div className="grid md:grid-cols-2 gap-10 items-center rounded-2xl bg-white/80 border border-gray-100 p-8 md:p-10">
            <div>
              <h2 className="text-3xl font-primary font-bold text-gray-900 mb-4">Hotel Services Built Into WanderWise</h2>
              <p className="text-gray-600 mb-6">
                Our hotel layer works with tours, so travelers can choose stays based on trip location while admins keep inventory updated in one place.
              </p>
              <ul className="space-y-3 text-gray-700">
                <li>Destination-based hotel suggestions from your upcoming trip.</li>
                <li>Realistic hotel pricing displayed in INR for clear budgeting.</li>
                <li>Admin notifications for every new hotel booking request.</li>
                <li>Inventory tools to add, edit, and remove hotel listings.</li>
              </ul>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1000&q=80"
                alt="Hotel lobby"
                className="rounded-xl w-full h-[320px] object-cover"
              />
            </div>
          </div>
        </FadeIn>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="bg-primary rounded-2xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-black/10"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to plan your next adventure?</h2>
              <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
                Let us handle the details while you dream about the destination. Contact us today to get started.
              </p>
              <a 
                href="/tours" 
                className="inline-block bg-white text-primary px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors"
              >
                Explore Tours
              </a>
            </div>
          </div>
        </FadeIn>
      </section>
    </div>
  );
};

export default OurServices;
