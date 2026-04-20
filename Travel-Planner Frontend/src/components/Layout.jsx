import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/useAuth';

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'About Us', path: '/about-us' },
  {
    name: 'Our Services',
    path: '/our-services',
  },
  {
    name: 'Tours',
    path: '/tours',
  },
  { name: 'AI Planner', path: '/ai-planner' },
  { name: 'Contact Us', path: '/contact-us' },
  { name: 'Legal & Policy', path: '/legal-and-policy' },
];

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  const dashboardPath = user?.role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard';
  const dashboardLabel = user?.role === 'ADMIN' ? 'Admin Dashboard' : 'Traveler Dashboard';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDropdown = (index) => {
    if (openDropdown === index) setOpenDropdown(null);
    else setOpenDropdown(index);
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <header className={cn(
      "fixed top-0 left-0 w-full z-50 transition-all duration-300",
      isScrolled ? "bg-primary shadow-lg py-4" : "bg-primary/90 py-6"
    )}>
      <div className="max-w-[1240px] mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 flex-shrink-0">
          <img
            src="/wanderwise-mark.svg"
            alt="WanderWise Logo"
            className="h-10 w-10 rounded-xl"
          />
          <div className="text-white font-primary font-bold text-3xl tracking-tight">
            Wander<span className="text-accent">Wise</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item, idx) => (
            <div key={idx} className="relative group">
              <Link 
                to={item.path} 
                className="text-white hover:text-accent font-secondary text-base flex items-center gap-1 transition-colors"
              >
                {item.name}
                {item.dropdown && <ChevronDown size={14} />}
              </Link>
              
              {/* Desktop Dropdown */}
              {item.dropdown && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                  <div className="py-2">
                    {item.dropdown.map((subItem, subIdx) => (
                      <Link 
                        key={subIdx} 
                        to={subItem.path}
                        className="block px-4 py-2 text-dark hover:bg-gray-100 hover:text-primary transition-colors"
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Right Side Icons & Auth */}
        <div className="flex items-center gap-6">
          {/* Desktop Auth Links */}
          <div className="hidden lg:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link
                  to={dashboardPath}
                  className="text-white hover:text-accent font-secondary text-base transition-colors"
                >
                  {dashboardLabel}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="bg-accent hover:bg-accent/90 text-white px-5 py-2 rounded-full font-secondary text-base transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-white hover:text-accent font-secondary text-base transition-colors">
                  Login
                </Link>
                <Link to="/signup-customer" className="bg-accent hover:bg-accent/90 text-white px-5 py-2 rounded-full font-secondary text-base transition-colors">
                  Sign Up
                </Link>
              </>
            )}
          </div>


          
          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div className={cn(
        "lg:hidden fixed inset-0 top-[70px] bg-primary z-40 transition-transform duration-300 overflow-y-auto",
        mobileMenuOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex flex-col p-6 gap-4">
          {navItems.map((item, idx) => (
            <div key={idx} className="border-b border-white/10 pb-4">
              <div className="flex justify-between items-center">
                <Link 
                  to={item.path} 
                  className="text-white text-xl font-secondary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
                {item.dropdown && (
                  <button onClick={() => toggleDropdown(idx)} className="text-white p-2">
                    <ChevronDown size={20} className={cn("transition-transform", openDropdown === idx && "rotate-180")} />
                  </button>
                )}
              </div>
              
              {/* Mobile Dropdown */}
              {item.dropdown && (
                <div className={cn(
                  "pl-4 mt-2 flex flex-col gap-3 overflow-hidden transition-all duration-300",
                  openDropdown === idx ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                )}>
                  {item.dropdown.map((subItem, subIdx) => (
                    <Link 
                      key={subIdx} 
                      to={subItem.path}
                      className="text-gray-300 hover:text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {subItem.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {/* Mobile Auth Links */}
          <div className="pt-6 border-t border-white/10 flex flex-col gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to={dashboardPath}
                  className="text-white text-xl font-secondary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {dashboardLabel}
                </Link>
                <button
                  type="button"
                  className="text-left text-white text-xl font-secondary"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-white text-xl font-secondary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/signup-customer" 
                  className="text-white text-xl font-secondary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

const Footer = () => {
  return (
    <footer className="bg-[#1F2130] text-white pt-16 pb-8">
      <div className="max-w-[1240px] mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Col 1 */}
        <div className="space-y-4">
          <h5 className="font-primary font-semibold text-lg">Explore</h5>
          <p className="text-gray-300 text-sm">Discover amazing tours with exclusive offers today!</p>
          <div className="pt-4">
            <p className="text-sm font-bold uppercase mb-2">Contact</p>
            <p>info@wanderwise.com</p>
            <p>+1 587-997-3169</p>
          </div>
        </div>

        {/* Col 2 */}
        <div className="space-y-4">
          <h5 className="font-primary font-semibold text-lg">Quick Links</h5>
          <ul className="space-y-2 text-sm underline decoration-white/30 hover:decoration-white">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about-us">About Us</Link></li>
            <li><Link to="/our-services">Our Services</Link></li>
            <li><Link to="/tours">Tours</Link></li>
            <li><Link to="/contact-us">Contact Us</Link></li>
          </ul>
        </div>

        {/* Col 3 */}
        <div className="space-y-4">
          <h5 className="font-primary font-semibold text-lg">Legal</h5>
          <ul className="space-y-2 text-sm underline decoration-white/30 hover:decoration-white">
            <li><Link to="/legal-and-policy">Legal & Policy</Link></li>
          </ul>
          <div className="pt-4">
             <Link to="/review" className="font-bold underline text-sm">Give us a review!!</Link>
          </div>
        </div>

        {/* Col 4 - Newsletter */}
        <div>
          <form className="flex flex-col gap-4">
             <label className="text-sm">Subscribe for tour updates</label>
             <input 
               type="email" 
               placeholder="Your email address" 
               className="px-4 py-3 rounded-full bg-white text-dark focus:outline-none"
             />
             <button className="bg-primary hover:bg-primary/80 text-white py-3 rounded-full transition-colors font-medium text-sm">
                Subscribe
             </button>
          </form>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm">© 2026 WanderWise. All rights reserved.</p>
        <div className="flex gap-6">
          <Facebook size={20} className="hover:text-accent cursor-pointer" />
          <Instagram size={20} className="hover:text-accent cursor-pointer" />
          <Linkedin size={20} className="hover:text-accent cursor-pointer" />
          <Twitter size={20} className="hover:text-accent cursor-pointer" />
        </div>
      </div>
    </footer>
  );
};

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
