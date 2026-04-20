import { motion } from 'framer-motion';
import { Users, Award, Heart, Hotel, ShieldCheck } from 'lucide-react';

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

const AboutUs = () => {
  return (
    <div className="page-shell pt-32 pb-20">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="text-center max-w-3xl mx-auto">
          <FadeIn>
            <h1 className="text-5xl md:text-6xl font-primary font-bold text-primary mb-6">
              Our Journey
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              We believe that travel is more than just visiting new places—it's about creating memories that last a lifetime. Founded in 2024, WanderWise started with a simple mission: to make world exploration accessible, personalized, and unforgettable for everyone.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white/70 backdrop-blur-sm py-16 mb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <FadeIn delay={0.1}>
              <div className="text-4xl font-bold text-accent mb-2">10k+</div>
              <div className="text-gray-600">Happy Travelers</div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="text-4xl font-bold text-accent mb-2">500+</div>
              <div className="text-gray-600">Destinations</div>
            </FadeIn>
            <FadeIn delay={0.3}>
              <div className="text-4xl font-bold text-accent mb-2">150+</div>
              <div className="text-gray-600">Tours</div>
            </FadeIn>
            <FadeIn delay={0.4}>
              <div className="text-4xl font-bold text-accent mb-2">24/7</div>
              <div className="text-gray-600">Support</div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <FadeIn>
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80" 
              alt="Team planning" 
              className="rounded-2xl shadow-xl w-full h-[400px] object-cover"
            />
          </FadeIn>
          <FadeIn delay={0.2}>
            <h2 className="text-3xl font-primary font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-gray-600 text-lg mb-6">
              To inspire and enable people to explore the world with confidence. We strive to curate unique travel experiences that respect local cultures, support sustainable tourism, and bring people closer together.
            </p>
            <h2 className="text-3xl font-primary font-bold text-gray-900 mb-6">Our Vision</h2>
            <p className="text-gray-600 text-lg">
              To be the world's most trusted travel companion, known for our passion, integrity, and commitment to creating joy through travel.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Hotel Promise */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-primary font-bold text-gray-900 mb-4">Our Hotel Promise</h2>
            <p className="text-lg text-gray-600">
              We do more than tours. WanderWise now includes curated hotel stays with destination-based recommendations, realistic INR pricing, and transparent booking updates for both travelers and admins.
            </p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-8">
          <FadeIn delay={0.1}>
            <div className="glass-card p-8 text-center hover:shadow-lg transition-shadow">
              <Hotel className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">Curated Stays</h3>
              <p className="text-gray-600">We map hotels to tour locations so you can quickly find relevant premium options.</p>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="glass-card p-8 text-center hover:shadow-lg transition-shadow">
              <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">Reliable Pricing</h3>
              <p className="text-gray-600">Hotel rates are shown in INR with realistic pricing so there are no surprises at checkout.</p>
            </div>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="glass-card p-8 text-center hover:shadow-lg transition-shadow">
              <Users className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">Managed Quality</h3>
              <p className="text-gray-600">Admins can add, update, and manage hotel inventory to keep recommendations accurate.</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <h2 className="text-3xl font-primary font-bold text-center text-gray-900 mb-12">Why Choose Us?</h2>
        </FadeIn>
        <div className="grid md:grid-cols-3 gap-8">
          <FadeIn delay={0.1}>
            <div className="glass-card p-8 text-center hover:shadow-lg transition-shadow">
              <Users className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">Customer First</h3>
              <p className="text-gray-600">Your satisfaction is our top priority. We go above and beyond to ensure your trip is perfect.</p>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="glass-card p-8 text-center hover:shadow-lg transition-shadow">
              <Award className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">Excellence</h3>
              <p className="text-gray-600">We partner with only the best hotels, guides, and transport providers to guarantee quality.</p>
            </div>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="glass-card p-8 text-center hover:shadow-lg transition-shadow">
              <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">Passion</h3>
              <p className="text-gray-600">We are travelers ourselves. We put our heart and soul into planning every itinerary.</p>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
