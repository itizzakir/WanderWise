import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UserProfile from './pages/UserProfile';
import TourDetailsPage from './pages/TourDetailsPage';
import TourBookingPage from './pages/TourBookingPage';
import AllTours from './pages/AllTours';
import TravelerDashboard from './pages/TravelerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SettingsPage from './pages/Settings';
import AboutUs from './pages/AboutUs';
import OurServices from './pages/OurServices';
import ContactUs from './pages/ContactUs';
import LegalAndPolicy from './pages/LegalAndPolicy';
import Review from './pages/Review';
import AIPlanner from './pages/AIPlanner';

import ProtectedRoute from './components/ProtectedRoute';

import MyTrips from './pages/MyTrips';
import TravelerHotels from './pages/TravelerHotels';

import TripDetails from './pages/TripDetails';
import NotFound from './pages/NotFound';
import DemoPayment from './pages/DemoPayment';
import TravelerNotifications from './pages/TravelerNotifications';
import { useAuth } from './lib/useAuth';

const AdminLandingGuard = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user?.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <AdminLandingGuard>
              <Layout><Home /></Layout>
            </AdminLandingGuard>
          }
        />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/signup-customer" element={<Layout><Signup /></Layout>} />
        <Route path="/about-us" element={<Layout><AboutUs /></Layout>} />
        <Route path="/our-services" element={<Layout><OurServices /></Layout>} />
        <Route path="/ai-planner" element={<Layout><AIPlanner /></Layout>} />
        
        {/* Contact Page */}
        <Route path="/contact-us" element={<Layout><ContactUs /></Layout>} />
        <Route path="/legal-and-policy" element={<Layout><LegalAndPolicy /></Layout>} />
        <Route path="/review" element={<Layout><Review /></Layout>} />
        
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Layout><UserProfile /></Layout>
            </ProtectedRoute>
          } 
        />
        <Route path="/tours" element={<Layout><AllTours /></Layout>} />
        <Route path="/tours/:destination/book" element={<Layout><TourBookingPage /></Layout>} />
        <Route path="/tours/:destination/:subDestination/book" element={<Layout><TourBookingPage /></Layout>} />
        <Route path="/tours/:destination" element={<Layout><TourDetailsPage /></Layout>} />
        <Route path="/tours/:destination/:subDestination" element={<Layout><TourDetailsPage /></Layout>} />
        <Route
          path="/user/payment/demo"
          element={
            <ProtectedRoute role="USER">
              <Layout><DemoPayment /></Layout>
            </ProtectedRoute>
          }
        />
        


        {/* Protected Dashboard Routes */}
        <Route 
          path="/user/dashboard" 
          element={
            <ProtectedRoute role="USER">
              <TravelerDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/user/dashboard/my-trips" 
          element={
            <ProtectedRoute role="USER">
              <MyTrips />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/user/dashboard/my-trips/upcoming" 
          element={
            <ProtectedRoute role="USER">
              <MyTrips statusFilter="Upcoming" />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/user/dashboard/my-trips/completed" 
          element={
            <ProtectedRoute role="USER">
              <MyTrips statusFilter="Completed" />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/user/dashboard/my-trips/:id" 
          element={
            <ProtectedRoute role="USER">
              <TripDetails />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/user/dashboard/hotels"
          element={
            <ProtectedRoute role="USER">
              <TravelerHotels />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/dashboard/hotels/:tab"
          element={
            <ProtectedRoute role="USER">
              <TravelerHotels />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/dashboard/notifications"
          element={
            <ProtectedRoute role="USER">
              <TravelerNotifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/dashboard/notifications/:tab"
          element={
            <ProtectedRoute role="USER">
              <TravelerNotifications />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/admin/dashboard/*" 
          element={
            <ProtectedRoute role="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/user/settings"
          element={
            <ProtectedRoute role="USER">
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Layout><NotFound /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
