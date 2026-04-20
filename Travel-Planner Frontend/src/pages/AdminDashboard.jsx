import React, { useCallback, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import AdminSidebar from '../components/dashboard/admin/AdminSidebar';
import AdminHeader from '../components/dashboard/admin/AdminHeader';
import AdminOverviewContent from '../components/dashboard/admin/AdminOverviewContent';
import AdminUserManagementPanel from '../components/dashboard/admin/AdminUserManagementPanel';
import AdminSettingsPanel from '../components/dashboard/admin/AdminSettingsPanel';
import AdminBookingsPanel from '../components/dashboard/admin/AdminBookingsPanel';
import AdminPaymentsPanel from '../components/dashboard/admin/AdminPaymentsPanel';
import AdminTripsItinerariesPanel from '../components/dashboard/admin/AdminTripsItinerariesPanel';
import AdminReportsPanel from '../components/dashboard/admin/AdminReportsPanel';
import AdminNotificationsPanel from '../components/dashboard/admin/AdminNotificationsPanel';
import AdminRecommendationsPanel from '../components/dashboard/admin/AdminRecommendationsPanel';
import AdminMessagesPanel from '../components/dashboard/admin/AdminMessagesPanel';
import AdminHotelsPanel from '../components/dashboard/admin/AdminHotelsPanel';

export default function TravelAdminDashboard() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleToggleMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen((current) => !current);
  }, []);

  const handleCloseMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(false);
  }, []);

  return (
    <div className="relative flex h-screen overflow-hidden bg-[#f1f5ff] font-secondary text-slate-900">
      <div className="pointer-events-none absolute -left-20 -top-24 h-96 w-96 rounded-full bg-primary/25 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-[-9rem] right-[-6rem] h-[30rem] w-[30rem] rounded-full bg-accent/25 blur-3xl" aria-hidden="true" />
      <AdminSidebar
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={handleCloseMobileSidebar}
      />
      <main className="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminHeader
          onMenuToggle={handleToggleMobileSidebar}
          isMenuOpen={isMobileSidebarOpen}
        />
        <div className="flex-1 overflow-y-auto px-4 pb-8 pt-6 md:px-8 md:pb-10 md:pt-8">
          <div className="mx-auto w-full max-w-[1380px]">
            <Routes>
              <Route index element={<AdminOverviewContent />} />
              <Route path="user-management" element={<AdminUserManagementPanel />} />
              <Route path="user-management/:tab" element={<AdminUserManagementPanel />} />
              <Route path="trips-itineraries" element={<AdminTripsItinerariesPanel />} />
              <Route path="trips-itineraries/:tab" element={<AdminTripsItinerariesPanel />} />
              <Route path="hotels" element={<AdminHotelsPanel />} />
              <Route path="hotels/:tab" element={<AdminHotelsPanel />} />
              <Route path="bookings" element={<AdminBookingsPanel />} />
              <Route path="bookings/:tab" element={<AdminBookingsPanel />} />
              <Route path="budget-payments" element={<AdminPaymentsPanel />} />
              <Route path="budget-payments/:tab" element={<AdminPaymentsPanel />} />
              <Route path="recommendations" element={<AdminRecommendationsPanel />} />
              <Route path="recommendations/:tab" element={<AdminRecommendationsPanel />} />
              <Route path="notifications" element={<AdminNotificationsPanel />} />
              <Route path="notifications/:tab" element={<AdminNotificationsPanel />} />
              <Route path="messages" element={<AdminMessagesPanel />} />
              <Route path="messages/:tab" element={<AdminMessagesPanel />} />
              <Route path="reports" element={<AdminReportsPanel />} />
              <Route path="reports/:tab" element={<AdminReportsPanel />} />
              <Route path="settings" element={<AdminSettingsPanel />} />
              <Route path="*" element={<AdminOverviewContent />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
}
