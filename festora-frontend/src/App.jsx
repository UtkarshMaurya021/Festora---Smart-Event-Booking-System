import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute.jsx";

import AllEvents from "./pages/organizer/AllEvents.jsx";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/signup";
import CreateEvent from "./pages/organizer/CreateEvent";
import EditEvent from "./pages/organizer/EditEvent.jsx";
import OrganizerBookings from "./pages/organizer/OrganizerBookings.jsx";
import OrganizerVenues from "./pages/organizer/OrganizerVenues.jsx";
import OrganizerProfile from "./pages/organizer/OrganizerProfile.jsx";
import VerifyTicket from "./pages/VerifyTicket.jsx";
import UserDashboard from "./pages/UserDashboard";
import UserEvents from "./pages/UserEvents.jsx";
import UserTickets from "./pages/UserTickets.jsx";
import UserProfile from "./pages/UserProfile.jsx";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import EventDetails from "./pages/EventDetails";
import UserBookings from "./pages/UserBookings.jsx";
import VenueManagement from "./pages/admin/VenueManagement.jsx";
import CategoryManagement from "./pages/admin/CategoryManagement.jsx";
import EventManagement from "./pages/admin/EventManagement.jsx";
import UserManagement from "./pages/admin/UserManagement.jsx";
import OrganizerManagement from "./pages/admin/OrganizerManagement.jsx";
import BookingManagement from "./pages/admin/BookingManagement.jsx";
import PaymentManagement from "./pages/admin/PaymentManagement.jsx";
import Payment from "./pages/PaymentPage.jsx";
import About from "./pages/About";
import PublicEvents from "./pages/PublicEvents";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/about" element={<About />} />

        <Route path="/events" element={<PublicEvents />} />
        <Route path="/" element={<LandingPage />} />

        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

        <Route
          path="/organizer/dashboard"
          element={
            <PrivateRoute>
              <OrganizerDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/organizer/events"
          element={
            <PrivateRoute role="ROLE_ORGANIZER">
              <AllEvents />
            </PrivateRoute>
          }
        />
        <Route
          path="/organizer/verify-ticket"
          element={
            <PrivateRoute role="ROLE_ORGANIZER">
              <VerifyTicket />
            </PrivateRoute>
          }
        />
        <Route
          path="/organizer/bookings"
          element={
            <PrivateRoute role="ROLE_ORGANIZER">
              <OrganizerBookings />
            </PrivateRoute>
          }
        />
        <Route
          path="/organizer/venues"
          element={
            <PrivateRoute role="ROLE_ORGANIZER">
              <OrganizerVenues />
            </PrivateRoute>
          }
        />
        <Route
          path="/organizer/profile"
          element={
            <PrivateRoute role="ROLE_ORGANIZER">
              <OrganizerProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/verify-ticket"
          element={
            <PrivateRoute role="ROLE_ADMIN">
              <VerifyTicket />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <PrivateRoute role="ROLE_ADMIN">
              <CategoryManagement />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/venues"
          element={
            <PrivateRoute role="ROLE_ADMIN">
              <VenueManagement />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/events"
          element={
            <PrivateRoute role="ROLE_ADMIN">
              <EventManagement />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <PrivateRoute role="ROLE_ADMIN">
              <UserManagement />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/organizers"
          element={
            <PrivateRoute role="ROLE_ADMIN">
              <OrganizerManagement />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <PrivateRoute role="ROLE_ADMIN">
              <BookingManagement />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <PrivateRoute role="ROLE_ADMIN">
              <PaymentManagement />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/user/dashboard"
          element={
            <PrivateRoute>
              <UserDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/user/events"
          element={
            <PrivateRoute role="ROLE_USER">
              <UserEvents />
            </PrivateRoute>
          }
        />
        <Route
          path="/user/tickets"
          element={
            <PrivateRoute role="ROLE_USER">
              <UserTickets />
            </PrivateRoute>
          }
        />
        <Route
          path="/user/profile"
          element={
            <PrivateRoute role="ROLE_USER">
              <UserProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="/organizer/events/create"
          element={
            <PrivateRoute role="ROLE_ORGANIZER">
              <CreateEvent />
            </PrivateRoute>
          }
        />
        <Route
          path="/payment/:bookingId"
          element={
            <PrivateRoute role="ROLE_USER">
              <Payment />
            </PrivateRoute>
          }
        />
        <Route
          path="/userbookings"
          element={
            <PrivateRoute role="ROLE_USER">
              <UserBookings />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-bookings"
          element={<Navigate to="/userbookings" replace />}
        />
        <Route path="/event/:id" element={<EventDetails />} />
        <Route
          path="/organizer/events/edit/:id"
          element={
            <PrivateRoute role="ROLE_ORGANIZER">
              <EditEvent />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
